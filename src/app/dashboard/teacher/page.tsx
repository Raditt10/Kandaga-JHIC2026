"use client"

import React from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { useSession } from "next-auth/react"
import {
  BookOpen,
  CheckCircle,
  XCircle,
  Sparkles,
  FileCheck,
  GraduationCap,
  Award,
  Clock,
  FlaskConical,
} from "lucide-react"

export default function TeacherDashboardPage() {
  const { data: session } = useSession()

  return (
    <DashboardLayout
      roleTitle="Teacher / Guru Portal"
      roleSlug="teacher"
      badgeColor="from-amber-600 to-orange-600"
      icon={BookOpen}
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-orange-950 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-200 text-xs font-bold mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Portal Penilaian & Pembimbingan Karya Siswa</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Selamat Bertugas, {session?.user?.username || "Bapak/Ibu Guru"}! 👨‍🏫
          </h1>
          <p className="text-amber-100 text-xs sm:text-sm max-w-2xl mt-2 leading-relaxed">
            Sebagai Guru Pembimbing, Anda bertugas memverifikasi kelayakan karya siswa, memberikan penilaian objektif, serta menyetujui penayangan portofolio di galeri utama Kandaga.
          </p>

          {/* User Session Detail */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/15 text-xs">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-amber-200 block text-[11px] font-medium">NIP / Username Guru</span>
              <span className="font-mono font-bold text-white text-sm">{session?.user?.username || "-"}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-amber-200 block text-[11px] font-medium">Email Akademik</span>
              <span className="font-mono font-bold text-white text-sm">{session?.user?.email || "-"}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-amber-200 block text-[11px] font-medium">Kompetensi Keahlian</span>
              <span className="font-mono font-bold text-amber-300 text-sm uppercase font-sans">PEMBIMBING AKADEMIK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-zinc-900">Pending Curations</h3>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">4 Proyek</p>
          <span className="text-[11px] text-zinc-500 font-medium">Menunggu penilaian & persetujuan Anda</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-zinc-900">Disetujui Publikasi</h3>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">28 Proyek</p>
          <span className="text-[11px] text-zinc-500 font-medium">Telah tampil di Galeri Utama Kandaga</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-zinc-900">Rata-Rata Nilai Riset</h3>
          <p className="text-2xl font-extrabold text-blue-600 mt-2">91.8 / 100</p>
          <span className="text-[11px] text-zinc-500 font-medium">Standar penilaian ISO SMKN 13</span>
        </div>
      </div>

      {/* Review Queue */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm">
        <h3 className="text-lg font-extrabold text-zinc-900 mb-4">Antrean Penilaian Karya Siswa</h3>

        <div className="space-y-4">
          {[
            {
              student: "Tim Riset Kimia Terapan (Analis Kimia)",
              project: "Formulasi Indikator Asam-Basa Antosianin Alami",
              score: "Pending Review",
              major: "Analis Kimia",
            },
            {
              student: "Inovasi IoT SMKN 13 (TKJ)",
              project: "EcoSync Smart IoT Green Energy",
              score: "94 / 100",
              major: "Teknik Komputer Jaringan",
            },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {item.major}
                </span>
                <h4 className="text-base font-bold text-zinc-900 mt-1">{item.project}</h4>
                <p className="text-xs text-zinc-500 font-medium">{item.student}</p>
              </div>

              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Setujui</span>
                </button>
                <button className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-xl text-xs font-bold transition cursor-pointer">
                  Revisi
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
