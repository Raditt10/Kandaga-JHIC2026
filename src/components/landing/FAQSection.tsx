"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { staggerChildren, revealUp } from "@/lib/motion";
import { FAQS } from "@/lib/data";
import type { FAQ } from "@/types";

// Easing overshoot sedikit — sesuai spesifikasi design2.md
const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;

function FAQItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: FAQ;
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
          <motion.h2 variants={revealUp}
            className="font-heading text-3xl font-semibold text-ink md:text-4xl">
            Pertanyaan yang sering muncul.
          </motion.h2>
          <motion.p variants={revealUp}
            className="mt-4 text-sm leading-relaxed text-ink-600">
            Tidak menemukan jawaban yang kamu cari? Hubungi kami langsung
            melalui BKK SMKN 13 Bandung.
          </motion.p>
          <motion.a
            variants={revealUp}
            href="mailto:bkk@smkn13bandung.sch.id"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark group"
          >
            <span>Hubungi BKK</span>
            <Image
              src="/icons/arrowright.svg"
              alt="Arrow"
              width={14}
              height={14}
              unoptimized
              className="w-3.5 h-3.5 object-contain transition-transform group-hover:translate-x-1"
            />
          </motion.a>
        </motion.div>

        {/* Kanan — accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {FAQS.map((faq) => (
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
