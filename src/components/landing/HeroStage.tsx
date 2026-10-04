"use client";

/**
 * HeroStage.tsx  v3
 *
 * Panggung: 3 lingkaran bertumpuk + bayangan + glow + cincin konsentris.
 * Ikon melayang DIPINDAH ke Hero.tsx (di-render di hero-root) supaya
 * ikon zona atas bisa muncul di sebelah judul & teks.
 *
 * Layer (bawah → atas):
 *   0. Cincin konsentris SVG
 *   1. Glow tengah radial crimson
 *   2. Bayangan blur kiri & kanan
 *   3. Grup 3 lingkaran
 */

import HeroMajorCircle, { HERO_MAJORS } from "./HeroMajorCircle";
import HeroMajorsBar from "./HeroMajorsBar";

function ConcentricRings() {
  const radarRings = [
    { r: 90, dash: "4 6", width: 1.2, opacity: 0.18 },
    { r: 170, dash: "20 10 4 10", width: 1.5, opacity: 0.18 },
    { r: 250, dash: "3 8", width: 1.2, opacity: 0.15 },
    { r: 340, dash: "32 16 8 16", width: 1.4, opacity: 0.14 },
    { r: 430, dash: "6 12", width: 1.2, opacity: 0.11 },
    { r: 530, dash: "40 20", width: 1, opacity: 0.08 },
    { r: 640, dash: "12 24", width: 1, opacity: 0.05 },
  ];

  return (
    <div className="hero-rings" aria-hidden="true">
      <svg
        viewBox="0 0 1000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          width: "max(130%, 1000px)",
          height: "max(130%, 1000px)",
          bottom: "-15%",
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      >
        {/* Sumbu aksis / radar crosshair garis putus-putus */}
        <line
          x1="500" y1="60"
          x2="500" y2="940"
          stroke="#8B1A2F"
          strokeWidth="1"
          strokeDasharray="6 10"
          opacity="0.08"
        />
        <line
          x1="60" y1="500"
          x2="940" y2="500"
          stroke="#8B1A2F"
          strokeWidth="1"
          strokeDasharray="6 10"
          opacity="0.08"
        />
        <line
          x1="188" y1="188"
          x2="812" y2="812"
          stroke="#8B1A2F"
          strokeWidth="1"
          strokeDasharray="4 12"
          opacity="0.05"
        />
        <line
          x1="812" y1="188"
          x2="188" y2="812"
          stroke="#8B1A2F"
          strokeWidth="1"
          strokeDasharray="4 12"
          opacity="0.05"
        />

        {/* Lingkaran putus-putus modern (radar rings) */}
        {radarRings.map((ring, i) => (
          <circle
            key={i}
            cx="500"
            cy="500"
            r={ring.r}
            stroke="#8B1A2F"
            strokeWidth={ring.width}
            strokeDasharray={ring.dash}
            opacity={ring.opacity}
            fill="none"
          />
        ))}

        {/* Titik aksen pusat radar */}
        <circle cx="500" cy="500" r="4" fill="#8B1A2F" opacity="0.25" />
      </svg>
    </div>
  );
}

export default function HeroStage() {
  const routeExists = false;
  const [left, center, right] = HERO_MAJORS;

  return (
    <div className="hero-stage">
      <ConcentricRings />
      <div className="hero-center-glow" aria-hidden="true" />
      <div className="hero-shadow-left"  aria-hidden="true" />
      <div className="hero-shadow-right" aria-hidden="true" />

      <div className="hero-circles-group">
        <HeroMajorCircle major={left}   position="left"   routeExists={routeExists} />
        <HeroMajorCircle major={center} position="center" routeExists={routeExists} />
        <HeroMajorCircle major={right}  position="right"  routeExists={routeExists} />
      </div>

      {/* ── Label Bar Jurusan di Bawah Model (Sesuai Desain & Tema Aplikasi) ── */}
      <HeroMajorsBar />
    </div>
  );
}
