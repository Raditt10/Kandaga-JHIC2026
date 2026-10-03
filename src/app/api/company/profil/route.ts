import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
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
        verifier: { select: { name: true, role: true } },
      },
    })

    if (!company) return NextResponse.json({ error: "Profil tidak ditemukan." }, { status: 404 })

    return NextResponse.json({
      namaKontak:         company.user.name,
      email:              company.user.email,
      terdaftarPada:      company.user.createdAt.toISOString(),
      namaPerusahaan:     company.name,
      bidang:             company.field,
      deskripsi:          company.description,
      alamat:             company.address,
      kota:               company.city,
      provinsi:           company.province,
      telepon:            company.phone,
      website:            company.website,
      nib:                company.nib,
      npwp:               company.npwp,
      skalaKaryawan:      company.employeeCount,
      tahunBerdiri:       company.foundedYear,
      logoUrl:            company.logoUrl,
      picName:            company.picName,
      picJabatan:         company.picPosition,
      picEmail:           company.picEmail,
      picPhone:           company.picPhone,
      dokumenUrl:         company.documentUrl,
      // Read-only verifikasi
      verificationStatus: company.verificationStatus,
      verifiedBy:         company.verifier?.name ?? null,
      verifiedAt:         company.verifiedAt?.toISOString() ?? null,
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

    const body = await req.json()
    const {
      namaPerusahaan,
      bidang,
      deskripsi,
      alamat,
      kota,
      provinsi,
      telepon,
      website,
      nib,
      npwp,
      skalaKaryawan,
      tahunBerdiri,
      logoUrl,
      picName,
      picJabatan,
      picEmail,
      picPhone,
      dokumenUrl,
    } = body

    // Validasi field nama
    if (namaPerusahaan !== undefined && (!namaPerusahaan?.trim() || namaPerusahaan.trim().length < 2)) {
      return NextResponse.json({ error: "Nama perusahaan minimal 2 karakter." }, { status: 400 })
    }

    // Parse tahun berdiri bila ada
    let parsedYear: number | null | undefined = undefined
    if (tahunBerdiri !== undefined) {
      if (tahunBerdiri === null || tahunBerdiri === "") {
        parsedYear = null
      } else {
        const y = Number(tahunBerdiri)
        if (isNaN(y) || y < 1900 || y > new Date().getFullYear()) {
          return NextResponse.json({ error: "Tahun berdiri tidak valid (1900 - sekarang)." }, { status: 400 })
        }
        parsedYear = y
      }
    }

    // Update hanya field metadata yang diizinkan (keamanan data)
    const updated = await prisma.company.update({
      where: { userId },
      data: {
        ...(namaPerusahaan !== undefined && { name: namaPerusahaan.trim() }),
        ...(bidang !== undefined && { field: bidang?.trim() || null }),
        ...(deskripsi !== undefined && { description: deskripsi?.trim() || null }),
        ...(alamat !== undefined && { address: alamat?.trim() || null }),
        ...(kota !== undefined && { city: kota?.trim() || null }),
        ...(provinsi !== undefined && { province: provinsi?.trim() || null }),
        ...(telepon !== undefined && { phone: telepon?.trim() || null }),
        ...(website !== undefined && { website: website?.trim() || null }),
        ...(nib !== undefined && { nib: nib?.trim() || null }),
        ...(npwp !== undefined && { npwp: npwp?.trim() || null }),
        ...(skalaKaryawan !== undefined && { employeeCount: skalaKaryawan?.trim() || null }),
        ...(parsedYear !== undefined && { foundedYear: parsedYear }),
        ...(logoUrl !== undefined && { logoUrl: logoUrl?.trim() || null }),
        ...(picName !== undefined && { picName: picName?.trim() || null }),
        ...(picJabatan !== undefined && { picPosition: picJabatan?.trim() || null }),
        ...(picEmail !== undefined && { picEmail: picEmail?.trim() || null }),
        ...(picPhone !== undefined && { picPhone: picPhone?.trim() || null }),
        ...(dokumenUrl !== undefined && { documentUrl: dokumenUrl?.trim() || null }),
      },
    })

    return NextResponse.json({
      message:        "Profil berhasil diperbarui.",
      data:           updated,
    })
  } catch (err) {
    console.error("[PATCH /api/company/profil]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 })
  }
}
