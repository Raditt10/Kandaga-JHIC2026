/**
 * GET /api/student/lowongan
 *
 * Daftar lowongan magang/PKL aktif untuk siswa. Hanya status "buka" dan
 * "terbatas" yang dikembalikan — "tutup" tidak ditampilkan.
 *
 * Memerlukan sesi login dengan role Student.
 *
 * Query params:
 *   ?major=RPL|TKJ|KA|Semua   (default: Semua — tampilkan semua jurusan)
 */

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["student"])
    if (auth.error) return auth.error

    const major = req.nextUrl.searchParams.get("major")?.trim() ?? "Semua"

    const rows = await prisma.internshipPostings.findMany({
      where: {
        status: { in: ["buka", "terbatas"] },
        // Jika ada filter jurusan: tampilkan yang cocok + yang berlabel "Semua"
        ...(major !== "Semua"
          ? { OR: [{ majorTarget: major }, { majorTarget: "Semua" }] }
          : {}),
      },
      orderBy: [
        { status: "asc" },   // "buka" < "terbatas"
        { deadline: "asc" }, // deadline terdekat dulu; null ke bawah
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        role: true,
        company: true,
        majorTarget: true,
        type: true,
        location: true,
        status: true,
        quota: true,
        deadline: true,
        description: true,
        createdAt: true,
      },
    })

    const postings = rows.map((r) => ({
      id: r.id,
      role: r.role,
      company: r.company,
      majorTarget: r.majorTarget,
      type: r.type,
      location: r.location,
      // Label UI yang ramah: "Buka Pendaftaran" / "Terbatas (X Kuota)" / "Tutup"
      statusLabel:
        r.status === "terbatas" && r.quota
          ? `Terbatas (${r.quota})`
          : r.status === "buka"
          ? "Buka Pendaftaran"
          : "Tutup",
      status: r.status,
      deadline: r.deadline
        ? r.deadline.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : null,
      description: r.description ?? null,
    }))

    return NextResponse.json({ postings })
  } catch (error) {
    console.error("Error in GET /api/student/lowongan:", error)
    return NextResponse.json(
      { error: "Gagal memuat daftar lowongan." },
      { status: 500 }
    )
  }
}
