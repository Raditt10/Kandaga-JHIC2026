import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const p = await prisma.projects.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: true,
            major: true,
          },
        },
        advisor: {
          include: {
            user: true,
            major: true,
          },
        },
        media: {
          orderBy: { order: "asc" },
        },
        tools: {
          include: { tool: true },
        },
      },
    });

    if (!p) {
      return NextResponse.json({ error: "Karya tidak ditemukan" }, { status: 404 });
    }

    const typeLabel =
      p.type === "KA" ? "Analis Kimia" : p.type === "TKJ" ? "TKJ" : "RPL";
    const mediaUrls = (p.media || []).map((m) => m.url);
    const cover = p.coverImage || mediaUrls[0] || "/images/preview-rpl.jpg";

    const mapped = {
      id: p.id,
      title: p.title,
      category: typeLabel,
      image: cover,
      author: p.student?.user?.name || "Siswa SMKN 13",
      authorRole: p.student?.class ? `Siswa ${p.student.class}` : "Siswa SMKN 13",
      likes: p.stars || 0,
      description: p.description || "",
      status: p.status,
      uploadedAt: p.createdAt.toISOString(),
      documents: [
        {
          id: `doc-${p.id}-1`,
          name: "Laporan Akhir & Dokumentasi Teknis",
          type: "pdf" as const,
          url: "/docs/laporan-akhir.pdf",
          meta: "PDF · 2.4 MB",
          required: true,
        },
        {
          id: `doc-${p.id}-2`,
          name: "Surat Pernyataan Orisinalitas",
          type: "pdf" as const,
          url: "/docs/surat-orisinalitas.pdf",
          meta: "PDF · 620 KB",
          required: true,
        },
        {
          id: `doc-${p.id}-3`,
          name: "Dokumentasi & Galeri Proyek",
          type: "image" as const,
          url: cover,
          meta: "JPG · Pratinjau Karya",
        },
      ],
      details: {
        description: p.description || "Deskripsi proyek sedang dalam kurasi pembimbing.",
        highlights: [
          "Proyek terverifikasi dan memenuhi standar kurikulum SMK.",
          "Telah melalui review kelayakan teknis oleh guru pembimbing.",
        ],
        tools: (p.tools || []).map((t) => t.name || t.tool?.name).filter(Boolean),
        links: [
          { label: "Pratinjau Langsung (Demo)", url: "https://demo.kandaga.smkn13bdg.sch.id" },
          { label: "Repositori Kode Sumber", url: "https://github.com/smkn13bandung/kandaga-project" },
        ],
        mentors: [
          {
            name: p.advisor?.user?.name || "Guru Pembimbing",
            role: "Guru Pembimbing Kompetensi Keahlian",
            initial: (p.advisor?.user?.name || "GP").slice(0, 2).toUpperCase(),
          },
        ],
      },
      creator: {
        id: p.student?.userId || p.studentId,
        name: p.student?.user?.name || "Siswa SMKN 13",
        class: p.student?.class || "XII",
        jurusan: typeLabel,
        avatar: p.student?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        nisn: p.student?.nis || "1324001",
        email: p.student?.user?.email || "siswa@smkn13bdg.sch.id",
        submissionCount: 1,
        portfolioCount: 1,
        status: p.student?.status === "aktif" ? "Aktif" : "Alumni",
      },
    };

    return NextResponse.json({ success: true, project: mapped });
  } catch (error) {
    console.error("GET /api/admin/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data karya" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status, reviewNotes, reviewedBy } = body;

    const updated = await prisma.projects.update({
      where: { id },
      data: {
        status: status || "approved",
        reviewNotes: reviewNotes || null,
        reviewedBy: reviewedBy || null,
        publishedAt: status === "approved" ? new Date() : null,
      },
    });

    // Invalidate Redis gallery cache
    try {
      const { invalidateGalleryCache } = await import("@/lib/redis");
      await invalidateGalleryCache();
    } catch (cacheErr) {
      console.warn("Cache invalidation error:", cacheErr);
    }

    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    console.error("PATCH /api/admin/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui status kurasi karya" },
      { status: 500 }
    );
  }
}
