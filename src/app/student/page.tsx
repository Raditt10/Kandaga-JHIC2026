"use client";

import React, { useState } from "react"
import DashboardLayout, { DashboardTab } from "@/components/DashboardLayout"
import AccountSettings from "@/components/settings/AccountSettings"
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
  LayoutDashboard,
  FolderGit2,
  Briefcase,
  User,
  Plus,
  ExternalLink,
  Eye,
  Clock,
  Filter,
  Search,
  X,
  FileText,
  AlertCircle,
  Building2,
  ChevronRight,
  BookOpen,
  Settings
} from "lucide-react"

export interface StudentProject {
  id: string
  title: string
  description: string
  major: string
  category: string
  techStack: string[]
  views: number
  status: string
  mentor: string
  submittedAt: string
  verifiedAt: string | null
  score: number | null
  github: string | null
  demo: string | null
}

// Mock Data Karya Siswa
const initialProjects: StudentProject[] = [
  {
    id: "1",
    title: "EduClass — LMS & Presensi QR Cerdas",
    description: "Sistem manajemen kelas digital terintegrasi presensi QR code geolokasi dan modul penilaian otomatis berbasis kurikulum merdeka.",
    major: "RPL",
    category: "Web & Mobile App",
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    views: 1240,
    status: "verified", // verified | review | draft
    mentor: "Drs. Ahmad Hidayat, M.Kom",
    submittedAt: "18 Sep 2026",
    verifiedAt: "22 Sep 2026",
    score: 95,
    github: "https://github.com/smkn13/educlass-lms",
    demo: "https://educlass.smkn13bandung.sch.id",
  },
  {
    id: "2",
    title: "Smart Green Energy Microcontroller IoT",
    description: "Sistem monitoring daya panel surya laboratorium sekolah secara real-time via MQTT protocol dan dashboard telemetry.",
    major: "TKJ",
    category: "IoT & Network System",
    techStack: ["ESP32", "MicroPython", "MQTT", "Grafana"],
    views: 890,
    status: "verified",
    mentor: "Budi Santoso, S.T.",
    submittedAt: "10 Sep 2026",
    verifiedAt: "15 Sep 2026",
    score: 92,
    github: "https://github.com/smkn13/iot-green-energy",
    demo: "https://iot.smkn13bandung.sch.id",
  },
  {
    id: "3",
    title: "Formulasi Indikator Asam-Basa Antosianin Alami",
    description: "Ekstraksi pigmen bunga telang dan kubis ungu terstandarisasi spektrofotometri sebagai alternatif ramah lingkungan indikator titrasi.",
    major: "Analis Kimia",
    category: "Riset Laboratorium ISO",
    techStack: ["Spektrofotometri UV-Vis", "Ekstraksi Pelarut", "Uji Presisi ISO 17025"],
    views: 450,
    status: "review",
    mentor: "Dra. Siti Nurhaliza, M.Si",
    submittedAt: "26 Sep 2026",
    verifiedAt: null,
    score: null,
    github: null,
    demo: null,
  },
  {
    id: "4",
    title: "Kandaga Asset Hub — Inventory Jaringan Sekolah",
    description: "Modul pelacakan perangkat switch, router, dan workstation lab berbasis barcode scanner PWA.",
    major: "TKJ",
    category: "Network Infrastructure",
    techStack: ["React", "Node.js", "SQLite"],
    views: 310,
    status: "verified",
    mentor: "Budi Santoso, S.T.",
    submittedAt: "05 Agu 2026",
    verifiedAt: "12 Agu 2026",
    score: 89,
    github: "https://github.com/smkn13/asset-hub",
    demo: null,
  },
]

