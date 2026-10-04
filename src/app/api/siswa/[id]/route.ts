/**
 * GET /api/siswa/[id]
 *
 * Profil publik siswa beserta seluruh karyanya yang sudah disetujui.
 * Endpoint ini PUBLIK — tidak memerlukan sesi login.
 *
 * [id] menerima dua format:
 *   • UUID siswa  (student.userId = users.id)
 *   • NIS siswa   (student.nis)
 *
 * Respons:
 *   { student, projects }
 *
 * Aturan privasi:
 *   - Jika student.isPrivate tidak ada di skema, semua profil dianggap publik.
 *   - Email dan data sensitif TIDAK pernah dikirim ke klien.
 *   - passwordHash tidak masuk select sama sekali.
 */

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// ─── Helper: konversi tipe project ke slug jurusan ────────────────────────────
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

    if (!id) {
      return NextResponse.json({ error: "ID atau NIS tidak diberikan." }, { status: 400 })
    }

    // Cari berdasarkan UUID (userId) atau NIS
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    const studentRow = await prisma.student.findFirst({
      where: isUuid ? { userId: id } : { nis: id },
      select: {
        userId: true,
        nis: true,
        class: true,
        generation: true,
        bio: true,
        currentCareer: true,
        photoUrl: true,
        user: {
          select: {
            id: true,
            name: true,
            status: true,
            // email SENGAJA dihilangkan — tidak boleh dikirim ke publik
          },
        },
        major: {
          select: {
            name: true,
            fullName: true,
          },
        },
        projects: {
          where: {
            status: "approved",
            deletedAt: null,
            isPrivate: false,
          },
          orderBy: { publishedAt: "desc" },
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
            media: {
              select: { url: true, type: true },
              orderBy: { order: "asc" },
              take: 8,
            },
            tools: {
              select: { tool: { select: { name: true } }, name: true },
            },
            badges: {
              select: {
                badge: { select: { tier: true, name: true } },
                awardedAt: true,
              },
            },
            advisor: {
              select: {
                user: { select: { name: true } },
              },
            },
            mainFeatures: {
              select: { feature: true },
            },
          },
        },
      },
    })

    if (!studentRow) {
      return NextResponse.json({ error: "Siswa tidak ditemukan." }, { status: 404 })
    }

    // Siswa nonaktif tidak ditampilkan ke publik
    if (studentRow.user.status === "nonaktif") {
      return NextResponse.json({ error: "Profil siswa tidak tersedia." }, { status: 404 })
    }

    // ── Shape student ────────────────────────────────────────────────────────
    const student = {
      id: studentRow.userId,
      name: studentRow.user.name,
      nis: studentRow.nis,
      class: studentRow.class,
      generation: studentRow.generation,
      bio: studentRow.bio ?? null,
      currentCareer: studentRow.currentCareer ?? null,
      photoUrl: studentRow.photoUrl ?? null,
      majorName: studentRow.major.name,
      majorFullName: studentRow.major.fullName,
    }

    // ── Shape projects ───────────────────────────────────────────────────────
    const projects = studentRow.projects.map((p) => {
      const slug = typeToSlug(String(p.type))
      const label = typeToLabel(String(p.type))
      const coverImage = p.coverImage ?? p.media[0]?.url ?? "/images/preview-rpl.jpg"
      const topBadge = p.badges[0]?.badge ?? null

      return {
        id: p.id,
        title: p.title,
        tagline: p.description
          ? p.description.slice(0, 110) + (p.description.length > 110 ? "..." : "")
          : "Karya tugas akhir siswa SMKN 13 Bandung.",
        description: p.description ?? "",
        solutionHighlights: p.mainFeatures.map((f) => f.feature),
        major: slug,
        majorLabel: label,
        jurusan: slug,
        jurusanLabel: label,
        year: p.year,
        coverImage,
        galleryImages: p.media.length > 0 ? p.media.map((m) => m.url) : [coverImage],
        status: (p.status === "featured" ? "featured" : "verified") as "featured" | "verified",
        badgeTier: topBadge ? (topBadge.tier as "gold" | "silver" | "bronze") : undefined,
        badgeLabel: topBadge?.name ?? undefined,
        tools: p.tools.map((t) => t.name || t.tool.name),
        studentId: studentRow.userId,
        studentName: studentRow.user.name,
        studentAvatar: studentRow.photoUrl ?? "/images/preview-rpl.jpg",
        studentClass: studentRow.class,
        isStudentPrivate: false,
        advisor: p.advisor
          ? {
              name: p.advisor.user.name,
              role: "Guru Pembimbing Kompetensi Keahlian",
              reviewNotes: p.reviewNotes ?? "Terverifikasi sekolah.",
            }
          : undefined,
        metrics: {
          views: p.viewCount,
          likes: p.stars,
        },
        score: p.score ?? null,
        links: {},
      }
    })

    return NextResponse.json({ student, projects })
  } catch (error) {
    console.error("Error in GET /api/siswa/[id]:", error)
    return NextResponse.json(
      { error: "Gagal memuat profil siswa." },
      { status: 500 }
    )
  }
}
