"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import DashboardLayout, { DashboardTab } from "@/components/DashboardLayout"
import AccountSettings from "@/components/settings/AccountSettings"
import EmptyState from "@/components/ui/EmptyState"
import { FilterDropdown } from "@/components/ui/FilterDropdown"
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
  ArrowUpRight,
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
  Settings,
  Loader2,
  Lock,
  ImagePlus,
  Video,
  Trash2,
  Inbox,
  SearchX,
} from "lucide-react"

export interface StudentProject {
  id: string
  title: string
  description: string
  major: string
  category: string
  techStack: string[]
  views: number
  status: "verified" | "review" | "revisi" | "draft" | string
  mentor: string
  submittedAt: string
  verifiedAt: string | null
  score: number | null
  github: string | null
  demo: string | null
}

// ── Data karya dari database ────────────────────────────────────────────
// Halaman ini sebelumnya memakai `initialProjects` (data mock di dalam file)
// sehingga kartu statistik dan daftar "Karya Saya" tidak mencerminkan isi
// database. Sekarang datanya diambil dari GET /api/student/projects.
//
// Database memakai status: pending | approved | revisi | private.
// UI ini memakai istilah: verified | review | draft.
const STATUS_UI: Record<string, "verified" | "review" | "revisi" | "draft"> = {
  approved: "verified",
  pending:  "review",
  revisi:   "revisi",
  private:  "draft",
}

type ApiProject = {
  id: string
  title: string
  description?: string
  majorLabel?: string
  tools?: string[]
  status?: string
  score?: number | null
  createdAt?: string
  updatedAt?: string | null
  metrics?: { views?: number }
  advisor?: { name?: string; reviewNotes?: string }
}

type LowonganItem = {
  id: string
  role: string
  company: string
  majorTarget: string
  type: string
  location: string
  status: string
  statusLabel: string
  deadline: string | null
  description: string | null
}

