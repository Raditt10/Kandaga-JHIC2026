import type { MetadataRoute } from "next";

/**
 * Web App Manifest — supaya Kandaga bisa dipasang ke layar utama ponsel
 * ("Add to Home Screen"). Ini penting karena sebagian besar penggunaan
 * diperkirakan dari ponsel: siswa melihat karya, perusahaan menyaring talenta.
 *
 * `display: "standalone"` membuatnya terbuka tanpa bilah alamat browser,
 * sehingga terasa seperti aplikasi.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kandaga — Galeri Digital Karya Siswa SMKN 13 Bandung",
    short_name: "Kandaga",
    description:
      "Etalase digital karya terbaik siswa SMKN 13 Bandung — terverifikasi sekolah, terbuka untuk industri.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#8B1A2F",
    lang: "id",
    dir: "ltr",
    categories: ["education", "portfolio", "productivity"],
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
