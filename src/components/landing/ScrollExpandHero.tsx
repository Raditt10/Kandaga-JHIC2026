"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

export default function ScrollExpandHero() {
  const reduce = useReducedMotion();
  const [sloganVisible, setSloganVisible] = useState(false);

  // Reduced motion: tampilkan langsung tanpa animasi
  if (reduce) {
    return (
      <section className="relative overflow-hidden bg-white py-24">
        <div className="relative mx-4 overflow-hidden rounded-none" style={{ height: "70vh" }}>
          <Image
            src="/images/hero-kolaborasi.jpg"
            alt="Siswa SMKN 13 Bandung mengerjakan proyek bersama"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-ink/55" />
          <p className="absolute inset-0 flex items-center justify-center px-8 text-center font-heading text-3xl font-semibold text-white md:text-5xl">
            Etalase karya siswa, terverifikasi sekolah, terbuka untuk industri.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-white py-8">
      {/* Jendela: mulai kecil (scale 0.55 + rounded) → besar (scale 1 + no rounded)
          whileInView: trigger saat 40% section masuk viewport, bukan langsung saat load */}
      <motion.div
        className="relative mx-auto w-full overflow-hidden"
        style={{ height: "70vh" }}
        initial={{ scale: 0.55, borderRadius: 28 }}
        whileInView={{ scale: 1, borderRadius: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        onViewportEnter={() => {
          // Delay slogan sampai animasi expand hampir selesai (0.85s)
          setTimeout(() => setSloganVisible(true), 850);
        }}
      >
        <Image
          src="/images/hero-kolaborasi.jpg"
          alt="Siswa SMKN 13 Bandung mengerjakan proyek bersama"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/55" />

        {/* KANDAGA — tampil saat jendela kecil, hilang saat mulai expand */}
        <motion.h2
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 0, y: -28 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center font-heading text-5xl font-black tracking-tight text-white drop-shadow-lg md:text-7xl"
          aria-hidden="true"
        >
          KANDAGA
        </motion.h2>

        {/* SLOGAN — muncul setelah expand selesai, di dalam jendela */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={sloganVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 text-center font-heading text-2xl font-semibold text-white drop-shadow-md md:text-5xl"
        >
          Etalase karya siswa,
          <br />
          terverifikasi sekolah,
          <br />
          terbuka untuk industri.
        </motion.p>
      </motion.div>
    </section>
  );
}
