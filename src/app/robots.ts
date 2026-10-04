import type { MetadataRoute } from "next";

/**
 * robots.txt untuk Kandaga.
 *
 * Aturan penting: SEMUA area berpemilik ditutup dari perayap. Halaman
 * dashboard (admin, guru, siswa, BKK, perusahaan) hanya berisi data
 * pengguna dan tidak boleh masuk indeks mesin pencari — bukan sekadar
 * tidak berguna untuk SEO, tetapi juga berisiko membocorkan tautan
 * internal.
 *
 * `/auth/*` juga ditutup: halaman login/daftar tidak punya nilai pencarian
 * dan hanya menambah duplikasi.
 */
const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXTAUTH_URL ??
  "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/student/",
          "/teacher/",
          "/bkk/",
          "/company/",
          "/auth/",
          // Halaman status pendaftaran mitra: transaksional, tidak untuk publik
          "/mitra/menunggu",
          "/mitra/ditolak",
        ],
      },
    ],
    sitemap: `${BASE_URL.replace(/\/$/, "")}/sitemap.xml`,
    host: BASE_URL.replace(/\/$/, ""),
  };
}
