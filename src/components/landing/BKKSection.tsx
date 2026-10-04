"use client";

import { motion } from "motion/react";
import { staggerChildren, revealUp } from "@/lib/motion";
// Isi alur & FAQ dipakai bersama dengan halaman publik /mitra/cara-kerja-bkk
import { bkkSteps as steps, bkkFaqs as faqs } from "@/data/bkkSteps";

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
          <motion.h2 variants={revealUp} className="font-heading text-3xl font-semibold text-ink md:text-4xl">
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

      </div>
    </section>
  );
}
