"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { staggerChildren, revealUp } from "@/lib/motion";

const faqs = [
  {
    id: "siapa-mitra",
    q: "Siapa yang bisa mendaftar sebagai mitra industri?",
    a: "Perusahaan, UMKM, lembaga, atau instansi pemerintah yang ingin mengakses portofolio siswa SMKN 13 Bandung untuk keperluan rekrutmen, kerja sama PKL, atau riset. Pendaftaran diverifikasi oleh Koordinator BKK sekolah sebelum akun aktif.",
  },
  {
    id: "biaya",
    q: "Apakah ada biaya untuk menjadi mitra?",
    a: "Tidak. Akses katalog karya dan fitur pencarian talenta sepenuhnya gratis untuk mitra industri yang sudah terverifikasi. Kandaga adalah platform resmi sekolah, bukan layanan komersial.",
  },
  {
    id: "verifikasi",
    q: "Berapa lama proses verifikasi akun perusahaan?",
    a: "Proses verifikasi biasanya berlangsung 1–3 hari kerja. Tim BKK akan menghubungi narahubung yang didaftarkan melalui email atau telepon untuk konfirmasi. Pastikan data perusahaan yang diisi lengkap dan valid.",
  },
  {
    id: "upload-karya",
    q: "Sebagai siswa, bagaimana cara mengunggah karya ke Kandaga?",
    a: "Karya tidak dapat diunggah langsung oleh siswa — setiap karya harus diajukan melalui guru pembimbing jurusan untuk dikurasi terlebih dahulu. Hubungi guru pembimbing di jurusan masing-masing (RPL, TKJ, atau Analis Kimia) untuk memulai proses pengajuan.",
  },
  {
    id: "bkk",
    q: "Apa itu BKK dan apa perannya di Kandaga?",
    a: "BKK (Bursa Kerja Khusus) adalah unit resmi di SMKN 13 Bandung yang bertugas memfasilitasi hubungan antara siswa/alumni dengan dunia industri. Di Kandaga, BKK berperan sebagai verifikator akun mitra dan fasilitator komunikasi antara perusahaan dengan siswa/guru.",
  },
];

// Easing overshoot sedikit — sesuai spesifikasi design2.md
const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;

function FAQItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: (typeof faqs)[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-ink-150">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:bg-ink-100 -mx-4 px-4 rounded-lg"
      >
        <span className="pr-8 text-sm font-medium text-ink md:text-base">
          {faq.q}
        </span>
        {/* Plus → × saat terbuka, dengan rotasi */}
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex-shrink-0 text-ink-300"
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </motion.span>
      </button>

      {/* Panel jawaban — easing overshoot untuk buka, ease-out untuk tutup */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.4, ease: OVERSHOOT },
              opacity: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
            }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-ink-600">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>("siapa-mitra");

  const toggle = (id: string) =>
    setOpenId((prev) => (prev === id ? null : id));

  return (
    <section id="faq" className="mx-auto max-w-7xl px-6 py-20 md:py-24">
      <div className="grid gap-16 lg:grid-cols-[2fr_3fr]">

        {/* Kiri */}
        <motion.div
          variants={staggerChildren}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.span variants={revealUp}
            className="text-xs font-semibold tracking-[0.3em] text-ink-600">
            FAQ
          </motion.span>
          <motion.h2 variants={revealUp}
            className="mt-2 font-heading text-3xl font-semibold text-ink md:text-4xl">
            Pertanyaan yang sering muncul.
          </motion.h2>
          <motion.p variants={revealUp}
            className="mt-4 text-sm leading-relaxed text-ink-600">
            Tidak menemukan jawaban yang kamu cari? Hubungi kami langsung
            melalui BKK SMKN 13 Bandung.
          </motion.p>
          <motion.a variants={revealUp}
            href="mailto:bkk@smkn13bandung.sch.id"
            className="mt-4 inline-block text-sm font-semibold text-primary hover:text-primary-dark">
            Hubungi BKK →
          </motion.a>
        </motion.div>

        {/* Kanan — accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {faqs.map((faq) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              isOpen={openId === faq.id}
              onToggle={() => toggle(faq.id)}
            />
          ))}
        </motion.div>

      </div>
    </section>
  );
}
