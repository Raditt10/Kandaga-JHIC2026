import { withAuth, NextRequestWithAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

/**
 * Middleware route guard — dijalankan oleh Next.js Edge Runtime.
 *
 * Perlindungan yang diterapkan:
 *
 * 1. Semua route /company/* wajib login.
 *    - company dengan verificationStatus "pending"  → /mitra/menunggu
 *    - company dengan verificationStatus "ditolak"  → /mitra/ditolak
 *    - company dengan verificationStatus "disetujui" → lanjut normal
 *
 * 2. Route dashboard lain (/student/*, /teacher/*, /admin/*, /bkk/*)
 *    wajib login, tapi tidak ada pengecekan verifikasi tambahan.
 *
 * 3. /mitra/menunggu dan /mitra/ditolak boleh diakses TANPA login
 *    (user baru selesai daftar belum punya session).
 *
 * Tidak disentuh oleh middleware ini (akses bebas):
 *    - / (landing page)
 *    - /auth/* (login, register)
 *    - /mitra/daftar (form pendaftaran publik)
 *    - /jurusan/*, /galeri-karya (halaman publik)
 *    - /api/* (ditangani masing-masing route)
 */
export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl
    const token        = req.nextauth.token

    // ── Guard: /company/* ──────────────────────────────────────────
    if (pathname.startsWith("/company")) {
      const role               = (token?.role as string | undefined)?.toLowerCase()
      const verificationStatus = token?.verificationStatus as string | null | undefined

      // Pastikan yang masuk memang role company
      if (role !== "company") {
        // Role lain yang entah bagaimana hit /company → ke dashboard mereka
        return NextResponse.redirect(new URL("/auth/login", req.url))
      }

      // Company pending: belum diverifikasi BKK
      if (!verificationStatus || verificationStatus === "pending") {
        return NextResponse.redirect(new URL("/mitra/menunggu", req.url))
      }

      // Company ditolak
      if (verificationStatus === "ditolak") {
        return NextResponse.redirect(new URL("/mitra/ditolak", req.url))
      }

      // verificationStatus === "disetujui" → lanjut
    }

    // ── Guard: role lain — pastikan role cocok dengan path ──────────
    const role = (token?.role as string | undefined)?.toLowerCase()

    if (pathname.startsWith("/student") && role !== "student") {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }
    if (pathname.startsWith("/teacher") && role !== "teacher") {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }
    if (pathname.startsWith("/bkk") && role !== "bkk") {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      // Halaman publik yang tidak butuh login sama sekali
      authorized({ req, token }) {
        const { pathname } = req.nextUrl

        // Route yang selalu boleh diakses tanpa token
        const publicRoutes = [
          "/",
          "/auth/",
          "/mitra/daftar",
          "/mitra/menunggu",
          "/mitra/ditolak",
          "/jurusan",
          "/galeri-karya",
          "/api/",
        ]

        const isPublic = publicRoutes.some(
          (r) => pathname === r || pathname.startsWith(r)
        )
        if (isPublic) return true

        // Semua route lain (termasuk /company/*, /student/*, dll) wajib token
        return !!token
      },
    },
  }
)

export const config = {
  // Jalankan middleware hanya pada route yang relevan
  // Exclude static assets dan _next internal routes
  matcher: [
    "/company/:path*",
    "/student/:path*",
    "/teacher/:path*",
    "/admin/:path*",
    "/bkk/:path*",
    "/mitra/menunggu",
    "/mitra/ditolak",
  ],
}
