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
    links: {
      demoUrl: p.links?.demoUrl || undefined,
      githubUrl: p.links?.githubUrl || undefined,
      docUrl: p.links?.docUrl || undefined,
    },
  };
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Sebelumnya endpoint ini terbuka tanpa login sama sekali — karya berstatus
    // pending/privat bisa dibaca siapa pun yang menebak URL-nya.
    const auth = await requireStudent();
    if (auth.error) return auth.error;

    const { id } = await context.params;
    const project = await prisma.projects.findUnique({
      where: { id },
      include: {
        mainFeatures: true,
        media: { orderBy: { order: "asc" } },
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
        advisor: {
          include: {
            user: true,
          },
        },
        badges: {
          include: {
            badge: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Proyek tidak ditemukan" }, { status: 404 });
    }

    if (project.studentId !== auth.userId) {
      return NextResponse.json({ error: "Karya ini bukan milik Anda" }, { status: 403 });
    }

    const mapped = mapDatabaseProject(project);
    return NextResponse.json({ success: true, project: mapped }, { status: 200 });
  } catch (error) {
    console.error("GET /api/student/projects/[id] error:", error);
    return NextResponse.json({ error: "Gagal memuat data proyek" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireStudent();
    if (auth.error) return auth.error;

    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));

    const existing = await prisma.projects.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Proyek tidak ditemukan" }, { status: 404 });
    }

    // Kepemilikan wajib dicek: sebelumnya siapa pun yang login bisa mengubah
    // status privasi karya milik siswa lain.
    if (existing.studentId !== auth.userId) {
      return NextResponse.json({ error: "Karya ini bukan milik Anda" }, { status: 403 });
    }

    // Toggle atau gunakan nilai eksplisit
    const newIsPrivate =
      typeof body.isPrivate === "boolean" ? body.isPrivate : !existing.isPrivate;

    const updated = await prisma.projects.update({
      where: { id },
      data: {
        isPrivate: newIsPrivate,
        status: newIsPrivate ? "private" : "pending",
      },
      include: {
        mainFeatures: true,
        media: { orderBy: { order: "asc" } },
        tools: { include: { tool: true } },
        student: { include: { user: true, major: true } },
        advisor: { include: { user: true } },
      },
    });

    const mapped = mapDatabaseProject(updated);
    return NextResponse.json({ success: true, project: mapped }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/student/projects/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui status visibilitas proyek" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireStudent();
    if (auth.error) return auth.error;

    const { id } = await context.params;
    const body = await req.json();

    const existing = await prisma.projects.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Proyek tidak ditemukan" }, { status: 404 });
    }

    if (existing.studentId !== auth.userId) {
      return NextResponse.json({ error: "Karya ini bukan milik Anda" }, { status: 403 });
    }

    const updateData: any = {};

    if (body.title && typeof body.title === "string") {
      updateData.title = body.title.trim();
    }
    if (body.description !== undefined) {
      updateData.description = body.description.trim();
    }
    if (body.major) {
      updateData.type = mapMajorToProjectType(body.major);
    }
    if (body.year) {
      updateData.year = Number(body.year);
    }
    if (typeof body.isPrivate === "boolean") {
      updateData.isPrivate = body.isPrivate;
      updateData.status = body.isPrivate ? "private" : "pending";
    }
    if (body.coverImage) {
      updateData.coverImage = body.coverImage;
    }

    // Perbarui relasi media jika diberikan
    if (Array.isArray(body.galleryImages)) {
      await prisma.projectsMedia.deleteMany({ where: { projectId: id } });
      const allUrls = Array.from(new Set([body.coverImage, ...body.galleryImages].filter(Boolean)));
      await prisma.projectsMedia.createMany({
        data: allUrls.map((url: string, index: number) => ({
          projectId: id,
          url,
          type: "photo",
          order: index,
        })),
      });
    }

    // Perbarui relasi tools jika diberikan
    if (Array.isArray(body.tools)) {
      await prisma.projectsTool.deleteMany({ where: { projectId: id } });
      for (const name of body.tools) {
        if (typeof name === "string" && name.trim()) {
          const trimmed = name.trim();
          const skillTool = await prisma.skillTool.upsert({
            where: { name: trimmed },
            create: { name: trimmed },
            update: {},
          });
          await prisma.projectsTool.create({
            data: {
              projectId: id,
              toolId: skillTool.id,
              name: trimmed,
            },
          });
        }
      }
    }

    const updated = await prisma.projects.update({
      where: { id },
      data: updateData,
      include: {
        mainFeatures: true,
        media: { orderBy: { order: "asc" } },
        tools: { include: { tool: true } },
        student: { include: { user: true, major: true } },
        advisor: { include: { user: true } },
      },
    });

    const mapped = mapDatabaseProject(updated);
    return NextResponse.json({ success: true, project: mapped }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/student/projects/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui data proyek" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireStudent();
    if (auth.error) return auth.error;

    const { id } = await context.params;

    const existing = await prisma.projects.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Proyek tidak ditemukan" }, { status: 404 });
    }

    // Tanpa cek ini, siapa pun yang punya sesi login bisa menghapus karya
    // milik siswa lain hanya dengan menebak id-nya.
    if (existing.studentId !== auth.userId) {
      return NextResponse.json({ error: "Karya ini bukan milik Anda" }, { status: 403 });
    }

    await prisma.projects.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Karya berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/student/projects/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus proyek" }, { status: 500 });
  }
}
