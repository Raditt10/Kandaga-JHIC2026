import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { Role } from "@prisma/client"

/**
 * POST /api/mitra/daftar
 * Registrasi perusahaan baru sebagai mitra Kandaga.
 *
 * Alur:
 * 1. Validasi semua field wajib
 * 2. Cek duplikasi email
 * 3. Hash password dengan bcrypt
 * 4. Buat Users (role=Company) + Company (status=pending) dalam 1 transaksi
 * 5. Return user ID + pesan sukses — JANGAN langsung login
 *
 * Setelah sukses, user diarahkan ke /mitra/menunggu (bukan dashboard).
 * Dashboard baru bisa diakses setelah BKK menyetujui status_verifikasi.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      namaKontak,
      email,
      password,
      namaPerusahaan,
      bidang,
      dokumenUrl, // mock URL — diisi dari upload atau placeholder
    } = body

    // ── Validasi field wajib ──────────────────────────────────────────
    const missingFields: string[] = []
    if (!namaKontak?.trim())      missingFields.push("Nama kontak")
    if (!email?.trim())           missingFields.push("Email")
    if (!password?.trim())        missingFields.push("Password")
    if (!namaPerusahaan?.trim())  missingFields.push("Nama perusahaan")

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Field berikut wajib diisi: ${missingFields.join(", ")}` },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password minimal 8 karakter." },
        { status: 400 }
      )
    }

    // Validasi format email sederhana
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      )
    }

    // ── Cek duplikasi email ───────────────────────────────────────────
    const existing = await prisma.users.findFirst({
      where: { email: email.trim().toLowerCase() },
    })
    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Gunakan email lain atau masuk ke akun yang ada." },
        { status: 409 }
      )
    }

    // ── Hash password ─────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 12)

    // ── Buat Users + Company dalam 1 transaksi ────────────────────────
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat akun user dengan role Company
      const user = await tx.users.create({
        data: {
          name:         namaKontak.trim(),
          email:        email.trim().toLowerCase(),
          passwordHash,
          role:         Role.Company,
          status:       "aktif",
        },
      })

      // 2. Buat profil perusahaan — status verifikasi default "pending"
      const company = await tx.company.create({
        data: {
          userId:             user.id,
          name:               namaPerusahaan.trim(),
          field:              bidang?.trim() || null,
          documentUrl:        dokumenUrl?.trim() || null,
          verificationStatus: "pending",
        },
      })

      return { userId: user.id, companyName: company.name }
    })

    return NextResponse.json(
      {
        message: "Pendaftaran berhasil. Akun Anda sedang menunggu verifikasi Koordinator BKK.",
        userId:  result.userId,
        company: result.companyName,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error("[/api/mitra/daftar]", err)
    return NextResponse.json(
      { error: "Terjadi kesalahan server. Coba lagi beberapa saat." },
      { status: 500 }
    )
  }
}
