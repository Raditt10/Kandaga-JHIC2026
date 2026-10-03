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
 */

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { normalizeRole } from "@/lib/auth"

type AuthOk = { userId: string; error?: undefined }
type AuthFail = { userId?: undefined; error: NextResponse }

export async function requireStudent(): Promise<AuthOk | AuthFail> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Sesi login diperlukan" }, { status: 401 }),
    }
  }

  // Role di session bisa berupa PascalCase (enum Prisma) maupun lowercase,
  // jadi dinormalisasi dulu — sama seperti di seluruh aplikasi.
  if (normalizeRole(String(session.user.role)) !== "student") {
    return {
      error: NextResponse.json(
        { error: "Endpoint ini hanya untuk akun siswa" },
        { status: 403 }
      ),
    }
  }

  return { userId: session.user.id }
}
