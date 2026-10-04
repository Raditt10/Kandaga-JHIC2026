"use client";

import Link from "next/link";
import Image from "next/image";
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
    label: "Facebook",
    href: "https://www.facebook.com/smkn13bandung",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor"
        className="h-5 w-auto" aria-hidden="true">
        <path d="M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@smkn13bandungofficial",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
        className="h-5 w-5" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

// ── Koordinat SMKN 13 Bandung (OpenStreetMap id 1411535109) ───────────────
const SCHOOL_COORDS = "-6.938251,107.656832";
const MAP_EMBED_SRC = `https://maps.google.com/maps?q=${SCHOOL_COORDS}&z=16&output=embed`;
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${SCHOOL_COORDS}`;

// ── Logo mitra & pendukung (folder public/logo_lomba) ─────────────────────
const partnerLogos = [
  { src: "/logo_lomba/1. LOGO JHIC 2.0.png", alt: "JHIC 2.0" },
  { src: "/logo_lomba/2. Logo Jagoan Hosting.png", alt: "Jagoan Hosting" },
  { src: "/logo_lomba/3. KOMDIGI.png", alt: "KOMDIGI" },
  { src: "/logo_lomba/4. Garuda Spark Full Color.png", alt: "Garuda Spark" },
  { src: "/logo_lomba/5. LOGO NGALUP.png", alt: "NGALUP" },
];

// ── Ikon kontak ───────────────────────────────────────────────────────────
function IconMail({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M3.5 7.5l8.5 5.5 8.5-5.5" />
    </svg>
  );
}

function IconPhone({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true">
      <path d="M4 4h3.5l1.8 4.5-2.1 1.4a12.5 12.5 0 006 6l1.4-2.1L19 15.5V19a1.5 1.5 0 01-1.6 1.5A15.5 15.5 0 013 5.6 1.5 1.5 0 014.5 4z" />
    </svg>
  );
}

function IconMapPin({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true">
      <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function IconExternal({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true">
      <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

// ── Blok daftar tautan (judul + list) ─────────────────────────────────────
function FooterColumn({
  title,
  links,
  className = "",
}: {
  title: string;
  links: NavLink[];
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="mb-4 text-base font-semibold text-white">
        {title}
      </p>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-white/90 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer id="footer" className="relative overflow-hidden bg-primary text-white">
      {/* ── Konten utama 4 kolom ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-14 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1.1fr_1.3fr] lg:gap-12">

          {/* Kolom 1 — Brand, kontak, sosial media, hak cipta */}
          <div className="flex flex-col gap-6">
            {/* Brand: logo + wordmark KANDAGA — mengikuti gaya title di navbar */}
            <Link
              href="/"
              aria-label="Kandaga — Beranda"
              className="flex items-center gap-2 group shrink-0"
            >
              <div className="relative h-10 w-10 rounded-full overflow-hidden shadow-xs ring-1 ring-white/20 bg-white transition-transform duration-200 group-hover:scale-105 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Kandaga"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <span className="select-none font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-rose-50 via-white to-rose-200 bg-clip-text text-transparent transition-all duration-300 whitespace-nowrap">
                KANDAGA
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-white/80 max-w-[32ch]">
              Etalase karya siswa SMKN 13 Bandung terverifikasi sekolah,
              terbuka untuk umum dan Industri.
            </p>

            {/* Kontak berikon */}
            <address className="not-italic flex flex-col gap-3 text-sm text-white/80">
              <p className="font-semibold text-white">SMKN 13 Bandung</p>

              <div className="flex items-start gap-2.5">
                <IconMail className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                <a
                  href="mailto:kandaga@smkn13bandung.sch.id"
                  className="break-all hover:text-white transition-colors"
                >
                  kandaga@smkn13bandung.sch.id
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <IconPhone className="h-4 w-4 shrink-0 text-white/50" />
                <a href="tel:+62222012345" className="hover:text-white transition-colors">
                  (022) 201-2345
                </a>
              </div>

              <div className="flex items-start gap-2.5">
                <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                <span>
                  Jl. Soekarno Hatta KM 10, Riung,
                  <br />
                  Rancasari, Bandung 40296
                </span>
              </div>
            </address>

            {/* Sosial media — ikon polos tanpa lingkaran pembungkus */}
            <div className="flex items-center gap-4">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-white transition-opacity duration-200 hover:opacity-70"
                >
                  {s.icon}
                </a>
              ))}
            </div>


            {/* Hak cipta — rata bawah kolom */}
            <div className="mt-auto flex flex-col gap-1 pt-2">
              <p className="text-xs tracking-[0.1em] text-white/60">
                © {new Date().getFullYear()} SMK NEGERI 13 BANDUNG. Seluruh Hak Cipta Dilindungi.
              </p>
            </div>
          </div>

          {/* Kolom 2 — Navigasi + tautan induk */}
          <div className="flex flex-col gap-8">
            <FooterColumn title="Navigasi" links={FOOTER_NAV_LINKS} />

            <div className="border-t border-white/15 pt-6">
              <p className="mb-3 text-base font-semibold text-white">
                Tautan Induk
              </p>
              <a
                href="https://smkn13bandung.sch.id"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-white/90 hover:text-white transition-colors group"
              >
                <span>smkn13bandung.sch.id</span>
                <IconExternal className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              </a>
              <p className="mt-1.5 text-xs text-white/50">
                Kandaga adalah sub-modul Major Gallery resmi SMKN 13 Bandung.
              </p>
            </div>
          </div>

          {/* Kolom 3 — Layanan + untuk industri */}
          <div className="flex flex-col gap-8">
            <FooterColumn title="Layanan" links={FOOTER_LAYANAN_LINKS} />
            <FooterColumn
              title="Untuk Industri"
              links={FOOTER_INDUSTRI_LINKS}
              className="border-t border-white/15 pt-6"
            />
          </div>

          {/* Kolom 4 — Lokasi sekolah + peta */}
          <div>
            <p className="mb-4 text-base font-semibold text-white">
              Lokasi Sekolah
            </p>
            <div className="relative overflow-hidden rounded-xl border border-white/15">
              <iframe
                title="Peta lokasi SMKN 13 Bandung"
                src={MAP_EMBED_SRC}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-48 w-full border-0 sm:h-52"
              />
              <a
                href={MAP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-ink shadow-sm transition-colors hover:bg-ink-100"
              >
                Buka di Maps
                <IconExternal className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* ── DIDUKUNG OLEH — Baris horizontal di bagian bawah footer ── */}
        <div className="mt-12">
          <p className="mb-6 text-center text-base font-semibold text-white">
            Didukung Oleh
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {partnerLogos.map((logo) => (
              <div
                key={logo.src}
                className="relative flex h-14 w-36 sm:h-16 sm:w-44 lg:w-48 items-center justify-center rounded-xl bg-white shadow-xs transition-all duration-200 hover:scale-[1.03] hover:shadow-md"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  sizes="200px"
                  className="object-contain p-2.5 sm:p-3"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
