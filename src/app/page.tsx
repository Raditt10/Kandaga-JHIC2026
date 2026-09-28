"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import {
  Check,
  Circle,
  Diamond,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Award,
  Layers,
  Building2,
  GraduationCap,
} from "lucide-react";

interface ProjectItem {
  id: number;
  title: string;
  category: "RPL" | "TKJ" | "Analis Kimia";
  tag: string;
  badge: string;
  imageUrl: string;
  description: string;
  creator: string;
  classYear: string;
  highlight: string;
}

const GALLERY_PROJECTS: ProjectItem[] = [
  {
    id: 1,
    title: "Sistem Ekstraksi Senyawa Alami & Uji Lab Kimia",
    category: "Analis Kimia",
    tag: "Terbaru",
    badge: "lab",
    imageUrl:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=85",
    description:
      "Penelitian formulasi indikator asam-basa alami berbasis antosianin serta pemantauan konsentrasi larutan dengan standar ISO laboratorium SMKN 13 Bandung.",
    creator: "Tim Riset Kimia Terapan",
    classYear: "Kelas XII Analis Kimia",
    highlight: "Akurasi 99.2% pada uji titrasi komparatif",
  },
  {
    id: 2,
    title: "EduClass - Sistem Manajemen Pembelajaran Terpadu",
    category: "RPL",
    tag: "Populer",
    badge: "web",
    imageUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=85",
    description:
      "Platform portal akademik responsif dengan sistem presensi QR cerdas, repositori modul pembelajaran, dan analitik performa belajar siswa secara real-time.",
    creator: "Kelompok 4 RPL",
    classYear: "Kelas XII RPL 1",
    highlight: "Digunakan aktif oleh 1,200+ siswa & guru",
  },
  {
    id: 3,
    title: "EcoSync - Smart IoT Green Energy Monitoring",
    category: "TKJ",
    tag: "Terbaru",
    badge: "web",
    imageUrl:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=85",
    description:
      "Perangkat IoT berbasis mikrokontroler ESP32 terintegrasi dashboard cloud untuk monitoring efisiensi energi terbarukan, suhu, dan kelembapan di lingkungan sekolah.",
    creator: "Inovasi IoT SMKN 13",
    classYear: "Kelas XII TKJ 2",
    highlight: "Monitoring sensor akurat dengan latency < 300ms",
  },
  {
    id: 4,
    title: "Kandaga UI - Design System & Portofolio Siswa",
    category: "RPL",
    tag: "Populer",
    badge: "ui/ux",
    imageUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=85",
    description:
      "Antarmuka etalase digital terstandarisasi untuk memamerkan proyek unggulan karya siswa dengan navigasi interaktif dan akses kurasi industri.",
    creator: "Creative Tech Club",
    classYear: "Kelas XI & XII RPL",
    highlight: "Desain modular dengan komponen Tailwind siap pakai",
  },
  {
    id: 5,
    title: "Analisis Mikroorganisme & Kualitas Air Baku",
    category: "Analis Kimia",
    tag: "Terbaru",
    badge: "kimia",
    imageUrl:
      "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1000&q=85",
    description:
      "Riset mikroskopis komparatif untuk menguji kelayakan dan kemurnian sumber air lingkungan sekitar dengan metode spektrofotometri dan filtrasi bertingkat.",
    creator: "Laboratorium Mikrobiologi",
    classYear: "Kelas XIII Kimia Industri",
    highlight: "Lolos kurasi riset sains terapan tingkat regional",
  },
];

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [activeProjectIndex, setActiveProjectIndex] = useState(2); // Center card (EcoSync) by default
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const isTransitioningRef = useRef(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const filterOptions = [
    "Semua",
    "RPL",
    "TKJ",
    "Analis Kimia",
    "Terbaru",
    "Populer",
  ];

  const selectedProject = GALLERY_PROJECTS[activeProjectIndex];

  const handlePrev = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 280);
    setDirection("prev");
    setActiveProjectIndex((prev) =>
      prev === 0 ? GALLERY_PROJECTS.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 280);
    setDirection("next");
    setActiveProjectIndex((prev) =>
      prev === GALLERY_PROJECTS.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafc] text-zinc-900 font-sans selection:bg-[#90133b] selection:text-white relative overflow-x-clip">
      {/* ---------------- MODULAR FLOATING NAVBAR ---------------- */}
      <Navbar
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onSelectCategory={(category) => {
          setActiveFilter(category);
          const matched = GALLERY_PROJECTS.findIndex((p) => p.category === category);
          if (matched !== -1) setActiveProjectIndex(matched);
        }}
      />

      {/* ---------------- SECTION PALING ATAS (DIKOSONGKAN DENGAN RAPIH) ---------------- */}
      <section className="relative w-full bg-white pt-28 sm:pt-32 pb-8 overflow-hidden select-none">
        {/* Area bagian atas telah dikosongkan dengan rapih */}
      </section>

      {/* ---------------- GALERI SECTION ---------------- */}
      <section
        id="galeri-section"
        className="py-16 md:py-24 relative bg-white border-t border-zinc-100"
      >

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="mb-10 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">
              Temukan karya yang bicara.
            </h2>
            <p className="text-zinc-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed mt-2.5">
              Jelajahi koleksi karya terbaik dari siswa-siswi SMKN 13 Bandung.
              Mulai dari aplikasi, desain, hingga riset laboratorium.
            </p>
          </div>

          {/* Filter Row with Minimalist "Selengkapnya ->" on Top Right */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {filterOptions.map((filter) => {
                const isSelected = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => {
                      setActiveFilter(filter);
                      // Match a project from filtered if current doesn't match
                      const matched = GALLERY_PROJECTS.findIndex((p) => {
                        if (filter === "Semua") return true;
                        if (filter === "RPL") return p.category === "RPL";
                        if (filter === "TKJ") return p.category === "TKJ";
                        if (filter === "Analis Kimia")
                          return p.category === "Analis Kimia";
                        if (filter === "Terbaru") return p.tag === "Terbaru";
                        if (filter === "Populer") return p.tag === "Populer";
                        return true;
                      });
                      if (matched !== -1) setActiveProjectIndex(matched);
                    }}
                    className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-[#891337] to-[#a61743] text-white shadow-md shadow-[#891337]/25 scale-105"
                        : "bg-zinc-50 text-zinc-700 border border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-100/80"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            {/* Minimalist "Selengkapnya ->" Button */}
            <button
              onClick={() => setIsDetailModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-600 hover:text-[#90133b] transition group cursor-pointer self-start sm:self-auto py-1"
            >
              <span>Selengkapnya</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#90133b] transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>

          {/* 3D Curved Showcase / Interactive Perspective Carousel (No boundary clipping, fully visible cards) */}
          <div
            className="relative w-full h-[260px] sm:h-[330px] md:h-[380px] lg:h-[420px] my-6 flex items-center justify-center select-none"
          >
            {/* Carousel navigation controls */}
            <button
              onClick={handlePrev}
              className="absolute left-1 sm:-left-3 md:-left-5 top-1/2 -translate-y-1/2 z-40 p-2.5 sm:p-3 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200/90 shadow-sm text-zinc-700 hover:text-black transition-colors duration-150 cursor-pointer"
              aria-label="Previous Project"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-1 sm:-right-3 md:-right-5 top-1/2 -translate-y-1/2 z-40 p-2.5 sm:p-3 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200/90 shadow-sm text-zinc-700 hover:text-black transition-colors duration-150 cursor-pointer"
              aria-label="Next Project"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Project Cards Display (Hardware-accelerated fan coverflow - zero wrap-around collisions) */}
            {GALLERY_PROJECTS.map((item, index) => {
              const total = GALLERY_PROJECTS.length;
              let offset = (index - activeProjectIndex + total) % total;
              if (offset > total / 2) offset -= total;

              const isCenter = offset === 0;
              const isWrapping =
                (offset === 2 && direction === "next") ||
                (offset === -2 && direction === "prev");

              // Ultra-fast GPU-only transition (Zero reflow, pure 2D affine GPU quad composition, instant wrap snap)
              let style: React.CSSProperties = {
                position: "absolute",
                top: "50%",
                left: "50%",
                transformOrigin: "center center",
                transition: isWrapping
                  ? "opacity 200ms ease-out"
                  : "transform 260ms cubic-bezier(0.25, 1, 0.5, 1), opacity 260ms ease-out",
                willChange: "transform",
              };

              if (offset === 0) {
                style = {
                  ...style,
                  transform: "translate3d(-50%, -50%, 0) rotate(0deg) scale(1)",
                  zIndex: 30,
                  opacity: 1,
                };
              } else if (offset === -1) {
                style = {
                  ...style,
                  transform: "translate3d(-88%, -48%, 0) rotate(-4.5deg) scale(0.9)",
                  zIndex: 20,
                  opacity: 0.95,
                };
              } else if (offset === 1) {
                style = {
                  ...style,
                  transform: "translate3d(-12%, -48%, 0) rotate(4.5deg) scale(0.9)",
                  zIndex: 20,
                  opacity: 0.95,
                };
              } else if (offset === -2) {
                style = {
                  ...style,
                  transform: "translate3d(-122%, -45%, 0) rotate(-8deg) scale(0.8)",
                  zIndex: 10,
                  opacity: isWrapping ? 0 : 0.88,
                };
              } else if (offset === 2) {
                style = {
                  ...style,
                  transform: "translate3d(22%, -45%, 0) rotate(8deg) scale(0.8)",
                  zIndex: 10,
                  opacity: isWrapping ? 0 : 0.88,
                };
              } else {
                style = {
                  ...style,
                  transform: "translate3d(-50%, -50%, 0) scale(0.5)",
                  zIndex: 0,
                  opacity: 0,
                  pointerEvents: "none",
                };
              }

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isCenter) {
                      setIsDetailModalOpen(true);
                    } else {
                      if (isTransitioningRef.current) return;
                      isTransitioningRef.current = true;
                      setTimeout(() => {
                        isTransitioningRef.current = false;
                      }, 280);
                      setDirection(offset > 0 ? "next" : "prev");
                      setActiveProjectIndex(index);
                    }
                  }}
                  style={style}
                  className={`w-[270px] sm:w-[350px] md:w-[410px] lg:w-[460px] h-[180px] sm:h-[235px] md:h-[275px] lg:h-[310px] rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.25rem] overflow-hidden select-none cursor-pointer shadow-md shadow-zinc-900/10 border-2 transition-colors duration-150 transform-gpu ${
                    isCenter
                      ? "border-dashed border-[#90133b]"
                      : "border-solid border-zinc-200/70"
                  } ${Math.abs(offset) > 1 ? "hidden sm:block" : ""}`}
                >
                  <div className="relative w-full h-full bg-zinc-200">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 270px, (max-width: 1024px) 410px, 460px"
                      priority
                      className="object-cover object-center pointer-events-none"
                    />

                    {/* Judul & Kategori Karya pada Card (Solid background, zero blur lag, zero layout reflow) */}
                    <div
                      className={`absolute inset-x-0 bottom-0 z-20 pointer-events-none text-left bg-white px-4 py-2.5 sm:px-5 sm:py-3 border-t-2 transition-colors duration-200 ${
                        isCenter
                          ? "border-dashed border-[#90133b]"
                          : "border-solid border-zinc-200/80"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${
                            isCenter ? "text-[#90133b]" : "text-[#90133b]/80"
                          }`}
                        >
                          {item.category}
                        </span>
                        <span className="text-zinc-400 text-[10px]">•</span>
                        <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-zinc-500">
                          {item.tag}
                        </span>
                      </div>
                      <h3
                        className={`font-bold truncate tracking-tight text-xs sm:text-sm md:text-base transition-colors duration-200 ${
                          isCenter ? "text-zinc-900" : "text-zinc-800"
                        }`}
                      >
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Dot Indicators */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {GALLERY_PROJECTS.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (i === activeProjectIndex || isTransitioningRef.current) return;
                  isTransitioningRef.current = true;
                  setTimeout(() => {
                    isTransitioningRef.current = false;
                  }, 280);
                  setDirection(i > activeProjectIndex ? "next" : "prev");
                  setActiveProjectIndex(i);
                }}
                className={`h-2 rounded-full transition-[width,background-color] duration-200 ease-out cursor-pointer ${
                  i === activeProjectIndex
                    ? "w-8 bg-[#90133b]"
                    : "w-2 bg-zinc-300 hover:bg-zinc-400"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Deskripsi Karya (Teks Kecil) - Min-height prevents document layout shift */}
          <div className="mt-6 text-center max-w-2xl mx-auto px-4 min-h-[48px]">
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
              {selectedProject.description}
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setIsDetailModalOpen(true)}
                className="group inline-flex items-center gap-2 text-sm font-bold text-zinc-900 hover:text-[#90133b] transition cursor-pointer"
              >
                <span>Lihat Selengkapnya</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-[#90133b]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- TENTANG KARYA & STATS SECTION (IMAGE 4) ---------------- */}
      <section
        id="tentang-section"
        style={{ contentVisibility: "auto", containIntrinsicSize: "0 500px" }}
        className="py-12 px-4 sm:px-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-b from-[#111318] via-[#0b0c10] to-[#07080a] text-white rounded-3xl p-8 sm:p-12 md:p-16 border border-zinc-800/80 relative overflow-hidden shadow-2xl">
            {/* Ambient Background Glow inside dark container (Zero-lag radial gradients) */}
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-[radial-gradient(circle,rgba(225,29,72,0.18)_0%,transparent_70%)] pointer-events-none transform-gpu" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[radial-gradient(circle,rgba(144,19,59,0.22)_0%,transparent_70%)] pointer-events-none transform-gpu" />

            {/* Top red label indicator */}
            <div className="flex items-center gap-2 text-[#e11d48] text-xs font-bold tracking-widest uppercase mb-8">
              <span className="w-6 h-0.5 bg-[#e11d48]" />
              <span>TENTANG KARYA</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
              {/* Left Column: Heading & Paragraphs */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none">
                    Lebih dari
                  </h2>
                  <span className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-[#ff3366] to-[#e11d48] bg-clip-text text-transparent tracking-tight block mt-1">
                    sekadar tugas.
                  </span>
                </div>

                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                  Setiap proyek adalah hasil ketrampilan siswa SMKN 13 Bandung
                  dalam menciptakan inovasi yang solutif. Dibangun atas fondasi
                  kompetensi dan integritas.
                </p>

                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                  Karya ini membuktikan bahwa generasi muda siap beradaptasi
                  dengan dinamika industri — dan siap memberikan dampak positif
                  bagi masyarakat.
                </p>
              </div>

              {/* Right Column: 2x2 Stats Grid with modern dividers & hover card */}
              <div className="lg:col-span-6">
                <div className="grid grid-cols-2 border-t border-l border-zinc-800/90 rounded-2xl overflow-hidden bg-zinc-950/70">
                  {/* Stat 1 */}
                  <div className="p-6 sm:p-8 border-r border-b border-zinc-800/90 hover:bg-zinc-800/30 transition-colors duration-150">
                    <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                      247+
                    </div>
                    <div className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold mt-2.5">
                      KARYA TERVERIFIKASI
                    </div>
                  </div>

                  {/* Stat 2 */}
                  <div className="p-6 sm:p-8 border-r border-b border-zinc-800/90 hover:bg-zinc-800/30 transition-colors duration-150">
                    <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                      18
                    </div>
                    <div className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold mt-2.5">
                      JURUSAN AKTIF
                    </div>
                  </div>

                  {/* Stat 3 */}
                  <div className="p-6 sm:p-8 border-r border-b border-zinc-800/90 hover:bg-zinc-800/30 transition-colors duration-150">
                    <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                      3×
                    </div>
                    <div className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold mt-2.5">
                      PENGHARGAAN NASIONAL
                    </div>
                  </div>

                  {/* Stat 4 */}
                  <div className="p-6 sm:p-8 border-r border-b border-zinc-800/90 hover:bg-zinc-800/30 transition-colors duration-150">
                    <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                      40+
                    </div>
                    <div className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold mt-2.5">
                      MITRA INDUSTRI
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- KEUNGGULAN SECTION (IMAGE 5) ---------------- */}
      <section
        id="keunggulan-section"
        style={{ contentVisibility: "auto", containIntrinsicSize: "0 500px" }}
        className="py-16 md:py-24 bg-white relative border-t border-zinc-100"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="relative mb-12">
            <div className="flex items-center gap-2 text-[#e11d48] text-xs font-bold tracking-widest uppercase mb-3">
              <span className="w-6 h-0.5 bg-[#e11d48]" />
              <span>KEUNGGULAN</span>
            </div>

            <div className="flex items-start justify-between">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-tight">
                Kenapa Harus
                <br />
                Kandaga?
              </h2>

              {/* Accent subtle dot on right */}
              <span className="w-2.5 h-2.5 rounded-full bg-pink-400 mt-2 hidden sm:block" />
            </div>
          </div>

          {/* 3 Modern Keunggulan Bento Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 01 */}
            <div className="group bg-[#fbf9f5] border border-[#ede9e1] rounded-3xl p-8 hover:border-[#d6c7b0] hover:shadow-xl hover:-translate-y-1 transition-transform duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-white/80 border border-zinc-200/70 text-zinc-500">
                    01
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Valid
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-100 shadow-xs flex items-center justify-center text-zinc-900 mb-6 group-hover:scale-110 group-hover:text-[#90133b] transition-transform duration-200">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight">
                  Terverifikasi Sekolah
                </h3>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  Karya yang ditampilkan telah diverifikasi oleh tim kurasi
                  sekolah dan memenuhi standar kualitas kejuruan yang ditetapkan.
                </p>
              </div>
            </div>

            {/* Card 03 (Middle as shown in reference) */}
            <div className="group bg-[#fbf9f5] border border-[#ede9e1] rounded-3xl p-8 hover:border-[#d6c7b0] hover:shadow-xl hover:-translate-y-1 transition-transform duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-white/80 border border-zinc-200/70 text-zinc-500">
                    03
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                    Kolaborasi
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-100 shadow-xs flex items-center justify-center text-zinc-900 mb-6 group-hover:scale-110 group-hover:text-[#90133b] transition-transform duration-200">
                  <Circle className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight">
                  Komunitas Kreatif
                </h3>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  Platform untuk siswa menemukan karya, berbagi pengalaman riset,
                  dan tumbuh bersama dalam ekosistem inovasi lintas jurusan.
                </p>
              </div>
            </div>

            {/* Card 02 (Right as shown in reference) */}
            <div className="group bg-[#fbf9f5] border border-[#ede9e1] rounded-3xl p-8 hover:border-[#d6c7b0] hover:shadow-xl hover:-translate-y-1 transition-transform duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-white/80 border border-zinc-200/70 text-zinc-500">
                    02
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    Kemitraan
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-100 shadow-xs flex items-center justify-center text-zinc-900 mb-6 group-hover:scale-110 group-hover:text-[#90133b] transition-transform duration-200">
                  <Diamond className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3 tracking-tight">
                  Terbuka untuk Industri
                </h3>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  Karya kami siap diakses langsung oleh industri dan mitra untuk
                  kerja sama, kolaborasi riset, serta rekrutmen talenta muda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FOOTER MODERN ACCENT BANNER (IMAGE 5) ---------------- */}
      <footer
        id="kontak-section"
        style={{ contentVisibility: "auto", containIntrinsicSize: "0 300px" }}
        className="bg-gradient-to-r from-[#7a0f30] via-[#90133b] to-[#6a0c27] text-white py-12 px-4 sm:px-6 relative overflow-hidden"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_70%)] pointer-events-none transform-gpu" />

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 relative bg-white rounded-full p-1.5 shadow-md shrink-0">
              <Image
                src="/logo.png"
                alt="Kandaga Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold tracking-widest text-base uppercase block">
                KANDAGA
              </span>
              <span className="text-xs text-rose-200 font-medium">
                Major Gallery • SMKN 13 Bandung
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-rose-100">
            <a
              href="#galeri-section"
              className="hover:text-white transition cursor-pointer"
            >
              Galeri Karya
            </a>
            <a
              href="#tentang-section"
              className="hover:text-white transition cursor-pointer"
            >
              Tentang Kami
            </a>
            <a
              href="#keunggulan-section"
              className="hover:text-white transition cursor-pointer"
            >
              Keunggulan
            </a>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="hover:text-white transition cursor-pointer"
            >
              Portal Masuk
            </button>
          </div>

          <div className="text-xs text-rose-200 text-center md:text-right">
            <p className="font-medium">
              © {new Date().getFullYear()} SMKN 13 Bandung. Hak cipta dilindungi.
            </p>
            <p className="text-[11px] text-rose-300 mt-1">
              Membangun Inovasi, Menginspirasi Industri.
            </p>
          </div>
        </div>
      </footer>

      {/* ---------------- LOGIN MODAL ---------------- */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-zinc-100">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-black p-1.5 rounded-full hover:bg-zinc-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 relative mx-auto mb-3">
                <Image
                  src="/logo.png"
                  alt="Kandaga Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <h4 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                Masuk ke Kandaga
              </h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                Akses portal karya siswa dan kurasi industri SMKN 13 Bandung
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsLoginModalOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Email / NISN
                </label>
                <input
                  type="text"
                  placeholder="Masukkan email atau NISN"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#90133b] transition bg-zinc-50/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#90133b] transition bg-zinc-50/50"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#891337] to-[#a61743] hover:from-[#76102f] hover:to-[#92143b] text-white py-3 rounded-xl text-sm font-bold tracking-wide transition-all shadow-md shadow-[#891337]/30 cursor-pointer active:scale-95"
              >
                Masuk
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- PROJECT DETAIL MODAL ---------------- */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative border border-zinc-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-black p-1.5 rounded-full hover:bg-zinc-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative w-full h-60 rounded-2xl overflow-hidden mb-6 shadow-md">
              <Image
                src={selectedProject.imageUrl}
                alt={selectedProject.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                {selectedProject.badge}
              </span>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider block">
                  {selectedProject.highlight}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-[#90133b] uppercase tracking-wider mb-2">
              <span>{selectedProject.category}</span>
              <span>•</span>
              <span>{selectedProject.tag}</span>
            </div>

            <h4 className="text-2xl font-extrabold text-zinc-900 mb-3 tracking-tight">
              {selectedProject.title}
            </h4>

            <p className="text-sm text-zinc-600 leading-relaxed mb-6">
              {selectedProject.description}
            </p>

            <div className="border-t border-zinc-100 pt-5 flex items-center justify-between text-xs text-zinc-500">
              <div>
                <span className="block font-bold text-zinc-900 text-sm">
                  {selectedProject.creator}
                </span>
                <span className="text-zinc-500">{selectedProject.classYear}</span>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="bg-gradient-to-r from-[#891337] to-[#a61743] text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-md transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
