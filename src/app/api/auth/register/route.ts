import { NextResponse } from "next/server"
import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

// Allowed public registration roles
const ALLOWED_PUBLIC_ROLES = ["student", "company"] as const
const FORBIDDEN_INTERNAL_ROLES = ["admin", "bkk", "teacher"]

export async function GET() {
  try {
    const majors = await prisma.major.findMany({
      select: {
        id: true,
        name: true,
        fullName: true,
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({
      success: true,
      majors,
    })
  } catch (error) {
    console.error("GET /api/auth/register error:", error)
    return NextResponse.json(
      { error: "Gagal memuat data jurusan" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      username,
      email,
      password,
      role: rawRole,
      // Student specific fields
      class: currentClass,
      majorId,
      majorName,
      nis,
      generation,
      // Company specific fields
      companyName,
      field,
      address,
      city,
      phone,
      website,
    } = body

    // 1. Mandatory common validation
    if (!username || typeof username !== "string" || !username.trim()) {
      return NextResponse.json(
        { error: "Nama lengkap / username wajib diisi." },
        { status: 400 }
      )
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Alamat email wajib diisi." },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      )
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Kata sandi minimal 6 karakter." },
        { status: 400 }
      )
    }

    const normalizedRole = (rawRole || "").trim().toLowerCase()

    // 2. Strict restriction: remove/reject internal roles
    if (FORBIDDEN_INTERNAL_ROLES.includes(normalizedRole)) {
      return NextResponse.json(
        {
          error:
            "Akun dengan peran internal (Admin, Guru, BKK) hanya dapat didaftarkan langsung oleh Administrator Sekolah.",
        },
        { status: 403 }
      )
    }

    if (!ALLOWED_PUBLIC_ROLES.includes(normalizedRole as any)) {
      return NextResponse.json(
        { error: "Peran yang dipilih tidak valid. Pilih Siswa atau Mitra Industri." },
        { status: 400 }
      )
    }

    // 3. Check for existing email in Users
    const existingUser = await prisma.users.findUnique({
      where: { email: email.trim().toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "Alamat email sudah terdaftar. Silakan masuk atau gunakan email lain.",
        },
        { status: 409 }
      )
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password.trim(), 10)

    // 5. Role-specific creation logic in Prisma Transaction
    if (normalizedRole === "student") {
      // Validate student class
      if (!currentClass || typeof currentClass !== "string" || !currentClass.trim()) {
        return NextResponse.json(
          { error: "Kelas saat ini wajib diisi untuk pendaftaran siswa (contoh: XII RPL 1)." },
          { status: 400 }
        )
      }

      // Check if NIS already exists if provided
      if (nis && typeof nis === "string" && nis.trim()) {
        const existingNis = await prisma.student.findUnique({
          where: { nis: nis.trim() },
        })
        if (existingNis) {
          return NextResponse.json(
            { error: `NIS ${nis.trim()} sudah digunakan oleh siswa lain.` },
            { status: 409 }
          )
        }
      }

      // Resolve Major ID
      let resolvedMajorId = majorId
      if (!resolvedMajorId && majorName) {
        const matchedMajor = await prisma.major.findFirst({
          where: {
            OR: [
              { name: { contains: majorName, mode: "insensitive" } },
              { fullName: { contains: majorName, mode: "insensitive" } },
            ],
          },
        })
        if (matchedMajor) resolvedMajorId = matchedMajor.id
      }

      // If still not resolved, fallback to RPL or first major in database
      if (!resolvedMajorId) {
        const defaultMajor =
          (await prisma.major.findUnique({ where: { name: "RPL" } })) ||
          (await prisma.major.findFirst())
        if (!defaultMajor) {
          return NextResponse.json(
            { error: "Data jurusan sekolah belum tersedia. Silakan hubungi admin." },
            { status: 500 }
          )
        }
        resolvedMajorId = defaultMajor.id
      }

      // Calculate generation if not supplied
      let resolvedGen = generation ? parseInt(String(generation), 10) : null
      if (!resolvedGen) {
        const currentYear = new Date().getFullYear()
        const upperClass = currentClass.toUpperCase()
        if (upperClass.includes("XII") || upperClass.includes("12")) {
          resolvedGen = currentYear
        } else if (upperClass.includes("XI") || upperClass.includes("11")) {
          resolvedGen = currentYear + 1
        } else {
          resolvedGen = currentYear + 2
        }
      }

      // Create Users + Student record
      const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.users.create({
          data: {
            name: username.trim(),
            email: email.trim().toLowerCase(),
            passwordHash: hashedPassword,
            role: Role.Student,
            status: "aktif",
          },
        })

        const newStudent = await tx.student.create({
          data: {
            userId: newUser.id,
            majorId: resolvedMajorId,
            class: currentClass.trim(),
            nis: nis && typeof nis === "string" && nis.trim() ? nis.trim() : null,
            generation: resolvedGen,
            status: "aktif",
          },
          include: {
            major: true,
          },
        })

        return {
          user: newUser,
          student: newStudent,
        }
      })

      return NextResponse.json(
        {
          success: true,
          message: "Akun siswa berhasil didaftarkan!",
          user: {
            id: result.user.id,
            username: result.user.name,
            email: result.user.email,
            role: "student",
            student: {
              class: result.student.class,
              major: (result.student as any).major?.name || "RPL",
              nis: result.student.nis,
            },
          },
        },
        { status: 201 }
      )
    }

    if (normalizedRole === "company") {
      const finalCompanyName = companyName?.trim() || username.trim()

      // Create Users + Company record (verificationStatus defaults to 'pending' / unverified)
      const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.users.create({
          data: {
            name: username.trim(),
            email: email.trim().toLowerCase(),
            passwordHash: hashedPassword,
            role: Role.Company,
            status: "aktif",
          },
        })

        const newCompany = await tx.company.create({
          data: {
            userId: newUser.id,
            name: finalCompanyName,
            field: field && typeof field === "string" && field.trim() ? field.trim() : "Teknologi & Industri",
            address: address && typeof address === "string" ? address.trim() : null,
            city: city && typeof city === "string" ? city.trim() : null,
            phone: phone && typeof phone === "string" ? phone.trim() : null,
            website: website && typeof website === "string" ? website.trim() : null,
            verificationStatus: "pending", // isVerified = false
          },
        })

        return {
          user: newUser,
          company: newCompany,
        }
      })

      return NextResponse.json(
        {
          success: true,
          message: "Akun mitra industri berhasil didaftarkan dan menunggu verifikasi BKK.",
          user: {
            id: result.user.id,
            username: result.user.name,
            email: result.user.email,
            role: "company",
            company: {
              name: result.company.name,
              field: result.company.field,
              verificationStatus: result.company.verificationStatus,
            },
          },
        },
        { status: 201 }
      )
    }

    return NextResponse.json(
      { error: "Peran pengguna tidak didukung." },
      { status: 400 }
    )
  } catch (error: any) {
    console.error("POST /api/auth/register error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat mendaftarkan akun. Silakan coba lagi." },
      { status: 500 }
    )
  }
}