import prisma from "@/lib/prisma";
import type { JurusanSlug, StudentProfileData, GalleryProjectItem } from "@/types";
import { Prisma } from "@prisma/client";

export interface StudentProfileResult {
  student: StudentProfileData;
  projects: GalleryProjectItem[];
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getStudentProfileById(
  id: string
): Promise<StudentProfileResult | null> {
  if (!id) return null;

  try {
    const isUuid = UUID_REGEX.test(id);
    const orConditions: Prisma.StudentWhereInput[] = [
      { nis: id },
      { user: { name: id } },
      { user: { email: { startsWith: id } } },
    ];
    if (isUuid) {
      orConditions.unshift({ userId: id });
    }

    const student = await prisma.student.findFirst({
      where: {
        OR: orConditions,
      },
      include: {
        user: true,
        major: true,
      },
    });

    if (!student) {
      return null;
    }

    const majorSlug: JurusanSlug =
      student.major.name === "Analis Kimia"
        ? "analis-kimia"
        : student.major.name.toLowerCase() === "tkj"
        ? "tkj"
        : "rpl";

    const projects = await prisma.projects.findMany({
      where: {
        studentId: student.userId,
        status: "approved",
        deletedAt: null,
        isPrivate: false,
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        year: true,
        status: true,
        coverImage: true,
        reviewNotes: true,
        viewCount: true,
        stars: true,
        studentId: true,
        isPrivate: true,
        media: {
          select: { url: true, order: true },
          orderBy: { order: "asc" },
        },
        tools: {
          select: {
            name: true,
            tool: { select: { name: true } },
          },
        },
        advisor: {
          select: {
            user: { select: { name: true } },
          },
        },
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
      const isFeatured =
        p.status === "featured" || (typeof p.stars === "number" && p.stars >= 150);

      return {
        id: p.id,
        title: p.title,
        tagline: p.description
          ? p.description.slice(0, 110) + "..."
          : "Karya tugas akhir siswa SMKN 13 Bandung.",
        description: p.description || "",
        solutionHighlights: [],
        major: typeSlug,
        majorLabel: typeLabel,
        jurusan: typeSlug,
        jurusanLabel: typeLabel,
        year: p.year || new Date().getFullYear(),
        coverImage: cover,
        galleryImages: mediaUrls.length > 0 ? mediaUrls : [cover],
        status: isFeatured ? ("featured" as const) : ("verified" as const),
        tools: (p.tools || [])
          .map((t) => t.name || t.tool?.name)
          .filter((name): name is string => Boolean(name)),
        studentId: student.userId,
        studentName: student.user.name,
        studentAvatar:
          student.photoUrl ||
          student.user.avatarUrl ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        studentClass: student.class || "XII",
        isStudentPrivate: Boolean(p.isPrivate),
        isPrivate: Boolean(p.isPrivate),
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

    const studentProfile: StudentProfileData = {
      id: student.userId,
      name: student.user.name,
      username: student.user.name.toLowerCase().replace(/\s+/g, ""),
      nis: student.nis || "—",
      class: student.class,
      major: majorSlug,
      majorName: student.major.fullName,
      generation: student.generation || 2026,
      avatar:
        student.photoUrl ||
        student.user.avatarUrl ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      bio:
        student.bio ||
        `Siswa kompetensi keahlian ${student.major.fullName} SMKN 13 Bandung.`,
      currentCareer: student.currentCareer || "Siswa SMK Aktif",
      status: student.status === "aktif" ? "aktif" : "alumni",
      isPrivate: false,
      skills:
        majorSlug === "rpl"
          ? ["TypeScript", "Next.js", "PostgreSQL", "Tailwind CSS"]
          : majorSlug === "tkj"
          ? ["MikroTik", "Cisco", "Linux Server", "Network Security"]
          : [
              "Kimia Analisis",
              "Spektrofotometri",
              "Kromatografi",
              "Quality Control",
            ],
      socialLinks: {
        github: `https://github.com/${student.user.name
          .toLowerCase()
          .replace(/\s+/g, "")}`,
        linkedin: `https://linkedin.com/in/${student.user.name
          .toLowerCase()
          .replace(/\s+/g, "")}`,
      },
      contactEmail: student.user.email,
    };

    return {
      student: studentProfile,
      projects: mappedProjects,
    };
  } catch (err) {
    console.error(`[student-server] Error fetching student ${id}:`, err);
    return null;
  }
}
