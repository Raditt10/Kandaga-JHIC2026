import prisma from "@/lib/prisma";
import type { GalleryProjectItem, JurusanSlug } from "@/types";
import { ProjectType, Prisma } from "@prisma/client";

export interface GalleryQueryOptions {
  page?: number;
  limit?: number;
  major?: string;
  q?: string;
  sort?: "terbaru" | "populer" | "unggulan" | string;
}

export interface PaginatedGalleryResult {
  projects: GalleryProjectItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Common projection for gallery card listing to avoid overfetching.
 */
const galleryCardSelect = {
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
    orderBy: { order: "asc" as const },
    take: 1,
  },
  tools: {
    select: {
      name: true,
      tool: { select: { name: true } },
    },
  },
  student: {
    select: {
      userId: true,
      class: true,
      photoUrl: true,
      user: {
        select: {
          name: true,
          avatarUrl: true,
        },
      },
    },
  },
  advisor: {
    select: {
      user: {
        select: {
          name: true,
        },
      },
    },
  },
} satisfies Prisma.ProjectsSelect;

export type GalleryCardProjectRecord = Prisma.ProjectsGetPayload<{
  select: typeof galleryCardSelect;
}>;

/**
 * Maps raw database project record to public GalleryProjectItem format.
 */
function mapProjectRecord(p: GalleryCardProjectRecord): GalleryProjectItem {
  const typeSlug: JurusanSlug =
    p.type === "KA" ? "analis-kimia" : p.type === "TKJ" ? "tkj" : "rpl";
  const typeLabel =
    p.type === "KA" ? "Analis Kimia" : p.type === "TKJ" ? "TKJ" : "RPL";
  const mediaUrls: string[] = (p.media || []).map((m) => m.url);
  const cover = p.coverImage || mediaUrls[0] || "/images/preview-rpl.jpg";
  const isFeatured = p.status === "featured" || (typeof p.stars === "number" && p.stars >= 150);

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
      .filter((toolName): toolName is string => Boolean(toolName)),
    studentId: p.studentId,
    studentName: p.student?.user?.name || "Siswa SMKN 13",
    studentAvatar:
      p.student?.photoUrl ||
      p.student?.user?.avatarUrl ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    studentClass: p.student?.class || "XII",
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
}

/**
 * Fetches paginated gallery projects from database with SQL LIMIT & OFFSET.
 */
