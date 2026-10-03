"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  TrendingUp,
  Sparkles,
  Heart,
  Eye,
  ArrowUpRight,
  Filter,
  BarChart3,
  Flame,
  Award,
} from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"
import { projectShowcases } from "@/lib/adminData"

export default function AdminTrendKaryaPage() {
  const [selectedJurusan, setSelectedJurusan] = useState("all")

  const jurusanTrends = [
    {
      name: "Rekayasa Perangkat Lunak (RPL)",
      tag: "RPL",
      count: 54,
      growth: "+28%",
      color: "border-rose-200 bg-rose-50/50 text-primary",
      badgeColor: "bg-rose-100 text-primary",
      topTech: ["Next.js & React", "IoT Telemetry", "AI Vision", "Mobile Flutter"],
    },
    {
      name: "Teknik Komputer Jaringan (TKJ)",
      tag: "TKJ",
      count: 46,
      growth: "+22%",
      color: "border-blue-200 bg-blue-50/50 text-blue-700",
      badgeColor: "bg-blue-100 text-blue-800",
      topTech: ["MikroTik & Cisco", "Serverless VPS", "Network Security", "Smart Home IoT"],
    },
    {
      name: "Analis Kimia (AK)",
      tag: "Analis Kimia",
      count: 42,
      growth: "+24%",
      color: "border-emerald-200 bg-emerald-50/50 text-emerald-700",
      badgeColor: "bg-emerald-100 text-emerald-800",
      topTech: ["Spektrofotometri", "Baku Mutu Air", "Uji Sampel Limbah", "Standar ISO 17025"],
    },
  ]

  const monthlyData = [
    { month: "Mei", karya: 18, pklRequests: 6 },
    { month: "Jun", karya: 24, pklRequests: 11 },
    { month: "Jul", karya: 29, pklRequests: 15 },
    { month: "Agt", karya: 32, pklRequests: 19 },
    { month: "Sep", karya: 38, pklRequests: 24 },
    { month: "Okt (Berjalan)", karya: 42, pklRequests: 28 },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Unified Header & Analytics Overview */}
        <div className="p-5 rounded-2xl bg-white border border-ink-150 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-lg font-bold text-ink flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Trend & Performa Portofolio Siswa</span>
              </h1>
              <p className="text-xs text-ink-600 mt-0.5">
                Pantau performa unggahan proyek, topik teknologi terpopuler, dan minat industri terhadap kompetensi siswa.
              </p>
            </div>

            <Link
              href="/admin/moderasi"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
            >
              <span>Kurasi Karya</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Inline Data Row - Terintegrasi Tanpa Card */}
          <div className="pt-5 border-t border-ink-150 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <span className="text-[11px] text-ink-300 font-medium block">Total Karya Rilis</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">142</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  +24.5%
                </span>
              </div>
              <span className="text-[11px] text-ink-600 block">Karya terkurasi & rilis</span>
            </div>

            <div className="space-y-1 sm:border-l sm:border-ink-150 sm:pl-6">
              <span className="text-[11px] text-ink-300 font-medium block">Minat Rekrutmen PKL</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">28</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
                  Industri
                </span>
              </div>
              <span className="text-[11px] text-ink-600 block">Mengajukan perekrutan</span>
            </div>

            <div className="space-y-1 md:border-l md:border-ink-150 md:pl-6">
              <span className="text-[11px] text-ink-300 font-medium block">Total Apresiasi</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">1.240</span>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full">
                  ❤️ Likes
                </span>
              </div>
              <span className="text-[11px] text-ink-600 block">Dari industri & umum</span>
            </div>

            <div className="space-y-1 md:border-l md:border-ink-150 md:pl-6">
              <span className="text-[11px] text-ink-300 font-medium block">Kategori Dominan</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">Web & IoT</span>
              </div>
              <span className="text-[11px] text-indigo-600 font-medium block">48% dari seluruh karya</span>
            </div>
          </div>
        </div>

        {/* Section: Tren Tiap Jurusan */}
        <div className="space-y-3">
          <h2 className="font-heading text-sm font-bold text-ink">
            Performa Unggahan Berdasarkan Kompetensi Keahlian
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {jurusanTrends.map((j) => (
              <div
                key={j.tag}
                className={`p-5 rounded-2xl bg-white border shadow-xs flex flex-col justify-between ${j.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${j.badgeColor}`}>
                      {j.tag}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">{j.growth}</span>
                  </div>
                  <h3 className="font-heading text-sm font-bold text-ink mb-1">
                    {j.name}
                  </h3>
                  <p className="text-2xl font-extrabold text-ink">
                    {j.count} <span className="text-xs font-semibold text-ink-600">Karya Terverifikasi</span>
                  </p>

                  <div className="mt-4 pt-3 border-t border-ink-150">
                    <span className="text-[10px] font-bold text-ink-600 uppercase tracking-wider block mb-2">
                      Topik Teknologi Populer:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {j.topTech.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded-md bg-white border border-ink-150 text-ink-700 text-[10px] font-semibold"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Karya Terpopuler & Grafik Pertumbuhan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 3 Karya Terpopuler */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-ink-150 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-sm font-bold text-ink flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Karya Terpopuler & Paling Banyak Dilirik Industri</span>
              </h2>
              <span className="text-xs text-ink-300 font-medium">Berdasarkan interaksi</span>
            </div>

            <div className="space-y-3">
              {projectShowcases.map((proj, idx) => (
                <div
                  key={proj.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-ink-150 hover:border-ink-150 bg-ink-100/50 hover:bg-ink-100 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-primary text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </div>
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-ink-100 shrink-0">
                      <Image src={proj.image} alt={proj.title} fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-ink leading-snug line-clamp-1">
                        {proj.title}
                      </h4>
                      <p className="text-[11px] text-ink-600 mt-0.5">
                        {proj.author} • <span className="font-medium text-ink-700">{proj.authorRole}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-ink-150 text-ink">
                      {proj.category}
                    </span>
                    <span className="text-rose-600 flex items-center gap-1 font-mono text-[11px]">
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      {proj.likes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grafik Pertumbuhan Bulanan */}
          <div className="bg-white rounded-2xl border border-ink-150 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-sm font-bold text-ink">
                  Pertumbuhan Karya Bulanan
                </h2>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  +133% 6 bln
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {monthlyData.map((d) => (
                  <div key={d.month} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-ink-600">{d.month}</span>
                      <span className="font-bold text-ink font-mono">{d.karya} Karya</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-ink-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary"
                        style={{ width: `${(d.karya / 45) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-ink-150 text-center">
              <p className="text-[11px] text-ink-300">
                Peningkatan tertinggi terjadi pada periode penyerahan tugas akhir siswa semester ganjil.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