// Mock Peluang Magang dari BKK & Industri
const internshipOpportunities = [
  {
    id: "m-1",
    company: "PT Telkom Indonesia (Digital Service)",
    role: "Junior Network & Cloud Engineer",
    majorTarget: "TKJ",
    type: "PKL Bersertifikat (6 Bulan)",
    location: "Bandung (Hybrid)",
    status: "Buka Pendaftaran",
    deadline: "20 Okt 2026",
  },
  {
    id: "m-2",
    company: "BukaStudio Software House",
    role: "Frontend Developer Intern",
    majorTarget: "RPL",
    type: "Magang Industri (3-6 Bulan)",
    location: "Bandung (On-site)",
    status: "Buka Pendaftaran",
    deadline: "25 Okt 2026",
  },
  {
    id: "m-3",
    company: "PT Kimia Farma Industri Tbk",
    role: "QC Lab Analyst Intern",
    majorTarget: "Analis Kimia",
    type: "PKL Industri Farmasi",
    location: "Bandung / Banjaran",
    status: "Terbatas (3 Kuota)",
    deadline: "15 Okt 2026",
  },
]

export default function StudentDashboardPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [projects, setProjects] = useState<StudentProject[]>(initialProjects)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  // Form State untuk modal Tambah Karya
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newMajor, setNewMajor] = useState("RPL")
  const [newCategory, setNewCategory] = useState("Web & Mobile App")
  const [newTechStack, setNewTechStack] = useState("")
  const [newGithub, setNewGithub] = useState("")
  const [newDemo, setNewDemo] = useState("")

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const newProject = {
      id: String(Date.now()),
      title: newTitle,
      description: newDescription || "Deskripsi proyek tugas akhir siswa.",
      major: newMajor,
      category: newCategory,
      techStack: newTechStack ? newTechStack.split(",").map((t) => t.trim()) : ["Proyek Baru"],
      views: 1,
      status: "review",
      mentor: "Menunggu Penugasan Guru Pembimbing",
      submittedAt: "Baru saja",
      verifiedAt: null,
      score: null,
      github: newGithub || null,
      demo: newDemo || null,
    }

    setProjects([newProject, ...projects])
    setIsUploadModalOpen(false)
    // reset form
    setNewTitle("")
    setNewDescription("")
    setNewTechStack("")
    setNewGithub("")
    setNewDemo("")
    setActiveTab("karya-saya")
  }

  // Filter Projects
  const filteredProjects = projects.filter((p) => {
    const matchStatus =
      filterStatus === "all" ? true : p.status === filterStatus
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchSearch
  })

  // Tabs Definition
  const studentTabs: DashboardTab[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "karya-saya",
      label: "Karya Saya",
      icon: FolderGit2,
      badge: `${projects.length}`,
    },
    {
      id: "magang",
      label: "Peluang Magang & BKK",
      icon: Briefcase,
      badge: `${internshipOpportunities.length}`,
    },
    {
      id: "profil",
      label: "Profil Siswa",
      icon: User,
    },
    {
      id: "pengaturan",
      label: "Pengaturan",
      icon: Settings,
    },
  ]

  return (
    <DashboardLayout
      roleTitle="Siswa"
      roleSlug="student"
      icon={GraduationCap}
      tabs={studentTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* ──────────────── TAB 1: DASHBOARD ──────────────── */}
      {activeTab === "dashboard" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Header Welcome Card */}
          <div className="bg-gradient-to-r from-rose-950 via-[#701026] to-[#8B1A2F] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-rose-100 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Portal Portofolio Siswa SMKN 13 Bandung</span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Halo, {session?.user?.username || "Siswa Kandaga"}! 🎓
              </h1>
              <p className="font-sans text-rose-100 text-sm max-w-[65ch] mt-2 leading-relaxed">
                Kelola karya tugas akhir dan riset laboratorium Anda. Karya yang telah diverifikasi oleh guru pembimbing akan otomatis tampil di Galeri Utama Kandaga dan dapat diakses mitra industri nasional.
              </p>

              {/* User Session Detail Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/15 text-xs">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-rose-200 block text-xs font-medium">Username Akun</span>
                  <span className="font-mono font-bold text-white text-sm mt-0.5 block">{session?.user?.username || "siswa.smkn13"}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-rose-200 block text-xs font-medium">Email Sekolah</span>
                  <span className="font-mono font-bold text-white text-sm mt-0.5 block truncate">{session?.user?.email || "siswa@smkn13bandung.sch.id"}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-rose-200 block text-xs font-medium">Status Akun Siswa</span>
                  <span className="font-bold text-emerald-300 text-sm mt-0.5 block">TERVERIFIKASI AKTIF</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-zinc-200/90 shadow-xs">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Total Karya Diunggah</span>
              <p className="font-heading text-3xl font-extrabold text-zinc-900 mt-2">{projects.length}</p>
              <span className="text-xs text-zinc-500 mt-1 block">Tugas akhir & portofolio</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-zinc-200/90 shadow-xs">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Terverifikasi Guru</span>
              <p className="font-heading text-3xl font-extrabold text-emerald-600 mt-2">
                {projects.filter((p) => p.status === "verified").length}
              </p>
              <span className="text-xs text-emerald-700 font-medium mt-1 block">Tayang di Galeri Utama</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-zinc-200/90 shadow-xs">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Dalam Review Guru</span>
              <p className="font-heading text-3xl font-extrabold text-amber-600 mt-2">
                {projects.filter((p) => p.status === "review").length}
              </p>
              <span className="text-xs text-amber-700 font-medium mt-1 block">Sedang dinilai pembimbing</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-zinc-200/90 shadow-xs">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Dilihat Mitra Industri</span>
              <p className="font-heading text-3xl font-extrabold text-blue-600 mt-2">
                {projects.reduce((acc, curr) => acc + curr.views, 0).toLocaleString()}
              </p>
              <span className="text-xs text-blue-700 font-medium mt-1 block">Total impresi industri</span>
            </div>
          </div>

          {/* Alur Kurasi & Aksi Cepat */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Alur Kurasi Siswa */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-lg font-bold text-zinc-900">Alur Verifikasi Karya Sekolah</h2>
                  <p className="text-xs text-zinc-500 max-w-[65ch]">Setiap karya melalui 4 tahapan kurasi sebelum ditayangkan ke publik dan mitra industri.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 bg-[#8B1A2F] text-white rounded-xl text-xs font-bold hover:bg-[#701026] transition cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Karya</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { step: "01", title: "Unggah Draf", desc: "Isi data proyek, stack, tautan GitHub/laporan", active: true },
                  { step: "02", title: "Review Guru", desc: "Verifikasi kelayakan riset oleh Guru Pembimbing", active: true },
                  { step: "03", title: "Approval Sekolah", desc: "Standarisasi ISO & kurasi tim kurikulum", active: true },
                  { step: "04", title: "Publikasi Galeri", desc: "Tampil di galeri utama & diakses industri", active: true },
                ].map((s, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 relative">
                    <span className="font-mono text-xs font-extrabold text-[#8B1A2F] block mb-1">{s.step}</span>
                    <h3 className="font-heading text-xs font-bold text-zinc-900">{s.title}</h3>
                    <p className="text-[12px] text-zinc-500 mt-1 leading-snug">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Card */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 mb-4">
                  <Award className="w-5 h-5" />
                </div>
                <h2 className="font-heading text-lg font-bold">Siapkan Portofolio PKL</h2>
                <p className="font-sans text-xs text-zinc-300 mt-2 leading-relaxed">
                  Mitra industri saat ini sedang membuka rekrutmen magang untuk periode semester mendatang melalui unit BKK SMKN 13.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("magang")}
                className="mt-6 w-full py-2.5 px-4 bg-white text-zinc-950 rounded-xl font-bold text-xs hover:bg-zinc-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Lihat Lowongan Magang</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Karya Terbaru Siswa Preview */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-zinc-900">Karya Terkini Anda</h2>
              <button
                type="button"
                onClick={() => setActiveTab("karya-saya")}
                className="text-xs font-bold text-[#8B1A2F] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Menu Karya Saya ({projects.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-zinc-100">
              {projects.slice(0, 3).map((item) => (
                <div key={item.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#8B1A2F] flex items-center justify-center shrink-0">
                      {item.major === "RPL" ? <FileCode className="w-5 h-5" /> : item.major === "TKJ" ? <Wifi className="w-5 h-5" /> : <FlaskConical className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-bold text-zinc-900">{item.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">{item.major}</span>
                        <span className="text-xs text-zinc-500">{item.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs text-zinc-500 font-mono">{item.views} views</span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        item.status === "verified"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.status === "verified" ? "Terverifikasi" : "Review Pembimbing"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 2: KARYA SAYA ──────────────── */}
      {activeTab === "karya-saya" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs">
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-zinc-900">
                Karya & Portofolio Saya
              </h1>
              <p className="font-sans text-xs sm:text-sm text-zinc-500 mt-1 max-w-[65ch]">
                Koleksi karya portofolio Anda. Unggah proyek tugas akhir baru atau pantau status kurasi guru pembimbing.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 bg-[#8B1A2F] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#701026] transition cursor-pointer flex items-center justify-center gap-2 shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Unggah Karya Baru</span>
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-zinc-200/80 shadow-xs">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari karya saya..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#8B1A2F]"
              />
            </div>

            {/* Filter Status Buttons */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {[
                { id: "all", label: "Semua Karya", count: projects.length },
                { id: "verified", label: "Terverifikasi", count: projects.filter((p) => p.status === "verified").length },
                { id: "review", label: "Dalam Review", count: projects.filter((p) => p.status === "review").length },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    filterStatus === f.id
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  <span>{f.label}</span>
                  <span className="ml-1.5 text-[11px] opacity-75">({f.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Project List Items */}
          <div className="space-y-4">
            {filteredProjects.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200">
                <FolderGit2 className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                <h3 className="font-heading text-base font-bold text-zinc-700">Tidak ada karya yang cocok</h3>
                <p className="text-xs text-zinc-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter status Anda.</p>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs hover:border-zinc-300 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                          {project.major}
                        </span>
                        <span className="text-xs font-semibold text-zinc-500">
                          {project.category}
                        </span>
                        <span className="text-zinc-300">•</span>
                        <span className="text-xs text-zinc-400">Diajukan: {project.submittedAt}</span>
                      </div>
                      <h2 className="font-heading text-lg font-bold text-zinc-900 pt-1">
                        {project.title}
                      </h2>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {project.status === "verified" ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Terverifikasi Sekolah</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Menunggu Kurasi Guru</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="font-sans text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-[65ch]">
                    {project.description}
                  </p>

                  {/* Tech stack chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 text-xs font-mono font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Footer info: Pembimbing, Nilai, Aksi */}
                  <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <p className="text-zinc-500">
                        Pembimbing: <strong className="text-zinc-800">{project.mentor}</strong>
                      </p>
                      {project.score && (
                        <p className="text-emerald-700 font-semibold">
                          Nilai Kelayakan Kurasi: {project.score} / 100
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl border border-zinc-200 text-zinc-700 font-semibold hover:bg-zinc-50 transition flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>GitHub</span>
                        </a>
                      )}
                      {project.demo && (
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-zinc-900 text-white font-semibold hover:bg-black transition flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Live Demo</span>
                        </a>
                      )}
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-xl border border-zinc-200 text-zinc-600 font-semibold hover:bg-zinc-50 transition cursor-pointer"
                      >
                        Edit Draf
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ──────────────── TAB 3: PELUANG MAGANG & BKK ──────────────── */}
      {activeTab === "magang" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-zinc-900">
              Peluang Magang & Kemitraan Industri (BKK)
            </h1>
            <p className="font-sans text-xs sm:text-sm text-zinc-500 mt-1 max-w-[65ch]">
              Peluang Praktik Kerja Lapangan (PKL) dan rekrutmen magang industri yang telah dikurasi oleh Bursa Kerja Khusus (BKK) SMKN 13 Bandung.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {internshipOpportunities.map((m) => (
              <div key={m.id} className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      Target: {m.majorTarget}
                    </span>
                    <span className="text-xs text-amber-600 font-semibold font-mono">{m.status}</span>
                  </div>
                  <h2 className="font-heading text-base font-bold text-zinc-900">{m.role}</h2>
                  <p className="text-xs font-semibold text-zinc-700 mt-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{m.company}</span>
                  </p>
                  <p className="text-xs text-zinc-500 mt-2">{m.type} • {m.location}</p>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">Batas: {m.deadline}</span>
                  <button
                    type="button"
                    onClick={() => alert(`Pengajuan minat untuk ${m.role} di ${m.company} diteruskan ke Koordinator BKK SMKN 13.`)}
                    className="px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Ajukan Minat via BKK
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────── TAB 4: PROFIL SISWA ──────────────── */}
      {activeTab === "profil" && (
        <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-zinc-900">
              Profil & Informasi Siswa
            </h1>
            <p className="font-sans text-xs sm:text-sm text-zinc-500 mt-1 max-w-[65ch]">
              Data identitas siswa yang tercatat di sistem akademik SMKN 13 Bandung dan lampiran portofolio resmi.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-zinc-500 font-medium mb-1">Nama Siswa</label>
                <input
                  type="text"
                  readOnly
                  value={session?.user?.username || "Ahmad Rizky Pratama"}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-medium mb-1">Email Akademik</label>
                <input
                  type="text"
                  readOnly
                  value={session?.user?.email || "ahmad.rizky@smkn13bandung.sch.id"}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-zinc-700"
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-medium mb-1">Kompetensi Keahlian</label>
                <input
                  type="text"
                  readOnly
                  value="Rekayasa Perangkat Lunak (RPL)"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl font-semibold text-rose-800"
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-medium mb-1">Tingkat / Kelas</label>
                <input
                  type="text"
                  readOnly
                  value="XII RPL 1 (Tahun Ajaran 2026/2027)"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 font-medium mb-1">Bio Singkat Portofolio</label>
              <textarea
                readOnly
                rows={3}
                value="Siswa tingkat akhir jurusan RPL SMKN 13 Bandung dengan spesialisasi Next.js, TypeScript, dan arsitektur database relasional PostgreSQL. Memiliki sertifikasi junior web developer BNSP."
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 leading-relaxed resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL UNGGAH KARYA BARU ──────────────── */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#8B1A2F] flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="font-heading text-lg font-bold text-zinc-900">Unggah Karya Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Judul Karya / Proyek *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: EduClass — LMS & Presensi QR Cerdas"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8B1A2F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Kompetensi Keahlian</label>
                  <select
                    value={newMajor}
                    onChange={(e) => setNewMajor(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-white focus:outline-none"
                  >
                    <option value="RPL">RPL (Rekayasa Perangkat Lunak)</option>
                    <option value="TKJ">TKJ (Teknik Komputer Jaringan)</option>
                    <option value="Analis Kimia">Analis Kimia</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Kategori Karya</label>
                  <input
                    type="text"
                    placeholder="Web App, IoT, Riset ISO"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Deskripsi Proyek Singkat</label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan tujuan, masalah yang diselesaikan, dan hasil karya Anda..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Teknologi / Stack (pisahkan koma)</label>
                <input
                  type="text"
                  placeholder="Next.js, TypeScript, PostgreSQL"
                  value={newTechStack}
                  onChange={(e) => setNewTechStack(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Tautan GitHub / Repo</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={newGithub}
                    onChange={(e) => setNewGithub(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Tautan Demo / Laporan</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newDemo}
                    onChange={(e) => setNewDemo(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-amber-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Setelah disimpan, karya akan berstatus <strong>Menunggu Kurasi Guru</strong>. Guru pembimbing akan menerima notifikasi untuk menilai karya Anda.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 text-zinc-600 rounded-xl font-bold hover:bg-zinc-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8B1A2F] text-white rounded-xl font-bold hover:bg-[#701026] transition cursor-pointer"
                >
                  Simpan & Ajukan Kurasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ──────────────── TAB 5: PENGATURAN AKUN ──────────────── */}
      {activeTab === "pengaturan" && <AccountSettings />}
    </DashboardLayout>
  );
}
