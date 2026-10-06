/**
 * Guard otorisasi untuk route API.
 *
 * Dibuat karena route hasil impor dari den_gallery hanya memeriksa
 * "ada sesi atau tidak" (`if (!session)`). Akibatnya:
 *   - akun perusahaan/admin bisa memanggil endpoint siswa, dan
 *     `ensureStudentProfile()` akan membuat baris `students` palsu untuk
 *     mereka (sudah terbukti terjadi saat pengujian),
 *   - endpoint [id] tidak memeriksa kepemilikan, sehingga siapa pun yang
 *     login bisa mengubah atau MENGHAPUS karya siswa lain,
 *   - /api/upload bisa dipanggil tanpa login sama sekali.
 *
 * Pemakaian:
 *   const auth = await requireStudent();
 *   if (auth.error) return auth.error;   // sudah berisi NextResponse
 *   ...auth.userId
 *
 * Tersedia: requireRole(["teacher", "bkk"]) — atau pintasan requireStudent()
 * dan requireTeacher().
 */

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { normalizeRole } from "@/lib/auth"
import prisma from "@/lib/prisma"

type AuthOk = { userId: string; role: string; error?: undefined }
type AuthFail = { userId?: undefined; role?: undefined; error: NextResponse }

/**
 * Guard umum: sesi wajib ada, dan role harus salah satu yang diizinkan.
 * Role di session bisa PascalCase (enum Prisma) maupun lowercase, jadi
 * dinormalisasi dulu — sama seperti di seluruh aplikasi.
 */
export async function requireRole(allowed: string[]): Promise<AuthOk | AuthFail> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Sesi login diperlukan" }, { status: 401 }),
    }
  }

  const role = normalizeRole(String(session.user.role))

  if (!allowed.includes(role)) {
    return {
      error: NextResponse.json(
        { error: `Endpoint ini hanya untuk: ${allowed.join(", ")}` },
        { status: 403 }
      ),
    }
  }

  // Verifikasi akun benar-benar ada di database (mencegah error jika DB pernah di-seed/reset saat sesi masih aktif)
  try {
    const dbUser = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { id: true, status: true },
    })

    if (!dbUser) {
      return {
        error: NextResponse.json(
          { error: "Sesi login tidak valid atau telah kadaluarsa. Silakan login kembali." },
          { status: 401 }
        ),
      }
    }

    if (dbUser.status !== "aktif") {
      return {
        error: NextResponse.json(
          { error: "Akun dinonaktifkan. Hubungi administrator." },
          { status: 403 }
        ),
      }
    }
  } catch (dbErr) {
    console.error("requireRole user validation error:", dbErr)
  }

  return { userId: session.user.id, role }
}

export async function requireStudent(): Promise<AuthOk | AuthFail> {
  return requireRole(["student"])
}

export async function requireTeacher(): Promise<AuthOk | AuthFail> {
  return requireRole(["teacher"])
}