function dariApi(p: ApiProject): StudentProject {
  const tgl = (iso?: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—"

  return {
    id: p.id,
    title: p.title,
    description: p.description || "Belum ada deskripsi.",
    major: p.majorLabel || "—",
    category: p.majorLabel || "Karya Siswa",
    techStack: p.tools ?? [],
    views: p.metrics?.views ?? 0,
    status: STATUS_UI[p.status ?? ""] ?? "review",
    mentor: p.advisor?.name || "—",
    submittedAt: tgl(p.createdAt),
    verifiedAt: p.status === "approved" ? tgl(p.updatedAt) : null,
    score: p.score ?? null,
    github: null,
    demo: null,
  }
}

// internshipOpportunities sekarang diambil dari /api/student/lowongan (lihat state di bawah)

export default function StudentDashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [projects, setProjects] = useState<StudentProject[]>([])
  const [memuatKarya, setMemuatKarya] = useState(true)
  const [galatKarya, setGalatKarya] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isSubmittingKarya, setIsSubmittingKarya] = useState(false)
  const [submitKaryaError, setSubmitKaryaError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  // ── Guru pembimbing untuk dropdown ────────────────────────────────────
  type AdvisorItem = { id: string; name: string; nip: string | null; majorName: string }
  const [advisors, setAdvisors] = useState<AdvisorItem[]>([])
  const [newAdvisorId, setNewAdvisorId] = useState("")

  // ── Lowongan magang dari database ─────────────────────────────────────────
  const [lowongan, setLowongan] = useState<LowonganItem[]>([])
  const [memuatLowongan, setMemuatLowongan] = useState(true)

  // ── Permintaan kontak yang diteruskan BKK ke siswa ────────────────────────
  type KontakItem = {
    id: string
    purpose: string
    purposeLabel: string
    message: string
    bkkNotes: string | null
    forwardedAt: string
    company: { name: string; field: string | null; email: string | null }
    project: { id: string; title: string }
  }
  const [kontak, setKontak] = useState<KontakItem[]>([])
  const [memuatKontak, setMemuatKontak] = useState(true)

  // Form State untuk modal Tambah Karya
  const [newTitle, setNewTitle] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newMajor, setNewMajor] = useState("RPL")
  const [newCategory, setNewCategory] = useState("Web & Mobile App")
  const [newTechStack, setNewTechStack] = useState("")
  const [newYear, setNewYear] = useState(new Date().getFullYear())
  const [newGithub, setNewGithub] = useState("")
  const [newDemo, setNewDemo] = useState("")

  // ── Ambil karya milik siswa dari database ─────────────────────────────
  const muatKarya = async () => {
    setMemuatKarya(true)
    setGalatKarya(null)
    try {
      const res = await fetch("/api/student/projects", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) {
        setGalatKarya(data.error || "Gagal memuat karya dari database.")
      } else {
        setProjects((data.projects ?? []).map(dariApi))
      }
    } catch {
      setGalatKarya("Terjadi kesalahan koneksi saat memuat karya.")
    }
    setMemuatKarya(false)
  }

  useEffect(() => {
    muatKarya()
    // sengaja hanya sekali saat halaman dibuka
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Konfigurasi adaptif per jurusan ──────────────────────────────────────
  // Placeholder dan label berubah sesuai jurusan supaya siswa TKJ dan
  // Analis Kimia tidak bingung mengisi form yang terasa "untuk RPL saja".
  const JURUSAN_CONFIG: Record<string, {
    titlePlaceholder: string
    descPlaceholder: string
    toolsLabel: string
    toolsPlaceholder: string
    linkALabel: string
    linkAPlaceholder: string
    linkBLabel: string
    linkBPlaceholder: string
    mediaHint: string
  }> = {
    RPL: {
      titlePlaceholder: "Misal: EduClass — LMS & Presensi QR Cerdas",
      descPlaceholder:  "Jelaskan masalah yang diselesaikan, teknologi yang dipakai, dan hasil akhirnya...",
      toolsLabel:       "Teknologi / Stack",
      toolsPlaceholder: "Next.js, TypeScript, PostgreSQL, Tailwind CSS",
      linkALabel:       "Tautan GitHub / Repositori",
      linkAPlaceholder: "https://github.com/...",
      linkBLabel:       "Tautan Demo / Aplikasi",
      linkBPlaceholder: "https://aplikasi.vercel.app",
      mediaHint:        "Unggah screenshot UI, diagram arsitektur, atau video demo aplikasi.",
    },
    TKJ: {
      titlePlaceholder: "Misal: Monitoring Jaringan Sekolah Berbasis SNMP",
      descPlaceholder:  "Jelaskan topologi jaringan, perangkat yang dipakai, masalah yang diatasi, dan hasil konfigurasinya...",
      toolsLabel:       "Perangkat & Protokol yang Digunakan",
      toolsPlaceholder: "Cisco Packet Tracer, Mikrotik, SNMP, VPN, Wireshark",
      linkALabel:       "Tautan Dokumentasi / Laporan",
      linkAPlaceholder: "https://docs.google.com/...",
      linkBLabel:       "Tautan Video Demo / Simulasi",
      linkBPlaceholder: "https://youtube.com/...",
      mediaHint:        "Unggah foto topologi jaringan, screenshot konfigurasi, atau video simulasi.",
    },
    "Analis Kimia": {
      titlePlaceholder: "Misal: Analisis Kadar Vitamin C pada Buah Lokal Bandung",
      descPlaceholder:  "Jelaskan tujuan riset, metode analisis yang digunakan, sampel yang diuji, dan kesimpulan hasilnya...",
      toolsLabel:       "Metode & Instrumen Laboratorium",
      toolsPlaceholder: "Titrasi Iodometri, Spektrofotometri UV-Vis, HPLC, AAS",
      linkALabel:       "Tautan Laporan Riset / Jurnal",
      linkAPlaceholder: "https://drive.google.com/...",
      linkBLabel:       "Tautan Data Pendukung",
      linkBPlaceholder: "https://drive.google.com/...",
      mediaHint:        "Unggah foto proses pengujian laboratorium, grafik hasil, atau poster riset.",
    },
  }

  const cfg = JURUSAN_CONFIG[newMajor] ?? JURUSAN_CONFIG["RPL"]

  // ── Media upload state ────────────────────────────────────────────────────
  type MediaItem = { url: string; type: "photo" | "video"; name: string; uploading?: boolean }
  const [mediaFiles, setMediaFiles] = useState<MediaItem[]>([])
  const [mediaError, setMediaError] = useState<string | null>(null)

  const handleMediaUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setMediaError(null)

    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith("image/")
      const isVideo = file.type.startsWith("video/")
      if (!isImage && !isVideo) {
        setMediaError("Hanya file gambar (JPG, PNG, WebP) atau video (MP4, WebM, MOV) yang diizinkan.")
        continue
      }
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024
      if (file.size > maxSize) {
        setMediaError(`${file.name} terlalu besar (maks ${isVideo ? "100MB" : "10MB"}).`)
        continue
      }

      // Tambah placeholder saat upload berjalan
      const placeholder: MediaItem = { url: "", type: isVideo ? "video" : "photo", name: file.name, uploading: true }
      setMediaFiles((prev) => [...prev, placeholder])

      const formData = new FormData()
      formData.append("file", file)

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? "Gagal mengunggah.")
        setMediaFiles((prev) =>
          prev.map((m) =>
            m === placeholder
              ? { url: data.url, type: data.mediaType ?? (isVideo ? "video" : "photo"), name: file.name }
              : m
          )
        )
      } catch (err) {
        setMediaFiles((prev) => prev.filter((m) => m !== placeholder))
        setMediaError(err instanceof Error ? err.message : "Gagal mengunggah file.")
      }
    }
  }
  useEffect(() => {
    let cancelled = false
    setMemuatLowongan(true)
    fetch("/api/student/lowongan")
      .then((res) => res.ok ? res.json() : Promise.reject(res.status))
      .then((data) => { if (!cancelled) setLowongan(data.postings ?? []) })
      .catch(() => { /* gagal — tampil kosong, tidak ada crash */ })
      .finally(() => { if (!cancelled) setMemuatLowongan(false) })
    return () => { cancelled = true }
  }, [])

  // ── Ambil permintaan kontak yang diteruskan BKK ──────────────────────────
  useEffect(() => {
    let cancelled = false
    setMemuatKontak(true)
    fetch("/api/student/kontak")
      .then((res) => res.ok ? res.json() : Promise.reject(res.status))
      .then((data) => { if (!cancelled) setKontak(data.requests ?? []) })
      .catch(() => { /* gagal — tampil kosong */ })
      .finally(() => { if (!cancelled) setMemuatKontak(false) })
    return () => { cancelled = true }
  }, [])

  // ── Ambil daftar guru pembimbing saat modal dibuka ──────────────────────
  useEffect(() => {
    if (!isUploadModalOpen) return
    let cancelled = false
    fetch("/api/student/advisors")
      .then((res) => res.ok ? res.json() : Promise.reject(res.status))
      .then((data) => {
        if (cancelled) return
        const list: AdvisorItem[] = data.advisors ?? []
        setAdvisors(list)
        // Auto-pilih guru pertama jika belum dipilih
        if (list.length > 0 && !newAdvisorId) setNewAdvisorId(list[0].id)
      })
      .catch(() => { /* gagal — dropdown tetap kosong */ })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUploadModalOpen])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    setIsSubmittingKarya(true)
    setSubmitKaryaError(null)

    try {
      const tools = newTechStack
        ? newTechStack.split(",").map((t) => t.trim()).filter(Boolean)
        : []

      const res = await fetch("/api/student/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          major: newMajor.toLowerCase().replace(/ /g, "-"),
          year: newYear,
          tools,
          ...(newAdvisorId ? { advisorId: newAdvisorId } : {}),
          ...(newGithub.trim() ? { githubUrl: newGithub.trim() } : {}),
          ...(newDemo.trim()   ? { demoUrl:   newDemo.trim()   } : {}),
          ...(mediaFiles.filter(m => m.url && !m.uploading).length > 0 ? {
            coverImage: mediaFiles.find(m => m.url && !m.uploading)?.url,
            galleryImages: mediaFiles.filter(m => m.url && !m.uploading).map(m => m.url),
          } : {}),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSubmitKaryaError(data.error ?? "Gagal menyimpan karya. Coba lagi.")
        setIsSubmittingKarya(false)
        return
      }

      // Sukses — tutup modal, reset form, refresh daftar dari DB
      setIsUploadModalOpen(false)
      setNewTitle("")
      setNewDescription("")
      setNewMajor("RPL")
      setNewCategory("Web & Mobile App")
      setNewTechStack("")
      setNewYear(new Date().getFullYear())
      setNewGithub("")
      setNewDemo("")
      setNewAdvisorId("")
      setSubmitKaryaError(null)
      setMediaFiles([])
      setMediaError(null)
      setUploadSuccess(
        `Karya "${data.project?.title ?? newTitle.trim()}" berhasil dikirim dan sedang menunggu kurasi dari guru pembimbing. Karya akan tampil di Galeri Kandaga setelah disetujui.`
      )
      setActiveTab("karya-saya")
      await muatKarya()
    } catch {
      setSubmitKaryaError("Terjadi kesalahan koneksi. Periksa koneksi internet Anda.")
    } finally {
      setIsSubmittingKarya(false)
    }
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
      badge: `${lowongan.length + kontak.length}`,
    },
  ]

  return (
    <DashboardLayout
      roleTitle="Student Portal"
      roleSlug="student"
      badgeColor="from-rose-500 to-pink-600"
      icon={GraduationCap}
      tabs={studentTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* ── Status pemuatan karya dari database ── */}
      {memuatKarya && (
        <div className="p-4 rounded-2xl bg-ink-100 border border-ink-150 text-xs font-semibold text-ink-600">
          Memuat karya Anda dari database…
        </div>
      )}
      {galatKarya && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
          {galatKarya}
        </div>
      )}

      {/* ── Banner sukses setelah upload ── */}
      {uploadSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-start gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <div className="flex-1">
            <p>{uploadSuccess}</p>
            <p className="font-normal mt-1 text-emerald-700">
              Login sebagai <strong>guru pembimbing</strong> untuk menyetujui karya dari tab Antrean Verifikasi.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUploadSuccess(null)}
            className="shrink-0 text-emerald-600 hover:text-emerald-800 cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ──────────────── TAB 1: DASHBOARD ──────────────── */}
      {activeTab === "dashboard" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Header Welcome Card */}
          <div className="rounded-3xl bg-gradient-to-r from-primary-dark to-primary text-white p-7 sm:p-9 relative overflow-hidden shadow-xl shadow-primary/15">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-xl pr-28 sm:pr-40 md:pr-0">
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                Halo, <span className="capitalize">{session?.user?.username || session?.user?.name || "Siswa Kandaga"}</span>!
              </h1>
              <p className="text-rose-100 text-xs sm:text-sm mt-2 leading-relaxed opacity-90">
                Kelola karya tugas akhir dan riset laboratorium Anda. Karya yang telah diverifikasi oleh guru pembimbing akan otomatis tampil di Galeri Utama Kandaga dan dapat diakses mitra industri nasional.
              </p>
            </div>

            {/* Model Chibi Siswa */}
            <div className="absolute right-1 sm:right-6 md:right-8 lg:right-12 -top-2 sm:-top-3 md:-top-4 w-36 sm:w-48 md:w-56 lg:w-64 h-48 sm:h-60 md:h-68 lg:h-76 pointer-events-none select-none z-10">
              <div className="relative w-full h-full">
                <Image
                  src="/images/siswa.webp"
                  alt="Ilustrasi Siswa"
                  fill
                  sizes="(max-width: 640px) 144px, (max-width: 768px) 200px, 260px"
                  priority
                  className="object-contain object-top drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Karya Diunggah */}
            <button
              type="button"
              onClick={() => setActiveTab("karya-saya")}
              className="group p-5 rounded-2xl bg-white border border-ink-150 shadow-xs hover:border-primary/30 hover:shadow-md transition flex flex-col justify-between text-left cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <FileText className="w-5 h-5 text-primary" />
                <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-primary transition" />
              </div>
              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight block">
                  {projects.length}
                </span>
                <span className="text-xs font-bold text-ink-700 block mt-1">Total Karya Diunggah</span>
                <span className="text-[11px] text-ink-400 block mt-0.5">
                  Tugas akhir &amp; portofolio
                </span>
              </div>
            </button>

            {/* Card 2: Terverifikasi Guru */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("karya-saya")
                setFilterStatus("verified")
              }}
              className="group p-5 rounded-2xl bg-white border border-ink-150 shadow-xs hover:border-primary/30 hover:shadow-md transition flex flex-col justify-between text-left cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-primary transition" />
              </div>
              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight block">
                  {projects.filter((p) => p.status === "verified").length}
                </span>
                <span className="text-xs font-bold text-ink-700 block mt-1">Terverifikasi Guru</span>
                <span className="text-[11px] text-ink-400 block mt-0.5">
                  Tayang di Galeri Utama
                </span>
              </div>
            </button>

            {/* Card 3: Dalam Review Guru */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("karya-saya")
                setFilterStatus("review")
              }}
              className="group p-5 rounded-2xl bg-white border border-ink-150 shadow-xs hover:border-primary/30 hover:shadow-md transition flex flex-col justify-between text-left cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <Clock className="w-5 h-5 text-primary" />
                <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-primary transition" />
              </div>
              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight block">
                  {projects.filter((p) => p.status === "review").length}
                </span>
                <span className="text-xs font-bold text-ink-700 block mt-1">Dalam Review Guru</span>
                <span className="text-[11px] text-ink-400 block mt-0.5">
                  Sedang dinilai pembimbing
                </span>
              </div>
            </button>

            {/* Card 4: Dilihat Mitra Industri */}
            <div className="p-5 rounded-2xl bg-white border border-ink-150 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <Eye className="w-5 h-5 text-primary" />
                <ArrowUpRight className="w-4 h-4 text-ink-300" />
              </div>
              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight block">
                  {projects.reduce((acc, curr) => acc + curr.views, 0).toLocaleString("id-ID")}
                </span>
                <span className="text-xs font-bold text-ink-700 block mt-1">Dilihat Mitra Industri</span>
                <span className="text-[11px] text-ink-400 block mt-0.5">
                  Total impresi industri
                </span>
              </div>
            </div>
          </div>

          {/* Alur Kurasi & Aksi Cepat */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Alur Kurasi Siswa */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-ink-150 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-lg font-bold text-ink">Alur Verifikasi Karya Sekolah</h2>
                  <p className="text-xs text-ink-600 max-w-[65ch]">Setiap karya melalui 4 tahapan kurasi sebelum ditayangkan ke publik dan mitra industri.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition cursor-pointer flex items-center gap-1.5 shrink-0"
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
                  <div key={idx} className="p-3.5 rounded-2xl bg-ink-100 border border-ink-150 relative">
                    <span className="font-mono text-xs font-extrabold text-primary block mb-1">{s.step}</span>
                    <h3 className="font-heading text-xs font-bold text-ink">{s.title}</h3>
                    <p className="text-[12px] text-ink-600 mt-1 leading-snug">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Card */}
            <div className="bg-gradient-to-br from-ink to-ink text-white rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 mb-4">
                  <Award className="w-5 h-5" />
                </div>
                <h2 className="font-heading text-lg font-bold">Siapkan Portofolio PKL</h2>
                <p className="font-sans text-xs text-ink-300 mt-2 leading-relaxed">
                  Mitra industri saat ini sedang membuka rekrutmen magang untuk periode semester mendatang melalui unit BKK SMKN 13.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("magang")}
                className="mt-6 w-full py-2.5 px-4 bg-white text-ink rounded-xl font-bold text-xs hover:bg-ink-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Lihat Lowongan Magang</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Karya Terbaru Siswa Preview */}
          <div className="bg-white rounded-2xl p-6 border border-ink-150 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-ink">Karya Terkini Anda</h2>
              <button
                type="button"
                onClick={() => setActiveTab("karya-saya")}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Menu Karya Saya ({projects.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-ink-150">
              {projects.slice(0, 3).map((item) => (
                <div key={item.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-primary flex items-center justify-center shrink-0">
                      {item.major === "RPL" ? <FileCode className="w-5 h-5" /> : item.major === "TKJ" ? <Wifi className="w-5 h-5" /> : <FlaskConical className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-bold text-ink">{item.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">{item.major}</span>
                        <span className="text-xs text-ink-600">{item.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs text-ink-600 font-mono">{item.views} views</span>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-ink-150 shadow-xs">
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-ink">
                Karya & Portofolio Saya
              </h1>
              <p className="font-sans text-xs sm:text-sm text-ink-600 mt-1 max-w-[65ch]">
                Koleksi karya portofolio Anda. Unggah proyek tugas akhir baru atau pantau status kurasi guru pembimbing.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-primary-dark transition cursor-pointer flex items-center justify-center gap-2 shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Unggah Karya Baru</span>
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-ink-150 shadow-xs">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-ink-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari karya saya..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-ink-100 border border-ink-150 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Filter Status Dropdown */}
            <div className="shrink-0">
              <FilterDropdown
                label="Status"
                value={filterStatus}
                onChange={(val) => setFilterStatus(val)}
                options={[
                  { value: "all", label: "Semua Karya", count: projects.length },
                  { value: "verified", label: "Terverifikasi", count: projects.filter((p) => p.status === "verified").length },
                  { value: "review", label: "Dalam Review", count: projects.filter((p) => p.status === "review").length },
                ]}
              />
            </div>
          </div>

          {/* Project List Items */}
          <div className="space-y-4">
            {filteredProjects.length === 0 ? (
              <EmptyState
                icon={<SearchX className="w-8 h-8" />}
                title="Tidak Ada Karya yang Cocok"
                description="Coba sesuaikan kata kunci pencarian atau reset filter kategori karya Anda."
              />
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-6 bg-white rounded-2xl border border-ink-150 shadow-xs hover:border-ink-300 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                          {project.major}
                        </span>
                        <span className="text-xs font-semibold text-ink-600">
                          {project.category}
                        </span>
                        <span className="text-ink-300">•</span>
                        <span className="text-xs text-ink-300">Diajukan: {project.submittedAt}</span>
                      </div>
                      <h2 className="font-heading text-lg font-bold text-ink pt-1">
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
                      ) : project.status === "revisi" ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200 text-xs font-bold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Perlu Revisi</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200 text-xs font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Menunggu Kurasi Guru</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="font-sans text-xs sm:text-sm text-ink-600 leading-relaxed max-w-[65ch]">
                    {project.description}
                  </p>

                  {/* Tech stack chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-ink-100 text-ink-700 text-xs font-mono font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Footer info: Pembimbing, Nilai, Aksi */}
                  <div className="pt-4 border-t border-ink-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <p className="text-ink-600">
                        Pembimbing: <strong className="text-ink">{project.mentor}</strong>
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
                          className="px-3 py-1.5 rounded-xl border border-ink-150 text-ink-700 font-semibold hover:bg-ink-100 transition flex items-center gap-1.5"
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
                          className="px-3 py-1.5 rounded-xl bg-ink text-white font-semibold hover:bg-black transition flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Live Demo</span>
                        </a>
                      )}
                      {project.status === "verified" ? (
                        <span
                          title="Karya terverifikasi tidak dapat diedit"
                          className="px-3 py-1.5 rounded-xl border border-ink-100 text-ink-300 font-semibold text-xs flex items-center gap-1.5 cursor-not-allowed select-none"
                        >
                          <Lock className="w-3 h-3" />
                          Terkunci
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => router.push(`/student/my-projects/${project.id}`)}
                          className="px-3 py-1.5 rounded-xl border border-ink-150 text-ink-600 font-semibold hover:bg-ink-100 transition cursor-pointer"
                        >
                          {project.status === "revisi" ? "Lihat Catatan & Revisi" : "Edit Draf"}
                        </button>
                      )}
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
          <div className="p-6 bg-white rounded-2xl border border-ink-150 shadow-xs">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-ink">
              Peluang Magang & Kemitraan Industri (BKK)
            </h1>
            <p className="font-sans text-xs sm:text-sm text-ink-600 mt-1 max-w-[65ch]">
              Peluang Praktik Kerja Lapangan (PKL) dan rekrutmen magang industri yang telah dikurasi oleh Bursa Kerja Khusus (BKK) SMKN 13 Bandung.
            </p>
          </div>

          {/* ── Permintaan dari perusahaan yang diteruskan BKK ── */}
          <div className="bg-white rounded-2xl border border-ink-150 shadow-xs overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-ink-150 flex items-center justify-between">
              <div>
                <h2 className="font-heading text-base font-bold text-ink flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Permintaan dari Mitra Industri
                </h2>
                <p className="text-xs text-ink-600 mt-0.5">
                  Perusahaan yang tertarik dengan karya Anda dan sudah diteruskan oleh BKK.
                </p>
              </div>
              {kontak.length > 0 && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {kontak.length} permintaan
                </span>
              )}
            </div>

            <div className="p-4">
              {memuatKontak && (
                <div className="py-6 flex items-center justify-center gap-2 text-xs text-ink-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memuat permintaan…
                </div>
              )}

              {!memuatKontak && kontak.length === 0 && (
                <EmptyState
                  title="Belum Ada Permintaan Kontak"
                  description="Belum ada perusahaan yang menghubungi Anda melalui BKK."
                  compact
                />
              )}

              {!memuatKontak && kontak.length > 0 && (
                <div className="space-y-3">
                  {kontak.map((k) => (
                    <div key={k.id} className="p-4 rounded-xl border border-ink-150 bg-ink-100/40 space-y-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-ink">{k.company.name}</p>
                          {k.company.field && (
                            <p className="text-[11px] text-ink-400">{k.company.field}</p>
                          )}
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          {k.purposeLabel}
                        </span>
                      </div>

                      <p className="text-[11px] text-ink-600 leading-relaxed">
                        <span className="font-semibold text-ink">Karya:</span> {k.project.title}
                      </p>

                      <p className="text-[11px] text-ink-600 leading-relaxed line-clamp-3">{k.message}</p>

                      {k.bkkNotes && (
                        <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 text-[11px] text-blue-800">
                          <span className="font-bold">Catatan BKK:</span> {k.bkkNotes}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-ink-300">
                          Diteruskan: {new Date(k.forwardedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        {k.company.email && (
                          <a
                            href={`mailto:${k.company.email}`}
                            className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Hubungi via Email
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-ink-150" />
            <span className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider">Lowongan dari BKK</span>
            <div className="flex-1 h-px bg-ink-150" />
          </div>

          {/* Loading */}
          {memuatLowongan && (
            <div className="p-4 rounded-2xl bg-ink-100 border border-ink-150 text-xs font-semibold text-ink-600">
              Memuat daftar lowongan dari database…
            </div>
          )}

          {!memuatLowongan && lowongan.length === 0 && (
            <div className="bg-white rounded-3xl border border-ink-150 p-6 shadow-xs">
              <EmptyState
                title="Belum Ada Lowongan Aktif"
                description="BKK SMKN 13 belum memposting lowongan magang saat ini. Pantau terus pembaruan informasi di sini."
              />
            </div>
          )}

          {/* Lowongan grid */}
          {!memuatLowongan && lowongan.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {lowongan.map((m) => (
                <div key={m.id} className="p-6 bg-white rounded-2xl border border-ink-150 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                        Target: {m.majorTarget}
                      </span>
                      <span className={`text-xs font-semibold font-mono ${
                        m.status === "terbatas" ? "text-amber-600" : "text-emerald-600"
                      }`}>
                        {m.statusLabel}
                      </span>
                    </div>
                    <h2 className="font-heading text-base font-bold text-ink">{m.role}</h2>
                    <p className="text-xs font-semibold text-ink-700 mt-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-ink-300" />
                      <span>{m.company}</span>
                    </p>
                    <p className="text-xs text-ink-600 mt-2">{m.type}{m.location ? ` • ${m.location}` : ""}</p>
                    {m.description && (
                      <p className="text-xs text-ink-600 mt-2 leading-relaxed line-clamp-2">{m.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-ink-150 flex items-center justify-between">
                    <span className="text-[11px] text-ink-300">
                      {m.deadline ? `Batas: ${m.deadline}` : "Deadline belum ditentukan"}
                    </span>
                    <a
                      href="#footer"
                      className="px-3.5 py-1.5 bg-ink hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Ajukan via BKK
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ──────────────── TAB 4: PROFIL SISWA ──────────────── */}
      {activeTab === "profil" && (
        <div className="max-w-4xl space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-white rounded-2xl border border-ink-150 shadow-xs">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-ink">
              Profil & Informasi Siswa
            </h1>
            <p className="font-sans text-xs sm:text-sm text-ink-600 mt-1 max-w-[65ch]">
              Data identitas siswa yang tercatat di sistem akademik SMKN 13 Bandung dan lampiran portofolio resmi.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-ink-150 shadow-xs space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-ink-600 font-medium mb-1">Nama Siswa</label>
                <input
                  type="text"
                  readOnly
                  value={session?.user?.username || "Ahmad Rizky Pratama"}
                  className="w-full px-3 py-2 bg-ink-100 border border-ink-150 rounded-xl font-bold text-ink"
                />
              </div>

              <div>
                <label className="block text-ink-600 font-medium mb-1">Email Akademik</label>
                <input
                  type="text"
                  readOnly
                  value={session?.user?.email || "ahmad.rizky@smkn13bandung.sch.id"}
                  className="w-full px-3 py-2 bg-ink-100 border border-ink-150 rounded-xl font-mono text-ink-700"
                />
              </div>

              <div>
                <label className="block text-ink-600 font-medium mb-1">Kompetensi Keahlian</label>
                <input
                  type="text"
                  readOnly
                  value="Rekayasa Perangkat Lunak (RPL)"
                  className="w-full px-3 py-2 bg-ink-100 border border-ink-150 rounded-xl font-semibold text-rose-800"
                />
              </div>

              <div>
                <label className="block text-ink-600 font-medium mb-1">Tingkat / Kelas</label>
                <input
                  type="text"
                  readOnly
                  value="XII RPL 1 (Tahun Ajaran 2026/2027)"
                  className="w-full px-3 py-2 bg-ink-100 border border-ink-150 rounded-xl text-ink"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-ink-600 font-medium mb-1">Bio Singkat Portofolio</label>
              <textarea
                readOnly
                rows={3}
                value="Siswa tingkat akhir jurusan RPL SMKN 13 Bandung dengan spesialisasi Next.js, TypeScript, dan arsitektur database relasional PostgreSQL. Memiliki sertifikasi junior web developer BNSP."
                className="w-full px-3 py-2 bg-ink-100 border border-ink-150 rounded-xl text-xs text-ink leading-relaxed resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL UNGGAH KARYA BARU ──────────────── */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            {/* Header — fixed */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-ink-150 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-primary flex items-center justify-center shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-ink leading-tight">Unggah Karya Baru</h3>
                  <p className="text-[10px] text-ink-400 mt-0.5">
                    {newMajor === "TKJ" ? "Infrastruktur Jaringan & Sistem" : newMajor === "Analis Kimia" ? "Riset & Analisis Laboratorium" : "Pengembangan Perangkat Lunak"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setIsUploadModalOpen(false); setSubmitKaryaError(null); setNewAdvisorId(""); setMediaFiles([]); setMediaError(null) }}
                className="p-1 rounded-lg text-ink-300 hover:text-ink-600 hover:bg-ink-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 min-h-0 px-6 py-5">
              <form id="upload-karya-form" onSubmit={handleCreateProject} className="space-y-4 text-xs">

                {/* Judul */}
                <div>
                  <label className="block font-semibold text-ink-700 mb-1">Judul Karya *</label>
                  <input
                    type="text"
                    required
                    placeholder={cfg.titlePlaceholder}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-ink-150 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Jurusan + Tahun */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-ink-700 mb-1">Kompetensi Keahlian</label>
                    <select
                      value={newMajor}
                      onChange={(e) => { setNewMajor(e.target.value); setMediaFiles([]); setMediaError(null) }}
                      className="w-full px-3 py-2 border border-ink-150 rounded-xl bg-white focus:outline-none"
                    >
                      <option value="RPL">RPL — Perangkat Lunak</option>
                      <option value="TKJ">TKJ — Komputer Jaringan</option>
                      <option value="Analis Kimia">Analis Kimia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-ink-700 mb-1">Tahun Karya</label>
                    <input
                      type="number"
                      min={2000}
                      max={2100}
                      value={newYear}
                      onChange={(e) => setNewYear(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-ink-150 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block font-semibold text-ink-700 mb-1">Deskripsi Karya</label>
                  <textarea
                    rows={3}
                    placeholder={cfg.descPlaceholder}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-ink-150 rounded-xl focus:outline-none resize-none"
                  />
                </div>

                {/* Guru */}
                <div>
                  <label className="block font-semibold text-ink-700 mb-1">
                    Guru Pembimbing <span className="text-rose-500">*</span>
                  </label>
                  {advisors.length === 0 ? (
                    <div className="w-full px-3 py-2 border border-ink-150 rounded-xl bg-ink-100 text-ink-400 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />Memuat daftar guru…
                    </div>
                  ) : (
                    <select
                      required
                      value={newAdvisorId}
                      onChange={(e) => setNewAdvisorId(e.target.value)}
                      className="w-full px-3 py-2 border border-ink-150 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">-- Pilih guru pembimbing --</option>
                      {advisors.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}{a.nip ? ` · ${a.nip}` : ""}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Tools — adaptive */}
                <div>
                  <label className="block font-semibold text-ink-700 mb-1">
                    {cfg.toolsLabel}
                    <span className="font-normal text-ink-400 ml-1">(pisahkan koma)</span>
                  </label>
                  <input
                    type="text"
                    placeholder={cfg.toolsPlaceholder}
                    value={newTechStack}
                    onChange={(e) => setNewTechStack(e.target.value)}
                    className="w-full px-3 py-2 border border-ink-150 rounded-xl focus:outline-none"
                  />
                </div>

                {/* Tautan — adaptive */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-ink-700 mb-1">{cfg.linkALabel}</label>
                    <input type="url" placeholder={cfg.linkAPlaceholder} value={newGithub}
                      onChange={(e) => setNewGithub(e.target.value)}
                      className="w-full px-3 py-2 border border-ink-150 rounded-xl focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-semibold text-ink-700 mb-1">{cfg.linkBLabel}</label>
                    <input type="url" placeholder={cfg.linkBPlaceholder} value={newDemo}
                      onChange={(e) => setNewDemo(e.target.value)}
                      className="w-full px-3 py-2 border border-ink-150 rounded-xl focus:outline-none" />
                  </div>
                </div>

                {/* ── Media upload ── */}
                <div>
                  <label className="block font-semibold text-ink-700 mb-1">
                    Foto / Video Karya
                    <span className="font-normal text-ink-400 ml-1">(opsional, maks 5 file)</span>
                  </label>
                  <p className="text-[10px] text-ink-400 mb-2">{cfg.mediaHint}</p>

                  {mediaFiles.length < 5 && (
                    <label className="flex flex-col items-center justify-center gap-1.5 w-full py-5 border-2 border-dashed border-ink-200 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition">
                      <div className="flex items-center gap-2 text-ink-400">
                        <ImagePlus className="w-5 h-5" />
                        <Video className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] text-ink-500 font-medium">Klik atau seret file ke sini</span>
                      <span className="text-[10px] text-ink-300">Gambar maks 10 MB · Video maks 100 MB</span>
                      <input type="file" accept="image/*,video/mp4,video/webm,video/quicktime" multiple className="hidden"
                        onChange={(e) => handleMediaUpload(e.target.files)} />
                    </label>
                  )}

                  {mediaError && (
                    <p className="mt-1.5 text-[11px] text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />{mediaError}
                    </p>
                  )}

                  {mediaFiles.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
                      {mediaFiles.map((m, idx) => (
                        <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden bg-ink-100 border border-ink-150 shrink-0">
                          {m.uploading ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <Loader2 className="w-4 h-4 animate-spin text-ink-300" />
                            </div>
                          ) : m.type === "video" ? (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-0.5 p-1">
                              <Video className="w-4 h-4 text-ink-400" />
                              <span className="text-[8px] text-ink-400 text-center truncate w-full px-0.5 leading-tight">{m.name.slice(0, 8)}…</span>
                            </div>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                          )}
                          {!m.uploading && (
                            <button type="button" onClick={() => setMediaFiles((prev) => prev.filter((_, i) => i !== idx))}
                              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-rose-600 transition cursor-pointer" aria-label="Hapus">
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                          {idx === 0 && !m.uploading && (
                            <span className="absolute bottom-0 left-0 right-0 text-center text-[8px] bg-primary/80 text-white py-0.5 leading-tight">Cover</span>
                          )}
                        </div>
                      ))}
                      {mediaFiles.length < 5 && !mediaFiles.some(m => m.uploading) && (
                        <label className="w-14 h-14 rounded-xl border-2 border-dashed border-ink-200 flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:border-primary hover:bg-primary/5 transition shrink-0">
                          <ImagePlus className="w-4 h-4 text-ink-300" />
                          <span className="text-[8px] text-ink-300">Tambah</span>
                          <input type="file" accept="image/*,video/mp4,video/webm,video/quicktime" multiple className="hidden"
                            onChange={(e) => handleMediaUpload(e.target.files)} />
                        </label>
                      )}
                    </div>
                  )}
                </div>

                {/* Notice */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2 text-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Karya disimpan sebagai <strong>Menunggu Kurasi Guru</strong> dan belum tayang publik. Guru akan meninjau sebelum karya muncul di Galeri Kandaga.
                  </p>
                </div>

                {submitKaryaError && (
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-2 text-rose-700">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">{submitKaryaError}</p>
                  </div>
                )}
              </form>
            </div>

            {/* Footer — fixed */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-ink-150 shrink-0">
              <button type="button" disabled={isSubmittingKarya}
                onClick={() => { setIsUploadModalOpen(false); setSubmitKaryaError(null); setNewAdvisorId(""); setMediaFiles([]); setMediaError(null) }}
                className="px-4 py-2 border border-ink-150 text-ink-600 rounded-xl text-xs font-bold hover:bg-ink-100 transition cursor-pointer disabled:opacity-50">
                Batal
              </button>
              <button type="submit" form="upload-karya-form"
                disabled={isSubmittingKarya || mediaFiles.some(m => m.uploading)}
                className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition cursor-pointer flex items-center gap-1.5 disabled:opacity-60">
                {isSubmittingKarya ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Menyimpan…</> : "Simpan & Ajukan Kurasi"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ──────────────── TAB 5: PENGATURAN AKUN ──────────────── */}
      {activeTab === "pengaturan" && <AccountSettings />}
    </DashboardLayout>
  )
}
