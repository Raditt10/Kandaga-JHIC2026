import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/prisma"

/**
 * GET /api/bkk/verifikasi
 * Hanya bisa diakses oleh role BKK.
 *
 * ?count=true  → { count: number } — jumlah pending (untuk dashboard widget)
 * default      → { items: [...] }  — list antrian FIFO
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })
    }
    const userRole = session.user.role?.toLowerCase()
    if (userRole !== "bkk" && userRole !== "admin") {
      return NextResponse.json({ error: "Hanya Koordinator BKK atau Admin yang dapat mengakses." }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const isCount = searchParams.get("count") === "true"

    if (isCount) {
      const count = await prisma.company.count({
        where: { verificationStatus: "pending" },
      })
      return NextResponse.json({ count })
    }

    // Ambil antrian FIFO (paling lama menunggu di atas)
    const companies = await prisma.company.findMany({
      where: { verificationStatus: "pending" },
      orderBy: { user: { createdAt: "asc" } },
      include: {
        user: {
          select: {
            id:        true,
            name:      true,
            email:     true,
            createdAt: true,
          },
        },
      },
    })

    const items = companies.map((c) => ({
      userId:      c.userId,
      namaKontak:  c.user.name,
      email:       c.user.email,
      namaPerusahaan: c.name,
      bidang:      c.field,
      dokumenUrl:  c.documentUrl,
      terdaftarPada: c.user.createdAt.toISOString(),
    }))

    return NextResponse.json({ items })
  } catch (err) {
    console.error("[GET /api/bkk/verifikasi]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 })
  }
}

/**
 * PATCH /api/bkk/verifikasi
 * Setujui atau tolak pengajuan akun perusahaan.
 *
 * Body: { userId, action: "setujui" | "tolak", catatan? }
 * - "tolak" wajib disertai catatan (panjang > 0)
 * - Database akan menolak "tolak" tanpa catatan via constraint
 */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })
    }
    const userRole = session.user.role?.toLowerCase()
    if (userRole !== "bkk" && userRole !== "admin") {
      return NextResponse.json({ error: "Hanya Koordinator BKK atau Admin yang dapat memverifikasi." }, { status: 403 })
    }

    const { userId, action, catatan } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "userId wajib diisi." }, { status: 400 })
    }
    if (!["setujui", "tolak"].includes(action)) {
      return NextResponse.json({ error: "action harus 'setujui' atau 'tolak'." }, { status: 400 })
    }
    if (action === "tolak" && (!catatan?.trim() || catatan.trim().length < 10)) {
      return NextResponse.json({
        error: "Catatan penolakan wajib diisi minimal 10 karakter.",
      }, { status: 400 })
    }

    // Cek pengajuan masih pending
    const existing = await prisma.company.findFirst({
      where: { userId, verificationStatus: "pending" },
    })
    if (!existing) {
      return NextResponse.json({
        error: "Pengajuan tidak ditemukan atau sudah diproses sebelumnya.",
      }, { status: 404 })
    }

    const newStatus = action === "setujui" ? "disetujui" : "ditolak"

    try {
      await prisma.company.update({
        where: { userId },
        data: {
          verificationStatus: newStatus,
          verifiedBy:         action === "setujui" ? session.user.id : null,
          verifiedAt:         action === "setujui" ? new Date() : null,
          catatanVerifikasi:  action === "tolak" ? catatan.trim() : null,
        },
      })
    } catch (dbErr: unknown) {
      // Tangani error constraint dari DB (catatan kosong saat tolak)
      const msg = dbErr instanceof Error ? dbErr.message : ""
      if (msg.includes("perusahaan_catatan_ditolak_chk")) {
        return NextResponse.json({
          error: "Catatan penolakan wajib diisi.",
        }, { status: 400 })
      }
      throw dbErr
    }

    return NextResponse.json({
      message: action === "setujui"
        ? "Akun perusahaan berhasil disetujui. Notifikasi dikirim otomatis."
        : "Pengajuan ditolak. Notifikasi dengan alasan dikirim ke perusahaan.",
      status: newStatus,
    })
  } catch (err) {
    console.error("[PATCH /api/bkk/verifikasi]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 })
  }
}
