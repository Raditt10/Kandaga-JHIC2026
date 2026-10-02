import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getProjectById } from "@/data/galleryData";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // 1. Coba ambil dari database Prisma jika tabel tersedia
    try {
      const dbProject = await prisma.projects.findUnique({
        where: { id },
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
      });

      if (dbProject) {
        const typeSlug = dbProject.type === "KA" ? "analis-kimia" : dbProject.type?.toLowerCase() || "rpl";
        const typeLabel = dbProject.type === "KA" ? "Analis Kimia" : dbProject.type || "RPL";

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
          coverImage: dbProject.media[0]?.url || "/images/preview-rpl.jpg",
          galleryImages: dbProject.media.length > 0 ? dbProject.media.map((m) => m.url) : ["/images/preview-rpl.jpg"],
          status: (dbProject.status === "featured" ? "featured" : "verified") as any,
          tools: dbProject.tools.map((t) => t.tool.name),
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
            likes: 0,
          },
          links: {},
        };

        return NextResponse.json({ project: mappedProject }, { status: 200 });
      }
    } catch {
      // Prisma table may not exist yet in local development, fall through to static data
    }

    // 2. Fallback ke data terpusat (galleryData.ts)
    const fallbackProject = getProjectById(id);
    if (fallbackProject) {
      return NextResponse.json({ project: fallbackProject }, { status: 200 });
    }

    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching project detail:", error);
    return NextResponse.json({ error: "Failed to fetch gallery project" }, { status: 500 });
  }
}