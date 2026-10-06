import type { MetadataRoute } from "next";
import { JURUSAN_DATA } from "@/data/jurusanData";
import prisma from "@/lib/prisma";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXTAUTH_URL ??
  "http://localhost:3000"
).replace(/\/$/, "");

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
      take : 5000,
    });
    karyaRoutes = karya.map((k) => ({
      url: `${BASE_URL}/gallery/${k.id}`,
      lastModified: k.updatedAt ?? now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (error) { 
    console.error("Sitemap: gagal memuat daftar karya dari database.", error);
  }

  return [...staticRoutes, ...jurusanRoutes, ...karyaRoutes];
}
