import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStudent } from "@/lib/api-auth";
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
  try {
    const existing = await prisma.student.findUnique({
      where: { userId },
    });
    if (existing) return existing;

    // Pastikan user ada di database
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) return null;

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

    const randomNis = "13" + Date.now().toString().slice(-6);

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
  } catch (err) {
    console.error("ensureStudentProfile error:", err);
    return null;
  }
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
    // Nilai & waktu kurasi dari guru, supaya siswa bisa melihat hasil penilaian.
    score: p.score ?? null,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : null,
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
    links: {
      ...(p.githubUrl ? { githubUrl: p.githubUrl } : {}),
      ...(p.demoUrl   ? { demoUrl:   p.demoUrl   } : {}),
    },
  };
}

export async function GET(req: NextRequest) {
  // Wajib role siswa. Tanpa cek ini, akun perusahaan/admin yang login bisa
  // memanggil endpoint ini dan ensureStudentProfile() akan membuat baris
  // `students` palsu untuk mereka.
  const auth = await requireStudent();
  if (auth.error) return auth.error;

  const studentId = auth.userId;

  try {
    // Pastikan profil siswa sudah ada di tabel students jika akun baru
    try {
      await ensureStudentProfile(studentId);
    } catch (profileErr) {
      console.warn("ensureStudentProfile warning:", profileErr);
    }

    const dbProjects = await prisma.projects.findMany({
      // Karya yang sudah diarsipkan (soft-delete) tidak boleh muncul lagi.
      where: { studentId, deletedAt: null },
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
            user: { select: { id: true, name: true, email: true } },
            major: true,
          },
        },
        advisor: {
          include: {
            user: { select: { id: true, name: true, email: true } },
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
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Gagal memuat data proyek dari database: ${detail}` }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireStudent();
    if (auth.error) return auth.error;

    const body = await req.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: "Judul karya wajib diisi" }, { status: 400 });
    }

    const studentId = auth.userId;
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

    let projectToolsData: { toolId: number; name: string }[] = [];
    const uniqueToolNames = Array.from(new Set(toolNames));
    if (uniqueToolNames.length > 0) {
      await prisma.skillTool.createMany({
        data: uniqueToolNames.map((name) => ({ name })),
        skipDuplicates: true,
      });
      const tools = await prisma.skillTool.findMany({
        where: { name: { in: uniqueToolNames } },
        select: { id: true, name: true },
      });
      const toolMap = new Map<string, number>();
      for (const t of tools) {
        toolMap.set(t.name.toLowerCase(), t.id);
      }
      const seenIds = new Set<number>();
      for (const name of uniqueToolNames) {
        const id = toolMap.get(name.toLowerCase());
        if (id && !seenIds.has(id)) {
          seenIds.add(id);
          projectToolsData.push({ toolId: id, name });
        }
      }
    }

    // 4. Persiapkan poin fitur / solusi (unik untuk cegah @@unique([projectId, feature]) collision)
    const rawFeatures: string[] = Array.isArray(body.mainFeatures)
      ? body.mainFeatures.filter((f: any) => typeof f === "string" && f.trim()).map((f: string) => f.trim())
      : [];
    const features = Array.from(new Set(rawFeatures));

    // 5. Validasi guru pembimbing agar tidak memicu foreign key violation
    let validAdvisorId: string | undefined = undefined;
    if (body.advisorId && typeof body.advisorId === "string" && body.advisorId.trim()) {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: body.advisorId.trim() },
        select: { userId: true },
      });
      if (teacher) {
        validAdvisorId = teacher.userId;
      }
    }
    if (!validAdvisorId) {
      const fallbackTeacher = await prisma.teacher.findFirst({
        select: { userId: true },
      });
      if (fallbackTeacher) {
        validAdvisorId = fallbackTeacher.userId;
      }
    }

    // 6. Buat entitas proyek di database
    const created = await prisma.projects.create({
      data: {
        studentId,
        ...(validAdvisorId ? { advisorId: validAdvisorId } : {}),
        title: body.title.trim(),
        description: body.description?.trim() || "",
        type: projectType,
        year: Number(body.year) || new Date().getFullYear(),
        status: body.isPrivate ? "private" : "pending",
        isPrivate: Boolean(body.isPrivate),
        coverImage: coverUrl,
        viewCount: 0,
        stars: 0,
        // Tautan eksternal opsional
        ...(body.githubUrl && typeof body.githubUrl === "string" && body.githubUrl.trim()
          ? { githubUrl: body.githubUrl.trim() } : {}),
        ...(body.demoUrl && typeof body.demoUrl === "string" && body.demoUrl.trim()
          ? { demoUrl: body.demoUrl.trim() } : {}),
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
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Gagal menyimpan karya ke database: ${detail}` },
      { status: 500 }
    );
  }
}
