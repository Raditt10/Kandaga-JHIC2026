import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import prisma from "@/lib/prisma"

/**
 * GET /api/mitra/status
 * Cek status verifikasi akun kemitraan perusahaan secara real-time.
 * Menerima query param `?userId=...` atau menggunakan session user aktif.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const queryUserId = searchParams.get("userId")?.trim()

    let targetUserId = queryUserId

    if (!targetUserId) {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        targetUserId = session.user.id
      }
    }

    if (!targetUserId) {
      return NextResponse.json({
        registered: false,
        status: null,
      })
    }

    const company = await prisma.company.findUnique({
      where: { userId: targetUserId },
      select: {
        userId: true,
        name: true,
        field: true,
        verificationStatus: true,
        catatanVerifikasi: true,
        verifiedAt: true,
        user: {
          select: {
            name: true,
            email: true,
            status: true,
          },
        },
      },
    })

    if (!company) {
      return NextResponse.json({
        registered: false,
        status: null,
      })
    }

    return NextResponse.json({
      registered: true,
      userId: company.userId,
      companyName: company.name,
      field: company.field,
      status: company.verificationStatus, // "pending" | "disetujui" | "ditolak"
      catatanVerifikasi: company.catatanVerifikasi,
      verifiedAt: company.verifiedAt ? company.verifiedAt.toISOString() : null,
      contactName: company.user.name,
      email: company.user.email,
    })
  } catch (err) {
    console.error("[/api/mitra/status]", err)
    return NextResponse.json(
      { error: "Gagal memeriksa status mitra." },
      { status: 500 }
    )
  }
}
