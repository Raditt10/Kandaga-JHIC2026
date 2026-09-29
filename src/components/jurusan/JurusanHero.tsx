"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { ArrowDown, Sparkles, Award, ShieldCheck, Cpu, ArrowUpRight } from "lucide-react";
import { JURUSAN_DATA } from "@/data/jurusanData";

// ── Blueprint Dimension Line Decorator ─────────────────────────────────────
function BlueprintDimensionLine({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-zinc-400 select-none">
      <span className="text-[#8B1A2F] font-bold">⊢</span>
      <div className="h-px bg-zinc-200 flex-1 relative">
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 -top-1.5 px-1 bg-white text-[9px] text-zinc-400">
          {label || "CANVAS • DIMENSION"}
        </div>
      </div>
      <span className="text-[#8B1A2F] font-bold">⊣</span>
    </div>
  );
}

export default function JurusanHero({
  onSelectMajor,
}: {
  onSelectMajor?: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true });

  const scrollToMajor = (id: string) => {
    if (onSelectMajor) {
      onSelectMajor(id);
      return;
    }
    const targetId = id === "semua" ? "daftar-jurusan" : id;
    const element = document.getElementById(targetId);
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
      {/* Background Blueprint Grid Pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] bg-[linear-gradient(to_right,#1A1A1A_1px,transparent_1px),linear-gradient(to_bottom,#1A1A1A_1px,transparent_1px)] bg-[size:36px_36px]"
        aria-hidden="true"
      />

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
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B1A2F]/5 border border-[#8B1A2F]/15 text-[#8B1A2F] text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#8B1A2F] animate-pulse" />
              <span>PROGRAM KEAHLIAN VOKASI SMKN 13 BANDUNG</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 tracking-tight leading-[1.15]">
                Tiga Pilar Keahlian,{" "}
                <span className="bg-gradient-to-r from-[#8B1A2F] via-[#a61743] to-[#5a0c1e] bg-clip-text text-transparent">
                  Menjawab Masa Depan
                </span>{" "}
                Industri.
              </h1>
              <p className="text-zinc-600 text-sm sm:text-base leading-relaxed max-w-xl">
                Eksplorasi kurikulum berbasis industri di SMKN 13 Bandung. Kami
                mengasah penguasaan teknis mendalam, budaya riset laboratorium, serta
                produksi digital nyata melalui 3 program studi unggulan yang
                terintegrasi di platform <strong>Kandaga</strong>.
              </p>
            </div>

            {/* Quick Major Jumping Pills */}
            <div className="pt-2">
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                Pilih Jurusan untuk Melihat Spesifikasi:
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => scrollToMajor("semua")}
                  className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-[#8B1A2F] text-zinc-800 hover:text-white transition-all duration-200 border border-zinc-200/80 hover:border-transparent cursor-pointer shadow-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B1A2F] group-hover:bg-white transition-colors" />
                  <span>Semua Jurusan</span>
                  <span className="text-[10px] opacity-60 font-mono">(3)</span>
                </button>
                {JURUSAN_DATA.map((jurusan) => (
                  <button
                    key={jurusan.id}
                    type="button"
                    onClick={() => scrollToMajor(jurusan.id)}
                    className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-[#8B1A2F] text-zinc-800 hover:text-white transition-all duration-200 border border-zinc-200/80 hover:border-transparent cursor-pointer shadow-xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B1A2F] group-hover:bg-white transition-colors" />
                    <span>{jurusan.name}</span>
                    <span className="text-[10px] opacity-60 font-mono">
                      ({jurusan.duration.split(" ")[0]} Thn)
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => scrollToMajor("semua")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-[#8B1A2F] to-[#a61743] hover:from-[#76102f] hover:to-[#92143b] text-white shadow-md shadow-[#8B1A2F]/20 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-98"
              >
                <span>Pelajari Detail Program</span>
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </button>

              <Link
                href="/#galeri-section"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-semibold bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 shadow-xs hover:border-zinc-300 transition-all duration-200"
              >
                <span>Lihat Portofolio Karya</span>
                <ArrowUpRight className="w-4 h-4 text-zinc-400" />
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-100">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-[#8B1A2F] font-bold text-sm">
                  <Award className="w-4 h-4 text-[#8B1A2F]" />
                  <span>Akreditasi A</span>
                </div>
                <p className="text-[11px] text-zinc-500">Unggul BAN-SM</p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-zinc-900 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-[#8B1A2F]" />
                  <span>ISO & BNSP</span>
                </div>
                <p className="text-[11px] text-zinc-500">Standar Internasional</p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-zinc-900 font-bold text-sm">
                  <Cpu className="w-4 h-4 text-[#8B1A2F]" />
                  <span>Teaching Factory</span>
                </div>
                <p className="text-[11px] text-zinc-500">Produksi Nyata</p>
              </div>
            </div>
          </motion.div>

          {/* ── Right Column: KOSONG / DEDICATED HERO 3D MODEL SLOT ── */}
          {/* Sesuai instruksi: "sisakan section kosong di section pertama untuk hero section nanti bakal ada model nya di bagian kanan" */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 w-full flex justify-center items-center"
          >
            {/* Model Container Wrapper with Blueprint Styling */}
            <div className="w-full max-w-lg relative group">
              
              {/* Decorative Blueprint Corner Crosshairs */}
              <span className="absolute -top-3 -left-3 text-zinc-300 font-mono text-sm pointer-events-none select-none">+</span>
              <span className="absolute -top-3 -right-3 text-zinc-300 font-mono text-sm pointer-events-none select-none">+</span>
              <span className="absolute -bottom-3 -left-3 text-zinc-300 font-mono text-sm pointer-events-none select-none">+</span>
              <span className="absolute -bottom-3 -right-3 text-zinc-300 font-mono text-sm pointer-events-none select-none">+</span>

              {/* Dimension measurement bar at the top */}
              <div className="mb-2">
                <BlueprintDimensionLine label="MODEL 3D HERO CANVAS (SLOT)" />
              </div>

              {/* 
                ============================================================
                TARGET CONTAINER UNTUK MODEL 3D
                Anda dapat langsung meletakkan komponen Three.js, Canvas,
                Spline Viewer (<spline-viewer>), atau Three Fiber di dalam ID ini.
                Container ini sudah memiliki rasio responsif, background halus,
                dan batas visual agar model 3D menyatu secara estetis.
                ============================================================
              */}
              <div
                id="hero-3d-model-container"
                data-slot="hero-3d-model"
                className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-zinc-50 to-[#F5F0E8]/40 shadow-sm overflow-hidden flex flex-col items-center justify-center p-6 text-center transition-all duration-300 group-hover:border-[#8B1A2F]/30 group-hover:shadow-md"
              >
                {/* Background Isometric Wireframe Grid */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[radial-gradient(#8B1A2F_1px,transparent_1px)] [background-size:16px_16px]"
                  aria-hidden="true"
                />

                {/* Ambient Soft Glow Sphere */}
                <div className="pointer-events-none absolute w-64 h-64 rounded-full bg-gradient-to-tr from-[#8B1A2F]/10 via-[#E8C97A]/15 to-transparent blur-2xl" />

                {/* Placeholder Visual & Coordinate Indicators */}
                <div className="relative z-10 flex flex-col items-center justify-center space-y-4 max-w-xs">
                  {/* Stylized 3D Cube / Wireframe Ring Animation */}
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-2xl border border-dashed border-[#8B1A2F]/30 animate-[spin_12s_linear_infinite]" />
                    <div className="absolute inset-2 rounded-full border border-zinc-300 animate-[spin_8s_linear_infinite_reverse]" />
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#8B1A2F] to-[#a61743] text-white flex items-center justify-center shadow-lg shadow-[#8B1A2F]/30 group-hover:scale-105 transition-transform duration-300">
                      <Sparkles className="w-6 h-6 text-[#E8C97A] animate-pulse" />
                    </div>
                  </div>

                  {/* Informational Badge */}
                  <div className="space-y-1.5">
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#8B1A2F]/10 text-[#8B1A2F] border border-[#8B1A2F]/20">
                      3D Model Slot
                    </span>
                    <h3 className="font-heading font-semibold text-zinc-800 text-sm sm:text-base">
                      Slot Model 3D Siap Diintegrasikan
                    </h3>
                    <p className="text-[11px] sm:text-xs text-zinc-500 leading-relaxed">
                      Area khusus di sisi kanan Hero section untuk rendering model 3D
                      interaktif (Spline, Three.js, atau asset GLTF).
                    </p>
                  </div>

                  {/* Tech specs chip */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/80 border border-zinc-200 text-[10px] font-mono text-zinc-500 shadow-2xs">
                    <span>Target: #hero-3d-model-container</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                </div>

                {/* Coordinate metadata corner overlay */}
                <div className="absolute bottom-3 left-4 text-[9px] font-mono text-zinc-400 select-none">
                  SEC-01 // HERO_MODEL_RIGHT
                </div>
                <div className="absolute bottom-3 right-4 text-[9px] font-mono text-zinc-400 select-none">
                  STATUS: READY
                </div>
              </div>

              {/* Bottom Dimension Line */}
              <div className="mt-2">
                <BlueprintDimensionLine label="RESPONSIVE VIEWPORT 1:1" />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
