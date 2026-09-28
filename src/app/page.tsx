"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
    badge: "Laboratorium",
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
    badge: "Web App",
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
    badge: "Web & IoT",
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
    badge: "UI/UX",
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
    badge: "Riset Kimia",
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
  const [activeNav, setActiveNav] = useState("Beranda");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [activeProjectIndex, setActiveProjectIndex] = useState(2); // Center card (EcoSync) by default
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    setActiveProjectIndex((prev) =>
      prev === 0 ? GALLERY_PROJECTS.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setActiveProjectIndex((prev) =>
      prev === GALLERY_PROJECTS.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafc] text-zinc-900 font-sans selection:bg-[#90133b] selection:text-white relative">
      {/* ---------------- UNIFIED FLOATING PILL NAVBAR (AS IN REFERENCE) ---------------- */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-4xl transition-all duration-300">
        <div className="bg-white/90 backdrop-blur-xl border border-zinc-200/80 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.08)] rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between">
          {/* Left: Brand Icon & Navigation Links */}
          <div className="flex items-center gap-6 sm:gap-8">
            {/* Logo Brand Icon & Title (Minimalist & Elegant) */}
            <a href="#" className="flex items-center gap-1 group">
              <div className="w-8 h-8 relative rounded-full overflow-hidden shadow-xs ring-1 ring-zinc-900/5 transition-transform duration-200 group-hover:scale-105 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Kandaga Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="inline-flex items-center select-none -ml-0.5 bg-gradient-to-r from-zinc-950 via-[#4e0e20] to-[#a61743] bg-clip-text text-transparent group-hover:from-zinc-900 group-hover:to-[#b81d4a] transition-all duration-300">
                <span className="font-tangerine font-bold text-3xl leading-none inline-block -translate-y-[1px]">
                  K
                </span>
                <span className="font-extrabold text-[15px] tracking-tight -ml-0.5">
                  andaga
                </span>
              </span>
            </a>

            {/* Nav Links with Dropdowns (Developers ∨, Pricing ∨, About) */}
            <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-zinc-600">
              {/* 1. Jurusan Kami Dropdown (Sitemap) */}
              <div
                className="relative"
                onMouseEnter={() => setOpenDropdown("jurusan")}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  onClick={() => {
                    document
                      .getElementById("galeri-section")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center gap-1.5 hover:text-zinc-950 transition cursor-pointer py-1"
                >
                  <span>Jurusan Kami</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {openDropdown === "jurusan" && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-xl border border-zinc-100 rounded-2xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      onClick={() => {
                        setActiveFilter("RPL");
                        document
                          .getElementById("galeri-section")
                          ?.scrollIntoView({ behavior: "smooth" });
                        setOpenDropdown(null);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-[#90133b] transition cursor-pointer"
                    >
                      Rekayasa Perangkat Lunak
                    </button>
                    <button
                      onClick={() => {
                        setActiveFilter("TKJ");
                        document
                          .getElementById("galeri-section")
                          ?.scrollIntoView({ behavior: "smooth" });
                        setOpenDropdown(null);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-[#90133b] transition cursor-pointer"
                    >
                      Teknik Komputer Jaringan
                    </button>
                    <button
                      onClick={() => {
                        setActiveFilter("Analis Kimia");
                        document
                          .getElementById("galeri-section")
                          ?.scrollIntoView({ behavior: "smooth" });
                        setOpenDropdown(null);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-[#90133b] transition cursor-pointer"
                    >
                      Analis Kimia
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Tentang Kami (Sitemap) */}
              <button
                onClick={() => {
                  document
                    .getElementById("tentang-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="hover:text-zinc-950 transition cursor-pointer py-1"
              >
                Tentang Kami
              </button>

              {/* 3. Galeri Karya (Sitemap) */}
              <button
                onClick={() => {
                  document
                    .getElementById("galeri-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="hover:text-zinc-950 transition cursor-pointer py-1"
              >
                Galeri Karya
              </button>

              {/* 4. Kontak (Sitemap) */}
              <button
                onClick={() => {
                  document
                    .getElementById("kontak-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="hover:text-zinc-950 transition cursor-pointer py-1"
              >
                Kontak
              </button>
            </nav>
          </div>

          {/* Right Action: Register + Login Pill Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/register"
              className="hidden sm:inline-block text-xs sm:text-sm font-semibold text-zinc-600 hover:text-[#90133b] transition cursor-pointer px-3 py-1.5"
            >
              Daftar Akun
            </Link>

            <Link
              href="/login"
              className="bg-gradient-to-r from-[#891337] to-[#a61743] hover:from-[#76102f] hover:to-[#92143b] text-white px-5 sm:px-6 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-200 shadow-md shadow-[#891337]/25 hover:shadow-lg hover:shadow-[#891337]/35 cursor-pointer active:scale-95"
            >
              Masuk
            </Link>

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-zinc-700 hover:text-black rounded-full cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 bg-white/95 backdrop-blur-xl border border-zinc-200/80 rounded-3xl p-4 shadow-xl space-y-2 animate-in fade-in duration-200">
            {["Jurusan Kami", "Tentang Kami", "Galeri Karya", "Kontak"].map(
              (item) => (
                <button
                  key={item}
                  onClick={() => {
                    setActiveNav(item);
                    setIsMobileMenuOpen(false);
                    if (item === "Jurusan Kami" || item === "Galeri Karya") {
                      document
                        .getElementById("galeri-section")
                        ?.scrollIntoView({ behavior: "smooth" });
                    } else if (item === "Tentang Kami") {
                      document
                        .getElementById("tentang-section")
                        ?.scrollIntoView({ behavior: "smooth" });
                    } else if (item === "Kontak") {
                      document
                        .getElementById("kontak-section")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeNav === item
                      ? "bg-gradient-to-r from-[#891337] to-[#a61743] text-white"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {item}
                </button>
              )
            )}
            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between px-2">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xs font-bold text-zinc-700 hover:text-zinc-950"
              >
                Mitra Perusahaan
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLoginModalOpen(true);
                }}
                className="bg-[#90133b] text-white px-5 py-1.5 rounded-full text-xs font-bold"
              >
                Masuk
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- SECTION PALING ATAS (DIKOSONGKAN DENGAN RAPIH) ---------------- */}
      <section className="relative w-full bg-white pt-28 sm:pt-32 pb-8 overflow-hidden select-none">
        {/* Area bagian atas telah dikosongkan dengan rapih */}
      </section>

      {/* ---------------- GALERI SECTION ---------------- */}
      <section
        id="galeri-section"
        className="py-16 md:py-24 relative bg-white border-t border-zinc-100"
      >
        {/* Subtle decorative dot accents */}
        <div className="hidden lg:flex flex-col gap-3 absolute left-6 top-32 text-pink-400/70 pointer-events-none select-none">
          <span className="w-2 h-2 rounded-full bg-pink-300 shadow-xs" />
          <span className="w-2 h-2 rounded-full bg-pink-300 shadow-xs" />
          <span className="w-2 h-2 rounded-full bg-pink-300 shadow-xs" />
        </div>
        <div className="hidden lg:flex flex-col gap-3 absolute right-6 top-32 text-pink-400/70 pointer-events-none select-none">
          <span className="w-2 h-2 rounded-full bg-pink-300 shadow-xs" />
          <span className="w-2 h-2 rounded-full bg-pink-300 shadow-xs" />
          <span className="w-2 h-2 rounded-full bg-pink-300 shadow-xs" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="mb-10">

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight">
              Temukan karya yang bicara.
            </h2>
            {/* Red accent line with modern soft gradient */}
            <div className="w-16 h-1 bg-gradient-to-r from-[#90133b] to-rose-400 mt-3 mb-4 rounded-full" />
            <p className="text-zinc-600 max-w-2xl text-sm sm:text-base leading-relaxed">
              Jelajahi koleksi karya terbaik dari siswa-siswi SMKN 13 Bandung.
              Mulai dari aplikasi, desain, hingga riset laboratorium.
            </p>
          </div>

          {/* Filter Pills with modern styling */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-12">
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

          {/* 3D Curved Showcase / Interactive Perspective Carousel */}
          <div className="relative py-4">
            {/* Carousel navigation controls */}
            <button
              onClick={handlePrev}
              className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/95 backdrop-blur-md border border-zinc-200 shadow-xl text-zinc-700 hover:text-black hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
              aria-label="Previous Project"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/95 backdrop-blur-md border border-zinc-200 shadow-xl text-zinc-700 hover:text-black hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
              aria-label="Next Project"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Project Cards Display */}
            <div className="flex items-center justify-center gap-3 sm:gap-5 md:gap-7 overflow-hidden px-4 py-8">
              {GALLERY_PROJECTS.map((item, index) => {
                const isCurrent = index === activeProjectIndex;
                const isNeighbor =
                  Math.abs(index - activeProjectIndex) === 1 ||
                  (activeProjectIndex === 0 &&
                    index === GALLERY_PROJECTS.length - 1) ||
                  (activeProjectIndex === GALLERY_PROJECTS.length - 1 &&
                    index === 0);

                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveProjectIndex(index)}
                    className={`relative rounded-3xl overflow-hidden transition-all duration-500 ease-out cursor-pointer ${
                      isCurrent
                        ? "w-[300px] sm:w-[400px] md:w-[470px] h-[230px] sm:h-[290px] md:h-[330px] z-20 scale-105 shadow-[0_25px_60px_-15px_rgba(144,19,59,0.25)] ring-2 ring-[#90133b]/25"
                        : isNeighbor
                        ? "w-[200px] sm:w-[270px] md:w-[310px] h-[190px] sm:h-[240px] md:h-[270px] z-10 scale-95 opacity-80 hover:opacity-100 shadow-lg hidden sm:block filter brightness-95"
                        : "w-[160px] sm:w-[210px] h-[160px] sm:h-[200px] z-0 scale-90 opacity-40 hover:opacity-70 shadow-sm hidden lg:block filter brightness-90"
                    }`}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover object-center"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Category pill badge on top right with modern frosted glass */}
                    <div className="absolute top-4 right-4 z-10">
                      <span className="bg-black/45 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-3.5 py-1 rounded-full shadow-xs uppercase tracking-wider">
                        {item.badge}
                      </span>
                    </div>

                    {/* Active Card Bottom Highlight Pill */}
                    {isCurrent && (
                      <div className="absolute bottom-4 left-4 right-4 z-10">
                        <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-md border border-white/40">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#90133b] block">
                            {item.category} • {item.tag}
                          </span>
                          <span className="text-xs font-bold text-zinc-900 truncate block mt-0.5">
                            {item.title}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Carousel Dot Indicators */}
            <div className="flex items-center justify-center gap-2 mt-2">
              {GALLERY_PROJECTS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveProjectIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    i === activeProjectIndex
                      ? "w-8 bg-[#90133b]"
                      : "w-2 bg-zinc-300 hover:bg-zinc-400"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Project Details Below Carousel (Image 3 Modernized) */}
          <div className="mt-8 text-center max-w-2xl mx-auto px-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {selectedProject.title}
            </h3>
            <p className="mt-4 text-sm sm:text-base text-zinc-600 leading-relaxed">
              {selectedProject.description}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
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
      <section id="tentang-section" className="py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-b from-[#111318] via-[#0b0c10] to-[#07080a] text-white rounded-3xl p-8 sm:p-12 md:p-16 border border-zinc-800/80 relative overflow-hidden shadow-2xl">
            {/* Ambient Background Glow inside dark container */}
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#e11d48]/15 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#90133b]/20 blur-3xl rounded-full pointer-events-none" />

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
                <div className="grid grid-cols-2 border-t border-l border-zinc-800/90 rounded-2xl overflow-hidden bg-zinc-950/40 backdrop-blur-xs">
                  {/* Stat 1 */}
                  <div className="p-6 sm:p-8 border-r border-b border-zinc-800/90 hover:bg-zinc-800/30 transition duration-300">
                    <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                      247+
                    </div>
                    <div className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold mt-2.5">
                      KARYA TERVERIFIKASI
                    </div>
                  </div>

                  {/* Stat 2 */}
                  <div className="p-6 sm:p-8 border-r border-b border-zinc-800/90 hover:bg-zinc-800/30 transition duration-300">
                    <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                      18
                    </div>
                    <div className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold mt-2.5">
                      JURUSAN AKTIF
                    </div>
                  </div>

                  {/* Stat 3 */}
                  <div className="p-6 sm:p-8 border-r border-b border-zinc-800/90 hover:bg-zinc-800/30 transition duration-300">
                    <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                      3×
                    </div>
                    <div className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold mt-2.5">
                      PENGHARGAAN NASIONAL
                    </div>
                  </div>

                  {/* Stat 4 */}
                  <div className="p-6 sm:p-8 border-r border-b border-zinc-800/90 hover:bg-zinc-800/30 transition duration-300">
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
            <div className="group bg-[#fbf9f5] border border-[#ede9e1] rounded-3xl p-8 hover:border-[#d6c7b0] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-white/80 border border-zinc-200/70 text-zinc-500">
                    01
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Valid
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-100 shadow-xs flex items-center justify-center text-zinc-900 mb-6 group-hover:scale-110 group-hover:text-[#90133b] transition-all duration-300">
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
            <div className="group bg-[#fbf9f5] border border-[#ede9e1] rounded-3xl p-8 hover:border-[#d6c7b0] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-white/80 border border-zinc-200/70 text-zinc-500">
                    03
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                    Kolaborasi
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-100 shadow-xs flex items-center justify-center text-zinc-900 mb-6 group-hover:scale-110 group-hover:text-[#90133b] transition-all duration-300">
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
            <div className="group bg-[#fbf9f5] border border-[#ede9e1] rounded-3xl p-8 hover:border-[#d6c7b0] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-white/80 border border-zinc-200/70 text-zinc-500">
                    02
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    Kemitraan
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-100 shadow-xs flex items-center justify-center text-zinc-900 mb-6 group-hover:scale-110 group-hover:text-[#90133b] transition-all duration-300">
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
        className="bg-gradient-to-r from-[#7a0f30] via-[#90133b] to-[#6a0c27] text-white py-12 px-4 sm:px-6 relative overflow-hidden"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

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

            <div className="space-y-4">
              <Link
                href="/login"
                className="block text-center w-full bg-gradient-to-r from-[#891337] to-[#a61743] hover:from-[#76102f] hover:to-[#92143b] text-white py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-md shadow-[#891337]/30 cursor-pointer active:scale-95"
              >
                Masuk ke Portal Kandaga
              </Link>
              
              <Link
                href="/register"
                className="block text-center w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all border border-zinc-200 cursor-pointer"
              >
                Daftar Akun Baru (5 Roles)
              </Link>
            </div>
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
