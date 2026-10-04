/**
 * GET /api/stats
 *
 * Statistik publik Kandaga untuk landing page StatsSection.
 * Endpoint ini TIDAK memerlukan autentikasi.
 *
 * Respons di-cache di edge selama 5 menit (300 detik) supaya tidak
 * membebani database setiap kali halaman utama dimuat.
 *
 * Shape:
 *   {
 *     jurusanAktif:          number   // selalu 3 (RPL, TKJ, Analis Kimia)
 *     karyaTerdokumentasi:   number   // projects WHERE status = 'approved'
 *     siswaBerkontribusi:    number   // rows di tabel students
 *     guruPembimbing:        number   // rows di tabel teachers
 *   }
 */

import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const revalidate = 300 // Next.js Route Segment Config — ISR 5 menit

export async function GET() {
  try {
    const [approvedProjects, totalStudents, totalTeachers, totalMajors] =
      await Promise.all([
        prisma.projects.count({
          where: { status: "approved", deletedAt: null },
        }),
        prisma.student.count(),
        prisma.teacher.count(),
        prisma.major.count(),
      ])

    return NextResponse.json(
      {
        jurusanAktif:        totalMajors,
        karyaTerdokumentasi: approvedProjects,
        siswaBerkontribusi:  totalStudents,
        guruPembimbing:      totalTeachers,
      },
      {
        status: 200,
        headers: {
          // Browser / CDN cache — 5 menit fresh, 10 menit stale-while-revalidate
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    )
  } catch (error) {
    console.error("Error in GET /api/stats:", error)
    return NextResponse.json(
      { error: "Gagal memuat statistik." },
      { status: 500 }
    )
  }
}
