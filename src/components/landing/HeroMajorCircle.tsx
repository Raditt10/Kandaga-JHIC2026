"use client";

/**
 * HeroMajorCircle.tsx  v3
 *
 * PENYEBAB MODEL BERGESER (v2 bug):
 *   .hero-circle-student-wrap  → position:absolute; left:50%; transform:translateX(-50%)
 *   .hero-circle-student-img   → position:absolute; left:50%; transform:translateX(-50%)
 *   = DOUBLE centering: wrap sudah di-center, lalu img di dalamnya di-center lagi
 *     terhadap wrap yang 92% lebar → img bergeser ±250px kiri.
 *
 * FIX:
 *   Gunakan <img> biasa (bukan next/image fill) dengan:
 *     position: absolute; bottom: 0;
 *     left: 50%; transform: translateX(-50%);   ← SATU kali centering
 *     width: auto; height: 125%;                 ← tinggi relatif terhadap diameter lingkaran
 *   Wrapper student TIDAK punya left/transform sendiri — hanya position:absolute, inset:0.
 *
 * PLACEHOLDER:
 *   Hanya dirender bila gambar GAGAL (useState imgError).
 *   Saat load berhasil: tidak ada elemen placeholder di DOM.
 *
 * Z-INDEX HOVER:
 *   Hover pada .hero-circle-hover-wrap juga menaikkan z-index
 *   dari parent .hero-circle-enter-wrap via CSS :has() atau
 *   dengan isolation: isolate + z-index pada hover-wrap sendiri.
 *   Seluruh unit (lingkaran + model + chip) naik ke z-index tertinggi.
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

/* ── Konfigurasi Jurusan ──────────────────────────────────────────── */
export interface HeroMajor {
  id: string;
  label: string;
  full: string;
  image: string;
  pattern: "binary" | "molecule" | "network";
  href: string;
}

export const HERO_MAJORS: HeroMajor[] = [
  {
    id: "rpl",
    label: "RPL",
    full: "Rekayasa Perangkat Lunak",
    image: "/images/hero/siswa-rpl.png",
    pattern: "binary",
    href: "/jurusan/rpl",
  },
  {
    id: "kimia",
    label: "Kimia Analisis",
    full: "Analisis Kimia",
    image: "/images/hero/siswa-kimia.png",
    pattern: "molecule",
    href: "/jurusan/analis-kimia",
  },
  {
    id: "tkj",
    label: "TKJ",
    full: "Teknik Komputer dan Jaringan",
    image: "/images/hero/siswa-tkj.png",
    pattern: "network",
    href: "/jurusan/tkj",
  },
];

/* ── Placeholder Siluet (conditional render via imgError state) ───── */
function SilhouettePlaceholder({ label }: { label: string }) {
  return (
    /* TODO: ganti dengan siswa-{label.toLowerCase()}.png */
    <div className="hero-circle-placeholder" aria-hidden="true">
      <svg viewBox="0 0 80 140" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ width: "55%", opacity: 0.35 }}>
        <circle cx="40" cy="20" r="16" fill="var(--hero-brand)" />
        <path d="M16 50 C16 42 64 42 64 50 L70 110 H10 Z" fill="var(--hero-brand)" />
        <rect x="14" y="106" width="20" height="30" rx="5" fill="var(--hero-brand)" />
        <rect x="46" y="106" width="20" height="30" rx="5" fill="var(--hero-brand)" />
      </svg>
      <span className="hero-circle-placeholder-text" style={{ color: "var(--hero-brand)" }}>
        Foto siswa {label}
      </span>
    </div>
  );
}

/* ── Props ────────────────────────────────────────────────────────── */
export interface HeroMajorCircleProps {
  major: HeroMajor;
  position: "left" | "center" | "right";
  routeExists?: boolean;
}

/* ── Komponen Utama ───────────────────────────────────────────────── */
export default function HeroMajorCircle({
  major,
  position,
  routeExists = false,
}: HeroMajorCircleProps) {
  /* Hanya tampilkan placeholder jika gambar gagal dimuat */
  const [imgError, setImgError] = useState(false);

  const enterClass = [
    "hero-circle-enter-wrap",
    `hero-circle-enter-wrap--${position}`,
  ].join(" ");

  const altText =
    position === "left"
      ? "Siswa RPL memegang laptop"
      : position === "center"
      ? "Siswa Kimia Analisis berjas lab memegang pipet"
      : "Siswa TKJ memegang kabel LAN";

  const innerContent = (
    <>
      {/* Placeholder — HANYA jika gambar gagal */}
      {imgError && <SilhouettePlaceholder label={major.label} />}

      {/* ④ Gambar siswa
          PERBAIKAN CENTERING:
          - .hero-circle-student-wrap: position:absolute inset:0 (TIDAK ada left/transform)
          - <img> (bukan next/image fill): position:absolute; bottom:0;
            left:50%; transform:translateX(-50%) — centering SATU kali saja
          Dengan pola ini tidak ada double-centering.
          next/image dipakai dengan width/height fixed + style override
          supaya browser menghitung layout tanpa fill (fill memaksa position:absolute
          pada img sehingga terjadi double offset).
      */}
      {!imgError && (
        <div className="hero-circle-student-wrap" aria-hidden="true">
          <Image
            src={major.image}
            alt={altText}
            width={480}
            height={640}
            priority
            className="hero-circle-student-img"
            onError={() => setImgError(true)}
          />
        </div>
      )}
    </>
  );

  const hoverWrapContent = routeExists ? (
    <Link
      href={major.href}
      className="hero-circle-hover-wrap"
      tabIndex={0}
      aria-label={`Lihat jurusan ${major.full}`}
    >
      {innerContent}
    </Link>
  ) : (
    <div
      className="hero-circle-hover-wrap"
      tabIndex={0}
      role="img"
      aria-label={`Jurusan ${major.full}`}
    >
      {innerContent}
    </div>
  );

  return (
    <div className={enterClass}>
      {hoverWrapContent}
    </div>
  );
}
