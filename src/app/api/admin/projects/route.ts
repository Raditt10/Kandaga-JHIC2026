/**
 * GET /api/admin/projects
 *
 * Daftar karya untuk panel admin — TERMASUK yang belum dimoderasi.
 * Sebelumnya halaman admin/moderasi menampilkan array mock dari
 * `lib/adminData.ts`, sehingga keputusan moderasi diambil atas karya fiktif.
 *
 * Query:
 *   ?status=all|pending|approved|revisi|rejected   (default: all)
 *   ?type=RPL|TKJ|KA                               (opsional)
 *   ?q=kata kunci                                  (judul / nama siswa)
 *   ?page=1&pageSize=12                            (maks 50)
 *
 * Respons menyertakan `counts` supaya tab status di UI bisa menampilkan
 * jumlah sebenarnya tanpa permintaan tambahan.
 */

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"
import { mapTeacherProject, TEACHER_PROJECT_INCLUDE } from "@/lib/teacher-scope"
import type { Prisma } from "@prisma/client"

const DEFAULT_PAGE_SIZE = 12
const MAX_PAGE_SIZE = 50
const VALID_STATUS = ["pending", "approved", "revisi", "rejected"]
const VALID_TYPE = ["RPL", "TKJ", "KA"]

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["admin"])
    if (auth.error) return auth.error

    const sp = req.nextUrl.searchParams
    const status = (sp.get("status") ?? "all").trim()
    const type = (sp.get("type") ?? "").trim().toUpperCase()
    const q = (sp.get("q") ?? "").trim()

    const page = Math.max(1, Number(sp.get("page") ?? 1) || 1)
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number(sp.get("pageSize") ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE)
    )

    // Karya yang di-soft-delete tidak pernah tampil di panel admin.
    const base: Prisma.ProjectsWhereInput = { deletedAt: null }
    if (VALID_STATUS.includes(status)) base.status = status
    if (VALID_TYPE.includes(type)) base.type = type as Prisma.EnumProjectTypeFilter["equals"]
    if (q) {
      base.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { student: { user: { name: { contains: q, mode: "insensitive" } } } },
      ]
    }

    const [rows, total, byStatus] = await Promise.all([
      prisma.projects.findMany({
        where: base,
        include: TEACHER_PROJECT_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.projects.count({ where: base }),
      // Jumlah per status memakai filter yang sama KECUALI status itu sendiri,
      // supaya angka di tab tetap benar saat salah satu tab sedang aktif.
      prisma.projects.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
    ])

    const counts: Record<string, number> = { all: 0, pending: 0, approved: 0, revisi: 0, rejected: 0 }
    for (const row of byStatus) {
      const n = row._count._all
      counts[row.status] = n
      counts.all += n
    }

    return NextResponse.json({
      items: rows.map(mapTeacherProject),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      counts,
    })
  } catch (error) {
    console.error("Error in GET /api/admin/projects:", error)
    return NextResponse.json({ error: "Gagal memuat daftar karya." }, { status: 500 })
  }
}
