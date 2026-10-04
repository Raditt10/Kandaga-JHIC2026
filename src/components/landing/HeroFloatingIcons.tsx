"use client";

/**
 * HeroFloatingIcons.tsx  v3
 *
 * PERBAIKAN: Komponen ini sekarang di-render di dalam hero-root (bukan
 * di dalam hero-stage), sehingga ikon zona ATAS bisa muncul di sekitar
 * judul dan teks.
 *
 * Posisi dalam persen terhadap hero-root (bukan stage).
 * 10 ikon tersebar di 3 zona:
 *
 * ZONA ATAS (sekitar judul/teks, min 32px dari teks):
 *   code      left:14%, top:16%
 *   flask     left:85%, top:14%
 *   wifi      left:22%, top:30%
 *   api       left:76%, top:32%
 *
 * ZONA SAMPING STAGE (dekat lingkaran):
 *   molecule  left:8%,  top:52%
 *   keyboard  left:5%,  top:68%
 *   ethernet  left:93%, top:58%
 *   globe     left:90%, top:74%
 *
 * ZONA BAWAH (di luar area model):
 *   404       left:11%, top:88%
 *   database  left:88%, top:90%
 *
 * Mobile <640px: maks 5 ikon (hideMobile=true pada 5 sisanya).
 * Semua aria-hidden="true".
 */

interface IconDef {
  key: string;
  id: string;
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  hideMobile: boolean;
}

const ICONS: IconDef[] = [
  /* ── Zona Atas ── */
  { key: "code-top",    id: "code",     left: "14%",  top: "14%", size: 36, opacity: 0.78, duration: 7.2, delay: 0.3,  hideMobile: false },
  { key: "flask-top",   id: "flask",    left: "85%",  top: "13%", size: 34, opacity: 0.72, duration: 6.8, delay: 1.1,  hideMobile: false },
  { key: "wifi-top",    id: "wifi",     left: "22%",  top: "26%", size: 30, opacity: 0.62, duration: 7.9, delay: 2.0,  hideMobile: true  },
  { key: "api-top",     id: "api",      left: "76%",  top: "27%", size: 32, opacity: 0.65, duration: 8.1, delay: 0.7,  hideMobile: true  },

  /* ── Zona Samping Stage ── */
  { key: "molecule-s",  id: "molecule", left: "8%",   top: "52%", size: 38, opacity: 0.80, duration: 6.5, delay: 0.0,  hideMobile: false },
  { key: "keyboard-s",  id: "keyboard", left: "5%",   top: "68%", size: 40, opacity: 0.70, duration: 8.4, delay: 1.8,  hideMobile: true  },
  { key: "ethernet-s",  id: "ethernet", left: "93%",  top: "58%", size: 36, opacity: 0.75, duration: 6.9, delay: 0.9,  hideMobile: false },
  { key: "globe-s",     id: "globe",    left: "90%",  top: "74%", size: 34, opacity: 0.68, duration: 7.6, delay: 2.5,  hideMobile: true  },

  /* ── Zona Bawah ── */
  { key: "404-bot",     id: "404",      left: "11%",  top: "88%", size: 36, opacity: 0.58, duration: 9.0, delay: 0.5,  hideMobile: true  },
  { key: "database-bot",id: "database", left: "88%",  top: "90%", size: 32, opacity: 0.60, duration: 8.6, delay: 1.5,  hideMobile: true  },
];

/* ── SVG Ikon Inline ──────────────────────────────────────────────── */
type SvgFn = (s: number) => React.ReactNode;

const SVG: Record<string, SvgFn> = {
  code: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  flask: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6M9 3v6l-4.5 9A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.8-3L15 9V3" />
      <path d="M6.5 14.5h11" />
    </svg>
  ),
  wifi: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  ),
  api: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="10" rx="2" />
      <path d="M6 11h.01M10 11h.01M14 11h2M6 14h12" />
    </svg>
  ),
  molecule: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <circle cx="4"  cy="6"  r="2" />
      <circle cx="20" cy="6"  r="2" />
      <circle cx="4"  cy="18" r="2" />
      <circle cx="20" cy="18" r="2" />
      <line x1="6"  y1="7"  x2="10" y2="10" />
      <line x1="18" y1="7"  x2="14" y2="10" />
      <line x1="6"  y1="17" x2="10" y2="14" />
      <line x1="18" y1="17" x2="14" y2="14" />
    </svg>
  ),
  keyboard: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12M10 14h.01M14 14h.01" />
    </svg>
  ),
  ethernet: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="3" width="10" height="8" rx="1" />
      <path d="M9 3V1M12 3V1M15 3V1" />
      <path d="M12 11v3" />
      <rect x="8" y="14" width="8" height="5" rx="1" />
      <path d="M10 19v2M14 19v2" />
    </svg>
  ),
  globe: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  "404": (s) => (
    <svg width={s} height={Math.round(s * 0.6)} viewBox="0 0 36 22" fill="none">
      <text x="1" y="17" fontSize="16" fontFamily="monospace" fontWeight="700"
        fill="currentColor">404</text>
    </svg>
  ),
  database: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v4c0 1.657 4.03 3 9 3s9-1.343 9-3V5" />
      <path d="M3 9v4c0 1.657 4.03 3 9 3s9-1.343 9-3V9" />
      <path d="M3 13v4c0 1.657 4.03 3 9 3s9-1.343 9-3v-4" />
    </svg>
  ),
};

export default function HeroFloatingIcons() {
  return (
    <div className="hero-icons-layer" aria-hidden="true">
      {ICONS.map((icon) => {
        const fn = SVG[icon.id];
        if (!fn) return null;
        return (
          <span
            key={icon.key}
            className={`hero-floating-icon${icon.hideMobile ? " hero-icon-hide-mobile" : ""}`}
            style={{
              left:     icon.left,
              right:    icon.right,
              top:      icon.top,
              bottom:   icon.bottom,
              opacity:  icon.opacity,
              animationDuration:        `${icon.duration}s`,
              animationDelay:           `${icon.delay}s`,
              animationTimingFunction:  "ease-in-out",
              color: "var(--hero-brand, #8B1A2F)",
            }}
          >
            {fn(icon.size)}
          </span>
        );
      })}
    </div>
  );
}
