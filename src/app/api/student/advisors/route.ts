/**
 * GET /api/student/advisors
 *
 * Daftar guru pembimbing yang tersedia untuk siswa yang login.
 * Hanya mengembalikan guru di jurusan yang sama dengan siswa,
 * sesuai aturan alurKarya.md §1 (dropdown difilter otomatis per jurusan).
 *
 * Memerlukan sesi login dengan role Student.
 */

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireStudent } from "@/lib/api-auth"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireStudent()
    if (auth.error) return auth.error

    const url = new URL(req.url)
    const majorParam = url.searchParams.get("major")

    let targetMajorId: string | undefined = undefined

    if (majorParam) {
      const targetName =
        majorParam === "analis-kimia" || majorParam === "ka"
          ? "Analis Kimia"
          : majorParam === "tkj"
          ? "TKJ"
          : "RPL"
      const majorRow = await prisma.major.findFirst({
        where: { name: { contains: targetName, mode: "insensitive" } },
        select: { id: true },
      })
      if (majorRow) targetMajorId = majorRow.id
    }

    if (!targetMajorId) {
      const student = await prisma.student.findUnique({
        where: { userId: auth.userId },
        select: { majorId: true },
      })
      if (student?.majorId) targetMajorId = student.majorId
    }

    let teachers = await prisma.teacher.findMany({
      where: targetMajorId ? { majorId: targetMajorId } : {},
      select: {
        userId: true,
        nip: true,
        user: { select: { name: true } },
        major: { select: { name: true, fullName: true } },
      },
      orderBy: { user: { name: "asc" } },
    })

    // Jika filter jurusan kosong, ambil semua guru agar form tidak buntu
    if (teachers.length === 0) {
      teachers = await prisma.teacher.findMany({
        select: {
          userId: true,
          nip: true,
          user: { select: { name: true } },
          major: { select: { name: true, fullName: true } },
        },
        orderBy: { user: { name: "asc" } },
      })
    }

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
