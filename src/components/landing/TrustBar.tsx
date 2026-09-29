"use client";

import { motion } from "motion/react";
import { staggerChildren, revealUp } from "@/lib/motion";
import { PARTNERS } from "@/lib/data";

export default function TrustBar() {
  return (
    <section className="border-y border-ink-150 bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          variants={staggerChildren}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          {/* Label */}
          <motion.p
            variants={revealUp}
            className="mb-8 text-center text-xs font-semibold tracking-[0.3em] text-ink-300"
          >
            DIPERCAYA OLEH MITRA INDUSTRI
          </motion.p>

          {/* Logo mitra — dummy kotak abu dengan singkatan */}
          <motion.div
            variants={staggerChildren}
            className="flex flex-wrap items-center justify-center gap-8 md:gap-12"
          >
            {PARTNERS.map((p) => (
              <motion.div
                key={p.abbr}
                variants={revealUp}
                title={p.name}
                className="flex h-10 w-24 items-center justify-center rounded border border-ink-150 text-xs font-semibold tracking-wide text-ink-300 transition-colors hover:border-ink-300 hover:text-ink-600"
              >
                {p.abbr}
              </motion.div>
            ))}
          </motion.div>

          {/* Catatan dummy */}
          <motion.p
            variants={revealUp}
            className="mt-6 text-center text-xs text-ink-300"
          >
            * Logo placeholder — ganti dengan logo mitra resmi saat tersedia
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
