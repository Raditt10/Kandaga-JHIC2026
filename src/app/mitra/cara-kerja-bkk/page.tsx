import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { bkkSteps } from "@/data/bkkSteps";

export const metadata: Metadata = {
  title: "Cara Kerja BKK — Kandaga",
  description:
    "Alur pendaftaran mitra industri hingga penyaluran minat rekrutmen dan PKL siswa SMKN 13 Bandung melalui Bursa Kerja Khusus (BKK).",
};

export default function CaraKerjaBKKPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">

        {/* ── Page Header ── */}
        <section className="bg-gradient-to-b from-[#FBF9F6] to-white pt-12 pb-8 md:pt-14 md:pb-10">
          <div className="mx-auto max-w-7xl px-6">
            <h1 className="font-heading text-3xl font-semibold text-ink md:text-4xl">
              Cara Kerja BKK
            </h1>
            <p className="mt-3 text-sm text-ink-600 md:text-base">
              Kandaga menghubungkan perusahaan dengan talenta siswa SMKN 13 Bandung melalui
              Bursa Kerja Khusus (BKK). Perusahaan tidak menghubungi siswa secara langsung,
              BKK yang meninjau dan meneruskan setiap permintaan.
            </p>
          </div>
        </section>

        {/* ── Konten utama ── */}
        <div className="mx-auto max-w-7xl px-6 py-10 space-y-14">

          {/* Langkah */}
          <section aria-labelledby="langkah-heading">
            <h2
              id="langkah-heading"
              className="font-heading text-3xl font-semibold text-ink md:text-4xl mb-6"
            >
              Lima Langkah Menjadi Mitra
            </h2>

            <ol className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bkkSteps.map((step) => (
                <li
                  key={step.no}
                  className="flex items-start gap-4 rounded-2xl border border-ink-150 bg-white p-5 shadow-xs"
                >
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-10 h-10 rounded-full bg-primary/8 text-primary font-heading font-bold text-sm flex items-center justify-center"
                  >
                    {step.no}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink text-sm">{step.title}</h3>
                    <p className="mt-1 text-sm text-ink-600 leading-relaxed">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* CTA */}
          <section className="rounded-2xl border border-ink-150 bg-[#FBF9F6] p-6 sm:p-8">
            <h2 className="font-heading text-xl font-semibold text-ink">
              Siap bergabung sebagai mitra?
            </h2>
            <p className="mt-2 text-sm text-ink-600">
              Pendaftaran gratis. Setelah dokumen legalitas diverifikasi BKK, akun Anda langsung
              mendapat akses ke katalog karya siswa.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/mitra/daftar"
                className="inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition"
              >
                Daftar sebagai Mitra
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center rounded-full border border-ink-150 bg-white px-6 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-100 transition"
              >
                Lihat Etalase Karya
              </Link>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
