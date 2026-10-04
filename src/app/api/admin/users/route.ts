/**
 * GET /api/admin/users
 *
 * Daftar seluruh akun untuk panel admin.
 *
 * Sebelumnya halaman admin/pengguna memakai `lib/users.ts` yang menyimpan
 * pengguna di array in-memory (`globalThis`). Akibatnya setiap perubahan
 * hilang begitu server dimulai ulang, dan `password` tersimpan sebagai teks
 * biasa di memori. Endpoint ini membaca tabel `users` sungguhan.
 *
 * Query: ?role=all|student|teacher|company|bkk|admin  ?q=  ?page=  ?pageSize=
 *
 * CATATAN KEAMANAN: `passwordHash` SENGAJA tidak pernah dipilih, sehingga
 * tidak mungkin ikut terkirim ke klien.
 */

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"
import { normalizeRole } from "@/lib/auth"
import type { Prisma } from "@prisma/client"

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  studentProfile: {
    select: { nis: true, class: true, generation: true, major: { select: { name: true, fullName: true } } },
  },
  teacherProfile: {
    select: { nip: true, major: { select: { name: true, fullName: true } } },
  },
  companyProfile: {
    select: { name: true, field: true, verificationStatus: true, verifiedAt: true },
  },
} satisfies Prisma.UsersSelect

type UserRow = Prisma.UsersGetPayload<{ select: typeof USER_SELECT }>

function mapUser(u: UserRow) {
  const role = normalizeRole(String(u.role))
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role,
    roleLabel: String(u.role),
    status: u.status,
    createdAt: u.createdAt.toISOString(),
    major: u.studentProfile?.major?.name ?? u.teacherProfile?.major?.name ?? null,
    majorFullName: u.studentProfile?.major?.fullName ?? u.teacherProfile?.major?.fullName ?? null,
    nis: u.studentProfile?.nis ?? null,
    kelas: u.studentProfile?.class ?? null,
    generation: u.studentProfile?.generation ?? null,
    nip: u.teacherProfile?.nip ?? null,
    companyName: u.companyProfile?.name ?? null,
    companyField: u.companyProfile?.field ?? null,
    verificationStatus: u.companyProfile?.verificationStatus ?? null,
    verifiedAt: u.companyProfile?.verifiedAt ? u.companyProfile.verifiedAt.toISOString() : null,
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["admin"])
    if (auth.error) return auth.error

    const sp = req.nextUrl.searchParams
    const role = (sp.get("role") ?? "all").trim().toLowerCase()
    const q = (sp.get("q") ?? "").trim()
    const page = Math.max(1, Number(sp.get("page") ?? 1) || 1)
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number(sp.get("pageSize") ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE)
    )

    const where: Prisma.UsersWhereInput = {}
    if (role !== "all" && ["student", "teacher", "company", "bkk", "admin"].includes(role)) {
      // Enum Prisma memakai PascalCase, kecuali BKK yang tetap "BKK".
      const enumValue =
        role === "bkk" ? "BKK" : ((role.charAt(0).toUpperCase() + role.slice(1)) as string)
      where.role = enumValue as Prisma.EnumRoleFilter["equals"]
    }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ]
    }

    const [rows, total, byRole] = await Promise.all([
      prisma.users.findMany({
        where,
        select: USER_SELECT,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.users.count({ where }),
      prisma.users.groupBy({ by: ["role"], _count: { _all: true } }),
    ])

    const counts: Record<string, number> = { all: 0, student: 0, teacher: 0, company: 0, bkk: 0, admin: 0 }
    for (const r of byRole) {
      const key = normalizeRole(String(r.role))
      counts[key] = (counts[key] ?? 0) + r._count._all
      counts.all += r._count._all
    }

    return NextResponse.json({
      items: rows.map(mapUser),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      counts,
    })
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error)
    return NextResponse.json({ error: "Gagal memuat daftar pengguna." }, { status: 500 })
  }
}
