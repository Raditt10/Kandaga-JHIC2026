"use client";

import React from "react";
import { FlaskConical, Network, Code2, ArrowRight, CheckCircle2 } from "lucide-react";

export default function JurusanCollaboration() {
  return (
    <section className="py-20 bg-white border-b border-zinc-200 relative overflow-hidden">
      {/* Decorative subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#1A1A1A_1px,transparent_1px),linear-gradient(to_bottom,#1A1A1A_1px,transparent_1px)] bg-[size:32px_32px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-[#8B1A2F]/10 text-[#8B1A2F] border border-[#8B1A2F]/20">
            <span>SINERGI INTERDISIPLINER • KANDAGA ECOSYSTEM</span>
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight">
            Kolaborasi Antar Jurusan, Menghasilkan Solusi Utuh
          </h2>

          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
            Di SMKN 13 Bandung, ketiga jurusan tidak berjalan sendiri-sendiri. Siswa
            terbiasa berkolaborasi lintas keilmuan untuk memecahkan problem industri
            kompleks yang memerlukan sinergi kimia, jaringan, dan perangkat lunak.
          </p>
        </div>

        {/* Interactive Synergy Diagram Card */}
        <div className="mt-12 p-6 sm:p-10 rounded-3xl bg-[#F5F0E8]/50 border border-zinc-200/90 shadow-sm">
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            
            {/* Box 1: Analis Kimia */}
            <div className="w-full lg:w-1/3 bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#4E0E20]/10 text-[#4E0E20] flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-[#8B1A2F]" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                Pilar 1: Presisi Ilmiah
              </span>
              <h3 className="font-heading font-bold text-base text-zinc-900">
                Analis Kimia
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Menyediakan kalibrasi sensor kimiawi, pengujian parameter air limbah
                (BOD/COD), preparasi reagen uji, serta validasi data analisis sesuai ISO 17025.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sensor Calibration & Lab QA</span>
              </div>
            </div>

            {/* Connector Arrow 1 */}
            <div className="hidden lg:flex flex-col items-center justify-center text-zinc-400">
              <span className="text-[10px] font-mono text-zinc-400 mb-1">TRANSMISI IOT</span>
              <div className="w-12 h-0.5 bg-zinc-300 relative">
                <ArrowRight className="w-4 h-4 text-zinc-500 absolute -right-2 -top-1.5" />
              </div>
            </div>

            {/* Box 2: TKJ */}
            <div className="w-full lg:w-1/3 bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#1A365D]/10 text-[#1A365D] flex items-center justify-center">
                <Network className="w-5 h-5 text-[#1A365D]" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                Pilar 2: Konektivitas & Jaringan
              </span>
              <h3 className="font-heading font-bold text-base text-zinc-900">
                Teknik Komputer & Jaringan
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Membangun arsitektur jaringan sensor nirkabel (LoRa/WiFi), gateway IoT,
                routing aman berenkripsi, administrasi server Linux, serta pengamanan transmisi data.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>IoT Gateway & Secure Pipeline</span>
              </div>
            </div>

            {/* Connector Arrow 2 */}
            <div className="hidden lg:flex flex-col items-center justify-center text-zinc-400">
              <span className="text-[10px] font-mono text-zinc-400 mb-1">DATA STREAMING</span>
              <div className="w-12 h-0.5 bg-zinc-300 relative">
                <ArrowRight className="w-4 h-4 text-zinc-500 absolute -right-2 -top-1.5" />
              </div>
            </div>

            {/* Box 3: RPL */}
            <div className="w-full lg:w-1/3 bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B1A2F]/10 text-[#8B1A2F] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-[#8B1A2F]" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                Pilar 3: Aplikasi & UI/UX
              </span>
              <h3 className="font-heading font-bold text-base text-zinc-900">
                Rekayasa Perangkat Lunak
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Mengembangkan dashboard web real-time (Next.js), sistem alert notifikasi
                ke ponsel, database time-series, serta visualisasi data analitik yang intuitif bagi operator.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Web Dashboard & Mobile Alert</span>
              </div>
            </div>

          </div>

          {/* Example Collaboration Case Study Banner */}
          <div className="mt-8 p-4 sm:p-5 rounded-xl bg-white border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B1A2F] font-bold">
                Contoh Karya Nyata Kolaboratif di SMKN 13:
              </span>
              <h4 className="font-heading text-sm sm:text-base font-bold text-zinc-900">
                "Smart Automated Environmental Lab Chamber & Water Safety Monitoring"
              </h4>
              <p className="text-xs text-zinc-500">
                Dihasilkan melalui kerja tim siswa gabungan tingkat akhir dan dipamerkan langsung di etalase Kandaga.
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-mono font-medium">
              3 Jurusan • 1 Solusi Terpadu
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}
