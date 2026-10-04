/**
 * GET /api/student/advisors
 *
 * Daftar guru pembimbing yang tersedia untuk siswa yang login.
 * Hanya mengembalikan guru di jurusan yang sama dengan siswa,
 * sesuai aturan alurKarya.md §1 (dropdown difilter otomatis per jurusan).
 *
 * Memerlukan sesi login dengan role Student.
 */

import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireStudent } from "@/lib/api-auth"

export async function GET() {
  try {
    const auth = await requireStudent()
    if (auth.error) return auth.error

    // Cari jurusan siswa yang login
    const student = await prisma.student.findUnique({
      where: { userId: auth.userId },
      select: { majorId: true },
    })

    // Jika siswa belum punya profil lengkap, kembalikan semua guru
    // supaya form tidak kosong (ensureStudentProfile belum dijalankan).
    const whereClause = student?.majorId
      ? { majorId: student.majorId }
      : {}

    const teachers = await prisma.teacher.findMany({
      where: whereClause,
      select: {
        userId: true,
        nip: true,
        user: { select: { name: true } },
        major: { select: { name: true, fullName: true } },
      },
      orderBy: { user: { name: "asc" } },
    })

    return NextResponse.json({
      advisors: teachers.map((t) => ({
        id: t.userId,
        name: t.user.name,
        nip: t.nip ?? null,
        majorName: t.major.name,
        majorFullName: t.major.fullName,
      })),
    })
  } catch (error) {
    console.error("Error in GET /api/student/advisors:", error)
    return NextResponse.json(
      { error: "Gagal memuat daftar guru pembimbing." },
      { status: 500 }
    )
  }
}
