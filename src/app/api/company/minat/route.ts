import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

/**
 * POST /api/company/minat
 * Ajukan permintaan kontak/minat ke karya siswa via BKK.
 *
 * Aturan bisnis (sesuai alurMitra.md §2 & AGENTS.md §5):
 * - Hanya company dengan verificationStatus "disetujui" yang bisa submit
 * - Karya harus berstatus approved dan tidak di-delete
 * - status awal permintaan selalu "terkirim" (tidak bisa diset manual)
 * - Perusahaan TIDAK pernah kontak siswa langsung — semua lewat BKK
 *
 * Body: { projectId, tujuan, pesan }
 * tujuan: "magang" | "kerja" | "kolaborasi"
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // ── Auth guard ─────────────────────────────────────────────────
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })
    }
    if (session.user.role?.toLowerCase() !== "company") {
      return NextResponse.json({ error: "Hanya akun perusahaan yang dapat mengajukan minat." }, { status: 403 })
    }
    if (session.user.verificationStatus !== "disetujui") {
      return NextResponse.json({
        error: "Akun Anda belum diverifikasi oleh BKK. Tunggu persetujuan sebelum mengajukan minat.",
      }, { status: 403 })
    }

    const { projectId, tujuan, pesan } = await req.json()

    // ── Validasi field ─────────────────────────────────────────────
    if (!projectId?.trim()) {
      return NextResponse.json({ error: "projectId wajib diisi." }, { status: 400 })
    }
    const validTujuan = ["magang", "kerja", "kolaborasi"]
    if (!tujuan || !validTujuan.includes(tujuan)) {
      return NextResponse.json({
        error: "Tujuan harus salah satu dari: magang, kerja, atau kolaborasi.",
      }, { status: 400 })
    }
    if (!pesan?.trim() || pesan.trim().length < 20) {
      return NextResponse.json({
        error: "Pesan minimal 20 karakter. Jelaskan kebutuhan dan konteks perusahaan Anda.",
      }, { status: 400 })
    }

    // ── Validasi karya ─────────────────────────────────────────────
    const project = await prisma.projects.findFirst({
      where: { id: projectId, status: "approved", deletedAt: null },
    })
    if (!project) {
      return NextResponse.json({
        error: "Karya tidak ditemukan atau tidak tersedia untuk diajukan.",
      }, { status: 404 })
    }

    // ── Cek duplikasi permintaan yang masih aktif ──────────────────
    const existing = await prisma.contactRequests.findFirst({
      where: {
        companyId: session.user.id,
        projectId,
        status: { in: ["terkirim", "ditinjau", "klarifikasi"] },
      },
    })
    if (existing) {
      return NextResponse.json({
        error: "Anda sudah memiliki permintaan aktif untuk karya ini. Pantau statusnya di Riwayat Permintaan.",
      }, { status: 409 })
    }

    // ── Insert permintaan kontak ───────────────────────────────────
    const request = await prisma.contactRequests.create({
      data: {
        companyId: session.user.id,
        projectId,
        purpose:   tujuan,
        message:   pesan.trim(),
        status:    "terkirim",
      },
    })

    return NextResponse.json(
      {
        message:   "Minat berhasil dikirim. BKK akan meninjau permintaan Anda.",
        requestId: request.id,
        status:    "terkirim",
      },
      { status: 201 }
    )
  } catch (err) {
    console.error("[POST /api/company/minat]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server. Coba lagi." }, { status: 500 })
  }
}

/**
 * GET /api/company/minat
 * Ambil riwayat semua permintaan milik company yang login.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })
    }
    if (session.user.role?.toLowerCase() !== "company") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 })
    }

    const requests = await prisma.contactRequests.findMany({
      where:   { companyId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        project: {
          include: {
            student: {
              include: {
                major: { select: { name: true } },
                user:  { select: { name: true } },
              },
            },
            media: { take: 1, orderBy: { order: "asc" } },
          },
        },
      },
    })

    const items = requests.map((r) => ({
      id:           r.id,
      status:       r.status,
      tujuan:       r.purpose,
      pesan:        r.message,
      catatanBkk:   r.bkkNotes,
      createdAt:    r.createdAt.toISOString(),
      updatedAt:    r.updatedAt.toISOString(),
      karya: {
        id:           r.project.id,
        title:        r.project.title,
        thumbnailUrl: r.project.media[0]?.url ?? null,
        jurusanNama:  r.project.student.major.name,
        siswaNama:    r.project.student.user.name,
        year:         r.project.year,
      },
    }))

    return NextResponse.json({ items })
  } catch (err) {
    console.error("[GET /api/company/minat]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 })
  }
}
