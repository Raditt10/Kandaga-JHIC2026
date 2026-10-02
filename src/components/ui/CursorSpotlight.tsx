"use client";

import { useRef, useCallback, type ReactNode } from "react";

interface CursorSpotlightProps {
  children: ReactNode;
  className?: string;
  /** Warna radial gradient (default: putih semi-transparan) */
  color?: string;
  /** Ukuran spotlight dalam px (default: 400) */
  size?: number;
}

/**
 * CursorSpotlight — wrapper section yang menampilkan radial-gradient
 * mengikuti posisi kursor via 2 CSS custom property.
 * Ringan: hanya 1 pointermove listener + CSS, tanpa canvas/WebGL.
 * Bekerja aman di layar sentuh (tidak ada efek, hanya konten biasa).
 */
export default function CursorSpotlight({
  children,
  className = "",
  color = "rgba(255,255,255,0.07)",
  size = 400,
}: CursorSpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (ref.current) {
        ref.current.style.setProperty("--spotlight-x", `${x}px`);
        ref.current.style.setProperty("--spotlight-y", `${y}px`);
      }
    },
    []
  );

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      onPointerMove={handlePointerMove}
      style={
        {
          "--spotlight-x": "50%",
          "--spotlight-y": "50%",
          "--spotlight-color": color,
          "--spotlight-size": `${size}px`,
        } as React.CSSProperties
      }
    >
      {/* Spotlight layer — pointer-events none supaya tidak ganggu klik */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(${size}px circle at var(--spotlight-x) var(--spotlight-y), var(--spotlight-color), transparent 70%)`,
        }}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
