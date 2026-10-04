"use client";

/**
 * Hero.tsx  v3  —  Hero Section "3 Lingkaran Jurusan"
 *
 * PERBAIKAN v3:
 * - HeroFloatingIcons di-render langsung di hero-root (bukan di stage),
 *   sehingga ikon zona atas muncul di area judul & teks.
 * - hero-root pakai overflow:hidden → lingkaran terpotong di dasar = flush.
 * - Scroll indicator tetap dihapus.
 * - Versi lama: HeroLegacy.tsx
 */

import "./hero.css";

import Link from "next/link";
import { motion } from "motion/react";
import MagneticButton from "@/components/ui/MagneticButton";
import { wordmarkReveal } from "@/lib/motion";
import HeroStage from "./HeroStage";
import HeroFloatingIcons from "./HeroFloatingIcons";

export default function Hero() {
  return (
    <section id="beranda-section" className="hero-root">
      {/* Shadow merah tipis di bagian atas, di belakang navbar pill */}
      <div className="hero-top-glow" aria-hidden="true" />

      {/*
       * Ikon melayang diletakkan di hero-root (position:absolute inset:0)
       * sehingga mencakup seluruh tinggi hero termasuk area teks.
       * z-index:2 di CSS — di bawah teks (z-3), di atas background.
       */}
      <HeroFloatingIcons />

      {/* ── Blok Teks ─────────────────────────────────────────────── */}
      <div className="hero-text-block">
        <motion.h1
          className="hero-heading font-heading"
          variants={wordmarkReveal}
          initial="hidden"
          animate="show"
        >
          KANDAGA
        </motion.h1>

        <motion.p
          className="hero-subheading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.75 }}
        >
          M A J O R &nbsp; G A L L E R Y
        </motion.p>

        <motion.p
          className="hero-paragraph"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          Etalase digital karya terbaik siswa SMKN 13 Bandung terverifikasi
          sekolah, terbuka untuk industri.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
          className="hero-cta-wrapper"
        >
          <MagneticButton radius={40} strength={6} wrapperClassName="relative">
            <motion.span
              className="absolute inset-0 rounded-full border border-accent"
              animate={{ scale: [1, 1.12, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden="true"
            />
            <Link
              href="/gallery"
              className="relative block rounded-full bg-primary px-7 py-3 text-xs font-semibold tracking-wide text-white transition-colors hover:bg-primary-dark md:text-sm"
            >
              MULAI JELAJAHI
            </Link>
          </MagneticButton>
        </motion.div>
      </div>

      {/* ── Panggung (flush ke dasar hero via overflow:hidden pada root) */}
      <HeroStage />
    </section>
  );
}
