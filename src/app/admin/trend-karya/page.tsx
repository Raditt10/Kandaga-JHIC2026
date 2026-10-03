"use client"

import React, { useState, useEffect } from "react"
import {
  TrendingUp,
  Sparkles,
  Heart,
  Eye,
  Filter,
  BarChart3,
  Flame,
} from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"
import type { ProjectShowcase } from "@/types"

export default function AdminTrendKaryaPage() {
  const [projects, setProjects] = useState<ProjectShowcase[]>([])
  const [selectedJurusan, setSelectedJurusan] = useState("all")

  // Interaksi grafik pertumbuhan bulanan
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/admin/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.projects)) {
          setProjects(data.projects)
        }
      })
      .catch((e) => console.error("Gagal memuat karya:", e))
  }, [])

  const jurusanTrends = [
    {
      name: "Rekayasa Perangkat Lunak (RPL)",
      tag: "RPL",
      count: 54,
      growth: "+28%",
      color: "border-red-200 bg-red-50/50",
      accent: "bg-red-500",
      badgeColor: "bg-red-100 text-red-700",
      topTech: ["Next.js & React", "IoT Telemetry", "AI Vision", "Mobile Flutter"],
    },
    {
      name: "Teknik Komputer Jaringan (TKJ)",
      tag: "TKJ",
      count: 46,
      growth: "+22%",
      color: "border-amber-200 bg-amber-50/50",
      accent: "bg-amber-500",
      badgeColor: "bg-amber-100 text-amber-800",
      topTech: ["MikroTik & Cisco", "Serverless VPS", "Network Security", "Smart Home IoT"],
    },
    {
      name: "Analis Kimia (AK)",
      tag: "Analis Kimia",
      count: 42,
      growth: "+24%",
      color: "border-emerald-200 bg-emerald-50/50",
      accent: "bg-emerald-500",
      badgeColor: "bg-emerald-100 text-emerald-800",
      topTech: ["Spektrofotometri", "Baku Mutu Air", "Uji Sampel Limbah", "Standar ISO 17025"],
    },
  ]

  const monthlyData = [
    { month: "Mei", karya: 18 },
    { month: "Jun", karya: 24 },
    { month: "Jul", karya: 29 },
    { month: "Agt", karya: 32 },
    { month: "Sep", karya: 38 },
    { month: "Okt (Berjalan)", karya: 42 },
  ]

  const totalKarya = monthlyData.reduce((sum, d) => sum + d.karya, 0)

  // Geometri grafik pertumbuhan bulanan
  const chart = { width: 560, height: 240, padLeft: 36, padRight: 12, padTop: 14, padBottom: 28 }
  const plotWidth = chart.width - chart.padLeft - chart.padRight
  const plotHeight = chart.height - chart.padTop - chart.padBottom
  const bandWidth = plotWidth / monthlyData.length
  const barWidth = Math.min(34, bandWidth * 0.42)

  const axisMax = Math.max(10, Math.ceil(Math.max(...monthlyData.map((d) => d.karya), 1) / 10) * 10)
  const gridSteps = Array.from({ length: axisMax / 10 + 1 }, (_, index) => index * 10)

  const bandCenter = (index: number) => chart.padLeft + bandWidth * index + bandWidth / 2
  const valueToY = (value: number) => chart.padTop + plotHeight - (value / axisMax) * plotHeight
  const shortMonthLabel = (month: string) => month.replace(/\s*\(.*\)$/, "")
  const barPath = (x: number, y: number, width: number, height: number, radius: number) => {
    const r = Math.max(0, Math.min(radius, height, width / 2))
    return `M ${x} ${y + height} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} L ${x + width - r} ${y} Q ${x + width} ${y} ${x + width} ${y + r} L ${x + width} ${y + height} Z`
  }
  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Unified Header & Analytics Overview */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#891337]" />
                <span>Trend Karya Siswa</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Pantau performa unggahan proyek, topik teknologi terpopuler, dan minat industri terhadap kompetensi siswa.
              </p>
            </div>
          </div>
        </div>

        {/* Section: Tren Tiap Jurusan */}
        <div className="space-y-3">
          <h2 className="font-heading text-sm font-bold text-slate-900">
            Performa Unggahan Berdasarkan Kompetensi Keahlian
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {jurusanTrends.map((j) => (
              <div
                key={j.tag}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-heading text-sm font-bold text-slate-900 mb-1">
                    {j.name}
                  </h3>
                  <p className="text-2xl font-extrabold text-slate-900">
                    {j.count} <span className="text-xs font-semibold text-slate-500">Karya Terverifikasi</span>
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Topik Paling Populer:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {j.topTech.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-semibold"
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
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-sm font-bold text-slate-900">
                Karya Terpopuler &amp; Paling Banyak Dilirik Industri
              </h2>
              <span className="text-xs text-slate-400 font-medium">Berdasarkan interaksi</span>
            </div>

            <div className="space-y-3">
              {projects.slice(0, 3).map((proj, idx) => (
                <div
                  key={proj.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-[#891337] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                        {proj.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {proj.author} • <span className="font-medium text-slate-700">{proj.authorRole}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-slate-200 text-slate-800">
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
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-sm font-bold text-slate-900">
                    Pertumbuhan Karya Bulanan
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Jumlah karya terkurasi yang diunggah tiap bulan
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-medium text-slate-400">Total karya</span>
                  <span className="block text-sm font-bold text-slate-900 font-mono">{totalKarya}</span>
                </div>
              </div>

              {/* Grafik */}
              <div className="relative w-full mt-4">
                <svg
                  viewBox={`0 0 ${chart.width} ${chart.height}`}
                  className="w-full h-auto"
                  role="img"
                  aria-label="Grafik jumlah karya terkurasi per bulan"
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <defs>
                    <linearGradient id="trendKaryaBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a61743" />
                      <stop offset="100%" stopColor="#891337" stopOpacity="0.7" />
                    </linearGradient>
                  </defs>

                  {/* Gridline & label sumbu Y */}
                  {gridSteps.map((step) => (
                    <g key={`grid-${step}`}>
                      <line
                        x1={chart.padLeft}
                        x2={chart.width - chart.padRight}
                        y1={valueToY(step)}
                        y2={valueToY(step)}
                        stroke={step === 0 ? "#cbd5e1" : "#e2e8f0"}
                        strokeDasharray={step === 0 ? undefined : "3 4"}
                      />
                      <text
                        x={chart.padLeft - 8}
                        y={valueToY(step)}
                        textAnchor="end"
                        dominantBaseline="middle"
                        fontSize="9"
                        fill="#94a3b8"
                      >
                        {step}
                      </text>
                    </g>
                  ))}

                  {/* Batang jumlah karya */}
                  {monthlyData.map((d, index) => {
                    const barTop = valueToY(d.karya)
                    const barHeight = chart.padTop + plotHeight - barTop
                    const barX = chart.padLeft + bandWidth * index + (bandWidth - barWidth) / 2
                    return (
                      <path
                        key={`karya-${d.month}`}
                        d={barPath(barX, barTop, barWidth, barHeight, 6)}
                        fill="url(#trendKaryaBar)"
                        opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.3}
                        className="transition-opacity duration-200"
                      />
                    )
                  })}

                  {/* Label bulan & area hover per bulan */}
                  {monthlyData.map((d, index) => (
                    <g key={`band-${d.month}`}>
                      <rect
                        x={chart.padLeft + bandWidth * index}
                        y={chart.padTop}
                        width={bandWidth}
                        height={plotHeight}
                        fill="#891337"
                        fillOpacity={hoveredIndex === index ? 0.05 : 0}
                        onMouseEnter={() => setHoveredIndex(index)}
                      />
                      <text
                        x={bandCenter(index)}
                        y={chart.height - chart.padBottom + 17}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight={hoveredIndex === index ? 700 : 400}
                        fill={hoveredIndex === index ? "#891337" : "#94a3b8"}
                      >
                        {shortMonthLabel(d.month)}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Tooltip mengikuti bulan yang disorot */}
                {hoveredIndex !== null && (
                  <div
                    className="pointer-events-none absolute top-0 z-10 min-w-[140px] -translate-x-1/2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg"
                    style={{
                      left: `${Math.min(Math.max((bandCenter(hoveredIndex) / chart.width) * 100, 18), 82)}%`,
                    }}
                  >
                    <p className="text-[10px] font-bold text-slate-900">
                      {monthlyData[hoveredIndex].month}
                    </p>
                    <div className="mt-1 space-y-1">
                      <p className="flex items-center justify-between gap-3 text-[10px]">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <span className="w-2 h-2 rounded-full bg-[#891337]" />
                          Karya
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {monthlyData[hoveredIndex].karya}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-slate-400 mt-2">
                Arahkan kursor ke grafik untuk melihat rincian tiap bulan. Okt adalah periode berjalan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
