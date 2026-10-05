/**
 * PATCH  /api/admin/users/[id]  → ubah peran / status akun / verifikasi mitra
 * DELETE /api/admin/users/[id]  → NONAKTIFKAN akun (bukan hapus permanen)
 *
 * Body PATCH (semua opsional, minimal satu):
 *   { role?, status?, verificationStatus?, catatanVerifikasi?,
 *     majorId?, nis?, kelas?, generation?, nip? }
 *
 * ATURAN PENTING
 * - Mengubah peran ke Siswa/Guru berarti harus membuat baris profil di tabel
 *   `students`/`teachers`, yang mewajibkan data jurusan (dan untuk siswa:
 *   NIS, kelas, angkatan). Kalau data itu tidak dikirim, permintaan ditolak
 *   dengan pesan yang menyebutkan tepat apa yang kurang — supaya tidak pernah
 *   ada akun dengan peran Siswa tetapi tanpa profil.
 * - DELETE TIDAK menghapus baris `users`. Relasi di skema memakai
 *   `onDelete: Cascade` dari users ke students/teachers/companies dan ke
 *   notifications, sehingga menghapus akun siswa akan ikut menghapus SELURUH
 *   karyanya. Karena itu DELETE hanya menandai status "nonaktif" dan
 *   tindakannya dicatat di audit log.
 * - Admin tidak boleh menurunkan peran atau menonaktifkan akunnya sendiri,
 *   supaya tidak terkunci dari panel.
 */

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireRole } from "@/lib/api-auth"
import { normalizeRole } from "@/lib/auth"
import { audit } from "@/lib/activity"

const ROLE_ENUM = {
  student: "Student",
  teacher: "Teacher",
  company: "Company",
  admin: "Admin",
  bkk: "BKK",
} as const

type RoleKey = keyof typeof ROLE_ENUM

