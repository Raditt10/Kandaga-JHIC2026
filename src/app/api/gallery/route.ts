import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCache, setCache } from "@/lib/redis";

/**
 * Galeri publik — hanya karya yang SUDAH disetujui admin dan belum dihapus.
 *
 * Catatan penting soal perubahan di sini:
 * 1. SEBELUMNYA endpoint ini punya "fallback ke data mock": kalau tabel kosong
 *    atau kueri gagal, ia menyajikan array palsu dari galleryData.ts. Akibatnya
 *    pengunjung publik bisa melihat karya yang tidak ada di database. Fallback
 *    itu DIHAPUS — database kosong berarti galeri memang kosong.
 * 2. `select` dipakai alih-alih `include` supaya kolom sensitif (passwordHash
 *    milik user siswa/guru) tidak ikut terbaca dari database sama sekali.
 * 3. Hasil di-cache dengan awalan kunci `gallery:` sehingga
 *    `invalidateGalleryCache()` di lib/redis.ts — yang sebelumnya menghapus
 *    kunci yang tidak pernah ditulis — sekarang benar-benar berfungsi.
 */

// Batas aman. Halaman galeri melakukan penyaringan & paginasi di sisi klien,
// jadi secara bawaan endpoint mengembalikan seluruh karya terbit. `take`
// dipasang supaya kueri tidak pernah tak terbatas ketika data bertambah banyak.
const MAX_ITEMS = 200;
const CACHE_TTL_SECONDS = 300;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");

  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const pageSize = pageParam
    ? Math.min(MAX_ITEMS, Math.max(1, Number.parseInt(pageSizeParam ?? "24", 10) || 24))
    : MAX_ITEMS;
  const skip = pageParam ? (page - 1) * pageSize : 0;

  const cacheKey = `gallery:list:${page}:${pageSize}`;

  try {
    const cached = await getCache<{ projects: unknown[]; total: number }>(cacheKey);
    if (cached) {
      return NextResponse.json(
        { ...cached, page, pageSize, fromCache: true },
        { status: 200 }
      );
    }

    const where = { status: "approved" as const, deletedAt: null };

    const [total, dbProjects] = await Promise.all([
      prisma.projects.count({ where }),
      prisma.projects.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        take: pageSize,
        skip,
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          year: true,
          status: true,
          viewCount: true,
          reviewNotes: true,
          studentId: true,
          media: { select: { url: true }, orderBy: { order: "asc" } },
          tools: { select: { tool: { select: { name: true } } } },
          badges: { select: { badge: { select: { tier: true, name: true } } } },
          student: {
            select: {
              // Student ber-primary key `userId` (bukan `id`).
              userId: true,
              class: true,
              photoUrl: true,
              // HANYA kolom yang dipakai UI. Sebelumnya `include: { user: true }`
              // ikut menarik passwordHash dari database.
              user: { select: { id: true, name: true } },
            },
          },
          advisor: {
            select: { user: { select: { id: true, name: true } } },
          },
        },
      }),
    ]);

    const projects = dbProjects.map((p) => {
      const typeSlug = p.type === "KA" ? "analis-kimia" : p.type?.toLowerCase() || "rpl";
      const typeLabel = p.type === "KA" ? "Analis Kimia" : p.type || "RPL";

      return {
        id: p.id,
        title: p.title,
        tagline: p.description
          ? p.description.slice(0, 110) + "..."
          : "Karya tugas akhir siswa SMKN 13 Bandung.",
        description: p.description || "",
        solutionHighlights: [],
        major: typeSlug as "rpl" | "tkj" | "analis-kimia",
        majorLabel: typeLabel,
        jurusan: typeSlug as "rpl" | "tkj" | "analis-kimia",
        jurusanLabel: typeLabel,
        year: p.year || new Date().getFullYear(),
        coverImage: p.media[0]?.url || "/images/preview-rpl.jpg",
        galleryImages: p.media.length > 0 ? p.media.map((m) => m.url) : ["/images/preview-rpl.jpg"],
        status: (p.status === "featured" ? "featured" : "verified") as "featured" | "verified",
        tools: p.tools.map((t) => t.tool.name),
        badges: p.badges.map((b) => ({ tier: b.badge.tier, nama: b.badge.name })),
        studentId: p.studentId,
        studentName: p.student?.user?.name || "Siswa SMKN 13",
        studentAvatar:
          p.student?.photoUrl ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        studentClass: p.student?.class || "XII",
        isStudentPrivate: false,
        advisor: {
          name: p.advisor?.user?.name || "Guru Pembimbing",
          role: "Guru Pembimbing Kompetensi Keahlian",
          reviewNotes: p.reviewNotes || "Terverifikasi sekolah.",
        },
        metrics: { views: p.viewCount || 0, likes: 0 },
        links: {},
      };
    });

    await setCache(cacheKey, { projects, total }, CACHE_TTL_SECONDS);

    return NextResponse.json(
      {
        projects,
        total,
        page,
        pageSize,
        hasMore: skip + projects.length < total,
        fromCache: false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/gallery:", error);
    // Tidak ada lagi fallback ke data mock: lebih baik melaporkan error jujur
    // daripada menampilkan karya yang tidak ada di database.
    return NextResponse.json(
      { error: "Gagal memuat galeri karya.", projects: [], total: 0 },
      { status: 500 }
    );
  }
}
