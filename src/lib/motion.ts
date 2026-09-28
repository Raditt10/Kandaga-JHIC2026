import type { Variants } from "motion/react";

// Reveal dari bawah ke atas — dipakai di semua section
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// Stagger wrapper — bungkus list/grid supaya anak-anaknya muncul berurutan
export const staggerChildren: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

// Curtain reveal pakai clip-path (untuk Hero panels)
export const curtainReveal: Variants = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  show: {
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

// Fade + rise untuk wordmark Hero
export const wordmarkReveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.5 },
  },
};

// Tilted stack: dari lebih miring ke posisi akhir
export const tiltedCardReveal = (rotate: number, x: number): Variants => ({
  hidden: { opacity: 0, rotate: rotate * 1.8, x: x * 1.5, scale: 0.88 },
  show: {
    opacity: 1,
    rotate,
    x,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
});