// Kosakata resmi kolom verificationStatus (src/types/index.ts).
const VERIFICATION_VALUES = ["pending", "disetujui", "ditolak"]

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(["admin"])
    if (auth.error) return auth.error

    const { id } = await context.params
    const body = await req.json().catch(() => ({}))

    const target = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        role: true,
        status: true,
        studentProfile: { select: { userId: true, majorId: true } },
        teacherProfile: { select: { userId: true, majorId: true } },
        companyProfile: { select: { userId: true } },
      },
    })
    if (!target) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 })
    }

    const isSelf = id === auth.userId
    const data: Record<string, unknown> = {}
    const changes: Record<string, unknown> = {}

    // ── status akun ────────────────────────────────────────────────────────
    if (typeof body.status === "string" && body.status.trim()) {
      const status = body.status.trim()
      if (isSelf && status !== "aktif") {
        return NextResponse.json(
          { error: "Anda tidak dapat menonaktifkan akun Anda sendiri." },
          { status: 400 }
        )
      }
      data.status = status
      changes.status = status
    }

    // ── peran ──────────────────────────────────────────────────────────────
    if (typeof body.role === "string" && body.role.trim()) {
      const roleKey = normalizeRole(body.role) as RoleKey
      if (!(roleKey in ROLE_ENUM)) {
        return NextResponse.json({ error: "Peran tidak dikenal." }, { status: 400 })
      }
      if (isSelf && roleKey !== "admin") {
        return NextResponse.json(
          { error: "Anda tidak dapat mengubah peran akun Anda sendiri." },
          { status: 400 }
        )
      }

      const currentKey = normalizeRole(String(target.role))
      if (roleKey !== currentKey) {
        // Peran yang butuh profil tambahan: pastikan datanya lengkap.
        if (roleKey === "student" && !target.studentProfile) {
          const majorId =
            typeof body.majorId === "string" && body.majorId.trim()
              ? body.majorId.trim()
              : target.teacherProfile?.majorId || ""
          if (!majorId) {
            return NextResponse.json(
              { error: "Untuk menjadikan pengguna ini Siswa, data jurusan wajib dipilih." },
              { status: 400 }
            )
          }
        }
        if (roleKey === "teacher" && !target.teacherProfile) {
          const majorId =
            typeof body.majorId === "string" && body.majorId.trim()
              ? body.majorId.trim()
              : target.studentProfile?.majorId || ""
          if (!majorId) {
            return NextResponse.json(
              { error: "Untuk menjadikan pengguna ini Guru, data jurusan (majorId) wajib dipilih." },
              { status: 400 }
            )
          }
        }
        data.role = ROLE_ENUM[roleKey]
        changes.role = roleKey
      }
    }

    // ── verifikasi mitra ───────────────────────────────────────────────────
    const verificationStatus =
      typeof body.verificationStatus === "string" ? body.verificationStatus.trim() : ""
    const catatan =
      typeof body.catatanVerifikasi === "string" ? body.catatanVerifikasi.trim() : ""

    if (verificationStatus) {
      if (!VERIFICATION_VALUES.includes(verificationStatus)) {
        return NextResponse.json(
          { error: `Status verifikasi harus salah satu dari: ${VERIFICATION_VALUES.join(", ")}.` },
          { status: 400 }
        )
      }
      if (!target.companyProfile) {
        return NextResponse.json(
          { error: "Pengguna ini bukan mitra perusahaan, jadi tidak punya status verifikasi." },
          { status: 400 }
        )
      }
      changes.verificationStatus = verificationStatus
    }

    const inputMajorId = typeof body.majorId === "string" ? body.majorId.trim() : ""
    const inputNip = typeof body.nip === "string" ? body.nip.trim() : ""

    if (Object.keys(data).length === 0 && !verificationStatus && !inputMajorId) {
      return NextResponse.json({ error: "Tidak ada perubahan yang dikirim." }, { status: 400 })
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Buat profil yang dibutuhkan lebih dulu, supaya peran baru tidak pernah
      // berdiri tanpa profil.
      const roleKey = typeof changes.role === "string" ? (changes.role as RoleKey) : null
      const effectiveMajorId =
        inputMajorId ||
        target.studentProfile?.majorId ||
        target.teacherProfile?.majorId ||
        ""

      if (roleKey === "student") {
        if (!target.studentProfile && effectiveMajorId) {
          const nis = typeof body.nis === "string" && body.nis.trim() ? body.nis.trim() : `13-${Date.now().toString().slice(-6)}`
          const kelas = typeof body.kelas === "string" && body.kelas.trim() ? body.kelas.trim() : "X"
          const generation = Number(body.generation) || new Date().getFullYear()
          await tx.student.create({
            data: {
              userId: id,
              majorId: effectiveMajorId,
              nis,
              class: kelas,
              generation,
            },
          })
        } else if (target.studentProfile && effectiveMajorId) {
          await tx.student.update({
            where: { userId: id },
            data: { majorId: effectiveMajorId },
          })
        }
      }

      if (roleKey === "teacher") {
        if (!target.teacherProfile && effectiveMajorId) {
          await tx.teacher.create({
            data: {
              userId: id,
              majorId: effectiveMajorId,
              nip: inputNip || null,
            },
          })
        } else if (target.teacherProfile) {
          await tx.teacher.update({
            where: { userId: id },
            data: {
              ...(effectiveMajorId ? { majorId: effectiveMajorId } : {}),
              ...(inputNip ? { nip: inputNip } : {}),
            },
          })
        }
      }

      // Jika role tidak berubah tetapi admin mengubah jurusan pada guru/siswa
      if (!roleKey && effectiveMajorId) {
        if (target.teacherProfile) {
          await tx.teacher.update({
            where: { userId: id },
            data: {
              majorId: effectiveMajorId,
              ...(inputNip ? { nip: inputNip } : {}),
            },
          })
        } else if (target.studentProfile) {
          await tx.student.update({
            where: { userId: id },
            data: { majorId: effectiveMajorId },
          })
        }
      }

      if (Object.keys(data).length > 0) {
        await tx.users.update({ where: { id }, data })
      }
      if (verificationStatus) {
        await tx.company.update({
          where: { userId: id },
          data: {
            verificationStatus,
            catatanVerifikasi: catatan || null,
            verifiedBy: auth.userId,
            verifiedAt: new Date(),
          },
        })
      }
      return tx.users.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, role: true, status: true },
      })
    })

    await audit({
      userId: auth.userId,
      action: "user.update",
      entity: "users",
      entityId: id,
      data: changes,
    })

    return NextResponse.json({
      success: true,
      message: "Perubahan akun tersimpan.",
      user: updated
        ? { ...updated, role: normalizeRole(String(updated.role)) }
        : null,
    })
  } catch (error) {
    console.error("Error in PATCH /api/admin/users/[id]:", error)
    return NextResponse.json({ error: "Gagal menyimpan perubahan akun." }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(["admin"])
    if (auth.error) return auth.error

    const { id } = await context.params

    if (id === auth.userId) {
      return NextResponse.json(
        { error: "Anda tidak dapat menonaktifkan akun Anda sendiri." },
        { status: 400 }
      )
    }

    const target = await prisma.users.findUnique({ where: { id }, select: { name: true } })
    if (!target) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 })
    }

    await prisma.users.update({ where: { id }, data: { status: "nonaktif" } })

    await audit({
      userId: auth.userId,
      action: "user.deactivate",
      entity: "users",
      entityId: id,
      data: { name: target.name },
    })

    return NextResponse.json({
      success: true,
      message: `Akun ${target.name} dinonaktifkan. Data karyanya tetap utuh dan tidak dihapus.`,
    })
  } catch (error) {
    console.error("Error in DELETE /api/admin/users/[id]:", error)
    return NextResponse.json({ error: "Gagal menonaktifkan akun." }, { status: 500 })
  }
}
