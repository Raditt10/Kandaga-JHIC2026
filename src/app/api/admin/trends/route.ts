/**
 * GET /api/admin/trends
 *
 * Analitik karya untuk halaman admin/trend-karya. Sebelumnya seluruh grafik
 * dan KPI di halaman itu memakai angka fiktif (142, 28, 1.240, 48%) yang
 * ditulis langsung di komponen.
 *
 * Semua seri di bawah dihitung dari database. Tren bulanan memakai
 * `date_trunc` di PostgreSQL agar tidak perlu menarik seluruh baris ke Node —
 * agregasi ini punya 12 bulan terakhir, bukan seluruh tabel.
 */

import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"

const TYPE_LABEL: Record<string, string> = {
  RPL: "Rekayasa Perangkat Lunak",
  TKJ: "Teknik Komputer & Jaringan",
  KA: "Analis Kimia",
}

export async function GET() {
  try {
    const auth = await requireRole(["admin"])
    if (auth.error) return auth.error

    const [byType, byYear, byStatus, topViewed, monthly, scoreAgg, viewAgg] = await Promise.all([
      prisma.projects.groupBy({ by: ["type"], where: { deletedAt: null }, _count: { _all: true } }),
      prisma.projects.groupBy({ by: ["year"], where: { deletedAt: null }, _count: { _all: true } }),
      prisma.projects.groupBy({ by: ["status"], where: { deletedAt: null }, _count: { _all: true } }),
      prisma.projects.findMany({
        where: { deletedAt: null },
        select: { id: true, title: true, viewCount: true, stars: true, type: true, status: true, score: true },
        orderBy: { viewCount: "desc" },
        take: 8,
      }),
      // Tanpa interpolasi nilai apa pun — aman dari injeksi.
      prisma.$queryRaw<{ month: Date; total: number }[]>`
        SELECT date_trunc('month', created_at) AS month, COUNT(*)::int AS total
        FROM projects
        WHERE deleted_at IS NULL
          AND created_at >= (date_trunc('month', NOW()) - INTERVAL '11 months')
        GROUP BY 1
        ORDER BY 1
      `,
      prisma.projects.aggregate({
        where: { deletedAt: null, score: { not: null } },
        _avg: { score: true },
        _count: { _all: true },
      }),
      prisma.projects.aggregate({ where: { deletedAt: null }, _sum: { viewCount: true } }),
    ])

    const statusCount: Record<string, number> = { pending: 0, approved: 0, revisi: 0, rejected: 0 }
    let total = 0
    for (const r of byStatus) {
      statusCount[r.status] = r._count._all
      total += r._count._all
    }

    const approvedByType: Record<string, number> = {}
    const approvedGroup = await prisma.projects.groupBy({
      by: ["type"],
      where: { deletedAt: null, status: "approved" },
      _count: { _all: true },
    })
    for (const r of approvedGroup) approvedByType[r.type] = r._count._all

    const approvedTotal = statusCount.approved

    return NextResponse.json({
      totals: {
        projects: total,
        approved: approvedTotal,
        pending: statusCount.pending,
        views: viewAgg._sum.viewCount ?? 0,
        averageScore: scoreAgg._avg.score ? Math.round(scoreAgg._avg.score * 10) / 10 : null,
        scoredCount: scoreAgg._count._all,
        // Rasio karya yang lolos moderasi — dihitung, bukan dikarang.
        approvalRate: total > 0 ? Math.round((approvedTotal / total) * 1000) / 10 : 0,
      },
      byMajor: byType
        .map((r) => ({
          code: r.type,
          label: TYPE_LABEL[r.type] ?? r.type,
          total: r._count._all,
          approved: approvedByType[r.type] ?? 0,
        }))
        .sort((a, b) => b.total - a.total),
      byYear: byYear
        .map((r) => ({ year: r.year, total: r._count._all }))
        .sort((a, b) => a.year - b.year),
      byStatus: Object.entries(statusCount).map(([status, count]) => ({ status, count })),
      monthly: monthly.map((m) => ({
        month: `${m.month.getFullYear()}-${String(m.month.getMonth() + 1).padStart(2, "0")}`,
        total: Number(m.total),
      })),
      topViewed: topViewed.map((p) => ({
        id: p.id,
        title: p.title,
        viewCount: p.viewCount,
        stars: p.stars,
        category: TYPE_LABEL[p.type] ?? p.type,
        status: p.status,
        score: p.score,
      })),
    })
  } catch (error) {
    console.error("Error in GET /api/admin/trends:", error)
    return NextResponse.json({ error: "Gagal memuat analitik tren." }, { status: 500 })
  }
}
