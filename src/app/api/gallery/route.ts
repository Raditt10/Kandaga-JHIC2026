import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Coba ambil dari database Prisma
    try {
      const dbProjects = await prisma.projects.findMany({
        // Hanya karya yang SUDAH diverifikasi guru dan belum dihapus yang boleh
        // tayang di galeri publik. Sebelumnya tidak ada filter sama sekali:
        // karya berstatus "pending" ikut muncul, dan karena `status` di bawah
        // selalu dipetakan ke "verified", karya yang belum dinilai pun
        // dilabeli "Terverifikasi" di UI.
        where: { status: "approved", deletedAt: null },
        include: {
          media: true,
          tools: {
            include: {
              tool: true,
            },
          },
          badges: {
            include: {
              badge: true,
            },
          },
          student: {
            include: {
              user: true,
              major: true,
            },
          },
          advisor: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (dbProjects && dbProjects.length > 0) {
        const mapped = dbProjects.map((p) => {
          const typeSlug = p.type === "KA" ? "analis-kimia" : p.type === "TKJ" ? "tkj" : "rpl";
          const typeLabel = p.type === "KA" ? "Analis Kimia" : p.type === "TKJ" ? "TKJ" : "RPL";
          const mediaUrls = (p.media || []).map((m: any) => m.url);
          const cover = p.coverImage || mediaUrls[0] || "/images/preview-rpl.jpg";

          return {
            id: p.id,
            title: p.title,
            tagline: p.description ? p.description.slice(0, 110) + "..." : "Karya tugas akhir siswa SMKN 13 Bandung.",
            description: p.description || "",
            solutionHighlights: [],
            major: typeSlug as any,
            majorLabel: typeLabel,
            jurusan: typeSlug as any,
            jurusanLabel: typeLabel,
            year: p.year || new Date().getFullYear(),
            coverImage: cover,
            galleryImages: mediaUrls.length > 0 ? mediaUrls : [cover],
            status: (p.status === "featured" ? "featured" : "verified") as any,
            tools: (p.tools || []).map((t) => t.name || t.tool?.name).filter(Boolean),
            studentId: p.studentId,
            studentName: p.student?.user?.name || "Siswa SMKN 13",
            studentAvatar: p.student?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            studentClass: p.student?.class || "XII",
            isStudentPrivate: false,
            advisor: {
              name: p.advisor?.user?.name || "Guru Pembimbing",
              role: "Guru Pembimbing Kompetensi Keahlian",
              reviewNotes: p.reviewNotes || "Terverifikasi sekolah.",
            },
            metrics: {
              views: p.viewCount || 0,
              likes: p.stars || 0,
            },
            links: {},
          };
        });

        return NextResponse.json({ projects: mapped }, { status: 200 });
      }
      return NextResponse.json({ error: "No project data found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error in /api/gallery:", error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 })
  }
}