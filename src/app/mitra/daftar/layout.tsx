import type { Metadata } from "next";

/**
 * Metadata untuk /mitra/daftar.
 *
 * Halaman pendaftaran mitra adalah komponen klien (formulir berisi state), jadi
 * metadata diletakkan di layout pembungkusnya.
 *
 * Halaman ini sengaja `index: true`: perusahaan yang mencari cara bermitra
 * dengan SMK lewat mesin pencari justru adalah calon pengguna yang tepat.
 */
export const metadata: Metadata = {
  description:
    "Daftarkan perusahaan Anda untuk mengakses katalog karya siswa SMKN 13 Bandung, mengirim minat rekrutmen, dan bermitra resmi melalui BKK sekolah.",
  alternates: { canonical: "/mitra/daftar" },
  openGraph: {
    title: "Kandaga",
    description:
      "Akses katalog karya siswa SMKN 13 Bandung dan bermitra resmi melalui BKK sekolah.",
    url: "/mitra/daftar",
  },
};

export default function MitraDaftarLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
