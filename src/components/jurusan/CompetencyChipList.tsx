"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

interface CompetencyChipListProps {
  items: string[];
  /** Label section kecil di atas chip list */
  label?: string;
}

/**
 * CompetencyChipList — pengganti grid checkmark generik.
 * Memakai gaya DimensionLine (leader-line ala gambar teknik) dari updateLanding.md,
 * dengan animasi stroke-draw saat masuk viewport (pola yang sama dengan WhySection).
 */
export default function CompetencyChipList({
  items,
  label = "KOMPETENSI UTAMA",
}: CompetencyChipListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="space-y-3">
      {/* Label dengan DimensionLine */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-mono font-semibold tracking-[0.25em] text-ink-600">
          {label}
        </span>
        {/* Animated dimension line */}
        <svg
          width="80"
          height="12"
          viewBox="0 0 80 12"
          className="text-ink-300"
          aria-hidden="true"
        >
          <motion.line
            x1="6" y1="6" x2="74" y2="6"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="68"
            strokeDashoffset="68"
            animate={isInView ? { strokeDashoffset: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          />
          <motion.line
            x1="6" y1="2" x2="6" y2="10"
            stroke="currentColor" strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.7 }}
          />
          <motion.line
            x1="74" y1="2" x2="74" y2="10"
            stroke="currentColor" strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
          />
        </svg>
      </div>

      {/* Chip items dengan leader-line + stroke-draw reveal */}
      <ul className="space-y-2.5">
        {items.map((item, index) => (
          <motion.li
            key={item}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -12 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.15 + index * 0.07,
            }}
          >
            {/* nomor urut — dekoratif, aria-hidden di parent */}
            <div className="flex flex-shrink-0 items-center gap-1.5">
              <span className="font-mono text-xs font-semibold text-ink-600">
                {String(index + 1).padStart(2, "0")}
              </span>
              <svg width="24" height="10" viewBox="0 0 24 10" aria-hidden="true">
                <line x1="0" y1="5" x2="16" y2="5" stroke="#CCCCCC" strokeWidth="1" />
                <path
                  d="M14 2.5 L18 5 L14 7.5"
                  fill="none"
                  stroke="#8B1A2F"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Chip */}
            <span className="inline-flex items-center rounded-full border border-ink-150 bg-ink-100 px-3.5 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary">
              {item}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
