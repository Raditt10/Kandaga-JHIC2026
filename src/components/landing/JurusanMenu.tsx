"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { staggerChildren, revealUp } from "@/lib/motion";
import { JURUSAN_LIST } from "@/lib/data";

// Lazy-load FlowingMenu karena membawa GSAP — tidak boleh memengaruhi LCP Hero
const FlowingMenu = dynamic(() => import("@/components/ui/FlowingMenu"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] animate-pulse rounded-2xl bg-ink-100" aria-label="Memuat menu jurusan..." />
  ),
});

// Map JURUSAN_LIST ke shape yang dibutuhkan FlowingMenu
const items = JURUSAN_LIST.map((j) => ({
  link: `/jurusan/${j.slug}`,
  text: j.name,
  image: j.image,
}));

export default function JurusanMenu() {
  return (
    <section id="jurusan-section" className="mx-auto max-w-7xl px-6 py-20 md:py-24">
      <motion.div
        variants={staggerChildren}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mb-8"
      >
        <motion.h2
          variants={revealUp}
          className="font-heading text-3xl font-semibold text-ink md:text-4xl"
        >
          Jelajahi per Jurusan
        </motion.h2>
        <motion.p
          variants={revealUp}
          className="mt-3 text-sm text-ink-600 md:text-base"
        >
          Tiga jurusan, satu platform — temukan karya dari bidang yang paling
          relevan dengan kebutuhanmu.
        </motion.p>
      </motion.div>

      {/* Container wajib punya tinggi jelas — item FlowingMenu mengisi tinggi induknya */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="h-[420px] overflow-hidden rounded-2xl"
      >
        <FlowingMenu
          items={items}
          bgColor="#1A1A1A"
          textColor="#ffffff"
          marqueeBgColor="#8B1A2F"
          marqueeTextColor="#ffffff"
          borderColor="rgba(255,255,255,0.12)"
          speed={18}
        />
      </motion.div>

      {/* Catatan aksesibilitas — efek hover tidak muncul di layar sentuh, link tetap bisa diketuk */}
    </section>
  );
}
