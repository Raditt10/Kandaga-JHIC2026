"use client"

import React, { useState } from "react"
import DashboardLayout, { DashboardTab } from "@/components/DashboardLayout"
import { useSession } from "next-auth/react"
import {
  Building2,
  Search,
  UserCheck,
  Briefcase,
  LayoutDashboard,
  Users,
  ShieldCheck,
  Plus,
  Filter,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  FileCheck2,
  Clock,
  Send
} from "lucide-react"

// Mock Data Katalog Talenta Terverifikasi
const verifiedTalents = [
  {
    id: "t-1",
    teamOrName: "Tim Riset Analis Kimia XIII",
    projectTitle: "Formulasi Indikator Asam-Basa Antosianin Alami",
    major: "Analis Kimia",
    skills: ["Spektrofotometri UV-Vis", "ISO 17025", "Quality Control"],
    score: 94,
    status: "Siap Magang / PKL",
    availability: "Semester Genap 2026/2027",
  },
  {
    id: "t-2",
    teamOrName: "Ahmad Rizky Pratama & Tim RPL",
    projectTitle: "EduClass — LMS & Presensi QR Cerdas",
    major: "RPL",
    skills: ["Next.js", "TypeScript", "PostgreSQL", "REST API"],
    score: 95,
    status: "Siap Magang / PKL",
    availability: "Segera",
  },
  {
    id: "t-3",
    teamOrName: "Bagus Setiawan & Tim TKJ",
    projectTitle: "Smart Green Energy Microcontroller IoT",
    major: "TKJ",
    skills: ["Mikrokontroler ESP32", "MQTT", "Jaringan Nirkabel", "MikroTik"],
    score: 92,
    status: "Siap Magang / PKL",
    availability: "Semester Genap 2026/2027",
  },
]

// Mock Lowongan PKL yang Dibuka Perusahaan
const companyInternships = [
  {
    id: "int-1",
    title: "Junior Frontend Engineer (Next.js)",
    major: "RPL",
    slots: "3 Kuota",
    applicants: 8,
    status: "Aktif",
    postedAt: "15 Sep 2026",
  },
  {
    id: "int-2",
    title: "Network Support & Infrastructure Intern",
    major: "TKJ",
    slots: "2 Kuota",
    applicants: 5,
    status: "Aktif",
    postedAt: "18 Sep 2026",
  },
]

