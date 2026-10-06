"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";

const DETAIL_TABS = [
  { id: "aktivitas", label: "Hal yang Akan Dilakukan" },
  { id: "fasilitas", label: "Fasilitas & Lab Industri" },
  { id: "karir", label: "Peluang Karir & Alumni" },
] as const;

type DetailTabId = (typeof DETAIL_TABS)[number]["id"];
import {
  Code2,
  Network,
  FlaskConical,
  Award,
  Clock,
  Sparkles,
  ShieldCheck,
  Activity, 
  Lock,
  Zap,
  Briefcase,
  CheckCircle2,
  Search,
  ArrowRight,
  Layers,
  Building2,
  ExternalLink,
  BookOpen,
  MapPin,
  Target,
  Cloud,
  Cpu,
  Lightbulb,
  Monitor,
  Palette,
  Server,
  Database,
  Smartphone,
  Binary,
  Scale,
  Dna,
  ShieldAlert,
  Droplets,
  Pipette,
  Atom,
} from "lucide-react";
import { JurusanDetail } from "@/data/jurusanData";

// Curriculum subject icon resolver helper
function CurriculumSubjectIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "BookOpen": return <BookOpen className={className} />;
    case "MapPin": return <MapPin className={className} />;
    case "Target": return <Target className={className} />;
    case "Network": return <Network className={className} />;
    case "Cloud": return <Cloud className={className} />;
    case "Cpu": return <Cpu className={className} />;
    case "Lightbulb": return <Lightbulb className={className} />;
    case "Monitor": return <Monitor className={className} />;
    case "Code2": return <Code2 className={className} />;
    case "Palette": return <Palette className={className} />;
    case "Server": return <Server className={className} />;
    case "Database": return <Database className={className} />;
    case "ShieldCheck": return <ShieldCheck className={className} />;
    case "Briefcase": return <Briefcase className={className} />;
    case "Smartphone": return <Smartphone className={className} />;
    case "Binary": return <Binary className={className} />;
    case "Layers": return <Layers className={className} />;
    case "CheckCircle2": return <CheckCircle2 className={className} />;
    case "FlaskConical": return <FlaskConical className={className} />;
    case "Scale": return <Scale className={className} />;
    case "Activity": return <Activity className={className} />;
    case "Dna": return <Dna className={className} />;
    case "ShieldAlert": return <ShieldAlert className={className} />;
    case "Droplets": return <Droplets className={className} />;
    case "Award": return <Award className={className} />;
    case "Pipette": return <Pipette className={className} />;
    case "Atom": return <Atom className={className} />;
    default: return <BookOpen className={className} />;
  }
}

