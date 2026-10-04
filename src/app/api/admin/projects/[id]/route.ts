/**
 * GET   /api/admin/projects/[id]  → detail satu karya
 * PATCH /api/admin/projects/[id]  → keputusan moderasi admin
 *
 * Body PATCH:
 *   { action: "approve" | "reject" | "revisi" | "pending", reviewNotes?, score? }
 *
 * Aturan:
 *   - hanya role admin (AGENTS.md §5),
 *   - "reject" WAJIB disertai catatan minimal 10 karakter, supaya siswa tahu
 *     alasan karyanya tidak tayang,
 *   - approve mengisi publishedAt; pending mengosongkannya kembali ke antrean,
 *   - siswa pemilik karya menerima notifikasi dan aksinya masuk audit log,
 *   - cache galeri diinvalidasi supaya perubahan langsung terlihat.
 *
 * Sebelum ini halaman admin/moderasi/[id] hanya memanggil setState lokal dan
 * tetap menampilkan pesan sukses — karya tidak pernah berpindah status di DB.
 */

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"
import { mapTeacherProject, TEACHER_PROJECT_INCLUDE } from "@/lib/teacher-scope"
import { notify, audit } from "@/lib/activity"

const MIN_CATATAN = 10

type Action = "approve" | "reject" | "revisi" | "pending"

const STATUS_BY_ACTION: Record<Action, string> = {
  approve: "approved",
  reject: "rejected",
  revisi: "revisi",
  pending: "pending",
}

const JUDUL: Record<Action, string> = {
  approve: "Karya Anda disetujui",
  reject: "Karya Anda belum dapat tayang",
  revisi: "Karya Anda perlu revisi",
  pending: "Karya Anda kembali ke antrean moderasi",
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(["admin"])
    if (auth.error) return auth.error

    const { id } = await context.params
    const project = await prisma.projects.findUnique({
      where: { id },
      include: TEACHER_PROJECT_INCLUDE,
    })

    if (!project || project.deletedAt) {
      return NextResponse.json({ error: "Karya tidak ditemukan." }, { status: 404 })
    }

    return NextResponse.json({ project: mapTeacherProject(project) })
  } catch (error) {
    console.error("Error in GET /api/admin/projects/[id]:", error)
    return NextResponse.json({ error: "Gagal memuat karya." }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(["admin"])
    if (auth.error) return auth.error

    const { id } = await context.params
    const body = await req.json().catch(() => ({}))
    const action = String(body.action ?? "") as Action

    if (!(action in STATUS_BY_ACTION)) {
      return NextResponse.json(
        { error: 'Aksi harus "approve", "reject", "revisi", atau "pending".' },
        { status: 400 }
      )
    }

    const project = await prisma.projects.findUnique({ where: { id } })
    if (!project || project.deletedAt) {
      return NextResponse.json({ error: "Karya tidak ditemukan." }, { status: 404 })
    }

    const reviewNotes = typeof body.reviewNotes === "string" ? body.reviewNotes.trim() : ""

    if (action === "reject" && reviewNotes.length < MIN_CATATAN) {
      return NextResponse.json(
        { error: `Alasan penolakan wajib diisi (minimal ${MIN_CATATAN} karakter).` },
        { status: 400 }
      )
    }
    if (reviewNotes.length > 0 && reviewNotes.length < MIN_CATATAN) {
      return NextResponse.json(
        { error: `Catatan minimal ${MIN_CATATAN} karakter.` },
        { status: 400 }
      )
    }

    // Nilai kurasi 0-100, opsional.
    let score: number | undefined
    if (body.score !== undefined && body.score !== null && body.score !== "") {
      const parsed = Number(body.score)
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
        return NextResponse.json({ error: "Nilai harus berupa angka 0-100." }, { status: 400 })
      }
      score = Math.round(parsed)
    }

    const status = STATUS_BY_ACTION[action]
    const approved = action === "approve"

    const updated = await prisma.projects.update({
      where: { id },
      data: {
        status,
        reviewedBy: auth.userId,
        ...(approved ? { publishedAt: new Date() } : {}),
        ...(action === "pending" ? { publishedAt: null } : {}),
        ...(action === "reject" || action === "revisi" || reviewNotes
          ? { reviewNotes }
          : {}),
        ...(score !== undefined ? { score } : {}),
      },
      include: TEACHER_PROJECT_INCLUDE,
    })

    const pesan: Record<Action, string> = {
      approve: `"${updated.title}" sudah disetujui dan tayang di Galeri Kandaga.`,
      reject: `"${updated.title}" belum dapat tayang. Catatan admin: ${reviewNotes}`,
      revisi: `"${updated.title}" dikembalikan untuk revisi. Catatan admin: ${reviewNotes}`,
      pending: `"${updated.title}" dikembalikan ke antrean moderasi.`,
    }

    await notify({
      userId: updated.studentId,
      type: "karya",
      title: JUDUL[action],
      content: pesan[action],
    })

    await audit({
      userId: auth.userId,
      action: `project.${action}`,
      entity: "projects",
      entityId: updated.id,
      data: { title: updated.title, status, score: score ?? null },
    })

    try {
      const { invalidateGalleryCache } = await import("@/lib/redis")
      await invalidateGalleryCache()
    } catch (cacheErr) {
      console.warn("Cache invalidation error:", cacheErr)
    }

    return NextResponse.json({
      success: true,
      message: pesan[action],
      project: mapTeacherProject(updated),
    })
  } catch (error) {
    console.error("Error in PATCH /api/admin/projects/[id]:", error)
    return NextResponse.json({ error: "Gagal menyimpan keputusan moderasi." }, { status: 500 })
  }
}
