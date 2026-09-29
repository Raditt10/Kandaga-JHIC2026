"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
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
  Wrench,
  Building2,
  ExternalLink,
} from "lucide-react";
import { JurusanDetail } from "@/data/jurusanData";
import CompetencyChipList from "@/components/jurusan/CompetencyChipList";

// Icon resolver helper
function ProgramIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "Code2":
      return <Code2 className={className} />;
    case "Sparkles":
      return <Sparkles className={className} />;
    case "UsersCheck":
    case "ShieldCheck":
      return <ShieldCheck className={className} />;
    case "Award":
      return <Award className={className} />;
    case "Activity":
      return <Activity className={className} />;
    case "Lock":
      return <Lock className={className} />;
    case "Zap":
      return <Zap className={className} />;
    case "FlaskConical":
      return <FlaskConical className={className} />;
    case "Briefcase":
      return <Briefcase className={className} />;
    case "CheckCircle2":
      return <CheckCircle2 className={className} />;
    case "Search":
      return <Search className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}

export default function JurusanDetailSection({
  jurusan,
  index,
}: {
  jurusan: JurusanDetail;
  index: number;
}) {
  const [activeTab, setActiveTab] = useState<"program" | "aktivitas" | "fasilitas" | "karir">("program");

  const isEven = index % 2 === 0;

  return (
    <section
      id={jurusan.id}
      className={`py-16 md:py-24 border-b border-zinc-200/80 scroll-mt-28 ${
        isEven ? "bg-white" : "bg-[#FAF7F2]/50"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ── 1. Header Jurusan ── */}
        <div className="space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-[#8B1A2F]/10 text-[#8B1A2F] border border-[#8B1A2F]/20">
              {jurusan.code}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span>{jurusan.duration}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <Award className="w-3 h-3 text-amber-600" />
              <span>{jurusan.accreditation}</span>
            </span>
          </div>

          {/* P0 fix: heading hierarchy h2, font-heading, ink-700, max-w-[65ch] */}
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink tracking-tight">
            {jurusan.name}
          </h2>

          <p className="font-medium text-base sm:text-lg text-primary">
            {jurusan.tagline}
          </p>

          {/* P0 fix: kontras ink-700, max-w-[65ch] untuk optimal line length */}
          <p className="text-base text-ink-700 leading-relaxed max-w-[65ch]">
            {jurusan.description}
          </p>

          {/* Fokus Utama — ganti grid checkmark dengan CompetencyChipList */}
          <div className="pt-2">
            <CompetencyChipList items={jurusan.coreFocus} label="KOMPETENSI UTAMA" />
          </div>
        </div>

        {/* ── 2. Tab Navigation Antar Modul Detail ── */}
        <div className="mt-10 border-b border-zinc-200 flex flex-wrap gap-2 sm:gap-4">
          {[
            { id: "program", label: "Program Unggulan", icon: <Layers className="w-4 h-4" /> },
            { id: "aktivitas", label: "Hal yang Akan Dilakukan", icon: <Wrench className="w-4 h-4" /> },
            { id: "fasilitas", label: "Fasilitas & Lab Industri", icon: <Building2 className="w-4 h-4" /> },
            { id: "karir", label: "Peluang Karir & Alumni", icon: <Briefcase className="w-4 h-4" /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`inline-flex items-center gap-2 pb-3 px-2 text-xs sm:text-sm font-semibold transition-all relative cursor-pointer ${
                  isActive
                    ? "text-[#8B1A2F]"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <span>{tab.icon}</span>
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
        <div className="mt-8">
          
          {/* TAB 1: PROGRAM UNGGULAN */}
          {activeTab === "program" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {jurusan.programs.map((prog, i) => (
                <div
                  key={i}
                  className="group relative p-6 rounded-2xl bg-white border border-zinc-200/90 hover:border-[#8B1A2F]/40 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#8B1A2F]/10 text-[#8B1A2F] flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                        <ProgramIcon name={prog.iconName} className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
                        {prog.badge}
                      </span>
                    </div>

                    <h4 className="font-heading text-base sm:text-lg font-bold text-zinc-900 group-hover:text-[#8B1A2F] transition-colors">
                      {prog.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                      {prog.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center gap-1.5 text-xs font-semibold text-[#8B1A2F]">
                    <span>Standar Pelaksanaan Vokasi SMKN 13</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

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
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-4">
                  Tahapan Belajar & Kurikulum Bertingkat:
                </h4>
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
                        <span className="text-[10px] font-mono uppercase text-zinc-400">Kompetensi Utama:</span>
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

              {/* Rutinitas & Praktik Riil Sehari-hari */}
              <div className="p-6 rounded-2xl bg-zinc-900 text-white space-y-4">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-[#E8C97A]" />
                  <h4 className="font-heading font-bold text-base sm:text-lg">
                    Praktik Lapangan & Rutinitas Nyata Siswa di Jurusan Ini:
                  </h4>
                </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jurusan.facilities.map((fac, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-xs space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700">
                        <Building2 className="w-5 h-5 text-[#8B1A2F]" />
                      </div>
                      <div>
                        <h5 className="font-heading font-bold text-base text-zinc-900">
                          {fac.name}
                        </h5>
                        <p className="text-[11px] font-mono text-zinc-400">
                          Standar Praktik Industri
                        </p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-100 font-mono">
                      Spesifikasi: {fac.spec}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {fac.features.map((feat, fi) => (
                        <span
                          key={fi}
                          className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{feat}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tools & Tech Stack Pill Bar */}
              <div className="p-5 rounded-2xl bg-white border border-zinc-200">
                <span className="text-xs font-mono uppercase text-zinc-400 block mb-3">
                  Perangkat, Software, & Instrumen yang Dikuasai:
                </span>
                <div className="flex flex-wrap gap-2">
                  {jurusan.toolsTech.map((tool, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg text-xs font-mono font-medium bg-zinc-100 text-zinc-800 border border-zinc-200/80"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
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
                  className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-[#8B1A2F]/10 text-[#8B1A2F] flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <h5 className="font-heading font-bold text-sm sm:text-base text-zinc-900">
                      {career.role}
                    </h5>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {career.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>{career.demand}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

        </div>

        {/* ── 4. Showcase Karya Nyata Siswa di Kandaga ── */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-zinc-800 shadow-md">
          <div className="space-y-1.5 max-w-xl text-left">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#E8C97A]">
              <Sparkles className="w-3.5 h-3.5 text-[#E8C97A]" />
              <span>ETALASE KARYA SISWA DI KANDAGA</span>
            </div>
            <h4 className="font-heading text-base sm:text-lg font-bold">
              {jurusan.highlightProject.title}
            </h4>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {jurusan.highlightProject.desc}
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <Link
              href={jurusan.highlightProject.link}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#8B1A2F] hover:bg-[#a61743] text-white transition-all shadow-sm cursor-pointer"
            >
              <span>Lihat Karya Terverifikasi</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