export default function JurusanDetailSection({
  jurusan,
  index,
}: {
  jurusan: JurusanDetail;
  index: number;
}) {
  const [activeTab, setActiveTab] = useState<DetailTabId>("aktivitas");
  const directionRef = useRef<1 | -1>(1); // 1 = ke kanan, -1 = ke kiri
  const isPausedRef = useRef(false);

  // Auto-switch tab setiap 6 detik: bergantian ke kanan lalu ke kiri
  useEffect(() => {
    const timer = setInterval(() => {
      if (isPausedRef.current) return;

      setActiveTab((current) => {
        const currentIndex = DETAIL_TABS.findIndex((t) => t.id === current);
        let nextIndex = currentIndex + directionRef.current;

        // Jika sampai di ujung kanan (index 2), putar arah ke kiri (-1)
        if (nextIndex >= DETAIL_TABS.length) {
          directionRef.current = -1;
          nextIndex = DETAIL_TABS.length - 2;
        }
        // Jika sampai di ujung kiri (index 0), putar arah ke kanan (1)
        else if (nextIndex < 0) {
          directionRef.current = 1;
          nextIndex = 1;
        }

        return DETAIL_TABS[nextIndex].id;
      });
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const handleTabClick = (tabId: DetailTabId) => {
    const newIndex = DETAIL_TABS.findIndex((t) => t.id === tabId);
    if (newIndex === DETAIL_TABS.length - 1) {
      directionRef.current = -1;
    } else if (newIndex === 0) {
      directionRef.current = 1;
    }
    setActiveTab(tabId);
  };

  const isEven = index % 2 === 0;

  return (
    <section
      id={jurusan.id}
      className={`py-16 md:py-24 border-b border-zinc-200/80 scroll-mt-28 ${
        isEven ? "bg-white" : "bg-[#FAF7F2]/50"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* ── 1. Bagian Utama Standalone: "Apa saja yang di pelajari?" ── */}
        <div id="detail-program" className="space-y-8">
          <div className="text-center space-y-2">
            <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight">
              Apa saja yang <span className="text-[#8B1A2F]">di pelajari?</span>
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto">
              Struktur kurikulum mata pelajaran berbasis kompetensi industri dan standar vokasi nasional
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4.5">
            {jurusan.curriculumSubjects?.map((subject, i) => (
              <div
                key={i}
                className={`group rounded-2xl bg-white p-3.5 sm:p-4 flex items-center gap-3.5 transition-all duration-200 border-2 border-dashed ${
                  subject.highlighted
                    ? "border-[#8B1A2F] shadow-xs"
                    : "border-zinc-200/90 hover:border-[#8B1A2F] hover:shadow-xs"
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-[#8B1A2F] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-200">
                  <CurriculumSubjectIcon name={subject.iconName} className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-zinc-800 leading-snug">
                  {subject.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. Tab Navigation & Modul Pelengkap di Bawahnya ── */}
        <div
          onMouseEnter={() => {
            isPausedRef.current = true;
          }}
          onMouseLeave={() => {
            isPausedRef.current = false;
          }}
        >
          <div className="border-b border-zinc-200 flex flex-wrap gap-2 sm:gap-6">
            {DETAIL_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  className={`inline-flex items-center pb-3 px-2 text-xs sm:text-sm font-semibold transition-all relative cursor-pointer ${
                    isActive
                      ? "text-[#8B1A2F]"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId={`tab-underline-${jurusan.id}`}
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B1A2F]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── 3. Konten Dinamis Berdasarkan Tab Aktif ── */}
          <div className="mt-8 space-y-8">

          {/* TAB 2: HAL YANG AKAN DILAKUKAN (AKTIVITAS & PEMBELAJARAN) */}
          {activeTab === "aktivitas" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Tahapan Belajar Fase demi Fase */}
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {jurusan.learningJourney.map((step, i) => (
                    <div
                      key={i}
                      className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-xs relative"
                    >
                      <div className="text-[11px] font-mono font-bold text-[#8B1A2F] uppercase mb-1">
                        {step.phase}
                      </div>
                      <h5 className="font-heading font-bold text-sm sm:text-base text-zinc-900 mb-2">
                        {step.title}
                      </h5>
                      <p className="text-xs text-zinc-600 leading-relaxed mb-4">
                        {step.desc}
                      </p>

                      <div className="space-y-1.5 pt-3 border-t border-zinc-100">
                        <span className="text-[10px] font-mono uppercase text-zinc-400">Kompetensi:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {step.skills.map((skill, si) => (
                            <span
                              key={si}
                              className="px-2 py-0.5 rounded text-[11px] bg-zinc-100 text-zinc-700 font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: FASILITAS & LAB INDUSTRI */}
          {activeTab === "fasilitas" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div
                className={`grid grid-cols-1 gap-5 ${
                  jurusan.facilities.length === 3
                    ? "sm:grid-cols-2 lg:grid-cols-3"
                    : "sm:grid-cols-2"
                }`}
              >
                {jurusan.facilities.map((fac, i) => (
                  <div
                    key={i}
                    className="group relative rounded-2xl overflow-hidden h-52 sm:h-60 bg-zinc-900 border border-zinc-200/80 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    {/* Foto Lab Full Card */}
                    {fac.image ? (
                      <Image
                        src={fac.image}
                        alt={fac.name}
                        fill
                        className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-zinc-800">
                        <Building2 className="w-10 h-10 stroke-[1.5]" />
                      </div>
                    )}

                    {/* Gradient Overlay agar teks judul terbaca jelas saat default */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-0" />

                    {/* Teks Judul Default (Menyatu dengan Foto di Bagian Bawah) */}
                    <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end transition-opacity duration-300 group-hover:opacity-0">
                      <h5 className="font-heading font-bold text-base sm:text-lg text-white leading-snug drop-shadow-md">
                        {fac.name}
                      </h5>
                    </div>

                    {/* Gradient Blur Overlay dari Kiri (Gradasi Murni Tanpa Batas Garis Kaku) */}
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out z-10 pointer-events-none group-hover:pointer-events-auto [mask-image:linear-gradient(to_right,black_0%,black_60%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_0%,black_60%,transparent_100%)]"
                    />

                    {/* Teks Keterangan Slide Halus dari Kiri saat Hover */}
                    <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-center max-w-[88%] sm:max-w-[80%] z-20 pointer-events-none group-hover:pointer-events-auto">
                      <div className="space-y-2.5 -translate-x-6 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out transform-gpu will-change-transform">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-4 bg-[#8B1A2F] rounded-full shrink-0" />
                          <h6 className="font-heading font-bold text-sm sm:text-base text-white leading-snug drop-shadow-md">
                            {fac.name}
                          </h6>
                        </div>

                        <p className="text-xs text-zinc-100 leading-relaxed font-mono bg-black/40 backdrop-blur-xs p-3 rounded-xl border border-white/15 drop-shadow-sm">
                          {fac.spec}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </motion.div>
          )}

          {/* TAB 4: PELUANG KARIR & PROFIL LULUSAN */}
          {activeTab === "karir" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {jurusan.careers.map((career, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-3"
                >
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-[#8B1A2F]/10 flex items-center justify-center shrink-0">
                      {career.icon ? (
                        <Image
                          src={career.icon}
                          alt={career.role}
                          width={18}
                          height={18}
                          unoptimized
                          className="w-4.5 h-4.5 object-contain"
                        />
                      ) : (
                        <Briefcase className="w-4 h-4 text-[#8B1A2F]" />
                      )}
                    </div>
                    <h5 className="font-heading font-bold text-sm sm:text-base text-zinc-900">
                      {career.role}
                    </h5>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {career.desc}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Rutinitas & Praktik Riil Sehari-hari (Tetap ada di setiap tab) */}
          {/* `kandaga-island-gelap` = pulau gelap: latarnya literal dan tidak
              ikut tema, jadi teks di dalamnya dikembalikan ke palet terang. */}
          <div className="kandaga-island-gelap p-6 rounded-2xl bg-zinc-900 text-white space-y-4">
            <h4 className="font-heading font-bold text-base sm:text-lg">
              Praktik Lapangan & Rutinitas Nyata Siswa di Jurusan Ini:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {jurusan.dailyActivities.map((act, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#8B1A2F] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {act}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      </div>
    </section>
  );
}
