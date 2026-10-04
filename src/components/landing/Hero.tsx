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

import HeroStage from "./HeroStage";
import HeroFloatingIcons from "./HeroFloatingIcons";

export default function Hero() {
  return (
    <section id="beranda-section" className="hero-root">
      {/* Shadow merah tipis di bagian atas, di belakang navbar pill */}
      <div className="hero-top-glow" aria-hidden="true" />

      {/*
       * Ikon melayang diletakkan di hero-root (position:absolute inset:0)
       * sehingga mencakup seluruh tinggi hero.
       * z-index:2 di CSS — di atas background.
       */}
      <HeroFloatingIcons />

      {/* ── Slogan sekolah — di atas model ──────────────────────────── */}
      <div className="hero-slogan relative z-10 mx-auto w-full max-w-3xl px-6 text-center">
        <p className="font-heading text-[clamp(1.35rem,3.2vw,2.35rem)] font-extrabold leading-tight tracking-tight text-ink">
          Berakhlak Mulia, Kompeten,
          <br className="hidden sm:block" />{" "}
          <span className="text-primary">dan Berdaya Suai</span>
        </p>
      </div>

      {/* ── Panggung (flush ke dasar hero via overflow:hidden pada root) */}
      <HeroStage />
    </section>
  );
}
