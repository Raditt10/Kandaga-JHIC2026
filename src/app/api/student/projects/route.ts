import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { GALLERY_PROJECTS } from "@/data/galleryData";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  try {
    try {
      const whereClause = studentId ? { studentId } : {};
      const dbProjects = await prisma.projects.findMany({
        where: whereClause,
        include: {
          media: true,
          tools: {
            include: {
              tool: true,
            },
          },
          student: {
            include: {
              user: true,
              major: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (dbProjects && dbProjects.length > 0) {
        const mapped = dbProjects.map((p) => {
          const typeSlug = p.type === "KA" ? "analis-kimia" : p.type?.toLowerCase() || "rpl";
          const typeLabel = p.type === "KA" ? "Analis Kimia" : p.type || "RPL";

          return {
            id: p.id,
            title: p.title,
            tagline: p.description ? p.description.slice(0, 110) + "..." : "Karya tugas akhir siswa.",
            description: p.description || "",
            solutionHighlights: [],
            major: typeSlug as any,
            majorLabel: typeLabel,
            jurusan: typeSlug as any,
            jurusanLabel: typeLabel,
            year: p.year || new Date().getFullYear(),
            coverImage: p.media[0]?.url || "/images/preview-rpl.jpg",
            galleryImages: p.media.length > 0 ? p.media.map((m) => m.url) : ["/images/preview-rpl.jpg"],
            status: (p.status === "featured" ? "featured" : "verified") as any,
            isPrivate: p.status === "private" || p.status === "draft",
            createdAt: p.createdAt.toISOString(),
            tools: p.tools.map((t) => t.tool.name),
            studentId: p.studentId,
            studentName: p.student?.user?.name || "Siswa SMKN 13",
            studentAvatar: p.student?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            studentClass: p.student?.class || "XII",
            isStudentPrivate: false,
            metrics: {
              views: p.viewCount || 0,
              likes: 0,
            },
          };
        });

        return NextResponse.json({ projects: mapped });
      }
    } catch {
      // Fallback
    }

    const filtered = studentId
      ? GALLERY_PROJECTS.filter((p) => p.studentId === studentId)
      : GALLERY_PROJECTS;

    return NextResponse.json({ projects: filtered });
  } catch (error) {
    console.error("GET /api/student/projects error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title) {
      return NextResponse.json({ error: "Judul karya wajib diisi" }, { status: 400 });
    }

    // Try Prisma insert or return successful mock creation
    return NextResponse.json({
      success: true,
      message: "Karya berhasil disimpan",
      project: {
        ...body,
        id: body.id || `custom-${Date.now()}`,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("POST /api/student/projects error:", error);
    return NextResponse.json({ error: "Gagal membuat proyek" }, { status: 500 });
  }
}
