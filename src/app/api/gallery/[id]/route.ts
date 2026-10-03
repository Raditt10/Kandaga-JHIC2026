import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getProjectById } from "@/data/galleryData";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const dbProject = await prisma.projects.findUnique({
      where: { id },
      include: {
        media: { orderBy: { order: "asc" } },
        tools: {
          include: {
            tool: true,
          },
        },
        student: {
          include:{
            user: true,
            major: true
          }
        },
        advisor: {
          include:{
            user: true
          }
        }
      }
    });

    // Karya yang belum diverifikasi guru (atau sudah dihapus) tidak boleh
    // dibuka lewat URL publik. Dikembalikan 404 — sengaja TIDAK jatuh ke
    // data statis, supaya status verifikasi tidak bisa dilewati lewat link.
    if (dbProject && (dbProject.status !== "approved" || dbProject.deletedAt)) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!dbProject) {
      return NextResponse.json({})
    }

      const typeSlug = dbProject.type === "KA" ? "analis-kimia" : dbProject.type === "TKJ" ? "tkj" : "rpl";
      const typeLabel = dbProject.type === "KA" ? "Analis Kimia" : dbProject.type === "TKJ" ? "TKJ" : "RPL";
      const mediaUrls = (dbProject.media || []).map((m: any) => m.url);
      const cover = dbProject.coverImage || mediaUrls[0] || "/images/preview-rpl.jpg";

      const mappedProject = {
        id: dbProject.id,
        title: dbProject.title,
        tagline: dbProject.description ? dbProject.description.slice(0, 110) + "..." : "Karya tugas akhir siswa SMKN 13 Bandung.",
        description: dbProject.description || "Deskripsi proyek sedang dalam kurasi pembimbing.",
        solutionHighlights: [
          "Proyek terverifikasi dan memenuhi standar kompetensi keahlian kurikulum SMK.",
          "Telah melalui review kelayakan teknis oleh guru pembimbing.",
        ],
        major: typeSlug as any,
        majorLabel: typeLabel,
        jurusan: typeSlug as any,
        jurusanLabel: typeLabel,
        year: dbProject.year || new Date().getFullYear(),
        coverImage: cover,
        galleryImages: mediaUrls.length > 0 ? mediaUrls : [cover],
        status: (dbProject.status === "featured" ? "featured" : "verified") as any,
        tools: (dbProject.tools || []).map((t) => t.name || t.tool?.name).filter(Boolean),
        studentId: dbProject.studentId,
        studentName: dbProject.student?.user?.name || "Siswa SMKN 13",
        studentAvatar: dbProject.student?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        studentClass: dbProject.student?.class || "XII",
        isStudentPrivate: false,
        advisor: {
          name: dbProject.advisor?.user?.name || "Guru Pembimbing",
          role: "Guru Pembimbing Kompetensi Keahlian",
          reviewNotes: dbProject.reviewNotes || "Karya telah memenuhi standar penilaian akhir.",
        },
        metrics: {
          views: dbProject.viewCount || 0,
          likes: dbProject.stars || 0,
        },
        links: {},
      };

      return NextResponse.json({ project: mappedProject }, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching project detail:", error);
    return NextResponse.json({ error: "Failed to fetch gallery project" }, { status: 500 });
  }
}