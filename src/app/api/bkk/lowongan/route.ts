/**
 * GET    /api/bkk/lowongan          → daftar semua lowongan (termasuk tutup)
 * POST   /api/bkk/lowongan          → buat lowongan baru
 * PATCH  /api/bkk/lowongan?id=...   → ubah lowongan (semua field opsional)
 * DELETE /api/bkk/lowongan?id=...   → hapus lowongan
 *
 * Semua operasi memerlukan sesi BKK.
 *
 * Body POST / PATCH (semua opsional kecuali role+company pada POST):
 *   { role, company, majorTarget, type, location, status, quota, deadline, description }
 */

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"

const VALID_STATUS = ["buka", "terbatas", "tutup"]
const VALID_MAJOR = ["RPL", "TKJ", "KA", "Semua"]

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET(_req: NextRequest) {
  try {
    const auth = await requireRole(["bkk"])
    if (auth.error) return auth.error

    const rows = await prisma.internshipPostings.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        role: true,
        company: true,
        majorTarget: true,
        type: true,
        location: true,
        status: true,
        quota: true,
        deadline: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        creator: { select: { name: true } },
      },
    })

    return NextResponse.json({
      postings: rows.map((r) => ({
        ...r,
        deadline: r.deadline ? r.deadline.toISOString() : null,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        creatorName: r.creator.name,
      })),
    })
  } catch (error) {
    console.error("Error in GET /api/bkk/lowongan:", error)
    return NextResponse.json({ error: "Gagal memuat lowongan." }, { status: 500 })
  }
}

// ─── POST ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(["bkk"])
    if (auth.error) return auth.error

    const body = await req.json().catch(() => ({}))

    const role = typeof body.role === "string" ? body.role.trim() : ""
    const company = typeof body.company === "string" ? body.company.trim() : ""

    if (!role || !company) {
      return NextResponse.json(
        { error: "Field 'role' dan 'company' wajib diisi." },
        { status: 400 }
      )
    }

    const majorTarget =
      typeof body.majorTarget === "string" && VALID_MAJOR.includes(body.majorTarget)
        ? body.majorTarget
        : "Semua"

    const status =
      typeof body.status === "string" && VALID_STATUS.includes(body.status)
        ? body.status
        : "buka"

    const deadline =
      typeof body.deadline === "string" && body.deadline
        ? new Date(body.deadline)
        : null

    const posting = await prisma.internshipPostings.create({
      data: {
        role,
        company,
        majorTarget,
        type: typeof body.type === "string" ? body.type.trim() : "Magang",
        location: typeof body.location === "string" ? body.location.trim() : "",
        status,
        quota: typeof body.quota === "string" && body.quota.trim() ? body.quota.trim() : null,
        deadline,
        description: typeof body.description === "string" ? body.description.trim() : null,
        createdBy: auth.userId,
      },
    })

    return NextResponse.json(
      { success: true, message: "Lowongan berhasil ditambahkan.", id: posting.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error in POST /api/bkk/lowongan:", error)
    return NextResponse.json({ error: "Gagal membuat lowongan." }, { status: 500 })
  }
}

// ─── PATCH ───────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireRole(["bkk"])
    if (auth.error) return auth.error

    const id = req.nextUrl.searchParams.get("id")?.trim()
    if (!id) {
      return NextResponse.json({ error: "Parameter 'id' wajib ada." }, { status: 400 })
    }

    const exists = await prisma.internshipPostings.findUnique({ where: { id }, select: { id: true } })
    if (!exists) {
      return NextResponse.json({ error: "Lowongan tidak ditemukan." }, { status: 404 })
    }

    const body = await req.json().catch(() => ({}))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {}

    if (typeof body.role === "string" && body.role.trim()) data.role = body.role.trim()
    if (typeof body.company === "string" && body.company.trim()) data.company = body.company.trim()
    if (typeof body.majorTarget === "string" && VALID_MAJOR.includes(body.majorTarget)) data.majorTarget = body.majorTarget
    if (typeof body.type === "string" && body.type.trim()) data.type = body.type.trim()
    if (typeof body.location === "string") data.location = body.location.trim()
    if (typeof body.status === "string" && VALID_STATUS.includes(body.status)) data.status = body.status
    if (typeof body.quota === "string") data.quota = body.quota.trim() || null
    if (typeof body.description === "string") data.description = body.description.trim() || null
    if (typeof body.deadline === "string") {
      data.deadline = body.deadline ? new Date(body.deadline) : null
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Tidak ada perubahan yang dikirim." }, { status: 400 })
    }

    await prisma.internshipPostings.update({ where: { id }, data })

    return NextResponse.json({ success: true, message: "Lowongan diperbarui." })
  } catch (error) {
    console.error("Error in PATCH /api/bkk/lowongan:", error)
    return NextResponse.json({ error: "Gagal memperbarui lowongan." }, { status: 500 })
  }
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireRole(["bkk"])
    if (auth.error) return auth.error

    const id = req.nextUrl.searchParams.get("id")?.trim()
    if (!id) {
      return NextResponse.json({ error: "Parameter 'id' wajib ada." }, { status: 400 })
    }

    const exists = await prisma.internshipPostings.findUnique({ where: { id }, select: { id: true } })
    if (!exists) {
      return NextResponse.json({ error: "Lowongan tidak ditemukan." }, { status: 404 })
    }

    await prisma.internshipPostings.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Lowongan dihapus." })
  } catch (error) {
    console.error("Error in DELETE /api/bkk/lowongan:", error)
    return NextResponse.json({ error: "Gagal menghapus lowongan." }, { status: 500 })
  }
}
