"use client";

/**
 * Heading outline (design-rules.md §3):
 *   h2: "Kolaborasi antar jurusan..."   ← section heading
 *     h3: "Analis Kimia"               ← pilar 1 (kolom teks, bukan kartu)
 *     h3: "Teknik Komputer & Jaringan" ← pilar 2
 *     h3: "Rekayasa Perangkat Lunak"   ← pilar 3
 *       h4: judul karya kolaboratif    ← showcase
 *
 * Design-rules fixes:
 * - All-caps: hanya label pendek ≤4 kata (§5)
 * - Nested cards: 3 kartu pilar → 3 kolom teks dengan garis pemisah vertikal,
 *   tanpa card/border/shadow (§6 — aturan max 1 pola kartu per halaman,
 *   jatah sudah dipakai di tab Program Unggulan JurusanDetailSection)
 * - text-[10px]/[11px] → text-xs minimum (§2)
 * - zinc-400 → ink-600 untuk kontras WCAG AA (§7)
 * - Paragraf tanpa max-w → max-w-[65ch] (§4)
 */

import React from "react";
import { FlaskConical, Network, Code2, CheckCircle2 } from "lucide-react";

const pillars = [
  {
    icon: <FlaskConical className="w-5 h-5 text-primary" aria-hidden="true" />,
    label: "Pilar 1",           // all-caps OK — 2 kata
    name: "Analis Kimia",
    description:
      "Menyediakan kalibrasi sensor kimiawi, pengujian parameter air limbah (BOD/COD), preparasi reagen uji, serta validasi data analisis sesuai ISO 17025.",
    tag: "Sensor Calibration & Lab QA",
    connector: "Transmisi IoT",  // sentence case, bukan all-caps
  },
  {
    icon: <Network className="w-5 h-5 text-[#1A365D]" aria-hidden="true" />,
    label: "Pilar 2",
    name: "Teknik Komputer & Jaringan",
    description:
      "Membangun arsitektur jaringan sensor nirkabel (LoRa/WiFi), gateway IoT, routing aman berenkripsi, administrasi server Linux, serta pengamanan transmisi data.",
    tag: "IoT Gateway & Secure Pipeline",
    connector: "Data streaming",  // sentence case
  },
  {
    icon: <Code2 className="w-5 h-5 text-primary" aria-hidden="true" />,
    label: "Pilar 3",
    name: "Rekayasa Perangkat Lunak",
    description:
      "Mengembangkan dashboard web real-time (Next.js), sistem alert notifikasi ke ponsel, database time-series, serta visualisasi data analitik yang intuitif bagi operator.",
    tag: "Web Dashboard & Mobile Alert",
    connector: null,
  },
];

export default function JurusanCollaboration() {
  return (
    <section className="py-20 bg-white border-b border-ink-150 relative overflow-hidden">
      {/* Blueprint grid — sangat halus */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#1A1A1A_1px,transparent_1px),linear-gradient(to_bottom,#1A1A1A_1px,transparent_1px)] bg-[size:32px_32px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="max-w-2xl space-y-3 mb-14">
          {/* all-caps label — 2 kata, OK */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-wider bg-primary/8 text-primary border border-primary/20">
            Sinergi interdisipliner
          </div>

          {/* h2 */}
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink tracking-tight">
            Kolaborasi antar jurusan, menghasilkan solusi utuh
          </h2>

          {/* body text: text-base, max-w-[65ch], ink-700 */}
          <p className="text-base text-ink-700 leading-relaxed max-w-[65ch]">
            Di SMKN 13 Bandung, ketiga jurusan tidak berjalan sendiri-sendiri.
            Siswa terbiasa berkolaborasi lintas keilmuan untuk memecahkan problem
            industri kompleks yang memerlukan sinergi kimia, jaringan, dan
            perangkat lunak.
          </p>
        </div>

        {/* ── 3 pilar: kolom teks dengan garis pemisah vertikal ──
            Tidak ada card/border/shadow — pola berbeda dari grid kartu
            di tab Program Unggulan (design-rules §6) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-ink-150">
          {pillars.map((pilar, i) => (
            <div key={pilar.label} className="px-0 lg:px-10 py-8 lg:py-0 first:pl-0 last:pr-0 space-y-4">

              {/* Label pilar — text-xs, 2 kata, all-caps OK */}
              <p className="text-xs font-mono font-semibold tracking-[0.2em] text-ink-600 uppercase">
                {pilar.label}
              </p>

              {/* Ikon + h3 — heading level benar, di bawah h2 */}
              <div className="flex items-center gap-3">
                {pilar.icon}
                <h3 className="font-heading font-bold text-base sm:text-lg text-ink">
                  {pilar.name}
                </h3>
              </div>

              {/* Deskripsi: text-base, max-w-[65ch], ink-700 */}
              <p className="text-base text-ink-700 leading-relaxed max-w-[65ch]">
                {pilar.description}
              </p>

              {/* Tag peran — text-xs */}
              <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>{pilar.tag}</span>
              </div>

              {/* Konektor antar pilar — hanya teks kecil di mobile, tidak perlu di kolom */}
              {pilar.connector && (
                <p className="text-xs text-ink-300 font-mono lg:hidden">
                  → {pilar.connector}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* ── Showcase karya kolaboratif ── */}
        <div className="mt-14 pt-8 border-t border-ink-150 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            {/* label: sentence case, bukan all-caps kalimat panjang */}
            <p className="text-xs font-mono font-semibold text-primary">
              Contoh karya nyata kolaboratif:
            </p>
            {/* h4 — di bawah h3 pilar RPL */}
            <h4 className="font-heading text-base sm:text-lg font-bold text-ink">
              Smart Automated Environmental Lab Chamber &amp; Water Safety Monitoring
            </h4>
            {/* deskripsi: text-sm, max-w-[65ch], ink-700 */}
            <p className="text-sm text-ink-700 leading-relaxed max-w-[65ch]">
              Dihasilkan melalui kerja tim siswa gabungan tingkat akhir dan
              dipamerkan langsung di etalase Kandaga.
            </p>
          </div>
          {/* tag ringkas — text-xs */}
          <span className="shrink-0 self-start inline-flex items-center px-3 py-1.5 rounded-full bg-ink-100 text-ink-700 text-xs font-mono font-medium border border-ink-150">
            3 jurusan &bull; 1 solusi terpadu
          </span>
        </div>

      </div>
    </section>
  );
}
