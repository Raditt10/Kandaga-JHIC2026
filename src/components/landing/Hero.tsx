"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { curtainReveal, wordmarkReveal, staggerChildren } from "@/lib/motion";
import MagneticButton from "@/components/ui/MagneticButton";

const panels = [
  { src: "/images/hero-kimia.jpg", alt: "Aktivitas laboratorium Analis Kimia" },
  { src: "/images/hero-kolaborasi.jpg", alt: "Siswa berkolaborasi mengerjakan proyek" },
  { src: "/images/hero-tkj.jpg", alt: "Aktivitas coding TKJ/RPL di depan layar" },
];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax ±8%
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  return (
    <section ref={sectionRef} id="beranda-section" className="relative overflow-hidden">
      {/* 3 panel curtain reveal staggered */}
      <motion.div
        className="grid h-[420px] grid-cols-3 md:h-[480px]"
        variants={staggerChildren}
        initial="hidden"
        animate="show"
      >
        {panels.map((panel, index) => (
          <motion.div
            key={panel.src}
            className="relative h-full w-full overflow-hidden"
            variants={curtainReveal}
            transition={{ delay: index * 0.1 }}
          >
            <motion.div className="absolute inset-0" style={{ y }}>
              <Image
                src={panel.src}
                alt={panel.alt}
                fill
                priority
                className="object-cover scale-110"
              />
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-white/60 to-white/95" />

      {/* Konten tengah */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <motion.h1
          className="font-heading text-5xl font-bold tracking-tight text-ink md:text-7xl"
          variants={wordmarkReveal}
          initial="hidden"
          animate="show"
        >
          KANDAGA
        </motion.h1>

        <motion.p
          className="mt-2 text-xs font-medium tracking-[0.6em] text-primary md:text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.75 }}
        >
          MAJOR GALLERY
        </motion.p>

        <motion.p
          className="mt-6 max-w-xl text-sm text-ink-700 md:text-lg"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          Etalase digital karya terbaik siswa SMKN 13 Bandung terverifikasi
          sekolah, terbuka untuk industri.
        </motion.p>

        {/* CTA magnetic — pakai komponen reusable */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6"
        >
          <MagneticButton radius={40} strength={6} wrapperClassName="relative">
            {/* Ring berdenyut emas */}
            <motion.span
              className="absolute inset-0 rounded-full border border-accent"
              animate={{ scale: [1, 1.12, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            />
            <button className="relative rounded-full bg-primary px-7 py-3 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-primary-dark md:text-sm">
              MULAI JELAJAHI
            </button>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
