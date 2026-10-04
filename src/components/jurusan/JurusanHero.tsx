"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import Image from "next/image";
import { JurusanDetail } from "@/data/jurusanData";

export default function JurusanHero({
  currentMajor,
}: {
  currentMajor: JurusanDetail;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });

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
      <div className="pointer-events-none absolute top-32 right-10 -z-10 w-80 h-80 rounded-full bg-[#E8C97A]/15 blur-3xl" />

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

          {/* ── Right Column: Model siswa per jurusan ── */}
          {/*
            Fixes (konsepGaleri.md §2 + design-rules.md §8):
            1. Badge tidak overflow — plakat inline di dalam frame
            2. Titik indikator pakai --color-primary
            3. Bingkai 1px ink-300, radius 6-8px (vitrine treatment)
            4. Satu plakat bawah (museum-style) bukan 2 chip terpisah
            5. object-position: top 20% — crop bust shot, kurangi negative space
            6. Gradient overlay 1/3 bawah untuk kontras teks (WCAG AA)
            7. Catatan konten: idealnya foto tanpa identitas personal di topi
          */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex lg:col-span-6 w-full justify-center items-center"
          >
            {/* Wrapper dengan overflow-hidden supaya tidak ada yang keluar frame */}
            <div className="relative w-full max-w-md">

              {/* Background dekoratif per jurusan — di luar bingkai foto */}
              <div
                className={`absolute inset-0 rounded-lg blur-sm scale-105 opacity-40 ${
                  currentMajor.id === "analis-kimia"
                    ? "bg-gradient-to-br from-amber-100 to-orange-100"
                    : currentMajor.id === "tkj"
                    ? "bg-gradient-to-br from-blue-100 to-cyan-100"
                    : "bg-gradient-to-br from-rose-100 to-primary-light"
                }`}
                aria-hidden="true"
              />

              {/*
                Bingkai foto — vitrine treatment (konsepGaleri §2):
                - border 1px solid ink-300
                - border-radius 6-8px (bukan rounded-2xl/3xl)
                - overflow-hidden untuk memastikan badge tidak keluar
              */}
              <div
                className="relative z-10 overflow-hidden aspect-[3/4] shadow-xl"
                style={{
                  border:       "1px solid var(--color-ink-300)",
                  borderRadius: "8px",
                }}
              >
                <Image
                  src={
                    currentMajor.id === "analis-kimia"
                      ? "/images/MODELKA.png"
                      : currentMajor.id === "tkj"
                      ? "/images/MODELTKJ.png"
                      : "/images/MODELRPL.png"
                  }
                  alt={`Siswa program ${currentMajor.name} SMKN 13 Bandung`}
                  fill
                  priority
                  className="object-cover"
                  style={{ objectPosition: "center 20%" }}  /* crop bust shot, kurangi negative space atas */
                />

                {/*
                  Overlay gradient 1/3 bawah saja (poin 6).
                  from-ink/80 memastikan WCAG AA untuk teks putih di atasnya.
                */}
                <div
                  className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/80 to-transparent pointer-events-none"
                  aria-hidden="true"
                />

                {/*
                  Plakat info museum (poin 4) — satu bar solid di bawah foto.
                  Kiri: nama jurusan + sekolah. Kanan: Akreditasi A.
                  Semua di dalam frame sehingga tidak overflow (fix poin 1).
                  Teks putih di atas from-ink/80 — kontras WCAG AA terjamin.
                */}
                <div className="absolute bottom-0 inset-x-0 px-4 py-3 flex items-center justify-between gap-3">
                  {/* Kiri: nama jurusan */}
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Titik indikator pakai --color-primary (fix poin 2) */}
                    <span
                      className="w-1.5 h-1.5 shrink-0 rounded-full bg-primary animate-pulse"
                      aria-hidden="true"
                    />
                    <p className="text-sm font-semibold text-white leading-tight truncate">
                      {currentMajor.name}
                      {currentMajor.duration && (
                        <span className="font-normal opacity-80"> · {currentMajor.duration}</span>
                      )}
                    </p>
                  </div>

                  {/* Kanan: badge Akreditasi A — selalu di dalam frame (fix poin 1) */}
                  <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 border border-white/30 backdrop-blur-sm text-xs font-bold text-white whitespace-nowrap">
                    🏆 Akreditasi A
                  </span>
                </div>

              </div>

              {/* Catatan konten (poin 7) — tersembunyi, hanya untuk developer */}
              {/* TODO: Ganti foto dengan versi tanpa identitas personal di topi,
                  atau crop lebih dekat ke wajah/APD. */}

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
