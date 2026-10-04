/**
 * GET /api/admin/stats
 *
 * Metrik untuk halaman admin/dashboard. Sebelumnya seluruh angka di halaman
 * itu ditulis langsung di dalam komponen ("128", "14", "+38 Karya") dan tidak
 * pernah berubah walaupun data di database bertambah.
 *
 * Semua angka di endpoint ini dihitung dari database.
 */

import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"
import { mapTeacherProject, TEACHER_PROJECT_INCLUDE, MAJOR_TO_PROJECT_TYPE } from "@/lib/teacher-scope"

const TYPE_LABEL: Record<string, string> = {
  RPL: "Rekayasa Perangkat Lunak",
  TKJ: "Teknik Komputer & Jaringan",
  KA: "Analis Kimia",
}

export async function GET() {
  try {
    const auth = await requireRole(["admin"])
    if (auth.error) return auth.error

    const [
      projectStatus,
      projectType,
      userRoles,
      companyStatus,
      contactStatus,
      majors,
      recentProjects,
      recentPartners,
      auditLogs,
      totalViews,
      avgScore,
    ] = await Promise.all([
      prisma.projects.groupBy({ by: ["status"], where: { deletedAt: null }, _count: { _all: true } }),
      prisma.projects.groupBy({ by: ["type"], where: { deletedAt: null }, _count: { _all: true } }),
      prisma.users.groupBy({ by: ["role"], _count: { _all: true } }),
      prisma.company.groupBy({ by: ["verificationStatus"], _count: { _all: true } }),
      prisma.contactRequests.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.major.findMany({
        select: { id: true, name: true, fullName: true, _count: { select: { students: true, teachers: true } } },
        orderBy: { name: "asc" },
      }),
      prisma.projects.findMany({
        where: { deletedAt: null },
        include: TEACHER_PROJECT_INCLUDE,
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.company.findMany({
        // Kosakata kolom ini adalah "pending" | "disetujui" | "ditolak"
        // (lihat src/types/index.ts VerificationStatus) — bukan "verified".
        where: { verificationStatus: "disetujui" },
        select: { userId: true, name: true, field: true, verifiedAt: true },
        orderBy: { verifiedAt: "desc" },
        take: 4,
      }),
      prisma.auditLogs.findMany({
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          data: true,
          createdAt: true,
          user: { select: { name: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.projects.aggregate({ where: { deletedAt: null }, _sum: { viewCount: true } }),
      prisma.projects.aggregate({
        where: { deletedAt: null, score: { not: null } },
        _avg: { score: true },
      }),
    ])

    const projects: Record<string, number> = { total: 0, pending: 0, approved: 0, revisi: 0, rejected: 0 }
    for (const r of projectStatus) {
      projects[r.status] = r._count._all
      projects.total += r._count._all
    }

    const users: Record<string, number> = { total: 0, student: 0, teacher: 0, company: 0, bkk: 0, admin: 0 }
    for (const r of userRoles) {
      const key = String(r.role).toLowerCase()
      users[key] = (users[key] ?? 0) + r._count._all
      users.total += r._count._all
    }

    const companies: Record<string, number> = { total: 0, pending: 0, disetujui: 0, ditolak: 0 }
    for (const r of companyStatus) {
      companies[r.verificationStatus] = r._count._all
      companies.total += r._count._all
    }

    const contacts: Record<string, number> = { total: 0 }
    for (const r of contactStatus) {
      contacts[r.status] = r._count._all
      contacts.total += r._count._all
    }

    const projectsByType: Record<string, number> = {}
    for (const r of projectType) projectsByType[r.type] = r._count._all

    return NextResponse.json({
      projects,
      users,
      companies,
      contacts,
      totalViews: totalViews._sum.viewCount ?? 0,
      averageScore: avgScore._avg.score ? Math.round(avgScore._avg.score * 10) / 10 : null,
      majors: majors.map((m) => ({
        id: m.id,
        code: m.name,
        label: m.fullName,
        students: m._count.students,
        teachers: m._count.teachers,
        // Pencocokan memakai kode ProjectType lewat peta bersama di
        // teacher-scope, karena nama jurusan "Analis Kimia" dipetakan ke
        // kode "KA" — bukan dicocokkan langsung dengan nama.
        projects: projectsByType[MAJOR_TO_PROJECT_TYPE[m.name] ?? ""] ?? 0,
      })),
      typeLabels: TYPE_LABEL,
      recentProjects: recentProjects.map(mapTeacherProject),
      recentPartners: recentPartners.map((c) => ({
        id: c.userId,
        name: c.name,
        field: c.field,
        verifiedAt: c.verifiedAt ? c.verifiedAt.toISOString() : null,
      })),
      recentAudit: auditLogs.map((l) => ({
        id: l.id,
        action: l.action,
        entity: l.entity,
        entityId: l.entityId,
        detail: typeof l.data === "object" && l.data !== null ? l.data : null,
        actorName: l.user?.name ?? "Sistem",
        actorRole: l.user ? String(l.user.role).toLowerCase() : null,
        createdAt: l.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("Error in GET /api/admin/stats:", error)
    return NextResponse.json({ error: "Gagal memuat statistik." }, { status: 500 })
  }
}
