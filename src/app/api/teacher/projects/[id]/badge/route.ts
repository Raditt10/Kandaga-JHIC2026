/**
 * POST /api/teacher/projects/[id]/badge
 *
 * Berikan atau cabut badge pada karya yang sudah disetujui.
 *
 * Body:
 *   { tier: "gold" | "silver" | "bronze" }  → berikan badge
 *   { tier: null }                           → cabut semua badge guru pada karya ini
 *
 * Aturan (sesuai alurKarya.md §4):
 *   - Hanya role teacher.
 *   - Guru hanya boleh memberi badge pada karya di jurusannya sendiri.
 *   - Karya wajib berstatus "approved" — badge tidak boleh diberikan ke
 *     karya yang belum diverifikasi.
 *   - Tier yang diizinkan untuk guru: gold, silver, bronze.
 *     Tier "industri" hanya wewenang BKK dan ditolak di sini.
 *   - Satu karya hanya boleh punya satu badge dari guru (karena constraint
 *     @@id([projectId, badgeId]) dan satu badge per tier). Jika tier baru
 *     diberikan, tier lama dicabut lebih dulu.
 */

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireTeacher } from "@/lib/api-auth"
import { resolveTeacherScope } from "@/lib/teacher-scope"
import { audit } from "@/lib/activity"

const TEACHER_TIERS = ["gold", "silver", "bronze"] as const
type TeacherTier = (typeof TEACHER_TIERS)[number]

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireTeacher()
    if (auth.error) return auth.error

    const { id: projectId } = await context.params
    const body = await req.json().catch(() => ({}))

    // tier === null berarti cabut badge
    const tier: TeacherTier | null =
      body.tier === null
        ? null
        : TEACHER_TIERS.includes(body.tier)
        ? (body.tier as TeacherTier)
        : undefined as unknown as null

    if (tier === undefined) {
      return NextResponse.json(
        { error: `Tier tidak valid. Pilihan: ${TEACHER_TIERS.join(", ")} atau null untuk mencabut.` },
        { status: 400 }
      )
    }

    // Periksa karya
    const project = await prisma.projects.findUnique({
      where: { id: projectId },
      select: { id: true, title: true, status: true, type: true, deletedAt: true, studentId: true },
    })

    if (!project || project.deletedAt) {
      return NextResponse.json({ error: "Karya tidak ditemukan." }, { status: 404 })
    }

    if (project.status !== "approved") {
      return NextResponse.json(
        { error: "Badge hanya bisa diberikan pada karya yang sudah disetujui (approved)." },
        { status: 400 }
      )
    }

    // Lingkup jurusan
    const scope = await resolveTeacherScope(auth.userId)
    if (!scope.projectType || project.type !== scope.projectType) {
      return NextResponse.json(
        {
          error: `Karya ini bukan dari jurusan Anda (${
            scope.teacher?.majorName ?? "belum ada jurusan"
          }).`,
        },
        { status: 403 }
      )
    }

    // ── Cabut badge (tier === null) ─────────────────────────────────────
    if (tier === null) {
      // Hapus semua badge teacher-tier pada karya ini
      const teacherBadges = await prisma.badges.findMany({
        where: { tier: { in: [...TEACHER_TIERS] } },
        select: { id: true },
      })
      const teacherBadgeIds = teacherBadges.map((b) => b.id)

      const deleted = await prisma.projectsBadge.deleteMany({
        where: { projectId, badgeId: { in: teacherBadgeIds } },
      })

      await audit({
        userId: auth.userId,
        action: "badge.remove",
        entity: "projects",
        entityId: projectId,
        data: { title: project.title, removedCount: deleted.count },
      })

      return NextResponse.json({
        success: true,
        message: "Badge karya berhasil dicabut.",
        badges: [],
      })
    }

    // ── Berikan badge (tier !== null) ───────────────────────────────────
    const badge = await prisma.badges.findUnique({ where: { tier } })
    if (!badge) {
      return NextResponse.json(
        { error: `Badge tier "${tier}" tidak ditemukan di database. Jalankan seed terlebih dahulu.` },
        { status: 404 }
      )
    }

    // Hapus badge guru lama dulu (one-badge-per-teacher policy)
    const allTeacherBadges = await prisma.badges.findMany({
      where: { tier: { in: [...TEACHER_TIERS] } },
      select: { id: true },
    })
    await prisma.projectsBadge.deleteMany({
      where: {
        projectId,
        badgeId: { in: allTeacherBadges.map((b) => b.id) },
      },
    })

    // Upsert badge baru
    await prisma.projectsBadge.upsert({
      where: { projectId_badgeId: { projectId, badgeId: badge.id } },
      update: { awardedBy: auth.userId, awardedAt: new Date() },
      create: { projectId, badgeId: badge.id, awardedBy: auth.userId },
    })

    await audit({
      userId: auth.userId,
      action: "badge.award",
      entity: "projects",
      entityId: projectId,
      data: { title: project.title, tier, badgeName: badge.name },
    })

    // Invalidate gallery cache agar Vitrine Card langsung memperlihatkan badge baru
    try {
      const { invalidateGalleryCache } = await import("@/lib/redis")
      await invalidateGalleryCache()
    } catch {
      /* cache miss tidak memblokir respons */
    }

    // Kembalikan semua badge karya setelah perubahan
    const updatedBadges = await prisma.projectsBadge.findMany({
      where: { projectId },
      include: { badge: true },
    })

    return NextResponse.json({
      success: true,
      message: `Badge "${badge.name}" berhasil diberikan.`,
      badges: updatedBadges.map((b) => ({
        badgeId:   b.badgeId,
        name:      b.badge.name,
        tier:      b.badge.tier,
        awardedAt: b.awardedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("Error in POST /api/teacher/projects/[id]/badge:", error)
    return NextResponse.json({ error: "Gagal memproses badge karya." }, { status: 500 })
  }
}
