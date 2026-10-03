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

function ConcentricRings() {
  const rings = [
    { r: 130, opacity: 0.09 },
    { r: 210, opacity: 0.07 },
    { r: 300, opacity: 0.052 },
    { r: 390, opacity: 0.036 },
  ];
  return (
    <div className="hero-rings" aria-hidden="true">
      <svg
        viewBox="0 0 800 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          width: "max(120%, 900px)",
          height: "max(120%, 900px)",
          bottom: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      >
        {rings.map((ring, i) => (
          <circle
            key={i}
            cx="400" cy="400"
            r={ring.r}
            stroke="#8B1A2F"
            strokeWidth="1"
            opacity={ring.opacity}
            fill="none"
          />
        ))}
      </svg>
    </div>
  );
}

export default function HeroStage() {
  // Ubah ke true jika route /karya?jurusan=* sudah ada
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
      {/* Ikon melayang di-render di Hero.tsx supaya zona atas muncul di sisi teks */}
    </div>
  );
}
