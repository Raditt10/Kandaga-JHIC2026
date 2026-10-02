"use client"

import React, { useState } from "react"
import DashboardLayout, { DashboardTab } from "@/components/DashboardLayout"
import { useSession } from "next-auth/react"
import {
  Briefcase,
  LayoutDashboard,
  Building2,
  FileCheck,
  GraduationCap,
  Plus,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  BarChart3,
  TrendingUp,
  MapPin,
  Calendar
} from "lucide-react"

// Mock Pendaftar Mitra Industri yang Perlu Diverifikasi BKK
const initialPendingPartners = [
  {
    id: "p-1",
    companyName: "PT Global Tech Cyber Solution",
    nib: "9120003418901",
    sector: "Jaringan Komputer & Cyber Security (Target TKJ)",
    submittedAt: "01 Okt 2026",
    documentUrl: "NIB_PT_GlobalTech.pdf",
    pic: "Bambang Sudrajat (Operations Manager)",
    status: "pending",
  },
  {
    id: "p-2",
    companyName: "PT BioFar Laboratorium Nusantara",
    nib: "8120001928472",
    sector: "Analisis Kimia & Pengujian Mutu (Target Analis Kimia)",
    submittedAt: "30 Sep 2026",
    documentUrl: "Legalitas_BioFar_2026.pdf",
    pic: "Dr. Heni Wahyuni (Lab Director)",
    status: "pending",
  },
]

// Mock Lowongan Kerja Alumni BKK
const initialJobPostings = [
  {
    id: "j-1",
    company: "PT Kimia Farma Industri Tbk",
    title: "Junior Laboratory Analyst",
    targetMajor: "Analis Kimia",
    type: "Full-Time (Kontrak 1 Tahun)",
    location: "Bandung (Banjaran)",
    applicantsCount: 16,
    postedAt: "24 Sep 2026",
    deadline: "15 Okt 2026",
  },
  {
    id: "j-2",
    company: "Telkom Indonesia (Digital Service)",
    title: "Network Infrastructure Support",
    targetMajor: "TKJ",
    type: "Full-Time / PKL",
    location: "Bandung (Lembong)",
    applicantsCount: 22,
    postedAt: "25 Sep 2026",
    deadline: "20 Okt 2026",
  },
  {
    id: "j-3",
    company: "BukaStudio Software House",
    title: "Junior Frontend Developer (React/Next.js)",
    targetMajor: "RPL",
    type: "Full-Time",
    location: "Bandung (Dago)",
    applicantsCount: 14,
    postedAt: "28 Sep 2026",
    deadline: "25 Okt 2026",
  },
]

