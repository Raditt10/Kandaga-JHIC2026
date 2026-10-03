import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { JurusanSlug, StudentProfileData, GalleryProjectItem } from "@/types";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Search by student.userId, student.nis, or user.name
    let student = await prisma.student.findFirst({
      where: {
        OR: [
          { userId: id },
          { nis: id },
          { user: { name: id } },
          { user: { email: { startsWith: id } } },
        ],
      },
      include: {
        user: true,
        major: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }

    const majorSlug: JurusanSlug =
      student.major.name === "Analis Kimia"
        ? "analis-kimia"
        : student.major.name.toLowerCase() === "tkj"
        ? "tkj"
        : "rpl";

    // Fetch approved projects for this student
    const projects = await prisma.projects.findMany({
      where: {
        studentId: student.userId,
        status: "approved",
        deletedAt: null,
      },
      include: {
        media: { orderBy: { order: "asc" } },
        tools: { include: { tool: true } },
        advisor: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const mappedProjects: GalleryProjectItem[] = projects.map((p) => {
      const typeSlug: JurusanSlug =
        p.type === "KA" ? "analis-kimia" : p.type === "TKJ" ? "tkj" : "rpl";
      const typeLabel =
        p.type === "KA" ? "Analis Kimia" : p.type === "TKJ" ? "TKJ" : "RPL";
      const mediaUrls = (p.media || []).map((m) => m.url);
      const cover = p.coverImage || mediaUrls[0] || "/images/preview-rpl.jpg";

      return {
        id: p.id,
        title: p.title,
        tagline: p.description ? p.description.slice(0, 110) + "..." : "Karya tugas akhir siswa SMKN 13 Bandung.",
        description: p.description || "",
        solutionHighlights: [],
        major: typeSlug,
        majorLabel: typeLabel,
        jurusan: typeSlug,
        jurusanLabel: typeLabel,
        year: p.year || new Date().getFullYear(),
        coverImage: cover,
        galleryImages: mediaUrls.length > 0 ? mediaUrls : [cover],
        status: (p.status === "featured" ? "featured" : "verified") as any,
        tools: (p.tools || []).map((t) => t.name || t.tool?.name).filter(Boolean),
        studentId: student!.userId,
        studentName: student!.user.name,
        studentAvatar: student!.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        studentClass: student!.class || "XII",
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
      };
    });

    const studentProfile: StudentProfileData = {
      id: student.userId,
      name: student.user.name,
      username: student.user.name.toLowerCase().replace(/\s+/g, ""),
      nis: student.nis || "—",
      class: student.class,
      major: majorSlug,
      majorName: student.major.fullName,
      generation: student.generation || 2026,
      avatar: student.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      bio: student.bio || `Siswa kompetensi keahlian ${student.major.fullName} SMKN 13 Bandung.`,
      currentCareer: "Siswa SMK Aktif",
      status: student.status === "aktif" ? "aktif" : "alumni",
      isPrivate: false,
      skills: majorSlug === "rpl" ? ["TypeScript", "Next.js", "PostgreSQL", "Tailwind CSS"] : majorSlug === "tkj" ? ["MikroTik", "Cisco", "Linux Server", "Network Security"] : ["Kimia Analisis", "Spektrofotometri", "Kromatografi", "Quality Control"],
      socialLinks: {
        github: `https://github.com/${student.user.name.toLowerCase().replace(/\s+/g, "")}`,
        linkedin: `https://linkedin.com/in/${student.user.name.toLowerCase().replace(/\s+/g, "")}`,
      },
      contactEmail: student.user.email,
    };

    return NextResponse.json({
      success: true,
      student: studentProfile,
      projects: mappedProjects,
    });
  } catch (error) {
    console.error("GET /api/siswa/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil profil siswa" },
      { status: 500 }
    );
  }
}
