"use client";

import { useState } from "react";
import { motion } from "motion/react";

export type JellyOption = { value: string; label: string };

type Props = {
  name: string;
  options: JellyOption[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
};

/**
 * JellyRadio — filter pills dengan efek squash & stretch saat dipilih.
 * Memakai <input type="radio"> asli supaya keyboard + screen reader bekerja.
 * Efek motion dimatikan otomatis bila user aktifkan prefers-reduced-motion
 * (lewat MotionConfig reducedMotion="user" di layout).
 */
export default function JellyRadio({
  name,
  options,
  defaultValue,
  onChange,
  className = "",
}: Props) {
  const [value, setValue] = useState(defaultValue ?? options[0]?.value ?? "");

  const handleChange = (newVal: string) => {
    setValue(newVal);
    onChange?.(newVal);
  };

  return (
    <div role="radiogroup" className={`flex flex-wrap gap-3 ${className}`}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <label key={opt.value} className="cursor-pointer">
            {/* Input tersembunyi tapi tetap ada untuk aksesibilitas */}
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={active}
              onChange={() => handleChange(opt.value)}
              className="peer sr-only"
            />

            {/* Pill dengan efek squash & stretch saat aktif */}
            <motion.span
              animate={
                active
                  ? {
                      // Squash ke samping lalu stretch balik → efek kenyal
                      scaleX: [1, 1.18, 0.93, 1.04, 1],
                      scaleY: [1, 0.82, 1.09, 0.97, 1],
                    }
                  : { scaleX: 1, scaleY: 1 }
              }
              transition={{ duration: 0.45, ease: "easeOut" }}
              className={`block select-none rounded-full border px-5 py-2 text-sm font-medium transition-colors
                peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2
                ${
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-ink-300 text-ink-700 hover:border-ink"
                }`}
            >
              {opt.label}
            </motion.span>
          </label>
        );
      })}
    </div>
  );
}