export default function BKKDashboardPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [pendingPartners, setPendingPartners] = useState(initialPendingPartners)
  const [jobPostings, setJobPostings] = useState(initialJobPostings)

  const handleApprovePartner = (id: string) => {
    setPendingPartners(pendingPartners.filter((p) => p.id !== id))
    alert("Mitra industri berhasil diverifikasi dan akun diberikan akses ke katalog talenta siswa.")
  }

  const bkkTabs: DashboardTab[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "verifikasi-mitra",
      label: "Verifikasi Mitra Industri",
      icon: FileCheck,
      badge: `${pendingPartners.length}`,
    },
    {
      id: "bursa-lowongan",
      label: "Bursa Kerja & Alumni",
      icon: Briefcase,
      badge: `${jobPostings.length}`,
    },
    {
      id: "tracer-study",
      label: "Tracer Study Lulusan",
      icon: BarChart3,
    },
  ]

  return (
    <DashboardLayout
      roleTitle="BKK / Bursa Kerja Khusus Portal"
      roleSlug="bkk"
      badgeColor="from-emerald-600 to-teal-700"
      icon={Briefcase}
      tabs={bkkTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* ──────────────── TAB 1: DASHBOARD BKK ──────────────── */}
      {activeTab === "dashboard" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-teal-200 text-xs font-semibold mb-3">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Pusat Bursa Kerja Khusus & Karir Alumni SMKN 13 Bandung</span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Portal BKK (Bursa Kerja Khusus) 💼
              </h1>
              <p className="font-sans text-teal-100 text-sm max-w-[65ch] mt-2 leading-relaxed">
                Kelola penyaluran kerja alumni, verifikasi legalitas mitra perusahaan pendaftar, dan pantau indikator serapan kerja lulusan tiga jurusan unggulan SMKN 13 Bandung.
              </p>

              {/* User Session Detail */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/15 text-xs">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-teal-200 block text-xs font-medium">Koordinator BKK</span>
                  <span className="font-mono font-bold text-white text-sm mt-0.5 block">{session?.user?.username || "koordinator.bkk"}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-teal-200 block text-xs font-medium">Email Resmi BKK</span>
                  <span className="font-mono font-bold text-white text-sm mt-0.5 block truncate">{session?.user?.email || "bkk@smkn13bandung.sch.id"}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-teal-200 block text-xs font-medium">Fungsi Penyaluran</span>
                  <span className="font-bold text-emerald-300 text-sm mt-0.5 block">KEMITRAAN & REKRUTMEN</span>
                </div>
              </div>
            </div>
          </div>

          {/* BKK Placement Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-zinc-200/90 shadow-xs">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Tingkat Serapan Kerja</span>
              <p className="font-heading text-3xl font-extrabold text-emerald-600 mt-2">94.2%</p>
              <span className="text-xs text-zinc-500 mt-1 block">Lulusan SMKN 13 Bandung</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-zinc-200/90 shadow-xs">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Mitra Industri MoU</span>
              <p className="font-heading text-3xl font-extrabold text-blue-600 mt-2">45 Mitra</p>
              <span className="text-xs text-zinc-500 mt-1 block">RPL, TKJ & Analis Kimia</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-zinc-200/90 shadow-xs">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Lowongan Kerja Aktif</span>
              <p className="font-heading text-3xl font-extrabold text-teal-600 mt-2">{jobPostings.length} Posisi</p>
              <span className="text-xs text-zinc-500 mt-1 block">Terbuka untuk Alumni</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-zinc-200/90 shadow-xs">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Job Fair Mendatang</span>
              <p className="font-heading text-xl font-extrabold text-purple-700 mt-2">Kandaga Fair 2026</p>
              <span className="text-xs text-zinc-500 mt-1 block">15 - 18 Oktober 2026</span>
            </div>
          </div>

          {/* Verification & Placement Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Industry Verification */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-lg font-bold text-zinc-900">Pendaftaran Mitra Menunggu Verifikasi</h2>
                  <p className="text-xs text-zinc-500">Perusahaan yang baru mendaftar dan menunggu validasi NIB.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("verifikasi-mitra")}
                  className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Lihat Semua ({pendingPartners.length})
                </button>
              </div>

              <div className="space-y-3">
                {pendingPartners.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-sm font-bold text-zinc-900">{item.companyName}</h3>
                      <p className="text-xs text-zinc-500 font-mono">NIB: {item.nib} • {item.sector}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApprovePartner(item.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shrink-0"
                    >
                      Setujui NIB
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tracer Summary */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-xs space-y-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-zinc-900">Distribusi Keterserapan Alumni</h2>
                <p className="text-xs text-zinc-500">Laporan Tracer Study Angkatan 2025/2026 SMKN 13 Bandung.</p>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { label: "Bekerja di Industri Mitra", pct: "74%", count: "248 Siswa", color: "bg-emerald-500" },
                  { label: "Melanjutkan Studi (Kuliah / PTN)", pct: "16%", count: "54 Siswa", color: "bg-blue-500" },
                  { label: "Wirausaha Mandiri / Startup", pct: "4.2%", count: "14 Siswa", color: "bg-amber-500" },
                  { label: "Masa Tunggu / Penyiapan Kerja", pct: "5.8%", count: "19 Siswa", color: "bg-zinc-300" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-zinc-700">{item.label}</span>
                      <span className="font-mono font-bold text-zinc-900">{item.pct} ({item.count})</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: item.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 2: VERIFIKASI MITRA INDUSTRI ──────────────── */}
      {activeTab === "verifikasi-mitra" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-zinc-900">
              Verifikasi Dokumen Legalitas Mitra Industri
            </h1>
            <p className="font-sans text-xs sm:text-sm text-zinc-500 mt-1 max-w-[65ch]">
              Sesuai standar operasional BKK, perusahaan wajib memverifikasi Nomor Induk Berusaha (NIB) dan izin operasional sebelum dapat mengakses katalog karya siswa secara penuh.
            </p>
          </div>

          <div className="space-y-4">
            {pendingPartners.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-heading text-base font-bold text-zinc-800">Semua Mitra Telah Diverifikasi</h3>
                <p className="text-xs text-zinc-500 mt-1">Tidak ada dokumen pendaftar industri yang pending saat ini.</p>
              </div>
            ) : (
              pendingPartners.map((item) => (
                <div key={item.id} className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs">
                          Pending Verifikasi BKK
                        </span>
                        <span className="text-xs text-zinc-400 font-mono">Daftar: {item.submittedAt}</span>
                      </div>
                      <h2 className="font-heading text-lg font-bold text-zinc-900">{item.companyName}</h2>
                      <p className="text-xs text-zinc-600 mt-0.5">Sektor Industri: <strong>{item.sector}</strong></p>
                      <p className="text-xs text-zinc-500">PIC Perusahaan: {item.pic}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => alert(`Membuka lampiran dokumen: ${item.documentUrl}`)}
                        className="px-3.5 py-2 border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Tinjau NIB ({item.nib})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprovePartner(item.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Setujui Kemitraan
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ──────────────── TAB 3: BURSA LOWONGAN KERJA ──────────────── */}
      {activeTab === "bursa-lowongan" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs">
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-zinc-900">
                Lowongan Kerja Khusus Alumni & Siswa BKK
              </h1>
              <p className="font-sans text-xs sm:text-sm text-zinc-500 mt-1 max-w-[65ch]">
                Katalog rekrutmen resmi dari mitra industri SMKN 13 Bandung untuk lulusan jurusan RPL, TKJ, dan Analis Kimia.
              </p>
            </div>
            <button
              type="button"
              onClick={() => alert("Formulir penambahan lowongan kerja BKK baru.")}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Lowongan BKK</span>
            </button>
          </div>

          <div className="space-y-4">
            {jobPostings.map((job) => (
              <div key={job.id} className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Target: {job.targetMajor}
                    </span>
                    <span className="text-xs font-semibold text-zinc-500">{job.type}</span>
                  </div>
                  <h2 className="font-heading text-base font-bold text-zinc-900 pt-0.5">{job.title}</h2>
                  <p className="text-xs text-zinc-600 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{job.company}</span>
                    <span className="text-zinc-300">•</span>
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{job.location}</span>
                  </p>
                  <p className="text-xs text-zinc-500">Pelamar Alumni: <strong className="text-emerald-700">{job.applicantsCount} berkas masuk</strong> • Batas: {job.deadline}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => alert(`Daftar ${job.applicantsCount} pelamar alumni untuk ${job.title}`)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Kelola Penyaluran ({job.applicantsCount})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────── TAB 4: TRACER STUDY ──────────────── */}
      {activeTab === "tracer-study" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-zinc-900">
              Laporan Tracer Study & Indikator Kinerja Lulusan
            </h1>
            <p className="font-sans text-xs sm:text-sm text-zinc-500 mt-1 max-w-[65ch]">
              Data pelacakan jejak alumni SMKN 13 Bandung untuk evaluasi relevansi kurikulum dan kebutuhan industri.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs space-y-2">
              <span className="text-xs font-bold text-zinc-500 uppercase">Rekayasa Perangkat Lunak (RPL)</span>
              <p className="font-heading text-3xl font-extrabold text-rose-700">96.8%</p>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Terserap di Software House Bandung & Jakarta, Fintech, serta melanjutkan ke Informatika ITB/Telkom Univ.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs space-y-2">
              <span className="text-xs font-bold text-zinc-500 uppercase">Teknik Komputer Jaringan (TKJ)</span>
              <p className="font-heading text-3xl font-extrabold text-blue-700">93.4%</p>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Terserap di ISP, BUMN Telkom, data center cloud operator, serta wirausaha teknisi jaringan.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs space-y-2">
              <span className="text-xs font-bold text-zinc-500 uppercase">Analis Kimia (4 Tahun)</span>
              <p className="font-heading text-3xl font-extrabold text-emerald-700">95.1%</p>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Terserap di industri farmasi, laboratorium pengujian mutu pangan BPOM/Sucofindo, dan industri kimia tekstil.
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
