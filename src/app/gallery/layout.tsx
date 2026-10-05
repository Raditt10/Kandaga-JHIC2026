import type { Metadata } from "next";

/**
 * Metadata untuk /gallery.
 *
 * Halaman galeri (`page.tsx`) adalah komponen klien — ia memuat daftar karya
 * lewat fetch di sisi peramban. Komponen klien tidak bisa mengekspor
 * `metadata`, jadi metadata diletakkan di layout ini yang membungkusnya.
 */
export const metadata: Metadata = {
  description:
    "Telusuri karya siswa SMKN 13 Bandung yang sudah diverifikasi guru pembimbing — lengkap dengan jurusan, tahun, dan teknologi yang dipakai. Terbuka untuk industri.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: "Kandaga",
    description:
      "Karya siswa SMKN 13 Bandung yang sudah diverifikasi guru pembimbing — RPL, TKJ, dan Analis Kimia.",
    url: "/gallery",
  },
};

export default function GalleryLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