export async function getGalleryProjects(
  options: GalleryQueryOptions = {}
): Promise<PaginatedGalleryResult> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(50, Math.max(1, options.limit || 12));
  const skip = (page - 1) * limit;

  const where: Prisma.ProjectsWhereInput = {
    status: "approved",
    deletedAt: null,
    isPrivate: false,
  };

  // Filter by major / jurusan
  if (options.major && options.major !== "semua") {
    const m = options.major.toLowerCase();
    if (m === "rpl") {
      where.type = ProjectType.RPL;
    } else if (m === "tkj") {
      where.type = ProjectType.TKJ;
    } else if (m === "analis-kimia" || m === "ka") {
      where.type = ProjectType.KA;
    }
  }

  // Filter by search query
  if (options.q && options.q.trim()) {
    const q = options.q.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { student: { user: { name: { contains: q, mode: "insensitive" } } } },
      { tools: { some: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }

  // Sorting
  let orderBy: Prisma.ProjectsOrderByWithRelationInput[] = [{ createdAt: "desc" }];
  if (options.sort === "populer") {
    orderBy = [{ viewCount: "desc" }, { createdAt: "desc" }];
  } else if (options.sort === "unggulan") {
    orderBy = [{ stars: "desc" }, { year: "desc" }, { createdAt: "desc" }];
  } else {
    // Default terbaru
    orderBy = [{ year: "desc" }, { createdAt: "desc" }];
  }

  const [dbProjects, total] = await prisma.$transaction([
    prisma.projects.findMany({
      where,
      take: limit,
      skip,
      select: galleryCardSelect,
      orderBy,
    }),
    prisma.projects.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    projects: dbProjects.map(mapProjectRecord),
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Fetches a single project detail by ID.
 */
export async function getGalleryProjectById(
  id: string
): Promise<GalleryProjectItem | null> {
  // Validate UUID to prevent PostgreSQL P2023 crash on arbitrary slugs
  if (!id || !UUID_REGEX.test(id)) {
    return null;
  }

  try {
    const dbProject = await prisma.projects.findUnique({
      where: { id },
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
        deletedAt: true,
        isPrivate: true,
        mainFeatures: {
          select: { feature: true },
        },
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
        student: {
          select: {
            userId: true,
            class: true,
            photoUrl: true,
            user: { select: { name: true, avatarUrl: true } },
            major: { select: { fullName: true } },
          },
        },
        advisor: {
          select: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!dbProject || dbProject.status !== "approved" || dbProject.deletedAt || dbProject.isPrivate) {
      return null;
    }

    const typeSlug: JurusanSlug =
      dbProject.type === "KA" ? "analis-kimia" : dbProject.type === "TKJ" ? "tkj" : "rpl";
    const typeLabel =
      dbProject.type === "KA" ? "Analis Kimia" : dbProject.type === "TKJ" ? "TKJ" : "RPL";
    const mediaUrls = (dbProject.media || []).map((m) => m.url);
    const cover = dbProject.coverImage || mediaUrls[0] || "/images/preview-rpl.jpg";
    const isFeatured =
      typeof dbProject.stars === "number" && dbProject.stars >= 150;

    const highlights =
      dbProject.mainFeatures && dbProject.mainFeatures.length > 0
        ? dbProject.mainFeatures.map((f: { feature: string }) => f.feature)
        : [
            "Proyek terverifikasi dan memenuhi standar kompetensi keahlian kurikulum SMK.",
            "Telah melalui review kelayakan teknis oleh guru pembimbing.",
          ];

    return {
      id: dbProject.id,
      title: dbProject.title,
      tagline: dbProject.description
        ? dbProject.description.slice(0, 110) + "..."
        : "Karya tugas akhir siswa SMKN 13 Bandung.",
      description:
        dbProject.description ||
        "Deskripsi proyek sedang dalam kurasi pembimbing.",
      solutionHighlights: highlights,
      major: typeSlug,
      majorLabel: typeLabel,
      jurusan: typeSlug,
      jurusanLabel: typeLabel,
      year: dbProject.year || new Date().getFullYear(),
      coverImage: cover,
      galleryImages: mediaUrls.length > 0 ? mediaUrls : [cover],
      status: isFeatured ? ("featured" as const) : ("verified" as const),
      tools: (dbProject.tools || [])
        .map((t) => t.name || t.tool?.name)
        .filter((toolName): toolName is string => Boolean(toolName)),
      studentId: dbProject.studentId,
      studentName: dbProject.student?.user?.name || "Siswa SMKN 13",
      studentAvatar:
        dbProject.student?.photoUrl ||
        dbProject.student?.user?.avatarUrl ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      studentClass: dbProject.student?.class || "XII",
      isStudentPrivate: Boolean(dbProject.isPrivate),
      isPrivate: Boolean(dbProject.isPrivate),
      advisor: {
        name: dbProject.advisor?.user?.name || "Guru Pembimbing",
        role: "Guru Pembimbing Kompetensi Keahlian",
        reviewNotes:
          dbProject.reviewNotes || "Karya telah memenuhi standar penilaian akhir.",
      },
      metrics: {
        views: dbProject.viewCount || 0,
        likes: dbProject.stars || 0,
      },
      links: {},
    };
  } catch (err) {
    console.error(`[gallery-server] Error fetching project ${id}:`, err);
    return null;
  }
}

/**
 * Fetches related projects with SQL limit, avoiding unbounded fetches.
 */
export async function getRelatedProjects(
  currentProjectId: string,
  type: ProjectType,
  limit = 3
): Promise<GalleryProjectItem[]> {
  const isUuid = UUID_REGEX.test(currentProjectId);
  const where: Prisma.ProjectsWhereInput = {
    type,
    status: "approved",
    deletedAt: null,
    isPrivate: false,
  };
  if (isUuid) {
    where.id = { not: currentProjectId };
  }

  const dbProjects = await prisma.projects.findMany({
    where,
    take: limit,
    select: galleryCardSelect,
    orderBy: { createdAt: "desc" },
  });

  return dbProjects.map(mapProjectRecord);
}
