import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { bkkSteps, bkkFaqs } from "@/data/bkkSteps";

/**
 * /mitra/cara-kerja-bkk — halaman publik penjelasan alur BKK untuk calon mitra.
 *
 * Ditautkan dari header /mitra/daftar. Sebelumnya tautan itu menunjuk ke rute
 * yang belum ada sehingga menghasilkan 404.
 *
 * Isi langkah & FAQ diambil dari src/data/bkkSteps.ts — sumber yang sama
 * dengan section landing page, supaya tidak ada dua versi teks.
 *
 * Server Component: tidak ada state maupun interaksi, jadi tidak perlu
 * "use client" dan tidak mengirim JavaScript tambahan ke pengunjung.
 */

export const metadata: Metadata = {
  title: "Cara Kerja BKK — Kandaga",
  description:
    "Alur pendaftaran mitra industri hingga penyaluran minat rekrutmen dan PKL siswa SMKN 13 Bandung melalui Bursa Kerja Khusus (BKK).",
};

export default function CaraKerjaBKKPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF9F6] via-white to-cream flex flex-col">

      {/* ── Mini navbar — pola sama dengan /mitra/daftar ────────────── */}
      <header className="w-full pt-6 px-4 z-20">
        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-md border border-ink-150 shadow-sm rounded-full px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 relative rounded-full overflow-hidden ring-1 ring-ink/5">
              <Image src="/logo.png" alt="Kandaga" fill className="object-contain" priority />
            </div>
            <span className="font-heading font-extrabold text-base bg-gradient-to-r from-ink via-primary to-primary bg-clip-text text-transparent">
              KANDAGA
            </span>
          </Link>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <Link href="/mitra/daftar" className="text-ink-600 hover:text-ink transition hidden sm:block">
              Daftar Mitra
            </Link>
            <Link
              href="/auth/login"
              className="rounded-full border border-primary text-primary px-4 py-2 hover:bg-primary hover:text-white transition"
            >
              Masuk
            </Link>
          </div>
        </div>
      </header>

      {/* ── Konten ─────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 py-12">
        <div className="w-full max-w-3xl mx-auto">

          {/* Judul */}
          <div className="mb-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/8 border border-primary/20 text-primary text-xs font-semibold mb-4">
              Untuk Mitra Industri
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
              Cara Kerja BKK
            </h1>
            <p className="mt-3 text-base text-ink-700 max-w-[65ch]">
              Kandaga menghubungkan perusahaan dengan talenta siswa SMKN 13 Bandung melalui
              Bursa Kerja Khusus (BKK). Perusahaan tidak menghubungi siswa secara langsung —
              BKK yang meninjau dan meneruskan setiap permintaan.
            </p>
          </div>

          {/* Langkah */}
          <section aria-labelledby="langkah-heading" className="mb-14">
            <h2 id="langkah-heading" className="font-heading text-xl font-bold text-ink mb-6">
              Lima Langkah Menjadi Mitra
            </h2>

            <ol className="space-y-4">
              {bkkSteps.map((step) => (
                <li
                  key={step.no}
                  className="flex items-start gap-4 rounded-2xl border border-ink-150 bg-white p-5"
                >
                  <span
                    aria-hidden="true"
                    className="shrink-0 w-10 h-10 rounded-full bg-primary/8 text-primary font-heading font-bold text-sm flex items-center justify-center"
                  >
                    {step.no}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-heading font-bold text-ink text-base">{step.title}</h3>
                    <p className="mt-1 text-sm text-ink-700 max-w-[65ch]">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* FAQ */}
          <section aria-labelledby="faq-heading" className="mb-14">
            <h2 id="faq-heading" className="font-heading text-xl font-bold text-ink mb-6">
              Pertanyaan yang Sering Diajukan
            </h2>

            <dl className="space-y-5">
              {bkkFaqs.map((faq) => (
                <div key={faq.q} className="rounded-2xl border border-ink-150 bg-white p-5">
                  <dt className="font-heading font-bold text-ink text-base">{faq.q}</dt>
                  <dd className="mt-1.5 text-sm text-ink-700 max-w-[65ch]">{faq.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Ajakan */}
          <section className="rounded-2xl border border-ink-150 bg-cream p-6 sm:p-8">
            <h2 className="font-heading text-xl font-bold text-ink">Siap bergabung sebagai mitra?</h2>
            <p className="mt-2 text-sm text-ink-700 max-w-[65ch]">
              Pendaftaran gratis. Setelah dokumen legalitas diverifikasi BKK, akun Anda langsung
              mendapat akses ke katalog karya siswa.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/mitra/daftar"
                className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition"
              >
                Daftar sebagai Mitra
              </Link>
              <Link
                href="/gallery"
                className="inline-flex items-center rounded-full border border-ink-150 bg-white px-6 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-100 transition"
              >
                Lihat Galeri Karya
              </Link>
            </div>
          </section>

        </div>
      </main>

      {/* ── Catatan kaki ───────────────────────────────────────────── */}
      <footer className="px-4 pb-10">
        <p className="max-w-3xl mx-auto text-center text-sm text-ink-600">
          Bursa Kerja Khusus SMKN 13 Bandung ·{" "}
          <a href="mailto:bkk@smkn13bandung.sch.id" className="text-primary hover:underline">
            bkk@smkn13bandung.sch.id
          </a>
        </p>
      </footer>

    </div>
  );
}