export default function CompanyDashboardPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [majorFilter, setMajorFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const companyTabs: DashboardTab[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "katalog-talenta",
      label: "Katalog Talenta Siswa",
      icon: Users,
      badge: `${verifiedTalents.length}`,
    },
    {
      id: "lowongan-pkl",
      label: "Lowongan Magang / PKL",
      icon: Briefcase,
      badge: `${companyInternships.length}`,
    },
    {
      id: "legalitas",
      label: "Legalitas & Status BKK",
      icon: ShieldCheck,
    },
  ]

  const filteredTalents = verifiedTalents.filter((t) => {
    const matchMajor = majorFilter === "all" ? true : t.major === majorFilter
    const matchSearch =
      t.teamOrName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchMajor && matchSearch
  })

  return (
    <DashboardLayout
      roleTitle="Company / Mitra Portal"
      roleSlug="company"
      badgeColor="from-blue-600 to-indigo-700"
      icon={Building2}
      tabs={companyTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* ──────────────── TAB 1: DASHBOARD ──────────────── */}
      {activeTab === "dashboard" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-xs font-semibold mb-3">
                <Building2 className="w-3.5 h-3.5" />
                <span>Portal Mitra Industri & Penyaluran Talenta Siswa</span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Selamat Datang, {session?.user?.username || "Mitra Industri"}! 🏢
              </h1>
              <p className="font-sans text-blue-100 text-sm max-w-[65ch] mt-2 leading-relaxed">
                Akses eksklusif untuk mengevaluasi karya siswa terverifikasi sekolah, membuka lowongan Praktik Kerja Lapangan (PKL), dan merekrut talenta terbaik SMKN 13 Bandung melalui BKK.
              </p>

              {/* User Session Detail */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/15 text-xs">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-blue-200 block text-xs font-medium">Perusahaan ID</span>
                  <span className="font-mono font-bold text-white text-sm mt-0.5 block">{session?.user?.username || "pt.mitra-industri"}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-blue-200 block text-xs font-medium">Email Terverifikasi</span>
                  <span className="font-mono font-bold text-white text-sm mt-0.5 block truncate">{session?.user?.email || "recruitment@industri.co.id"}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-blue-200 block text-xs font-medium">Status Kemitraan</span>
                  <span className="font-bold text-emerald-400 text-sm mt-0.5 block">VERIFIED BKK PARTNER</span>
                </div>
              </div>
            </div>
          </div>

          {/* Talent Search & Internship Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h2 className="font-heading text-xs font-semibold text-zinc-500 uppercase tracking-wider">Katalog Talenta Tersedia</h2>
              <p className="font-heading text-3xl font-extrabold text-zinc-900 mt-2">120+ Karya</p>
              <span className="text-xs text-zinc-500 mt-1 block">RPL, TKJ & Analis Kimia terkurasi</span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <Briefcase className="w-5 h-5" />
              </div>
              <h2 className="font-heading text-xs font-semibold text-zinc-500 uppercase tracking-wider">Lowongan Magang Aktif</h2>
              <p className="font-heading text-3xl font-extrabold text-purple-700 mt-2">{companyInternships.length} Posisi</p>
              <span className="text-xs text-purple-700 font-medium mt-1 block">5 Kuota magang dibuka</span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="font-heading text-xs font-semibold text-zinc-500 uppercase tracking-wider">Kandidat Dalam Proses BKK</h2>
              <p className="font-heading text-3xl font-extrabold text-emerald-600 mt-2">13 Siswa</p>
              <span className="text-xs text-emerald-700 font-medium mt-1 block">Dalam koordinasi wawancara</span>
            </div>
          </div>

          {/* Quick Preview Talenta */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-zinc-900">Rekomendasi Talenta Terverifikasi</h2>
                <p className="text-xs text-zinc-500 max-w-[65ch]">Karya tugas akhir siswa dengan nilai kurasi di atas 90 yang siap diserap program PKL.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("katalog-talenta")}
                className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Katalog Lengkap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verifiedTalents.slice(0, 2).map((t) => (
                <div key={t.id} className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                      {t.major}
                    </span>
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                      Nilai: {t.score}/100
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-zinc-900">{t.projectTitle}</h3>
                  <p className="text-xs text-zinc-500 font-medium">Oleh: {t.teamOrName}</p>
                  <p className="text-xs text-zinc-600 font-mono">Skills: {t.skills.join(", ")}</p>
                  <button
                    type="button"
                    onClick={() => alert(`Minat wawancara untuk ${t.teamOrName} diteruskan ke BKK SMKN 13.`)}
                    className="w-full py-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Kirim Minat Wawancara via BKK
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 2: KATALOG TALENTA ──────────────── */}
      {activeTab === "katalog-talenta" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-zinc-900">
              Katalog Talenta & Karya Terverifikasi
            </h1>
            <p className="font-sans text-xs sm:text-sm text-zinc-500 mt-1 max-w-[65ch]">
              Eksplorasi portofolio siswa yang telah lulus kurasi sekolah. Sesuai prosedur BKK, pengajuan minat akan diverifikasi oleh koordinator sebelum wawancara.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-zinc-200/80 shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari skill atau judul proyek..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {[
                { id: "all", label: "Semua Jurusan" },
                { id: "RPL", label: "RPL (Software)" },
                { id: "TKJ", label: "TKJ (Jaringan)" },
                { id: "Analis Kimia", label: "Analis Kimia" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMajorFilter(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    majorFilter === m.id
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Talent Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTalents.map((t) => (
              <div key={t.id} className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {t.major}
                    </span>
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                      Skor Kurasi: {t.score}
                    </span>
                  </div>
                  <h2 className="font-heading text-base font-bold text-zinc-900">{t.projectTitle}</h2>
                  <p className="text-xs text-zinc-500 font-medium">Oleh: {t.teamOrName}</p>
                  <p className="text-xs text-zinc-600 font-mono">Ketersediaan: {t.availability}</p>

                  <div className="flex flex-wrap gap-1 pt-2">
                    {t.skills.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[11px] font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => alert(`Minat wawancara untuk ${t.teamOrName} diteruskan ke BKK SMKN 13.`)}
                    className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Minat Magang (BKK)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────── TAB 3: LOWONGAN PKL ──────────────── */}
      {activeTab === "lowongan-pkl" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs">
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-zinc-900">
                Lowongan Praktik Kerja Lapangan (PKL)
              </h1>
              <p className="font-sans text-xs sm:text-sm text-zinc-500 mt-1 max-w-[65ch]">
                Kelola lowongan magang industri Anda untuk siswa SMKN 13 Bandung. Lowongan aktif akan disebarkan melalui kanal BKK sekolah.
              </p>
            </div>
            <button
              type="button"
              onClick={() => alert("Formulir pembukaan lowongan PKL baru.")}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buka Posisi PKL Baru</span>
            </button>
          </div>

          <div className="space-y-4">
            {companyInternships.map((job) => (
              <div key={job.id} className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      Target: {job.major}
                    </span>
                    <span className="text-xs font-mono font-semibold text-zinc-400">Diposting: {job.postedAt}</span>
                  </div>
                  <h2 className="font-heading text-base font-bold text-zinc-900">{job.title}</h2>
                  <p className="text-xs text-zinc-500 mt-1">Kuota: {job.slots} • Pelamar siswa saat ini: <strong className="text-emerald-700">{job.applicants} siswa</strong></p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => alert(`Daftar ${job.applicants} pelamar untuk ${job.title}`)}
                    className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black transition cursor-pointer"
                  >
                    Review Pelamar ({job.applicants})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────── TAB 4: LEGALITAS & AKUN BKK ──────────────── */}
      {activeTab === "legalitas" && (
        <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-zinc-900">
              Dokumen Legalitas & Status Kemitraan BKK
            </h1>
            <p className="font-sans text-xs sm:text-sm text-zinc-500 mt-1 max-w-[65ch]">
              Informasi verifikasi legalitas perusahaan oleh Koordinator Bursa Kerja Khusus SMKN 13 Bandung sesuai prosedur operasional standar.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs space-y-6">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCheck2 className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="font-heading text-sm font-bold text-emerald-950">Status Kemitraan: Terverifikasi BKK</h3>
                  <p className="text-xs text-emerald-700">Nomor MoU Kemitraan Sekolah: 421.5/BKK-SMKN13/IND/2026</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full">
                Aktif (2026-2029)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-zinc-500 font-medium mb-1">Nama Perusahaan / Entitas</label>
                <input
                  type="text"
                  readOnly
                  value="PT Mitra Sinergi Teknologi Bandung"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-medium mb-1">Nomor Induk Berusaha (NIB)</label>
                <input
                  type="text"
                  readOnly
                  value="9120008321094"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-zinc-800"
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-medium mb-1">Bidang Industri Kerjasama</label>
                <input
                  type="text"
                  readOnly
                  value="Teknologi Informasi, Jaringan & Software House"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800"
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-medium mb-1">Kontak PIC HRD / BKK</label>
                <input
                  type="text"
                  readOnly
                  value="Dewi Anggraeni, S.Psi (HR Manager)"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
