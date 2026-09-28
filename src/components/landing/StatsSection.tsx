"use client";

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { staggerChildren, revealUp } from "@/lib/motion";

const stats = [
  { value: 3,    suffix: "",  label: "Jurusan Aktif" },
  { value: 200,  suffix: "+", label: "Karya Terdokumentasi" },
  { value: 50,   suffix: "+", label: "Siswa Berkontribusi" },
  { value: 15,   suffix: "+", label: "Guru Pembimbing" },
];

// Hook count-up
function useCountUp(target: number, duration = 1200, active = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;

    // Hormati prefers-reduced-motion — langsung tampil nilai akhir
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) { setCount(target); return; }

    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Easing: melambat di akhir
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [target, duration, active]);

  return count;
}

function StatItem({
  value,
  suffix,
  label,
  active,
}: {
  value: number;
  suffix: string;
  label: string;
  active: boolean;
}) {
  const count = useCountUp(value, 1200, active);
  return (
    <motion.div variants={revealUp}>
      <p className="font-heading text-4xl font-bold text-white md:text-5xl">
        {count}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-white/60">{label}</p>
    </motion.div>
  );
}

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-ink py-20 md:py-24">
      {/* Aksen kilau emas sangat halus — 2 radial blur, opacity ~8% */}
      <motion.div
        className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(232,201,122,0.08) 0%, transparent 70%)",
        }}
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-20 right-0 h-80 w-80 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(232,201,122,0.06) 0%, transparent 70%)",
        }}
        animate={{ x: [0, -20, 0], y: [0, -15, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:gap-20">
          {/* Teks kiri */}
          <motion.div
            className="md:max-w-sm"
            variants={staggerChildren}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
          >
            <motion.span
              variants={revealUp}
              className="text-xs font-semibold tracking-[0.3em] text-white/50"
            >
              TENTANG KARYA
            </motion.span>
            <motion.h2
              variants={revealUp}
              className="mt-3 font-heading text-3xl font-semibold text-white md:text-4xl"
            >
              Lebih dari sekadar{" "}
              <span className="text-primary">tugas.</span>
            </motion.h2>
            <motion.p
              variants={revealUp}
              className="mt-4 text-sm leading-relaxed text-white/60 md:text-base"
            >
              Setiap karya di Kandaga merupakan hasil nyata dari proses belajar
              yang serius — dikurasi, diverifikasi guru, dan siap dilihat dunia
              industri.
            </motion.p>
          </motion.div>

          {/* Grid statistik kanan — count-up saat masuk viewport */}
          <motion.div
            className="grid grid-cols-2 gap-8 md:flex-1"
            variants={staggerChildren}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
          >
            {stats.map((stat) => (
              <StatItem
                key={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                active={isInView}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
