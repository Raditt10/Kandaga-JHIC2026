import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import prisma from "@/lib/prisma"

/**
 * GET /api/bkk/mitra/[id]
 * Mengambil detail lengkap metadata satu perusahaan berdasarkan userId.
 * Dapat diakses oleh Koordinator BKK, Admin, atau perusahaan pemilik profil.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })
    }

    const { id: targetUserId } = await params
    const role = session.user.role?.toLowerCase()

    // BKK & Admin berhak melihat semua, sedangkan perusahaan hanya profil miliknya
    const isStaff = role === "bkk" || role === "admin"
    const isOwner = session.user.id === targetUserId

    if (!isStaff && !isOwner) {
      return NextResponse.json({ error: "Tidak memiliki hak akses." }, { status: 403 })
    }

    const company = await prisma.company.findUnique({
      where: { userId: targetUserId },
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
          select: {
            id:   true,
            name: true,
            role: true,
          },
        },
        _count: {
          select: {
            contactRequests: true,
            bookmarks:       true,
          },
        },
      },
    })

    if (!company) {
      return NextResponse.json({ error: "Profil perusahaan tidak ditemukan." }, { status: 404 })
    }

    return NextResponse.json({
      userId:             company.userId,
      namaKontak:         company.user.name,
      email:              company.user.email,
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
      status:             company.verificationStatus,
      catatanVerifikasi:  company.catatanVerifikasi,
      verifiedBy:         company.verifier?.name ?? null,
      verifiedAt:         company.verifiedAt?.toISOString() ?? null,
      terdaftarPada:      company.user.createdAt.toISOString(),
      statistik: {
        totalPermintaanKontak: company._count.contactRequests,
        totalKaryaTersimpan:   company._count.bookmarks,
      },
    })
  } catch (err) {
    console.error("[GET /api/bkk/mitra/[id]]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 })
  }
}

/**
 * PATCH /api/bkk/mitra/[id]
 * Memperbarui status verifikasi mitra (Setujui / Tolak / Minta Revisi).
 * Hanya dapat dilakukan oleh Koordinator BKK atau Admin.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })
    }

    const role = session.user.role?.toLowerCase()
    if (role !== "bkk" && role !== "admin") {
      return NextResponse.json(
        { error: "Hanya Koordinator BKK dan Admin yang berwenang melakukan verifikasi." },
        { status: 403 }
      )
    }

    const { id: targetUserId } = await params
    const { action, catatan } = await req.json()

    if (!["setujui", "tolak", "pending"].includes(action)) {
      return NextResponse.json(
        { error: "action harus 'setujui', 'tolak', atau 'pending'." },
        { status: 400 }
      )
    }

    if (action === "tolak" && (!catatan?.trim() || catatan.trim().length < 10)) {
      return NextResponse.json(
        { error: "Catatan penolakan / revisi wajib diisi minimal 10 karakter." },
        { status: 400 }
      )
    }

    const targetCompany = await prisma.company.findUnique({
      where: { userId: targetUserId },
    })

    if (!targetCompany) {
      return NextResponse.json({ error: "Perusahaan tidak ditemukan." }, { status: 404 })
    }

    const newStatus = action === "setujui" ? "disetujui" : action === "tolak" ? "ditolak" : "pending"

    const updated = await prisma.company.update({
      where: { userId: targetUserId },
      data: {
        verificationStatus: newStatus,
        verifiedBy:         action === "setujui" ? session.user.id : null,
        verifiedAt:         action === "setujui" ? new Date() : null,
        catatanVerifikasi:  action === "tolak" ? catatan.trim() : null,
      },
      include: {
        verifier: { select: { name: true } },
      },
    })

    return NextResponse.json({
      message: action === "setujui"
        ? "Akun mitra berhasil disetujui."
        : action === "tolak"
        ? "Pengajuan mitra ditolak dengan catatan."
        : "Status mitra dikembalikan ke antrean peninjauan.",
      data: {
        userId:            updated.userId,
        status:            updated.verificationStatus,
        verifiedBy:        updated.verifier?.name ?? null,
        verifiedAt:        updated.verifiedAt?.toISOString() ?? null,
        catatanVerifikasi: updated.catatanVerifikasi,
      },
    })
  } catch (err) {
    console.error("[PATCH /api/bkk/mitra/[id]]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 })
  }
}
