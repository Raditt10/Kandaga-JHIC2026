import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

/**
 * GET /api/bkk/mitra
 * Ambil semua perusahaan (riwayat historis, bukan hanya antrian).
 * Hanya bisa diakses oleh role BKK.
 *
 * Query params:
 *   ?status=pending|disetujui|ditolak   (opsional, filter per status)
 *   ?q=keyword                           (opsional, search nama perusahaan)
 *
 * Response per item:
 *   { userId, namaKontak, email, namaPerusahaan, bidang, dokumenUrl,
 *     status, catatanVerifikasi, verifiedAt, terdaftarPada }
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
    const statusFilter = searchParams.get("status") // "pending"|"disetujui"|"ditolak"
    const keyword      = searchParams.get("q")?.trim()

    const companies = await prisma.company.findMany({
      where: {
        ...(statusFilter ? { verificationStatus: statusFilter } : {}),
        ...(keyword
          ? {
              OR: [
                { name: { contains: keyword, mode: "insensitive" } },
                { user: { name: { contains: keyword, mode: "insensitive" } } },
                { user: { email: { contains: keyword, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      orderBy: { user: { createdAt: "desc" } }, // terbaru di atas
      include: {
        user: {
          select: {
            id:        true,
            name:      true,
            email:     true,
            createdAt: true,
          },
        },
        verifier: {
          select: { name: true },
        },
      },
    })

    const items = companies.map((c) => ({
      userId:             c.userId,
      namaKontak:         c.user.name,
      email:              c.user.email,
      namaPerusahaan:     c.name,
      bidang:             c.field,
      dokumenUrl:         c.documentUrl,
      status:             c.verificationStatus,
      catatanVerifikasi:  c.catatanVerifikasi,
      verifiedBy:         c.verifier?.name ?? null,
      verifiedAt:         c.verifiedAt?.toISOString() ?? null,
      terdaftarPada:      c.user.createdAt.toISOString(),
    }))

    // Ringkasan count per status untuk filter badge
    const summary = {
      semua:      companies.length,
      pending:    companies.filter((c) => c.verificationStatus === "pending").length,
      disetujui:  companies.filter((c) => c.verificationStatus === "disetujui").length,
      ditolak:    companies.filter((c) => c.verificationStatus === "ditolak").length,
    }

    return NextResponse.json({ items, summary })
  } catch (err) {
    console.error("[GET /api/bkk/mitra]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 })
  }
}
