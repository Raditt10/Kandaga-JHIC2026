import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Galeri Karya — Kandaga SMKN 13 Bandung",
  description:
    "Jelajahi koleksi karya terbaik siswa SMKN 13 Bandung — aplikasi, desain, riset laboratorium, dan lebih banyak lagi.",
};

/**
 * Halaman Galeri Karya — placeholder siap dikembangkan Fase 2.
 * Akan menampilkan grid karya dari database dengan filter jurusan/skill/badge.
 */
export default function GaleriKaryaPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">

        {/* Hero section */}
        <section className="border-b border-ink-150 bg-gradient-to-b from-[#FBF9F6] to-white py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <span className="text-xs font-semibold tracking-[0.3em] text-ink-600">
              GALERI KARYA
            </span>
            <h1 className="mt-2 font-heading text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
              Karya terbaik siswa SMKN 13 Bandung
            </h1>
            <p className="mt-4 text-base text-ink-700 leading-relaxed max-w-[65ch]">
              Semua karya telah melewati kurasi guru pembimbing — kamu sedang
              melihat portofolio nyata, bukan unggahan bebas.
            </p>

            {/* Filter pills placeholder */}
            <div className="mt-8 flex flex-wrap gap-3">
              {["Semua", "RPL", "TKJ", "Analis Kimia", "Terbaru", "Populer"].map(
                (filter) => (
                  <button
                    key={filter}
                    className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                      filter === "Semua"
                        ? "border-primary bg-primary text-white"
                        : "border-ink-300 text-ink-700 hover:border-ink"
                    }`}
                  >
                    {filter}
                  </button>
                )
              )}
            </div>
          </div>
        </section>

        {/* Placeholder grid */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-150 text-center">
            <p className="font-heading text-2xl font-semibold text-ink-300">
              Katalog Karya
            </p>
            <p className="mt-2 text-sm text-ink-300 max-w-sm">
              Halaman ini akan menampilkan grid karya lengkap dari database setelah
              koneksi Supabase dikonfigurasi di Fase 2.
            </p>
            <Link
              href="/"
              className="mt-6 rounded-full border border-ink-150 px-5 py-2.5 text-sm font-medium text-ink-700 hover:border-ink transition-colors"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
