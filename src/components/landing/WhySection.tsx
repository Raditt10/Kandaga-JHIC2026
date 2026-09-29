"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { staggerChildren, revealUp } from "@/lib/motion";
import { FEATURES } from "@/lib/data";
import type { Feature, FeatureIconKey } from "@/types";

// Mapping iconKey → path ke folder local /icons/*.svg
const ICON_PATH_MAP: Record<FeatureIconKey, string> = {
  verified: "/icons/verified.svg",
  enterprise: "/icons/enterprise.svg",
  school: "/icons/school.svg",
  factory: "/icons/factory.svg",
  task: "/icons/task.svg",
  assignment: "/icons/assignment.svg",
  check: "/icons/verified.svg",
  folder: "/icons/enterprise.svg",
  users: "/icons/school.svg",
};

// Kartu dengan tilt-on-hover ±4 derajat
function FeatureCard({ feature }: { feature: Feature }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 8; // ±4deg
    const rotateX = -((y / rect.height) - 0.5) * 8;
    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => setTilt({ rotateX: 0, rotateY: 0 });

  const iconSrc = ICON_PATH_MAP[feature.iconKey] ?? `/icons/${feature.iconKey}.svg`;

  return (
    <motion.div
      ref={cardRef}
      variants={revealUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ transformStyle: "preserve-3d" }}
      className="group rounded-2xl border border-ink-150 p-8 transition-shadow hover:shadow-md bg-white"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="font-heading text-3xl font-bold text-ink-150">
          {feature.number}
        </span>
        <div className="flex h-9 w-9 items-center justify-center transition-transform duration-200 group-hover:scale-110">
          <Image
            src={iconSrc}
            alt={feature.title}
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
          />
        </div>
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
        <motion.h2
          variants={revealUp}
          className="font-heading text-3xl font-semibold text-ink md:text-4xl"
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
      >
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.number} feature={feature} />
        ))}
      </motion.div>
    </section>
  );
}
