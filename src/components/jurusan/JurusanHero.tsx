"use client";

import React, { useRef, useTransition, useState, useMemo } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { ArrowDown, Award, ShieldCheck, Cpu, ArrowUpRight } from "lucide-react";
import { JURUSAN_DATA } from "@/data/jurusanData";

// Dekoratif — aria-hidden, ukuran teks di bawah 12px OK karena tidak dibaca
function BlueprintDimensionLine({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-ink-300 select-none" aria-hidden="true">
      <span className="text-primary font-bold">⊢</span>
      <div className="h-px bg-ink-150 flex-1 relative">
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 -top-1.5 px-1 bg-white text-xs text-ink-300">
          {label || "CANVAS • DIMENSION"}
        </div>
      </div>
      <span className="text-primary font-bold">⊣</span>
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

  // useTransition: setState tidak blokir UI — user langsung dapat feedback visual
  const [isPending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState("semua");

  // useMemo: spec jurusan aktif tidak dihitung ulang setiap render
  const activeJurusan = useMemo(
    () => JURUSAN_DATA.find((j) => j.id === activeId) ?? null,
    [activeId]
  );

  const handleSelect = (id: string) => {
    // Feedback visual instan sebelum React selesai update state
    startTransition(() => setActiveId(id));
    scrollToMajor(id);
  };

  const scrollToMajor = (id: string) => {
    if (onSelectMajor) { onSelectMajor(id); return; }
    const targetId = id === "semua" ? "daftar-jurusan" : id;
    const element = document.getElementById(targetId);
    if (!element) return;
    const win = window as unknown as {
      lenis?: { scrollTo: (target: HTMLElement, options?: { offset?: number; duration?: number }) => void };
    };
    if (win.lenis?.scrollTo) { win.lenis.scrollTo(element, { offset: -85, duration: 1.0 }); return; }
    window.scrollTo({ top: element.getBoundingClientRect().top + window.pageYOffset - 85, behavior: "smooth" });
  };

  return (
    <section
      ref={containerRef}
      className="relative pt-16 pb-16 md:pt-20 md:pb-24 overflow-hidden bg-gradient-to-b from-[#FBF9F6] via-white to-white"
    >
      {/* Blueprint grid background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] bg-[linear-gradient(to_right,#1A1A1A_1px,transparent_1px),linear-gradient(to_bottom,#1A1A1A_1px,transparent_1px)] bg-[size:36px_36px]" aria-hidden="true" />
      <div className="pointer-events-none absolute top-16 left-1/4 -z-10 w-96 h-96 rounded-full bg-primary/5 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute top-32 right-10 -z-10 w-80 h-80 rounded-full bg-accent/15 blur-3xl" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* ── Kolom kiri ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            {/* label pendek — sentence case */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/15 text-primary text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
              Program keahlian vokasi SMKN 13 Bandung
            </div>

            {/* h1 — satu-satunya di halaman ini */}
            <div className="space-y-3">
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight leading-[1.15]">
                Tiga Pilar Keahlian,{" "}
                <span className="text-primary">Menjawab Masa Depan</span>{" "}
                Industri.
              </h1>
              {/* body text: text-base, max-w-[65ch], ink-700 */}
              <p className="text-base text-ink-700 leading-relaxed max-w-[65ch]">
                Eksplorasi kurikulum berbasis industri di SMKN 13 Bandung. Kami
                mengasah penguasaan teknis mendalam, budaya riset laboratorium, serta
                produksi digital nyata melalui 3 program studi unggulan yang
                terintegrasi di platform <strong>Kandaga</strong>.
              </p>
            </div>

            {/* filter pills + feedback isPending */}
            <div className="pt-2">
              <p className="text-xs font-mono text-ink-600 mb-3">
                Pilih jurusan untuk melihat spesifikasi:
              </p>
              {/* Wrapper dengan opacity saat pending — feedback instan ke user */}
              <div
                className={`flex flex-wrap gap-3 transition-opacity duration-150 ${
                  isPending ? "opacity-60" : "opacity-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSelect("semua")}
                  className={`group inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border cursor-pointer ${
                    activeId === "semua"
                      ? "bg-primary text-white border-transparent"
                      : "bg-ink-100 text-ink-700 hover:bg-primary hover:text-white border-ink-150 hover:border-transparent"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full transition-colors ${activeId === "semua" ? "bg-white" : "bg-primary group-hover:bg-white"}`} aria-hidden="true" />
                  Semua Jurusan
                  <span className="text-xs opacity-60 font-mono">(3)</span>
                </button>
                {JURUSAN_DATA.map((jurusan) => (
                  <button
                    key={jurusan.id}
                    type="button"
                    onClick={() => handleSelect(jurusan.id)}
                    className={`group inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border cursor-pointer ${
                      activeId === jurusan.id
                        ? "bg-primary text-white border-transparent"
                        : "bg-ink-100 text-ink-700 hover:bg-primary hover:text-white border-ink-150 hover:border-transparent"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full transition-colors ${activeId === jurusan.id ? "bg-white" : "bg-primary group-hover:bg-white"}`} aria-hidden="true" />
                    {jurusan.name}
                    <span className="text-xs opacity-60 font-mono">({jurusan.duration.split(" ")[0]} Thn)</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSelect("semua")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/20 transition-all duration-200 cursor-pointer"
              >
                Pelajari Detail Program
                <ArrowDown className="w-4 h-4" aria-hidden="true" />
              </button>
              <Link
                href="/#galeri-section"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold bg-white hover:bg-ink-100 text-ink-700 border border-ink-150 hover:border-ink-300 transition-all duration-200"
              >
                Lihat Portofolio Karya
                <ArrowUpRight className="w-4 h-4 text-ink-300" aria-hidden="true" />
              </Link>
            </div>

            {/* Trust highlights — text-sm minimum */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-ink-150">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
                  <Award className="w-4 h-4" aria-hidden="true" />
                  <span>Akreditasi A</span>
                </div>
                <p className="text-sm text-ink-600">Unggul BAN-SM</p>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-ink font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span>ISO & BNSP</span>
                </div>
                <p className="text-sm text-ink-600">Standar Internasional</p>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-ink font-bold text-sm">
                  <Cpu className="w-4 h-4 text-primary" aria-hidden="true" />
                  <span>Teaching Factory</span>
                </div>
                <p className="text-sm text-ink-600">Produksi Nyata</p>
              </div>
            </div>
          </motion.div>

          {/* ── Kolom kanan: slot model 3D (ditunda sesuai updateJurusan.md §3.A) ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 w-full flex justify-center items-center"
          >
            <div className="w-full max-w-lg relative">
              <span className="absolute -top-3 -left-3 text-ink-300 font-mono text-sm pointer-events-none select-none" aria-hidden="true">+</span>
              <span className="absolute -top-3 -right-3 text-ink-300 font-mono text-sm pointer-events-none select-none" aria-hidden="true">+</span>
              <span className="absolute -bottom-3 -left-3 text-ink-300 font-mono text-sm pointer-events-none select-none" aria-hidden="true">+</span>
              <span className="absolute -bottom-3 -right-3 text-ink-300 font-mono text-sm pointer-events-none select-none" aria-hidden="true">+</span>
              <div className="mb-2">
                <BlueprintDimensionLine label="MODEL 3D HERO CANVAS (SLOT)" />
              </div>
              <div
                id="hero-3d-model-container"
                className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square rounded-3xl border border-ink-150 bg-gradient-to-br from-white via-ink-100 to-cream shadow-sm overflow-hidden flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[radial-gradient(#8B1A2F_1px,transparent_1px)] [background-size:16px_16px]" aria-hidden="true" />
                <div className="pointer-events-none absolute w-64 h-64 rounded-full bg-gradient-to-tr from-primary/10 via-accent/15 to-transparent blur-2xl" aria-hidden="true" />
                <div className="relative z-10 flex flex-col items-center justify-center space-y-3 max-w-xs">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-2xl border border-dashed border-primary/30 animate-[spin_12s_linear_infinite]" aria-hidden="true" />
                    <div className="absolute inset-2 rounded-full border border-ink-150 animate-[spin_8s_linear_infinite_reverse]" aria-hidden="true" />
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/30">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-accent" aria-hidden="true">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  {/* span bukan heading — label placeholder */}
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider bg-primary/10 text-primary border border-primary/20">
                    3D Model Slot
                  </span>
                  <p className="text-sm text-ink-600 leading-relaxed">
                    Area untuk model 3D interaktif — keputusan aset ditunda sesuai rapat tim.
                  </p>
                </div>
                <div className="absolute bottom-3 left-4 text-xs font-mono text-ink-300 select-none" aria-hidden="true">
                  SEC-01 // HERO_MODEL_RIGHT
                </div>
              </div>
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
