"use client";

import React from "react";

export interface LoadingProps {
  /**
   * Teks utama yang ditampilkan pada indikator loading.
   * Default: "Memuat data..."
   */
  text?: string;
  /**
   * Deskripsi atau subteks bantuan opsional.
   */
  subtext?: string;
  /**
   * Ukuran spinner: "sm" | "md" | "lg" | "xl". Default: "lg"
   */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * Tipe penempatan:
   * - "fullscreen" (default): overlay fixed memenuhi layar (z-50) dengan latar belakang blur halus.
   * - "contained": overlay absolute pada parent container berposisi relatif.
   * - "inline": elemen loading di dalam alur layout (tanpa overlay).
   */
  variant?: "fullscreen" | "contained" | "inline";
  className?: string;
}

/**
 * Loading — Singular global loading component (@/components/ui/Loading).
 *
 * Digunakan secara deklaratif di halaman mana pun yang melakukan fetch data:
 * ```tsx
 * const [isLoading, setIsLoading] = useState(true);
 *
 * return (
 *   <div>
 *     {isLoading && <Loading />}
 *     ...konten utama...
 *   </div>
 * );
 * ```
 */
export default function Loading({
  text = "Memuat data...",
  subtext,
  size = "lg",
  variant = "fullscreen",
  className = "",
}: LoadingProps) {
  const sizeMap = {
    sm: { spinner: "w-6 h-6", text: "text-xs", stroke: "3" },
    md: { spinner: "w-8 h-8", text: "text-sm", stroke: "3" },
    lg: { spinner: "w-11 h-11", text: "text-base", stroke: "3.5" },
    xl: { spinner: "w-14 h-14", text: "text-lg", stroke: "4" },
  }[size];

  const layoutClass = {
    fullscreen:
      "fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-xs transition-opacity",
    contained:
      "absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-xs",
    inline: "w-full py-12 flex items-center justify-center",
  }[variant];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`${layoutClass} ${className}`.trim()}
    >
      <div className="flex flex-col items-center justify-center gap-3.5 p-6 rounded-3xl bg-white/90 border border-ink-150/70 shadow-sm max-w-sm text-center">
        {/* ── Kandaga Branded Dual-Tone Spinner ── */}
        <div className="relative flex items-center justify-center">
          <svg
            className={`animate-spin ${sizeMap.spinner} text-[#8B1A2F]`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {/* Background track circle */}
            <circle
              className="opacity-15"
              cx="12"
              cy="12"
              r="10"
              stroke="#1A1A1A"
              strokeWidth={sizeMap.stroke}
            />
            {/* Primary rotating arc */}
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>

          {/* Accent Gold Inner Pulse Dot */}
          <div className="absolute w-2 h-2 rounded-full bg-[#E8C97A] animate-ping opacity-75" />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-[#E8C97A]" />
        </div>

        {/* ── Text Feedback ── */}
        {text && (
          <p
            className={`font-heading font-medium text-ink-900 ${sizeMap.text} tracking-tight`}
          >
            {text}
          </p>
        )}

        {subtext && (
          <p className="text-xs text-ink-600 max-w-[28ch] leading-relaxed -mt-1">
            {subtext}
          </p>
        )}

        <span className="sr-only">{text || "Memuat..."}</span>
      </div>
    </div>
  );
}
