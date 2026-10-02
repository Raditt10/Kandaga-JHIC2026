"use client"

import React from "react"
import Link from "next/link"
import DashboardLayout from "@/components/DashboardLayout"
import { useSession } from "next-auth/react"
import {
  GraduationCap,
  Sparkles,
  Upload,
  CheckCircle2,
  Award,
  FileCode,
  FlaskConical,
  Wifi,
  ArrowRight,
  FolderOpen,
} from "lucide-react"

export default function StudentDashboardPage() {
  const { data: session } = useSession()

  return (
    <DashboardLayout
      roleTitle="Student Portal"
      roleSlug="student"
      badgeColor="from-rose-500 to-pink-600"
      icon={GraduationCap}
    >
      {/* Header Welcome Card */}
      <div className="bg-gradient-to-r from-rose-900 via-[#891337] to-[#a61743] rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-rose-100 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal Portofolio Siswa SMKN 13 Bandung</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Halo, {session?.user?.username || "Siswa Kandaga"}! 🎓
          </h1>
          <p className="text-rose-100 text-xs sm:text-sm max-w-2xl mt-2 leading-relaxed">
            Ini adalah area khusus untuk siswa. Di sini Anda dapat mengunggah proyek tugas akhir, memamerkan hasil laboratorium, dan melacak kurasi mitra industri.
          </p>

          {/* User Session Detail Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/15 text-xs">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-rose-200 block text-[11px] font-medium">Username Terdaftar</span>
              <span className="font-mono font-bold text-white text-sm">{session?.user?.username || "-"}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-rose-200 block text-[11px] font-medium">Email Terverifikasi</span>
              <span className="font-mono font-bold text-white text-sm">{session?.user?.email || "-"}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-rose-200 block text-[11px] font-medium">Peran Pengguna (Role)</span>
              <span className="font-mono font-bold text-white text-sm uppercase">{session?.user?.role || "STUDENT"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Student Action Cards & Projects Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-[#90133b] flex items-center justify-center mb-4">
            <Upload className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-zinc-900">Unggah Karya Baru</h3>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            Kirimkan tautan GitHub, repositori aplikasi, atau modul riset laboratorium Analis Kimia Anda.
          </p>
          <Link
            href="/student/post-project"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#8B1A2F] text-white rounded-xl text-xs font-bold hover:bg-[#6B1424] transition cursor-pointer shadow-xs"
          >
            + Tambah Karya
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-zinc-900">Status Verifikasi Guru</h3>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            2 dari 3 karya Anda telah disetujui dan dikurasi oleh Guru Pembimbing Kompetensi Keahlian.
          </p>
          <span className="inline-block mt-4 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Terverifikasi Sekolah
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-zinc-900">Review Perusahaan</h3>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            Portofolio Anda telah dilihat oleh 5 Mitra Industri & Perusahaan pencari talenta magang.
          </p>
          <span className="inline-block mt-4 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            5 Dilihat Industri
          </span>
        </div>
      </div>

      {/* Submitted Projects Table / List */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="text-lg font-extrabold text-zinc-900">Portofolio Dipublikasikan</h3>
          <Link
            href="/student/my-projects"
            className="text-xs font-bold text-[#8B1A2F] hover:underline flex items-center gap-1"
          >
            <span>Kelola & Lihat Seluruh Karya Saya</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        <div className="space-y-3">
          {[
            {
              title: "EduClass - LMS & Presensi QR Cerdas",
              major: "RPL",
              icon: FileCode,
              views: "1,240 views",
              status: "Terpublikasi Galeri",
            },
            {
              title: "Smart Green Energy Microcontroller IoT",
              major: "TKJ",
              icon: Wifi,
              views: "890 views",
              status: "Terpublikasi Galeri",
            },
            {
              title: "Formulasi Indikator Asam-Basa Antosianin Alami",
              major: "Analis Kimia",
              icon: FlaskConical,
              views: "450 views",
              status: "Review Guru",
            },
          ].map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-zinc-100 bg-zinc-50/60 flex items-center justify-between hover:bg-zinc-100/80 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#90133b] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">{item.title}</h4>
                    <span className="text-xs font-semibold text-rose-700">{item.major}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-zinc-500 font-mono">{item.views}</span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px]">
                    {item.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
