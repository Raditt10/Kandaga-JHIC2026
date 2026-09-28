"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

const navLinks = [
  { label: "Beranda", href: "/" },
  { label: "Gallery", href: "/galeri" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "About", href: "/tentang" },
  { label: "Kontak", href: "/kontak" },
];

const layananLinks = [
  { label: "Verifikasi Karya", href: "/verifikasi" },
  { label: "Akademi", href: "/akademi" },
  { label: "Komunitas", href: "/komunitas" },
];

const industriLinks = [
  { label: "Cari Talenta", href: "/talenta" },
  { label: "Daftar Mitra", href: "/mitra" },
  { label: "Program Magang", href: "/magang" },
  { label: "Hubungi Kami", href: "/kontak" },
];

// ── Wordmark fill-on-scroll ──────────────────────────────────────────────
// Saat user mendekati footer, fill terisi dari outline putih → solid putih
function ScrollWordmark() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    // Mulai mengisi saat bagian atas footer masuk viewport bawah,
    // selesai saat tengah footer mencapai tengah layar
    offset: ["start end", "center center"],
  });

  // opacity fill teks: 0 (outline) → 1 (solid white)
  const fillOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  // stroke opacity: 1 (outline) → 0 (stroke menghilang saat fill penuh)
  const strokeOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div ref={ref} className="relative overflow-hidden border-b border-white/20 px-6 pt-10 pb-4">
      {/* Layer 1: outline teks (selalu ada, memudar saat fill muncul) */}
      <motion.p
        className="font-heading text-[clamp(4rem,18vw,10rem)] font-black leading-none tracking-tight text-transparent"
        style={{
          WebkitTextStroke: "2px rgba(255,255,255,1)",
          opacity: strokeOpacity,
          position: "absolute",
          top: "2.5rem", left: "1.5rem", right: "1.5rem",
          userSelect: "none",
        }}
        aria-hidden="true"
      >
        KANDAGA
      </motion.p>

      {/* Layer 2: fill solid, opacity naik sesuai scroll */}
      <motion.p
        className="relative font-heading text-[clamp(4rem,18vw,10rem)] font-black leading-none tracking-tight text-white"
        style={{ opacity: fillOpacity }}
      >
        KANDAGA
      </motion.p>
    </div>
  );
}

export default function Footer() {
  return (
    <footer id="kontak-section" className="bg-primary text-white">
      {/* Wordmark fill-on-scroll */}
      <ScrollWordmark />

      {/* Konten 4 kolom */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Kolom 1 — Logo + Alamat */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Kandaga Logo"
                width={36}
                height={36}
                unoptimized
                className="brightness-0 invert"
              />
              <span className="font-heading text-lg font-bold tracking-wide text-white">
                KAN<span className="text-white/70">DA</span>GA
              </span>
            </Link>
            <address className="not-italic text-sm leading-relaxed text-white/80">
              SMKN 13 Bandung
              <br />
              Jl. Soekarno Hatta KM 10, Riung, Kec.
              <br />
              Rancasari
              <br />
              Bandung, Jawa Barat 40296
            </address>
          </div>

          {/* Kolom 2 — Navigasi */}
          <div>
            <p className="mb-4 text-xs font-semibold tracking-[0.25em] text-white/60">
              NAVIGASI
            </p>
            <ul className="flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="text-sm text-white/90 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3 — Layanan */}
          <div>
            <p className="mb-4 text-xs font-semibold tracking-[0.25em] text-white/60">
              LAYANAN
            </p>
            <ul className="flex flex-col gap-2.5">
              {layananLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="text-sm text-white/90 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 4 — Untuk Industri */}
          <div>
            <p className="mb-4 text-xs font-semibold tracking-[0.25em] text-white/60">
              UNTUK INDUSTRI
            </p>
            <ul className="flex flex-col gap-2.5">
              {industriLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="text-sm text-white/90 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-white/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <p className="text-xs tracking-[0.15em] text-white/60">
            © 2026 SMK NEGERI 13 BANDUNG. SELURUH HAK CIPTA DILINDUNGI.
          </p>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram Kandaga"
            className="text-white/60 transition-colors hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
              strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
