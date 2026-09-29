"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { staggerChildren, revealUp } from "@/lib/motion";
import { FEATURES } from "@/lib/data";
import type { Feature, FeatureIconKey } from "@/types";

// Map iconKey → komponen SVG animasi
// Data (FEATURES) hanya menyimpan string key, bukan referensi komponen,
// supaya JSON-safe dan siap untuk API di Fase 2.

// SVG ikon — verifikasi (check circle), industri (folder), siswa (users)
// Animasi stroke "menggambar diri sendiri" saat masuk viewport
function AnimatedCheckIcon({ isVisible }: { isVisible: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <motion.path
        d="M9 12.75L11.25 15 15 9.75"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isVisible ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      />
      <motion.path
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isVisible ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      />
    </svg>
  );
}

function AnimatedFolderIcon({ isVisible }: { isVisible: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <motion.path
        d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isVisible ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      />
    </svg>
  );
}

function AnimatedUsersIcon({ isVisible }: { isVisible: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <motion.path
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isVisible ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      />
    </svg>
  );
}

// Map iconKey → komponen animasi
const ICON_MAP: Record<FeatureIconKey, React.ComponentType<{ isVisible: boolean }>> = {
  check:  AnimatedCheckIcon,
  folder: AnimatedFolderIcon,
  users:  AnimatedUsersIcon,
};

// Gabungkan data dari data.ts dengan komponen ikon
const features = FEATURES.map((f) => ({
  ...f,
  Icon: ICON_MAP[f.iconKey],
}));

// Kartu dengan tilt-on-hover ±4 derajat
function FeatureCard({
  feature,
  isVisible,
}: {
  feature: Feature & { Icon: React.ComponentType<{ isVisible: boolean }> };
  isVisible: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 8;   // ±4deg
    const rotateX = -((y / rect.height) - 0.5) * 8;
    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => setTilt({ rotateX: 0, rotateY: 0 });

  return (
    <motion.div
      ref={cardRef}
      variants={revealUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ transformStyle: "preserve-3d" }}
      className="rounded-2xl border border-ink-150 p-8 transition-shadow hover:shadow-md"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="font-heading text-3xl font-bold text-ink-150">
          {feature.number}
        </span>
        <span className="text-primary">
          <feature.Icon isVisible={isVisible} />
        </span>
      </div>
      <h3 className="font-heading text-lg font-semibold text-ink">
        {feature.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-600">
        {feature.description}
      </p>
    </motion.div>
  );
}

export default function WhySection() {
  const sectionRef = useRef<HTMLElement>(null);
  // Pakai state untuk track inView supaya bisa pass ke ikon
  const [isVisible, setIsVisible] = useState(false);

  return (
    <section id="tentang-section" ref={sectionRef} className="mx-auto max-w-7xl px-6 py-20 md:py-24">
      {/* Header */}
      <motion.div
        className="mb-12 max-w-xl"
        variants={staggerChildren}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.span
          variants={revealUp}
          className="text-xs font-semibold tracking-[0.3em] text-ink-600"
        >
          KEUNGGULAN
        </motion.span>
        <motion.h2
          variants={revealUp}
          className="mt-2 font-heading text-3xl font-semibold text-ink md:text-4xl"
        >
          Kenapa Harus Kandaga?
        </motion.h2>
      </motion.div>

      {/* Kartu fitur */}
      <motion.div
        className="grid gap-6 md:grid-cols-3"
        variants={staggerChildren}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        onViewportEnter={() => setIsVisible(true)}
      >
        {features.map((feature) => (
          <FeatureCard key={feature.number} feature={feature} isVisible={isVisible} />
        ))}
      </motion.div>
    </section>
  );
}
