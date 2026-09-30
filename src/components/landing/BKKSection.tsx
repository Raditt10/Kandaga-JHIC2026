"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { staggerChildren, revealUp } from "@/lib/motion";

// ── 5 langkah alur BKK ───────────────────────────────────────────────────
const steps = [
  {
    no: "01",
    title: "Daftar akun perusahaan",
    desc: "Isi formulir pendaftaran dan unggah dokumen legalitas perusahaan (NIB, NPWP, atau SK).",
  },
  {
    no: "02",
    title: "Verifikasi oleh Koordinator BKK",
    desc: "Tim BKK meninjau kelengkapan dokumen. Proses verifikasi berlangsung dalam 1×24 jam kerja.",
  },
  {
    no: "03",
    title: "Akses katalog karya siswa",
    desc: "Akun terverifikasi dapat menelusuri dan memfilter katalog portofolio berdasarkan jurusan, skill, atau badge prestasi.",
  },
  {
    no: "04",
    title: "Kirim minat melalui sistem",
    desc: "Sampaikan minat rekrutmen atau kerja sama PKL melalui platform — tidak ada kontak langsung ke siswa.",
  },
  {
    no: "05",
    title: "BKK meneruskan ke siswa & guru",
    desc: "BKK memverifikasi minat dan menghubungkan Anda dengan siswa serta guru pembimbing terkait untuk tindak lanjut.",
  },
];

// ── FAQ singkat ────────────────────────────────────────────────────────────
const faqs = [
  {
    q: "Berapa lama proses verifikasi akun perusahaan?",
    a: "Maksimal 1×24 jam kerja. Tim BKK akan menghubungi narahubung yang terdaftar melalui email atau WhatsApp.",
  },
  {
    q: "Apakah bisa digunakan untuk kebutuhan PKL saja?",
    a: "Ya. Selain rekrutmen, platform ini juga mendukung penempatan PKL dan kerja sama proyek kolaboratif.",
  },
  {
    q: "Siapa yang bisa dihubungi jika ada kendala?",
    a: "Hubungi Koordinator BKK SMKN 13 Bandung melalui email bkk@smkn13bandung.sch.id atau WhatsApp di jam layanan.",
  },
];

export default function BKKSection() {
  return (
    <section
      id="cara-kerja-bkk"
      className="scroll-mt-24 border-t border-ink-150 bg-white py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* ── Header ── */}
        <motion.div
          className="mb-14 max-w-2xl"
          variants={staggerChildren}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.span variants={revealUp} className="text-xs font-semibold tracking-[0.3em] text-ink-600">
            CARA KERJA BKK
          </motion.span>
          <motion.h2 variants={revealUp} className="mt-2 font-heading text-3xl font-semibold text-ink md:text-4xl">
            Apa itu BKK, dan bagaimana prosesnya?
          </motion.h2>
          <motion.p variants={revealUp} className="mt-4 text-base text-ink-700 leading-relaxed max-w-[65ch]">
            BKK (Bursa Kerja Khusus) adalah unit resmi SMKN 13 Bandung untuk program{" "}
            <em>link and match</em> dengan DUDI — Dunia Usaha &amp; Dunia Industri.
            Proses ini diakui sekolah dan difasilitasi langsung oleh guru koordinator,
            bukan sekadar fitur marketplace.
          </motion.p>
        </motion.div>

        {/* ── 5 langkah ── */}
        <motion.div
          className="mb-16"
          variants={staggerChildren}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, i) => (
              <motion.div
                key={step.no}
                variants={revealUp}
                className="relative flex flex-col gap-3"
              >
                {/* Konektor horizontal — hanya desktop, kecuali item terakhir */}
                {i < steps.length - 1 && (
                  <div
                    className="absolute top-4 left-full hidden h-px w-6 bg-ink-150 lg:block"
                    aria-hidden="true"
                  />
                )}
                {/* Nomor */}
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {step.no}
                </span>
                {/* Konten */}
                <div>
                  <p className="font-heading text-sm font-semibold text-ink">{step.title}</p>
                  <p className="mt-1 text-sm text-ink-700 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── FAQ ── */}
        <motion.div
          className="mb-14 rounded-2xl border border-ink-150 bg-ink-100 p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h3 className="font-heading text-lg font-semibold text-ink mb-6">
            Pertanyaan yang sering ditanyakan
          </h3>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="border-b border-ink-150 pb-6 last:border-0 last:pb-0">
                <p className="font-heading text-sm font-semibold text-ink">{faq.q}</p>
                <p className="mt-2 text-sm text-ink-700 leading-relaxed max-w-[65ch]">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── CTA penutup ── */}
        <motion.div
          className="flex flex-col items-start gap-3 sm:flex-row sm:items-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href="/mitra/daftar"
            className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Daftar Sebagai Mitra Industri
          </Link>
          <p className="text-xs text-ink-300">
            Akun perusahaan diverifikasi oleh Koordinator BKK sebelum mengakses katalog.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
