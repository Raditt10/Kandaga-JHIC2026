"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

export default function ScrollExpandHero() {
  const reduce = useReducedMotion();
  const [sloganVisible, setSloganVisible] = useState(false);
  /*
   * Animasi clip-path memaksa repaint area 70vh x 100vw setiap frame. will-change
   * di sini hanya dipasang selama animasi berjalan, lalu dilepas lewat
   * onAnimationComplete — kalau dibiarkan permanen, lapisan compositor
   * besar itu tertahan seumur halaman dan justru menambah beban.
   */
  const [expanding, setExpanding] = useState(false);

  if (reduce) {
    return (
      <section className="relative overflow-hidden bg-white">
        <div className="relative h-[70vh] w-full overflow-hidden">
          <Image
            src="/images/smkn13.webp"
            alt="Siswa SMKN 13 Bandung mengerjakan proyek bersama"
            fill
            sizes="100vw"
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
      {/* Pakai clip-path bukan scale — clip-path hanya paint, tidak trigger layout */}
      <motion.div
        className="relative w-full overflow-hidden"
        style={{ height: "70vh", willChange: expanding ? "clip-path" : undefined }}
        initial={{ clipPath: "inset(8% 12% 8% 12% round 24px)" }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        onViewportEnter={() => {
          setExpanding(true);
          setTimeout(() => setSloganVisible(true), 750);
        }}
        onAnimationComplete={() => setExpanding(false)}
      >
        <Image
          src="/images/smkn13.webp"
          alt="Siswa SMKN 13 Bandung mengerjakan proyek bersama"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/55" />

        {/* KANDAGA — langsung ada, hilang saat expand mulai */}
        <motion.h2
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 0, y: -20 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center font-heading text-5xl font-black tracking-tight text-white md:text-7xl"
          aria-hidden="true"
        >
          KANDAGA
        </motion.h2>

        {/* SLOGAN — muncul setelah expand selesai */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={sloganVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 text-center font-heading text-2xl font-semibold text-white md:text-5xl"
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
