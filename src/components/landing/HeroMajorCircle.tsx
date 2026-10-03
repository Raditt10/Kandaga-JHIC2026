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
    href: "/karya?jurusan=rpl",
  },
  {
    id: "kimia",
    label: "Kimia Analisis",
    full: "Analisis Kimia",
    image: "/images/hero/siswa-kimia.png",
    pattern: "molecule",
    href: "/karya?jurusan=kimia",
  },
  {
    id: "tkj",
    label: "TKJ",
    full: "Teknik Komputer dan Jaringan",
    image: "/images/hero/siswa-tkj.png",
    pattern: "network",
    href: "/karya?jurusan=tkj",
  },
];

/* ── Pola Dekoratif SVG ───────────────────────────────────────────── */
function BinaryPattern() {
  const rows = [
    "1 0 1 1 0 1 0 1 1 0",
    "0 1 0 0 1 0 1 0 0 1",
    "1 1 0 1 0 0 1 1 0 1",
    "0 0 1 0 1 1 0 0 1 0",
    "1 0 0 1 1 0 1 0 1 0",
    "0 1 1 0 0 1 0 1 0 1",
    "1 0 1 0 1 0 0 1 1 0",
  ];
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }} aria-hidden="true">
      {rows.map((row, ri) =>
        row.split(" ").map((char, ci) => (
          <text key={`${ri}-${ci}`} x={ci * 20 + 5} y={ri * 28 + 24}
            fontSize="11" fill="white" fontFamily="monospace" fontWeight="600">
            {char}
          </text>
        ))
      )}
    </svg>
  );
}

function MoleculePattern() {
  const atomPairs: [number, number][] = [
    [100, 40], [130, 57], [130, 91], [100, 108], [70, 91], [70, 57],
  ];
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }} aria-hidden="true">
      <polygon points="100,40 130,57 130,91 100,108 70,91 70,57"
        stroke="white" strokeWidth="1.5" fill="none" />
      <polygon points="100,52 120,63 120,85 100,96 80,85 80,63"
        stroke="white" strokeWidth="0.8" fill="none" strokeDasharray="4 3" />
      {atomPairs.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3" fill="white" />
      ))}
      <line x1="100" y1="108" x2="100" y2="140" stroke="white" strokeWidth="1.5" />
      <circle cx="100" cy="145" r="5" fill="none" stroke="white" strokeWidth="1.2" />
      <line x1="70" y1="57" x2="46" y2="44" stroke="white" strokeWidth="1.5" />
      <circle cx="42" cy="41" r="4" fill="none" stroke="white" strokeWidth="1.2" />
      <line x1="130" y1="57" x2="154" y2="44" stroke="white" strokeWidth="1.5" />
      <circle cx="158" cy="41" r="4" fill="none" stroke="white" strokeWidth="1.2" />
      <circle cx="38" cy="155" r="18" stroke="white" strokeWidth="0.8" fill="none" />
      <circle cx="162" cy="155" r="12" stroke="white" strokeWidth="0.8" fill="none" />
    </svg>
  );
}

function NetworkPattern() {
  const nodes: [number, number][] = [
    [100, 30], [50, 60], [150, 60],
    [30, 110], [100, 95], [170, 110],
    [55, 155], [145, 155], [100, 185],
  ];
  const edges: [number, number][] = [
    [0, 1], [0, 2], [1, 3], [1, 4],
    [2, 4], [2, 5], [3, 6], [4, 6],
    [4, 7], [5, 7], [6, 8], [7, 8],
    [0, 4], [1, 2],
  ];
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }} aria-hidden="true">
      {edges.map(([a, b], i) => (
        <line key={i}
          x1={nodes[a][0]} y1={nodes[a][1]}
          x2={nodes[b][0]} y2={nodes[b][1]}
          stroke="white" strokeWidth="0.9" opacity="0.8" />
      ))}
      {nodes.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3.5" fill="white" />
      ))}
    </svg>
  );
}

/* ── Placeholder Siluet (conditional render via imgError state) ───── */
function SilhouettePlaceholder({ label }: { label: string }) {
  return (
    /* TODO: ganti dengan siswa-{label.toLowerCase()}.png */
    <div className="hero-circle-placeholder" aria-hidden="true">
      <svg viewBox="0 0 80 140" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ width: "55%", opacity: 0.5 }}>
        <circle cx="40" cy="20" r="16" fill="white" />
        <path d="M16 50 C16 42 64 42 64 50 L70 110 H10 Z" fill="white" />
        <rect x="14" y="106" width="20" height="30" rx="5" fill="white" />
        <rect x="46" y="106" width="20" height="30" rx="5" fill="white" />
      </svg>
      <span className="hero-circle-placeholder-text">
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
      {/* ① Background + gradient lingkaran (position:absolute inset:0) */}
      <div className="hero-circle" aria-hidden="true" />

      {/* ② Pola dekoratif — masked supaya tidak tutup wajah */}
      <div className="hero-circle-pattern" aria-hidden="true">
        {major.pattern === "binary"   && <BinaryPattern />}
        {major.pattern === "molecule" && <MoleculePattern />}
        {major.pattern === "network"  && <NetworkPattern />}
      </div>

      {/* ③ Placeholder — HANYA jika gambar gagal */}
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

      {/* ⑤ Chip label — opacity-only, tanpa slide */}
      <span className="hero-label-chip" aria-hidden="true">
        {major.full}
      </span>
    </>
  );

  const hoverWrapContent = routeExists ? (
    <a
      href={major.href}
      className="hero-circle-hover-wrap"
      tabIndex={0}
      aria-label={`Lihat karya jurusan ${major.full}`}
    >
      {innerContent}
    </a>
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
