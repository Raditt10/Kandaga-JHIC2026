"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { staggerChildren, revealUp } from "@/lib/motion";
import { STATS } from "@/lib/data";
import type { Stat } from "@/types";

// ─── Tipe respons /api/stats ──────────────────────────────────────────────────

interface StatsApiResponse {
  jurusanAktif:        number
  karyaTerdokumentasi: number
  siswaBerkontribusi:  number
  guruPembimbing:      number
}

// Petakan respons API ke shape Stat[] yang dipakai StatItem
function apiToStats(data: StatsApiResponse): Stat[] {
  return [
    { value: data.jurusanAktif,        suffix: "",  label: "Jurusan Aktif" },
    { value: data.karyaTerdokumentasi, suffix: "+", label: "Karya Terdokumentasi" },
    { value: data.siswaBerkontribusi,  suffix: "+", label: "Siswa Berkontribusi" },
    { value: data.guruPembimbing,      suffix: "+", label: "Guru Pembimbing" },
  ]
}

// ─── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200, active = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setCount(target); return; }

    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [target, duration, active]);

  return count;
}

// ─── Single stat item ─────────────────────────────────────────────────────────

function StatItem({ value, suffix, label, active }: Stat & { active: boolean }) {
  const count = useCountUp(value, 1200, active);
  return (
    <motion.div variants={revealUp}>
      <p className="font-heading text-4xl font-bold text-white md:text-5xl">
        {count}{suffix}
      </p>
      <p className="mt-1 text-sm text-white/60">{label}</p>
    </motion.div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  /* Tanpa `once` — dipakai untuk mematikan animasi kilau saat bagian ini di luar layar. */
  const floatsInView = useInView(sectionRef, { margin: "-80px" });

  // Mulai dari data statis — diperbarui setelah API merespons
  const [stats, setStats] = useState<Stat[]>(STATS);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/stats")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<StatsApiResponse>;
      })
      .then((data) => {
        if (!cancelled) setStats(apiToStats(data));
      })
      .catch((err) => {
        // Gagal fetch → tetap tampil STATS statis, tidak perlu pesan error
        console.warn("[StatsSection] Gagal memuat stats dari API:", err);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-ink py-20 md:py-24">
      {/*
       * Aksen kilau emas sangat halus — hanya dirender saat bagian ini terlihat.
       * Keduanya beranimasi `repeat: Infinity`; kalau dibiarkan tetap hidup di luar
       * layar, compositor terus bekerja selama pengguna menggulir bagian lain.
       */}
      {floatsInView && (
        <>
          <motion.div
            className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(232,201,122,0.08) 0%, transparent 70%)" }}
            animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute -bottom-20 right-0 h-80 w-80 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(232,201,122,0.06) 0%, transparent 70%)" }}
            animate={{ x: [0, -20, 0], y: [0, -15, 0] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:gap-20">

          {/* Teks kiri */}
          <motion.div
            className="md:max-w-sm"
            variants={staggerChildren}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
          >
            <motion.h2
              variants={revealUp}
              className="font-heading text-3xl font-semibold text-white md:text-4xl"
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

          {/* Grid statistik kanan */}
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
