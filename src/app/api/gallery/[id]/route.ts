/**
 * GET /api/gallery/[id]
 *
 * Detail karya publik. Hanya karya berstatus "approved" dan belum dihapus
 * yang boleh dikembalikan. Karya pending/rejected/deleted → 404.
 *
 * Tidak ada fallback ke data mock — jika karya tidak ada di DB, berarti
 * karya itu memang tidak ada secara resmi.
 */

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

function typeToSlug(type: string): "rpl" | "tkj" | "analis-kimia" {
  if (type === "TKJ") return "tkj"
  if (type === "KA") return "analis-kimia"
  return "rpl"
}

function typeToLabel(type: string): string {
  if (type === "TKJ") return "TKJ"
  if (type === "KA") return "Analis Kimia"
  return "RPL"
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

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
        viewCount: true,
        stars: true,
        reviewNotes: true,
        score: true,
        deletedAt: true,
        studentId: true,
        isPrivate: true,
        media: {
          select: { url: true, type: true },
          orderBy: { order: "asc" },
          take: 10,
        },
        tools: {
          select: { tool: { select: { name: true } }, name: true },
        },
        badges: {
          select: { badge: { select: { tier: true, name: true } }, awardedAt: true },
        },
        mainFeatures: {
          select: { feature: true },
        },
        student: {
          select: {
            userId: true,
            class: true,
            photoUrl: true,
            user: { select: { name: true } },
            major: { select: { name: true, fullName: true } },
          },
        },
        advisor: {
          select: { user: { select: { name: true } } },
        },
      },
    })

    // Karya tidak ada, atau belum disetujui, atau sudah dihapus, atau diprivat
    if (
      !dbProject ||
      dbProject.status !== "approved" ||
      dbProject.deletedAt !== null ||
      dbProject.isPrivate
    ) {
      return NextResponse.json({ error: "Karya tidak ditemukan." }, { status: 404 })
    }

    // Naikkan view count (fire-and-forget, kegagalan tidak memblokir respons)
    prisma.projects.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {/* diabaikan */})

    const slug = typeToSlug(String(dbProject.type))
    const label = typeToLabel(String(dbProject.type))
    const coverImage = dbProject.coverImage ?? dbProject.media[0]?.url ?? "/images/preview-rpl.jpg"
    const topBadge = dbProject.badges[0]?.badge ?? null

    const project = {
      id: dbProject.id,
      title: dbProject.title,
      tagline: dbProject.description
        ? dbProject.description.slice(0, 110) + (dbProject.description.length > 110 ? "..." : "")
        : "Karya tugas akhir siswa SMKN 13 Bandung.",
      description: dbProject.description ?? "",
      solutionHighlights: dbProject.mainFeatures.map((f) => f.feature),
      major: slug,
      majorLabel: label,
      jurusan: slug,
      jurusanLabel: label,
      year: dbProject.year,
      coverImage,
      galleryImages: dbProject.media.length > 0 ? dbProject.media.map((m) => m.url) : [coverImage],
      status: "verified" as const,
      badgeTier: topBadge ? (topBadge.tier as "gold" | "silver" | "bronze") : undefined,
      badgeLabel: topBadge?.name ?? undefined,
      tools: dbProject.tools.map((t) => t.name || t.tool.name),
      studentId: dbProject.studentId,
      studentName: dbProject.student?.user?.name ?? "Siswa SMKN 13",
      studentAvatar: dbProject.student?.photoUrl ?? "/images/preview-rpl.jpg",
      studentClass: dbProject.student?.class ?? "XII",
      isStudentPrivate: false,
      advisor: dbProject.advisor
        ? {
            name: dbProject.advisor.user.name,
            role: "Guru Pembimbing Kompetensi Keahlian",
            reviewNotes: dbProject.reviewNotes ?? "Terverifikasi sekolah.",
          }
        : undefined,
      metrics: {
        views: dbProject.viewCount,
        likes: dbProject.stars,
      },
      score: dbProject.score ?? null,
      majorForRelated: slug,
      links: {},
    }

    return NextResponse.json({ project }, { status: 200 })
  } catch (error) {
    console.error("Error in GET /api/gallery/[id]:", error)
    return NextResponse.json({ error: "Gagal memuat detail karya." }, { status: 500 })
  }
}
