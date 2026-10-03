import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import type { ProjectType } from "@prisma/client";

function mapMajorToProjectType(major: string): ProjectType {
  const m = (major || "").toLowerCase().trim();
  if (m === "analis-kimia" || m === "ka" || m.includes("kimia")) return "KA";
  if (m === "tkj" || m.includes("jaringan")) return "TKJ";
  return "RPL";
}

function mapProjectTypeToSlug(type: ProjectType | string): { slug: "rpl" | "tkj" | "analis-kimia"; label: string } {
  if (type === "KA") return { slug: "analis-kimia", label: "Analis Kimia" };
  if (type === "TKJ") return { slug: "tkj", label: "TKJ" };
  return { slug: "rpl", label: "RPL" };
}

async function ensureStudentProfile(userId: string, majorHint?: string) {
  const existing = await prisma.student.findUnique({
    where: { userId },
  });
  if (existing) return existing;

  const targetMajorName =
    majorHint === "analis-kimia"
      ? "Analis Kimia"
      : majorHint === "tkj"
      ? "TKJ"
      : "RPL";

  let major = await prisma.major.findFirst({
    where: { name: { contains: targetMajorName, mode: "insensitive" } },
  });

  if (!major) {
    major = await prisma.major.findFirst();
  }

  if (!major) {
    major = await prisma.major.create({
      data: {
        name: "RPL",
        fullName: "Rekayasa Perangkat Lunak",
        image: "/images/preview-rpl.jpg",
        link: "/jurusan/rpl",
        description: "Pengembangan aplikasi web, mobile, dan sistem informasi berbasis kode.",
      },
    });
  }

  const randomNis = "13" + Math.floor(100000 + Math.random() * 900000).toString();

  return await prisma.student.create({
    data: {
      userId,
      majorId: major.id,
      nis: randomNis,
      class: "XII RPL 1",
      generation: 2025,
      status: "aktif",
    },
  });
}

function mapDatabaseProject(p: any) {
  const { slug, label } = mapProjectTypeToSlug(p.type);
  const mediaUrls = (p.media || []).map((m: any) => m.url);
  const cover = p.coverImage || mediaUrls[0] || "/images/preview-rpl.jpg";
  const gallery = mediaUrls.length > 0 ? mediaUrls : [cover];

  return {
    id: p.id,
    title: p.title,
    tagline: p.description ? p.description.slice(0, 110) + "..." : "Karya tugas akhir siswa SMKN 13 Bandung.",
    description: p.description || "",
    solutionHighlights: (p.mainFeatures || []).map((f: any) => f.feature),
    major: slug,
    majorLabel: label,
    jurusan: slug,
    jurusanLabel: label,
    year: p.year || new Date().getFullYear(),
    coverImage: cover,
    galleryImages: gallery,
    status: p.status || "pending",
    isPrivate: Boolean(p.isPrivate),
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
    tools: (p.tools || []).map((t: any) => t.name || t.tool?.name).filter(Boolean),
    studentId: p.studentId,
    studentName: p.student?.user?.name || "Siswa SMKN 13",
    studentAvatar: p.student?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    studentClass: p.student?.class || "XII",
    isStudentPrivate: false,
    advisor: {
      name: p.advisor?.user?.name || "Guru Pembimbing",
      role: "Guru Pembimbing Kompetensi Keahlian",
      reviewNotes: p.reviewNotes || "Menunggu penilaian kelayakan karya.",
    },
    metrics: {
      views: p.viewCount || 0,
      likes: p.stars || 0,
    },
    links: {},
  };
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Sesi login diperlukan" }, { status: 401 });
  }

  const studentId = session.user.id;

  try {
    // Pastikan profil siswa sudah ada di tabel students
    await ensureStudentProfile(studentId);

    const dbProjects = await prisma.projects.findMany({
      where: { studentId },
      include: {
        media: { orderBy: { order: "asc" } },
        tools: {
          include: {
            tool: true,
          },
        },
        mainFeatures: true,
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

    const mapped = dbProjects.map(mapDatabaseProject);
    return NextResponse.json({ projects: mapped }, { status: 200 });
  } catch (error) {
    console.error("GET /api/student/projects error:", error);
    return NextResponse.json({ error: "Gagal memuat data proyek dari database" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Sesi login diperlukan" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: "Judul karya wajib diisi" }, { status: 400 });
    }

    const studentId = session.user.id;
    const majorSlug = body.major || "rpl";
    const projectType = mapMajorToProjectType(majorSlug);

    // 1. Pastikan profil siswa terhubung di database
    await ensureStudentProfile(studentId, majorSlug);

    // 2. Persiapkan media (cover & galeri tambahan)
    const rawGallery: string[] = Array.isArray(body.galleryImages) ? body.galleryImages : [];
    const coverUrl = body.coverImage || rawGallery[0] || "/images/preview-rpl.jpg";
    const allMediaUrls = Array.from(new Set([coverUrl, ...rawGallery].filter(Boolean)));

    // 3. Persiapkan tools
    const toolNames: string[] = Array.isArray(body.tools)
      ? body.tools.filter((t: any) => typeof t === "string" && t.trim()).map((t: string) => t.trim())
      : [];

    const projectToolsData = [];
    for (const name of toolNames) {
      const skillTool = await prisma.skillTool.upsert({
        where: { name },
        create: { name },
        update: {},
      });
      projectToolsData.push({
        toolId: skillTool.id,
        name,
      });
    }

    // 4. Persiapkan poin fitur / solusi
    const features: string[] = Array.isArray(body.mainFeatures)
      ? body.mainFeatures.filter((f: any) => typeof f === "string" && f.trim()).map((f: string) => f.trim())
      : [];

    // 5. Buat entitas proyek di database
    const created = await prisma.projects.create({
      data: {
        studentId,
        title: body.title.trim(),
        description: body.description?.trim() || "",
        type: projectType,
        year: Number(body.year) || new Date().getFullYear(),
        status: body.isPrivate ? "private" : "pending",
        isPrivate: Boolean(body.isPrivate),
        coverImage: coverUrl,
        viewCount: 0,
        stars: 0,
        mainFeatures: {
          create: features.map((feature) => ({ feature })),
        },
        media: {
          create: allMediaUrls.map((url, index) => ({
            url,
            type: "photo",
            order: index,
          })),
        },
        tools: {
          create: projectToolsData,
        },
      },
      include: {
        media: { orderBy: { order: "asc" } },
        tools: { include: { tool: true } },
        mainFeatures: true,
        badges: { include: { badge: true } },
        student: { include: { user: true, major: true } },
        advisor: { include: { user: true } },
      },
    });

    const mapped = mapDatabaseProject(created);

    // Broadcast real-time activity notification to admin via Socket.IO
    try {
      const io = (global as unknown as { io?: any }).io;
      if (io) {
        io.to("admin_channel").emit("admin_notification", {
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: "project_created",
          category: "project",
          title: "Karya Siswa Baru Diunggah",
          message: `${created.student?.user?.name || "Siswa"} mengunggah karya baru "${created.title}" (${mapped.majorLabel}).`,
          timestamp: new Date().toISOString(),
          read: false,
          priority: "normal",
          metadata: {
            projectId: created.id,
            projectTitle: created.title,
            studentName: created.student?.user?.name || "Siswa SMKN 13",
            url: `/gallery/${created.id}`,
            badgeText: mapped.majorLabel,
          },
        });
      }
    } catch (sockErr) {
      console.warn("Socket broadcast error:", sockErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Karya berhasil disimpan ke database",
        project: mapped,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/student/projects error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan karya ke database" },
      { status: 500 }
    );
  }
}
