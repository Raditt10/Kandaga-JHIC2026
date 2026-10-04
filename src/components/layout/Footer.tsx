"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  FOOTER_NAV_LINKS,
  FOOTER_LAYANAN_LINKS,
  FOOTER_INDUSTRI_LINKS,
} from "@/lib/data";
import type { NavLink } from "@/types";

// ── Sosial media ──────────────────────────────────────────────────────────
const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com/smkn13bandung",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@smkn13bandung",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
        className="h-5 w-5" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.78a4.86 4.86 0 01-1.02-.09z" />
      </svg>
    ),
  },
  {
    label: "Threads",
    href: "https://threads.net/@smkn13bandung",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
        className="h-5 w-5" aria-hidden="true">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.186v-.007C1.5 8.418 2.36 5.551 4.013 3.48 5.845 1.198 8.584.016 12.154 0h.014c2.764.017 5.115.795 6.986 2.313 1.731 1.4 2.881 3.353 3.344 5.632l-2.498.439c-.369-1.783-1.239-3.223-2.517-4.163-1.4-1.026-3.232-1.547-5.345-1.56H12c-2.926.019-5.131.845-6.563 2.454C4.153 6.38 3.5 8.736 3.5 12.179v.007c0 3.434.668 5.782 1.983 7.177 1.434 1.52 3.65 2.294 6.587 2.313h.007c2.581-.017 4.42-.638 5.46-1.84.876-1.005 1.315-2.498 1.315-4.44 0-.22-.008-.435-.022-.644-1.133.32-2.306.48-3.498.48-2.135 0-3.866-.502-5.148-1.493-1.367-1.056-2.09-2.548-2.09-4.31 0-1.9.737-3.445 2.09-4.452C11.617 3.956 13.22 3.5 15.138 3.5c2.08 0 3.814.559 5.156 1.662 1.374 1.13 2.15 2.742 2.239 4.616.006.14.009.28.009.424 0 2.694-.663 4.793-1.97 6.234C19.27 17.74 17.5 18.5 15.2 18.5h-.007" />
      </svg>
    ),
  },
];

// ── Wordmark outline background ──────────────────────────────────────────
// Outline raksasa yang menjadi background watermark di belakang konten footer
function BackgroundOutlineWordmark() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });

  // Parallax halus & transisi opacity saat footer masuk viewport
  const y = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.12, 0.22]);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      <motion.p
        className="w-full text-center font-heading font-black tracking-[-0.04em] leading-none text-transparent whitespace-nowrap"
        style={{
          fontSize: "clamp(4rem, 20vw, 36rem)",
          WebkitTextStroke: "clamp(1.5px, 0.22vw, 2.5px) rgba(255, 255, 255, 0.85)",
          y,
          opacity,
        }}
      >
        KANDAGA
      </motion.p>
    </div>
  );
}

export default function Footer() {
  return (
    <footer id="footer" className="relative overflow-hidden bg-primary text-white">
      {/* Background outline watermark KANDAGA */}
      <BackgroundOutlineWordmark />

      {/* ── Konten utama 4 kolom ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-14 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Kolom 1 — Brand + Kontak */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 relative rounded-full overflow-hidden shadow-xs ring-1 ring-white/20 bg-white transition-transform duration-200 group-hover:scale-105 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Kandaga Logo"
                  fill sizes="32px"
                  className="object-contain"
                />
              </div>
              <span className="select-none font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-rose-100 transition-colors duration-200 whitespace-nowrap">
                KANDAGA
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-white/80 max-w-[30ch]">
              Etalase karya siswa SMKN 13 Bandung — terverifikasi sekolah,
              terbuka untuk industri.
            </p>

            {/* Kontak */}
            <address className="not-italic space-y-2 text-sm text-white/80">
              <p className="font-semibold text-white">SMKN 13 Bandung</p>
              <p>Jl. Soekarno Hatta KM 10, Riung,<br />Rancasari, Bandung 40296</p>
              <p>
                <a href="tel:+62222012345" className="hover:text-white transition-colors">
                  (022) 201-2345
                </a>
              </p>
              <p>
                <a
                  href="mailto:kandaga@smkn13bandung.sch.id"
                  className="hover:text-white transition-colors"
                >
                  kandaga@smkn13bandung.sch.id
                </a>
              </p>
            </address>

            {/* Jam layanan BKK */}
            <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs text-white/70">
              <p className="font-semibold text-white/90 mb-1">Jam Layanan BKK</p>
              <p>Senin – Jumat: 08.00–15.00 WIB</p>
              <p>Sabtu: 08.00–12.00 WIB</p>
            </div>
          </div>

          {/* Kolom 2 — Navigasi cepat */}
          <div>
            <p className="mb-4 text-xs font-semibold tracking-[0.25em] text-white/60">
              NAVIGASI
            </p>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_NAV_LINKS.map((link: NavLink) => (
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
              {FOOTER_LAYANAN_LINKS.map((link: NavLink) => (
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
              {FOOTER_INDUSTRI_LINKS.map((link: NavLink) => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="text-sm text-white/90 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Tautan ke situs induk SMKN 13 */}
            <div className="mt-8 pt-6 border-t border-white/15">
              <p className="text-xs font-semibold tracking-[0.25em] text-white/60 mb-3">
                TAUTAN INDUK
              </p>
              <a
                href="https://smkn13bandung.sch.id"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-white/90 hover:text-white transition-colors group"
              >
                <span>smkn13bandung.sch.id</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <p className="mt-1.5 text-xs text-white/50">
                Kandaga adalah sub-modul Major Gallery resmi SMKN 13 Bandung.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar: sosmed + legal ── */}
      <div className="relative z-10 border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 sm:flex-row">

          {/* Legal + credit */}
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <p className="text-xs tracking-[0.1em] text-white/60">
              © {new Date().getFullYear()} SMK NEGERI 13 BANDUNG. SELURUH HAK CIPTA DILINDUNGI.
            </p>
            <p className="text-xs text-white/40">
              Kandaga — program siswa SMKN 13 Bandung &bull; Dibuat oleh siswa RPL
            </p>
          </div>

          {/* Sosial media */}
          <div className="flex items-center gap-4">
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-white/60 transition-colors hover:text-white"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
