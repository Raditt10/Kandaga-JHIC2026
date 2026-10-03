import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/prisma"

/**
 * GET /api/bkk/mitra/[userId]
 * Detail satu mitra perusahaan untuk halaman review verifikasi.
 * Hanya bisa diakses oleh role BKK atau Admin.
 *
 * Response: { item: {...} }
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })
    }
    const userRole = session.user.role?.toLowerCase()
    if (userRole !== "bkk" && userRole !== "admin") {
      return NextResponse.json({ error: "Hanya Koordinator BKK atau Admin yang dapat mengakses." }, { status: 403 })
    }

    const { userId } = await params

    const company = await prisma.company.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true, createdAt: true },
        },
        verifier: {
          select: { name: true },
        },
      },
    })

    if (!company) {
      return NextResponse.json({ error: "Mitra perusahaan tidak ditemukan." }, { status: 404 })
    }

    const item = {
      userId:             company.userId,
      namaKontak:         company.user.name,
      email:              company.user.email,
      namaPerusahaan:     company.name,
      bidang:             company.field,
      dokumenUrl:         company.documentUrl,
      status:             company.verificationStatus,
      catatanVerifikasi:  company.catatanVerifikasi,
      verifiedBy:         company.verifier?.name ?? null,
      verifiedAt:         company.verifiedAt?.toISOString() ?? null,
      terdaftarPada:      company.user.createdAt.toISOString(),
    }

    return NextResponse.json({ item })
  } catch (err) {
    console.error("[GET /api/bkk/mitra/[userId]]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 })
  }
}
