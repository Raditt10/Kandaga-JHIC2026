import type { MetadataRoute } from "next";
import { JURUSAN_DATA } from "@/data/jurusanData";
import prisma from "@/lib/prisma";

/**
 * Sitemap dinamis Kandaga.
 *
 * Hanya halaman publik yang masuk. Daftar ini sengaja TIDAK memuat
 * dashboard, halaman autentikasi, maupun halaman status pendaftaran mitra —
 * sejalan dengan aturan di robots.ts.
 *
 * Bagian karya diambil langsung dari database supaya sitemap ikut bertambah
 * setiap ada karya baru disetujui. Kalau database sedang tidak bisa diakses,
 * sitemap tetap dikembalikan berisi halaman statis dan daftar jurusan —
 * kegagalan satu bagian tidak boleh membuat seluruh sitemap hilang.
 */
const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXTAUTH_URL ??
  "http://localhost:3000"
).replace(/\/$/, "");

/** Segarkan sitemap setiap jam — cukup sering, tanpa membebani database. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/gallery`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    // `/jurusan` sengaja TIDAK didaftarkan: halaman itu hanya mengalihkan ke
    // `/jurusan/rpl`. URL yang mengalihkan tidak layak masuk sitemap — mesin
    // pencari akan mengikuti pengalihannya ke halaman jurusan yang sebenarnya.
    {
      url: `${BASE_URL}/mitra/cara-kerja-bkk`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/mitra/daftar`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const jurusanRoutes: MetadataRoute.Sitemap = JURUSAN_DATA.map((j) => ({
    url: `${BASE_URL}/jurusan/${j.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  let karyaRoutes: MetadataRoute.Sitemap = [];
  try {
    const karya = await prisma.projects.findMany({
      where: { status: "approved", deletedAt: null },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    });
    karyaRoutes = karya.map((k) => ({
      url: `${BASE_URL}/gallery/${k.id}`,
      lastModified: k.updatedAt ?? now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    // Database tidak tersedia: sitemap tetap berisi halaman statis + jurusan.
    console.error("Sitemap: gagal memuat daftar karya dari database.", error);
  }

  return [...staticRoutes, ...jurusanRoutes, ...karyaRoutes];
}
