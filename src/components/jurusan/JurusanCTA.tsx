"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import CursorSpotlight from "@/components/ui/CursorSpotlight";
import MagneticButton from "@/components/ui/MagneticButton";

export default function JurusanCTA() {
  return (
    <CursorSpotlight
      className="py-24 md:py-32 bg-gradient-to-br from-primary via-[#6B1424] to-[#420A16] text-white relative overflow-hidden"
      color="rgba(255,255,255,0.06)"
      size={500}
    >
      {/* Static blueprint grid — tidak bergerak, bukan animated noise */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:32px_32px]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" aria-hidden="true" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">

        {/* Label — sentence case, bukan all-caps kalimat panjang */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/20 text-accent">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" aria-hidden="true" />
          <span>Kemitraan DUDI &amp; Pendaftaran Siswa</span>
        </div>

        {/* P0 + adopted: massive typography + warna putih solid (bukan abu di atas marun) */}
        <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
          Tertarik Merekrut Talenta
          <br className="hidden sm:block" />
          atau Berkolaborasi?
        </h2>

        {/* P0 fix: teks putih/cream di atas marun — bukan zinc-200 yang bisa gagal kontras */}
        <p className="text-cream text-base sm:text-lg max-w-[60ch] mx-auto leading-relaxed">
          Platform Kandaga memverifikasi kompetensi siswa secara transparan.
          Dapatkan akses langsung ke talenta siap kerja dari jurusan RPL, TKJ,
          maupun Analis Kimia melalui saluran kemitraan resmi BKK sekolah.
        </p>

        {/* Benefits — teks putih, ukuran text-sm minimum */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-white/90">
          {[
            "Portofolio Karya Terverifikasi",
            "Fasilitas Uji Kompetensi BNSP",
            "Program Magang 6–10 Bulan",
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA buttons — MagneticButton untuk tombol utama */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <MagneticButton radius={50} strength={8}>
            <Link
              href="/#galeri-section"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold bg-white text-ink hover:bg-cream transition-all shadow-lg cursor-pointer"
            >
              Jelajahi Galeri Karya Teruji
              <ArrowRight className="w-4 h-4 text-primary" aria-hidden="true" />
            </Link>
          </MagneticButton>

          <Link
            href="/#industri-section"
            className="inline-flex items-center gap-2 px-6 py-4 rounded-full text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/25 transition-all cursor-pointer"
          >
            Hubungi Kemitraan BKK
          </Link>
        </div>

      </div>
    </CursorSpotlight>
  );
}
