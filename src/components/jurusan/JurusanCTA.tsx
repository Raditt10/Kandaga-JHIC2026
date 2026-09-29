"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function JurusanCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#8B1A2F] via-[#6B1424] to-[#420A16] text-white relative overflow-hidden">
      {/* Decorative background grid and circles */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:32px_32px]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/20 text-[#E8C97A]">
          <span className="w-2 h-2 rounded-full bg-[#E8C97A] animate-pulse" />
          <span>KEMITRAAN DUDI & PENDAFTARAN SISWA</span>
        </div>

        <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
          Tertarik Merekrut Talenta atau Berkolaborasi dengan SMKN 13 Bandung?
        </h2>

        <p className="text-zinc-200 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Platform Kandaga memverifikasi kompetensi siswa secara transparan. Dapatkan
          akses langsung ke talenta siap kerja dari jurusan RPL, TKJ, maupun Analis
          Kimia melalui saluran kemitraan resmi BKK sekolah.
        </p>

        {/* Benefits bullets */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 text-xs sm:text-sm text-zinc-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#E8C97A]" />
            <span>Portofolio Karya Terverifikasi</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#E8C97A]" />
            <span>Fasilitas Uji Kompetensi BNSP</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#E8C97A]" />
            <span>Program Magang 6–10 Bulan</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/#galeri-section"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold bg-white text-zinc-900 hover:bg-zinc-100 transition-all shadow-lg hover:shadow-xl cursor-pointer active:scale-98"
          >
            <span>Jelajahi Galeri Karya Teruji</span>
            <ArrowRight className="w-4 h-4 text-[#8B1A2F]" />
          </Link>

          <Link
            href="/#industri-section"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/25 transition-all cursor-pointer"
          >
            <span>Hubungi Kemitraan BKK</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
