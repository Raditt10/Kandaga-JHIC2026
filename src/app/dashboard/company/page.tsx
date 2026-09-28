"use client"

import React from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { useSession } from "next-auth/react"
import {
  Building2,
  Search,
  UserCheck,
  Briefcase,
  ExternalLink,
  Award,
  Sparkles,
  CheckCircle2,
  Layers,
} from "lucide-react"

export default function CompanyDashboardPage() {
  const { data: session } = useSession()

  return (
    <DashboardLayout
      roleTitle="Company / Mitra Portal"
      roleSlug="company"
      badgeColor="from-blue-600 to-indigo-700"
      icon={Building2}
    >
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-xs font-bold mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>Portal Mitra Perusahaan & Rekrutmen Talenta</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Selamat Datang, {session?.user?.username || "Mitra Industri"}! 🏢
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl mt-2 leading-relaxed">
            Sebagai Perusahaan/Mitra Industri, Anda memiliki akses eksklusif untuk mengevaluasi karya siswa SMKN 13 Bandung, merekrut kandidat magang, dan memberikan sertifikasi kompetensi.
          </p>

          {/* User Session Detail */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/15 text-xs">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-blue-200 block text-[11px] font-medium">Perusahaan ID</span>
              <span className="font-mono font-bold text-white text-sm">{session?.user?.username || "-"}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-blue-200 block text-[11px] font-medium">Email Terverifikasi</span>
              <span className="font-mono font-bold text-white text-sm">{session?.user?.email || "-"}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-blue-200 block text-[11px] font-medium">Status Mitra</span>
              <span className="font-mono font-bold text-emerald-400 text-sm uppercase">VERIFIED INDUSTRY PARTNER</span>
            </div>
          </div>
        </div>
      </div>

      {/* Talent Search & Internship Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-zinc-900">Eksplorasi Talenta Siswa</h3>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            Jelajahi lebih dari 120+ karya siswa dari jurusan RPL, TKJ, dan Analis Kimia yang terverifikasi sekolah.
          </p>
          <button className="mt-4 px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition cursor-pointer">
            Cari Kandagawan
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
            <Briefcase className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-zinc-900">Lowongan Magang Industri</h3>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            Buka posisi Praktik Kerja Lapangan (PKL) baru khusus untuk siswa SMKN 13 Bandung.
          </p>
          <span className="inline-block mt-4 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            3 Posisi Aktif
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-zinc-900">Kandidat Terpilih</h3>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            8 Siswa telah diundang mengikuti proses wawancara magang teknis.
          </p>
          <span className="inline-block mt-4 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            8 Pelamar Dalam Proses
          </span>
        </div>
      </div>

      {/* Featured Student Talent Profiles for Companies */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm">
        <h3 className="text-lg font-extrabold text-zinc-900 mb-4">Rekomendasi Talenta Siap Magang</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: "Tim Riset Analis Kimia XIII",
              skill: "Titrasi ISO & Spektrofotometri",
              major: "Analis Kimia",
              highlight: "Formulasi Indikator Asam Basa Alami (Akurasi 99.2%)",
            },
            {
              name: "Creative RPL Developers",
              skill: "Next.js, TypeScript, NextAuth, Tailwind",
              major: "Rekayasa Perangkat Lunak",
              highlight: "Sistem Manajemen Academic EduClass",
            },
          ].map((t, idx) => (
            <div key={idx} className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  {t.major}
                </span>
                <span className="text-xs text-zinc-400 font-medium">Disetujui Guru Pembimbing</span>
              </div>
              <h4 className="text-base font-extrabold text-zinc-900">{t.name}</h4>
              <p className="text-xs text-zinc-600 font-mono">Skillset: {t.skill}</p>
              <p className="text-xs font-semibold text-[#90133b]">Highlight: {t.highlight}</p>
              <button className="w-full py-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer">
                Undang Wawancara Magang
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
