/**
 * GET /api/student/kontak
 *
 * Permintaan kontak dari perusahaan yang sudah diteruskan BKK ke siswa.
 * Hanya mengembalikan permintaan dengan status "diteruskan" yang ditujukan
 * ke karya milik siswa yang sedang login.
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

    // Ambil profil siswa untuk mendapatkan daftar karya miliknya
    const student = await prisma.student.findUnique({
      where: { userId: auth.userId },
      select: { userId: true },
    })

    if (!student) {
      return NextResponse.json({ requests: [] })
    }

    const requests = await prisma.contactRequests.findMany({
      where: {
        status: "diteruskan",
        project: {
          studentId: auth.userId,
          deletedAt: null,
        },
      },
      orderBy: { reviewedAt: "desc" },
      select: {
        id: true,
        purpose: true,
        message: true,
        bkkNotes: true,
        reviewedAt: true,
        createdAt: true,
        company: {
          select: {
            name: true,
            field: true,
            user: { select: { email: true } },
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    const PURPOSE_LABEL: Record<string, string> = {
      magang: "Magang / PKL",
      kerja:  "Rekrutmen Kerja",
      kolaborasi: "Kolaborasi Proyek",
    }

    return NextResponse.json({
      requests: requests.map((r) => ({
        id:           r.id,
        purpose:      r.purpose,
        purposeLabel: PURPOSE_LABEL[r.purpose] ?? r.purpose,
        message:      r.message,
        bkkNotes:     r.bkkNotes ?? null,
        forwardedAt:  r.reviewedAt ? r.reviewedAt.toISOString() : r.createdAt.toISOString(),
        company: {
          name:  r.company?.name ?? "—",
          field: r.company?.field ?? null,
          email: r.company?.user?.email ?? null,
        },
        project: {
          id:    r.project.id,
          title: r.project.title,
        },
      })),
    })
  } catch (error) {
    console.error("Error in GET /api/student/kontak:", error)
    return NextResponse.json(
      { error: "Gagal memuat permintaan kontak." },
      { status: 500 }
    )
  }
}
