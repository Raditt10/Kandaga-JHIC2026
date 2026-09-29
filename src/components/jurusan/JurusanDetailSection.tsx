"use client";

/**
 * Heading outline per section (design-rules.md §3):
 *   h2: {jurusan.name}                ← nama jurusan (satu per section)
 *     h3: "Program Unggulan"          ← tab program
 *       h4: {prog.title}              ← judul tiap program
 *     h3: "Tahapan Belajar"           ← tab aktivitas
 *       h4: {step.title}              ← fase belajar
 *     h3: "Fasilitas & Lab"           ← tab fasilitas (tabel, bukan nested card)
 *     h3: "Peluang Karir"             ← tab karir (list sederhana, bukan nested card)
 */

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Code2, Network, FlaskConical, Award, Clock, Sparkles,
  ShieldCheck, Activity, Lock, Zap, Briefcase, CheckCircle2,
  Search, ArrowRight, Layers, Wrench, Building2, ExternalLink,
  TrendingUp,
} from "lucide-react";
import { JurusanDetail } from "@/data/jurusanData";
import CompetencyChipList from "@/components/jurusan/CompetencyChipList";

function ProgramIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "Code2":       return <Code2 className={className} />;
    case "Sparkles":    return <Sparkles className={className} />;
    case "UsersCheck":
    case "ShieldCheck": return <ShieldCheck className={className} />;
    case "Award":       return <Award className={className} />;
    case "Activity":    return <Activity className={className} />;
    case "Lock":        return <Lock className={className} />;
    case "Zap":         return <Zap className={className} />;
    case "FlaskConical":return <FlaskConical className={className} />;
    case "Briefcase":   return <Briefcase className={className} />;
    case "CheckCircle2":return <CheckCircle2 className={className} />;
    case "Search":      return <Search className={className} />;
    default:            return <Sparkles className={className} />;
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
        {/*
          Heading level: h2 (satu per section, di bawah h1 di JurusanHero)
          Semua badge pakai text-xs minimum (design-rules §2)
          Kontras: ink-600/700 di atas putih (design-rules §7)
        */}
        <div className="space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            {/* text-xs = 12px, minimum batas fungsional */}
            <span className="px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">
              {jurusan.code}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-ink-100 text-ink-700 border border-ink-150">
              <Clock className="w-3.5 h-3.5 text-ink-600" aria-hidden="true" />
              {jurusan.duration}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <Award className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
              {jurusan.accreditation}
            </span>
          </div>

          {/* h2 — judul jurusan, font-heading wajib */}
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink tracking-tight">
            {jurusan.name}
          </h2>

          <p className="font-medium text-base sm:text-lg text-primary">
            {jurusan.tagline}
          </p>

          {/* body text: text-base, max-w-[65ch], ink-700 (design-rules §2,§4,§7) */}
          <p className="text-base text-ink-700 leading-relaxed max-w-[65ch]">
            {jurusan.description}
          </p>

          <div className="pt-2">
            <CompetencyChipList items={jurusan.coreFocus} label="KOMPETENSI UTAMA" />
          </div>
        </div>

        {/* ── 2. Tab Navigation ── */}
        <div className="mt-10 border-b border-zinc-200 flex flex-wrap gap-2 sm:gap-4">
          {[
            { id: "program",   label: "Program Unggulan",        icon: <Layers className="w-4 h-4" /> },
            { id: "aktivitas", label: "Hal yang Akan Dilakukan", icon: <Wrench className="w-4 h-4" /> },
            { id: "fasilitas", label: "Fasilitas & Lab Industri", icon: <Building2 className="w-4 h-4" /> },
            { id: "karir",     label: "Peluang Karir & Alumni",  icon: <Briefcase className="w-4 h-4" /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`inline-flex items-center gap-2 pb-3 px-2 text-sm font-semibold transition-all relative cursor-pointer ${
                  isActive ? "text-primary" : "text-ink-600 hover:text-ink"
                }`}
              >
                <span aria-hidden="true">{tab.icon}</span>
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId={`tab-underline-${jurusan.id}`}
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── 3. Konten Tab ── */}
        <div className="mt-8">

          {/* ─────────────────────────────────────────────────────────────
              TAB 1: PROGRAM UNGGULAN
              Pola: grid kartu (diizinkan karena ini SATU-SATUNYA grid kartu
              di halaman ini — tab Fasilitas & Karir memakai pola berbeda)
              Heading: h3 → h4 (tidak ada skip)
          ───────────────────────────────────────────────────────────── */}
          {activeTab === "program" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* h3 — label section dalam tab, menjembatani h2 → h4 */}
              <h3 className="font-heading text-lg font-semibold text-ink mb-6">
                Program Unggulan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jurusan.programs.map((prog, i) => (
                  <div
                    key={i}
                    className="group relative p-6 rounded-2xl bg-white border border-ink-150 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                          <ProgramIcon name={prog.iconName} className="w-5 h-5" />
                        </div>
                        {/* badge: text-xs minimum */}
                        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-ink-100 text-ink-600 border border-ink-150">
                          {prog.badge}
                        </span>
                      </div>
                      {/* h4 — di bawah h3, tidak skip level */}
                      <h4 className="font-heading text-base sm:text-lg font-bold text-ink group-hover:text-primary transition-colors">
                        {prog.title}
                      </h4>
                      {/* deskripsi: text-sm, max-w-[65ch] */}
                      <p className="text-sm text-ink-700 leading-relaxed max-w-[65ch]">
                        {prog.desc}
                      </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-ink-150 flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <span>Standar Pelaksanaan Vokasi SMKN 13</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 2: AKTIVITAS & PEMBELAJARAN
              Pola: urutan fase + dark panel — BERBEDA dari grid kartu
          ───────────────────────────────────────────────────────────── */}
          {activeTab === "aktivitas" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* h3 */}
              <h3 className="font-heading text-lg font-semibold text-ink">
                Tahapan Belajar & Kurikulum Bertingkat
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {jurusan.learningJourney.map((step, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-white border border-ink-150 shadow-sm relative"
                  >
                    {/* fase: label pendek, bukan heading, text-xs */}
                    <p className="text-xs font-mono font-bold text-primary uppercase tracking-wider mb-1">
                      {step.phase}
                    </p>
                    {/* h4 — di bawah h3 */}
                    <h4 className="font-heading font-bold text-sm sm:text-base text-ink mb-2">
                      {step.title}
                    </h4>
                    <p className="text-sm text-ink-700 leading-relaxed mb-4 max-w-[65ch]">
                      {step.desc}
                    </p>
                    <div className="space-y-1.5 pt-3 border-t border-ink-150">
                      {/* label: text-xs (bukan heading) */}
                      <p className="text-xs font-mono text-ink-600">Kompetensi utama:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {step.skills.map((skill, si) => (
                          <span
                            key={si}
                            className="px-2.5 py-1 rounded text-xs bg-ink-100 text-ink-700 font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rutinitas sehari-hari — dark panel */}
              <div className="p-6 rounded-2xl bg-ink text-white space-y-4">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-accent" aria-hidden="true" />
                  <h4 className="font-heading font-bold text-base sm:text-lg">
                    Praktik lapangan & rutinitas nyata siswa
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {jurusan.dailyActivities.map((act, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      {/* nomor: dekoratif, text-xs */}
                      <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5" aria-hidden="true">
                        {i + 1}
                      </span>
                      <p className="text-sm text-white/80 leading-relaxed">
                        {act}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 3: FASILITAS — TABEL (bukan nested card, design-rules §6)
              Pola berbeda dari grid kartu di tab Program Unggulan
          ───────────────────────────────────────────────────────────── */}
          {activeTab === "fasilitas" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* h3 */}
              <h3 className="font-heading text-lg font-semibold text-ink">
                Fasilitas &amp; Lab Industri
              </h3>

              {/* Tabel fasilitas — pola berbeda dari kartu */}
              <div className="overflow-hidden rounded-2xl border border-ink-150">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-ink-100 border-b border-ink-150">
                      <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">
                        Fasilitas
                      </th>
                      <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading hidden sm:table-cell">
                        Spesifikasi
                      </th>
                      <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading hidden md:table-cell">
                        Fitur
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-150 bg-white">
                    {jurusan.facilities.map((fac, i) => (
                      <tr key={i} className="hover:bg-ink-100/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Building2 className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
                            <span className="font-medium text-ink">{fac.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-ink-700 hidden sm:table-cell">
                          <span className="font-mono text-xs bg-ink-100 px-2 py-1 rounded">
                            {fac.spec}
                          </span>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <div className="flex flex-wrap gap-1.5">
                            {fac.features.map((feat, fi) => (
                              <span
                                key={fi}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-100"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
                                {feat}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tools — pill bar, bukan card */}
              <div className="space-y-2">
                <p className="text-xs font-mono text-ink-600">
                  Perangkat, software &amp; instrumen yang dikuasai:
                </p>
                <div className="flex flex-wrap gap-2">
                  {jurusan.toolsTech.map((tool, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-ink-100 text-ink-700 border border-ink-150"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 4: KARIR — LIST ACCORDION (bukan nested card, design-rules §6)
              Pola berbeda dari grid kartu di tab Program Unggulan
          ───────────────────────────────────────────────────────────── */}
          {activeTab === "karir" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {/* h3 */}
              <h3 className="font-heading text-lg font-semibold text-ink mb-6">
                Peluang Karir &amp; Profil Lulusan
              </h3>

              {/* List accordion per karir — tidak ada card/border/shadow */}
              {jurusan.careers.map((career, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 py-4 border-b border-ink-150 last:border-0"
                >
                  {/* nomor urut — dekoratif */}
                  <span className="font-mono text-xs font-bold text-ink-300 w-6 shrink-0 pt-0.5" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="flex-1 space-y-1">
                    {/* h4 — di bawah h3, tidak skip level */}
                    <h4 className="font-heading font-bold text-base text-ink">
                      {career.role}
                    </h4>
                    <p className="text-sm text-ink-700 leading-relaxed max-w-[65ch]">
                      {career.desc}
                    </p>
                  </div>

                  {/* demand badge — kanan, text-xs */}
                  <div className="shrink-0 flex items-center gap-1.5 text-xs text-ink-600">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>{career.demand}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

        </div>

        {/* ── 4. Showcase Karya Nyata ── */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-ink via-zinc-950 to-ink text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-zinc-800 shadow-md">
          <div className="space-y-1.5 max-w-xl text-left">
            {/* label: text-xs, 4 kata, all-caps OK */}
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-accent">
              <Sparkles className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              <span>KARYA SISWA DI KANDAGA</span>
            </div>
            {/* h3 (di bawah h2 nama jurusan) */}
            <h3 className="font-heading text-base sm:text-lg font-bold text-white">
              {jurusan.highlightProject.title}
            </h3>
            <p className="text-sm text-white/80 leading-relaxed max-w-[65ch]">
              {jurusan.highlightProject.desc}
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <Link
              href={jurusan.highlightProject.link}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-primary hover:bg-primary-dark text-white transition-all shadow-sm"
            >
              Lihat karya terverifikasi
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
