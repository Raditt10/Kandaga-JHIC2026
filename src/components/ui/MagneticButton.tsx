"use client";

import { useRef, useCallback, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  /** Radius deteksi kursor dari tepi tombol (px). Default: 40 */
  radius?: number;
  /** Offset tarik maksimal (px). Default: 6 */
  strength?: number;
  /** Wrapper element tambahan (opsional, misal untuk pulse ring) */
  wrapperClassName?: string;
}

/**
 * MagneticButton — tombol yang tertarik halus mengikuti kursor
 * saat kursor mendekat dalam `radius` px dari tepi tombol.
 *
 * Dipakai di: Hero landing page (CTA "MULAI JELAJAHI") dan
 * CTA Kemitraan halaman Jurusan — komponen tunggal, bukan disalin dua kali.
 */
export default function MagneticButton({
  children,
  className = "",
  radius = 40,
  strength = 6,
  wrapperClassName = "",
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 300, damping: 28 });
  const y = useSpring(rawY, { stiffness: 300, damping: 28 });

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = btnRef.current?.getBoundingClientRect();
      if (!rect) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const halfW = rect.width / 2;
      const halfH = rect.height / 2;
      const edgeDist = Math.max(
        0,
        dist - Math.sqrt(halfW * halfW + halfH * halfH)
      );

      if (edgeDist < radius) {
        const pull = 1 - edgeDist / radius;
        rawX.set((dx / dist) * strength * pull);
        rawY.set((dy / dist) * strength * pull);
      } else {
        rawX.set(0);
        rawY.set(0);
      }
    },
    [rawX, rawY, radius, strength]
  );

  const handlePointerLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return (
    <motion.div
      ref={btnRef}
      className={`relative inline-flex items-center justify-center ${wrapperClassName}`}
      style={{ x, y }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className={className}>{children}</div>
    </motion.div>
  );
}
