"use client"

import React from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { useSession } from "next-auth/react"
import {
  Briefcase,
  TrendingUp,
  UserCheck,
  Building,
  Calendar,
  Sparkles,
  Award,
  Users,
} from "lucide-react"

export default function BKKDashboardPage() {
  const { data: session } = useSession()

  return (
    <DashboardLayout
      roleTitle="BKK / Bursa Kerja Khusus Portal"
      roleSlug="bkk"
      badgeColor="from-emerald-600 to-teal-700"
      icon={Briefcase}
    >
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-teal-200 text-xs font-bold mb-3">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Pusat Penyebab & Bursa Kerja Khusus SMKN 13 Bandung</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Portal BKK (Bursa Kerja Khusus) 💼
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm max-w-2xl mt-2 leading-relaxed">
            Sebagai Pengelola BKK, Anda memfasilitasi penyaluran kerja alumni, menjembatani kerjasama Job Fair dengan industri, serta memantau statistik Tracer Study lulusan SMKN 13 Bandung.
          </p>

          {/* User Session Detail */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/15 text-xs">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-teal-200 block text-[11px] font-medium">BKK Account Username</span>
              <span className="font-mono font-bold text-white text-sm">{session?.user?.username || "-"}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-teal-200 block text-[11px] font-medium">Email BKK Resmi</span>
              <span className="font-mono font-bold text-white text-sm">{session?.user?.email || "-"}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-teal-200 block text-[11px] font-medium">Fungsi Utama</span>
              <span className="font-mono font-bold text-emerald-300 text-sm uppercase">PENYALURAN KERJA & ALUMNI</span>
            </div>
          </div>
        </div>
      </div>

      {/* BKK Placement Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm">
          <span className="text-xs font-bold text-zinc-500 uppercase block">Tingkat Penyerapan Kerja</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">94.2%</p>
          <span className="text-[11px] text-zinc-500 mt-1 block">Lulusan SMKN 13 Bandung</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm">
          <span className="text-xs font-bold text-zinc-500 uppercase block">Mitra Industri MoU</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">45 Perusahaan</p>
          <span className="text-[11px] text-zinc-500 mt-1 block">RPL, TKJ & Analis Kimia</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm">
          <span className="text-xs font-bold text-zinc-500 uppercase block">Lowongan Kerja Aktif</span>
          <p className="text-2xl font-extrabold text-teal-600 mt-1">14 Posisi</p>
          <span className="text-[11px] text-zinc-500 mt-1 block">Terbuka untuk Alumni</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm">
          <span className="text-xs font-bold text-zinc-500 uppercase block">Job Fair Mendatang</span>
          <p className="text-2xl font-extrabold text-purple-600 mt-1">Kandaga Fair 2026</p>
          <span className="text-[11px] text-zinc-500 mt-1 block">15 - 18 Oktober 2026</span>
        </div>
      </div>

      {/* Career Center Job Openings */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-zinc-900">Lowongan Kerja Khusus BKK SMKN 13</h3>
          <button className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition cursor-pointer">
            + Tambah Info Lowongan
          </button>
        </div>

        <div className="space-y-3">
          {[
            {
              company: "PT Kimia Farma Industri Tbk",
              title: "Junior Laboratory Analyst",
              target: "Alumni Analis Kimia",
              type: "Full-Time",
            },
            {
              company: "Telkom Indonesia (Digital Service)",
              title: "Network Infrastructure Support",
              target: "Alumni TKJ",
              type: "Full-Time / PKL",
            },
            {
              company: "BukaStudio Software House",
              title: "Frontend Developer (React/Next.js)",
              target: "Alumni RPL",
              type: "Full-Time",
            },
          ].map((job, idx) => (
            <div key={idx} className="p-4 rounded-2xl border border-zinc-100 bg-zinc-50/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {job.target}
                </span>
                <h4 className="text-base font-extrabold text-zinc-900 mt-1">{job.title}</h4>
                <p className="text-xs text-zinc-500 font-medium">{job.company}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-zinc-600">{job.type}</span>
                <button className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black transition cursor-pointer">
                  Detail Rekrutmen
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
