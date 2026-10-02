import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

/**
 * GET /api/company/profil  → ambil data profil perusahaan yang login
 * PATCH /api/company/profil → update nama, bidang, dokumenUrl
 *
 * Sesuai alurMitra.md §2:
 * - status_verifikasi, verified_by, verified_at adalah READ-ONLY dari sisi perusahaan
 * - Trigger perusahaan_guard di DB juga melindungi kolom-kolom itu
 */

async function getVerifiedCompany(req?: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  if (session.user.role?.toLowerCase() !== "company") return null
  return session.user.id
}

export async function GET() {
  try {
    const userId = await getVerifiedCompany()
    if (!userId) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })

    const company = await prisma.company.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true, createdAt: true } },
      },
    })

    if (!company) return NextResponse.json({ error: "Profil tidak ditemukan." }, { status: 404 })

    return NextResponse.json({
      namaKontak:        company.user.name,
      email:             company.user.email,
      terdaftarPada:     company.user.createdAt.toISOString(),
      namaPerusahaan:    company.name,
      bidang:            company.field,
      dokumenUrl:        company.documentUrl,
      // Read-only — hanya tampil, tidak bisa diedit
      verificationStatus: company.verificationStatus,
      catatanVerifikasi:  company.catatanVerifikasi,
    })
  } catch (err) {
    console.error("[GET /api/company/profil]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await getVerifiedCompany()
    if (!userId) return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })

    const { namaPerusahaan, bidang, dokumenUrl } = await req.json()

    // Validasi field yang bisa diedit
    if (namaPerusahaan !== undefined && (!namaPerusahaan?.trim() || namaPerusahaan.trim().length < 2)) {
      return NextResponse.json({ error: "Nama perusahaan minimal 2 karakter." }, { status: 400 })
    }

    // Update — hanya field yang diizinkan
    // Trigger perusahaan_guard di DB secara otomatis mencegah perubahan
    // pada status_verifikasi, verified_by, verified_at dari sisi perusahaan
    const updated = await prisma.company.update({
      where: { userId },
      data: {
        ...(namaPerusahaan?.trim() ? { name: namaPerusahaan.trim() } : {}),
        ...(bidang !== undefined ? { field: bidang?.trim() || null } : {}),
        ...(dokumenUrl !== undefined ? { documentUrl: dokumenUrl?.trim() || null } : {}),
      },
    })

    return NextResponse.json({
      message:        "Profil berhasil diperbarui.",
      namaPerusahaan: updated.name,
      bidang:         updated.field,
      dokumenUrl:     updated.documentUrl,
    })
  } catch (err) {
    console.error("[PATCH /api/company/profil]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 })
  }
}
