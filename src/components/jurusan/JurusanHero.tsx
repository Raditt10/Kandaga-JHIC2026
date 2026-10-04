"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import Image from "next/image";
import { JurusanDetail } from "@/data/jurusanData";

/** Foto model per jurusan (rasio 2:3). TKJ menyusul. */
const MODEL_BY_MAJOR: Record<string, string> = {
  "analis-kimia": "/majors/MODELKA2.webp",
  rpl: "/majors/MODELRPL2.webp",
};

export default function JurusanHero({
  currentMajor,
}: {
  currentMajor: JurusanDetail;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });
  const modelSrc = MODEL_BY_MAJOR[currentMajor.id];

  const scrollToDetail = () => {
    const element = document.getElementById("detail-program");
    if (!element) return;

    const win = window as unknown as {
      lenis?: { scrollTo: (target: HTMLElement | string, options?: { offset?: number; duration?: number }) => void };
    };

    if (win.lenis && typeof win.lenis.scrollTo === "function") {
      win.lenis.scrollTo(element, { offset: -85, duration: 1.0 });
      return;
    }

    const yOffset = -85;
    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <section
      ref={containerRef}
      className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-[#FBF9F6] via-white to-white"
    >
      {/* Ambient decorative lighting */}
      <div className="pointer-events-none absolute top-16 left-1/4 -z-10 w-96 h-96 rounded-full bg-[#8B1A2F]/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ── Left Column: Konten Teks & Informasi Jurusan ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 tracking-tight leading-[1.15]">
                {currentMajor.name}
              </h1>
              <p className="font-medium text-base sm:text-lg text-[#8B1A2F]">
                &ldquo;{currentMajor.tagline}&rdquo;
              </p>
              <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-xl">
                {currentMajor.description}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={scrollToDetail}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#8B1A2F] hover:bg-[#721426] text-white shadow-sm transition-all duration-200 cursor-pointer active:scale-98"
              >
                <span>Pelajari Detail Program</span>
                <Image
                  src="/icons/arrowdown.svg"
                  alt="Detail"
                  width={16}
                  height={16}
                  className="w-4 h-4 object-contain"
                />
              </button>

              <Link
                href={currentMajor.highlightProject?.link || "/#galeri-section"}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-zinc-50 text-zinc-900 border-2 border-dashed border-zinc-300 hover:border-zinc-400 transition-all duration-200 shadow-xs cursor-pointer active:scale-98"
              >
                <span>Lihat Portofolio Karya</span>
                <Image
                  src="/icons/eye.svg"
                  alt="Portofolio"
                  width={16}
                  height={16}
                  className="w-4 h-4 object-contain"
                />
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="grid grid-cols-2 gap-4 max-w-md pt-4 border-t border-zinc-100">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-[#8B1A2F] font-bold text-sm">
                  <Image
                    src="/icons/verified.svg"
                    alt="Akreditasi A"
                    width={18}
                    height={18}
                    className="w-4 h-4 object-contain"
                  />
                  <span>Akreditasi A</span>
                </div>
                <p className="text-[11px] text-zinc-500">Unggul BAN-SM</p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-zinc-900 font-bold text-sm">
                  <Image
                    src="/icons/factory.svg"
                    alt="Teaching Factory"
                    width={18}
                    height={18}
                    className="w-4 h-4 object-contain"
                  />
                  <span>Teaching Factory</span>
                </div>
                <p className="text-[11px] text-zinc-500">Produksi Nyata</p>
              </div>
            </div>
          </motion.div>

          {/* ── Right Column: foto model jurusan (tanpa border, tanpa badge) ── */}
          {modelSrc && (
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:flex lg:col-span-6 w-full justify-center items-end"
            >
              <div className="relative w-full max-w-[480px] aspect-[2/3] overflow-hidden rounded-2xl">
                <Image
                  src={modelSrc}
                  alt={`Siswa program ${currentMajor.name}`}
                  fill
                  priority
                  sizes="480px"
                  className="object-cover"
                />
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </section>
  );
}
