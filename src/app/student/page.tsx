"use client"

import React, { useEffect, useState, useCallback, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import DashboardLayout, { DashboardTab } from "@/components/DashboardLayout"
import AccountSettings from "@/components/settings/AccountSettings"
import StudentProfileView from "@/components/profile/StudentProfileView"
import EmptyState from "@/components/ui/EmptyState"
import { FilterDropdown } from "@/components/ui/FilterDropdown"
import { useSession } from "next-auth/react"
import {
  GraduationCap,
  CheckCircle2,
  FileCode,
  FlaskConical,
  Wifi,
  LayoutDashboard,
  FolderGit2,
  Briefcase,
  User,
  Plus,
  ExternalLink,
  ArrowRight,
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
  Loader2,
  Lock,
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
  coverImage?: string | null
  isPrivate?: boolean
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
  major?: string
  tools?: string[]
  status?: string
  isPrivate?: boolean
  coverImage?: string | null
  score?: number | null
  createdAt?: string
  updatedAt?: string | null
  metrics?: { views?: number }
  advisor?: { name?: string; reviewNotes?: string }
  links?: { githubUrl?: string; demoUrl?: string }
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
    github: p.links?.githubUrl ?? null,
    demo: p.links?.demoUrl ?? null,
    coverImage: p.coverImage || null,
    isPrivate: Boolean(p.isPrivate),
  }
}

// internshipOpportunities sekarang diambil dari /api/student/lowongan (lihat state di bawah)

const VALID_TABS = ["dashboard", "karya-saya", "magang", "profil", "pengaturan"]

function StudentDashboardContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const initialTab = tabParam && VALID_TABS.includes(tabParam) ? tabParam : "dashboard"
  const [activeTab, setActiveTab] = useState<string>(initialTab)
  const [projects, setProjects] = useState<StudentProject[]>([])
  const [memuatKarya, setMemuatKarya] = useState(true)
  const [galatKarya, setGalatKarya] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showUploadSuccess, setShowUploadSuccess] = useState(false)
  const [isSuccessToastLeaving, setIsSuccessToastLeaving] = useState(false)
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)
  const [isDeleteToastLeaving, setIsDeleteToastLeaving] = useState(false)

  const dismissUploadSuccess = () => {
    setIsSuccessToastLeaving(true)
    setTimeout(() => {
      setShowUploadSuccess(false)
      setIsSuccessToastLeaving(false)
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href)
        if (url.searchParams.has("uploaded")) {
          url.searchParams.delete("uploaded")
          window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""))
        }
      }
    }, 450)
  }

  const dismissDeleteSuccess = () => {
    setIsDeleteToastLeaving(true)
    setTimeout(() => {
      setShowDeleteSuccess(false)
      setIsDeleteToastLeaving(false)
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href)
        if (url.searchParams.has("deleted")) {
          url.searchParams.delete("deleted")
          window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""))
        }
      }
    }, 450)
  }

  useEffect(() => {
    if (searchParams.get("uploaded") === "true") {
      setShowUploadSuccess(true)
      setIsSuccessToastLeaving(false)
      muatKarya()

      const timer = setTimeout(() => {
        dismissUploadSuccess()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [searchParams])

  useEffect(() => {
    if (searchParams.get("deleted") === "true") {
      setShowDeleteSuccess(true)
      setIsDeleteToastLeaving(false)
      muatKarya()

      const timer = setTimeout(() => {
        dismissDeleteSuccess()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [searchParams])

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

  // ── Ambil karya milik siswa dari database ─────────────────────────────
  const muatKarya = async () => {
    setMemuatKarya(true)
    setGalatKarya(null)
    try {
      const res = await fetch("/api/student/projects", { cache: "no-store" })
      const data = await res.json()
      if (res.status === 401) {
        setGalatKarya(data.error || "Sesi login tidak valid. Mengalihkan ke login...")
        setTimeout(() => {
          router.push("/auth/login")
        }, 1500)
        return
      }
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

  const handleTabChange = useCallback((tabId: string) => {
    if (!VALID_TABS.includes(tabId)) return
    setActiveTab(tabId)
    if (tabId === "dashboard") {
      router.replace("/student", { scroll: false })
    } else {
      router.replace(`/student?tab=${tabId}`, { scroll: false })
    }
  }, [router])

  // Sinkronisasi state tab saat query param berubah
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && VALID_TABS.includes(tab)) {
      setActiveTab(tab)
    } else if (!tab && activeTab !== "dashboard") {
      setActiveTab("dashboard")
    }
  }, [searchParams])

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
      onTabChange={handleTabChange}
    >
      {/* ── Status pemuatan karya dari database ── */}
      {galatKarya && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
          {galatKarya}
        </div>
      )}

      {/* ── Pop-out notifikasi sukses dari atas (Hijau Friendly, Joyful, Tanpa Emoji, Smooth In/Out) ── */}
      {showUploadSuccess && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92vw] sm:w-[480px] pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isSuccessToastLeaving
              ? "-translate-y-28 opacity-0 scale-95"
              : "translate-y-0 opacity-100 scale-100"
          }`}
        >
          <div className="bg-emerald-600 text-white rounded-2xl shadow-2xl shadow-emerald-950/25 border border-emerald-500 p-4 sm:p-5 flex items-start gap-3.5 relative overflow-hidden">
            {/* Ikon Sukses */}
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            </div>

            {/* Isi Pesan */}
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="font-heading font-bold text-sm text-white leading-snug">
                Karya Berhasil Diajukan
              </h4>
              <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                Karya baru Anda sedang menunggu kurasi dari guru pembimbing sebelum otomatis tampil di Galeri Utama Kandaga.
              </p>
            </div>

              {/* Tombol Tutup */}
            <button
              type="button"
              onClick={dismissUploadSuccess}
              className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Pop-out notifikasi sukses hapus/arsip dari atas ── */}
      {showDeleteSuccess && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92vw] sm:w-[480px] pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isDeleteToastLeaving
              ? "-translate-y-28 opacity-0 scale-95"
              : "translate-y-0 opacity-100 scale-100"
          }`}
        >
          <div className="bg-ink text-white rounded-2xl shadow-2xl shadow-ink/25 border border-ink-700 p-4 sm:p-5 flex items-start gap-3.5 relative overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <h4 className="font-heading font-bold text-sm text-white leading-snug">
                Karya Berhasil Diproses
              </h4>
              <p className="text-xs text-ink-300 mt-1 leading-relaxed">
                Karya telah dihapus dan dipindahkan ke arsip alumni. Data tidak lagi muncul di daftar aktif karya Anda.
              </p>
            </div>

            <button
              type="button"
              onClick={dismissDeleteSuccess}
              className="p-1 rounded-lg text-ink-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
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
                Halo,{" "}
                {status === "loading" ? (
                  <span className="inline-block w-36 h-7 rounded-lg bg-white/30 animate-pulse align-middle" />
                ) : (
                  <span className="capitalize">
                    {session?.user?.username || session?.user?.name || "Siswa Kandaga"}
                  </span>
                )}
                !
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
              onClick={() => handleTabChange("karya-saya")}
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
                handleTabChange("karya-saya")
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
                handleTabChange("karya-saya")
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
              <div>
                <h2 className="font-heading text-lg font-bold text-ink">Alur Verifikasi Karya Sekolah</h2>
                <p className="text-xs text-ink-600 max-w-[65ch]">Setiap karya melalui 4 tahapan kurasi sebelum ditayangkan ke publik dan mitra industri.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { step: "01", title: "Unggah di Halaman Baru", desc: "Isi data proyek & media lengkap di formulir halaman mandiri", active: true },
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

            {/* Quick Action Card - Organic Abstract Graphic */}
            {/* `kandaga-island-gelap` = pulau gelap. Latar kartu ini literal
                `bg-[#18181b]` dan tidak ikut tema, jadi isinya — termasuk
                tombol putihnya — dipaksa kembali ke palet terang lewat
                globals.css. */}
            <div className="kandaga-island-gelap relative overflow-hidden bg-[#18181b] text-white rounded-2xl p-6 shadow-md border border-zinc-800 flex flex-col justify-between group">
              {/* Organic Fluid Abstract Shapes - Anchored to the Bottom Right Corner */}
              <div
                className="pointer-events-none absolute -right-3 -bottom-3 w-36 h-36 sm:w-44 sm:h-44 select-none z-0"
                aria-hidden="true"
              >
                <svg
                  className="w-full h-full transform group-hover:scale-105 group-hover:rotate-6 transition-transform duration-500 ease-out"
                  viewBox="0 0 160 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="blobGradA" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#BE123C" />
                      <stop offset="100%" stopColor="#881337" />
                    </linearGradient>
                    <linearGradient id="blobGradB" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FB7185" />
                      <stop offset="100%" stopColor="#E11D48" />
                    </linearGradient>
                    <linearGradient id="blobGradC" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                    <linearGradient id="blobGradD" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#A855F7" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                  </defs>

                  {/* Base Organic Blob */}
                  <path
                    d="M95 15 C130 5 155 35 155 75 C155 115 130 150 90 155 C50 160 15 130 20 90 C25 50 60 25 95 15 Z"
                    fill="url(#blobGradA)"
                    opacity="0.9"
                  />

                  {/* Overlapping Purple Blob */}
                  <path
                    d="M100 35 C135 25 150 55 145 90 C140 125 105 145 75 135 C45 125 35 90 50 60 C65 30 85 40 100 35 Z"
                    fill="url(#blobGradD)"
                    opacity="0.85"
                  />

                  {/* Vibrant Coral-Rose Front Wave */}
                  <path
                    d="M110 50 C135 40 145 70 140 95 C135 120 105 135 85 125 C65 115 60 85 75 65 C90 45 95 55 110 50 Z"
                    fill="url(#blobGradB)"
                  />

                  {/* Amber Accent Blob */}
                  <path
                    d="M80 55 C95 45 110 60 105 75 C100 90 85 95 70 85 C55 75 65 65 80 55 Z"
                    fill="url(#blobGradC)"
                  />

                  {/* Small Decorative Floating Circles */}
                  <circle cx="45" cy="40" r="7" fill="#FB7185" />
                  <circle cx="35" cy="115" r="9" fill="#F59E0B" />
                  <circle cx="130" cy="20" r="5" fill="#FDA4AF" />
                  <circle cx="150" cy="125" r="6" fill="#C084FC" />
                </svg>
              </div>

              {/* Card Content - Clean, Unobstructed Text on top */}
              <div className="relative z-10">
                <h2 className="font-heading text-lg font-bold text-white tracking-tight">
                  Siapkan Portofolio PKL
                </h2>
                <p className="font-sans text-xs text-zinc-300 mt-2 leading-relaxed">
                  Mitra industri saat ini sedang membuka rekrutmen magang untuk periode semester mendatang melalui unit BKK SMKN 13.
                </p>
              </div>

              {/* Action Button */}
              <div className="relative z-10 mt-6">
                <button
                  type="button"
                  onClick={() => handleTabChange("magang")}
                  className="w-full py-2.5 px-4 bg-white text-zinc-900 rounded-xl font-bold text-xs hover:bg-zinc-100 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer group/btn"
                >
                  <span>Lihat Lowongan Magang</span>
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform text-zinc-900" />
                </button>
              </div>
            </div>
          </div>

          {/* Karya Terbaru Siswa Preview */}
          <div className="bg-white rounded-2xl p-6 border border-ink-150 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold text-ink">Karya Terkini Anda</h2>
              <button
                type="button"
                onClick={() => handleTabChange("karya-saya")}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {projects.length === 0 ? (
              <EmptyState
                compact
                title="Belum Ada Karya yang Diunggah"
                description="Anda belum memiliki proyek tugas akhir atau inovasi yang terdaftar di portofolio."
              />
            ) : (
              <div className="divide-y divide-ink-150">
                {projects.slice(0, 3).map((item) => (
                  <div key={item.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading text-sm font-bold text-ink truncate" title={item.title}>
                        {item.title}
                      </h3>
                      <p className="text-xs text-ink-500 mt-0.5">
                        {item.submittedAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      {item.status === "verified" && (
                        <span className="text-xs text-ink-600 font-mono">{item.views} views</span>
                      )}
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                          item.status === "verified"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.status === "revisi"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.status === "verified"
                          ? "Terverifikasi"
                          : item.status === "revisi"
                          ? "Perlu Revisi"
                          : "Review Pembimbing"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                Koleksi karya portofolio Anda. Buka formulir halaman penuh untuk mendaftarkan proyek inovasi baru atau pantau status kurasi guru pembimbing.
              </p>
            </div>

            <Link
              href="/student/create-project"
              className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-primary-dark transition cursor-pointer flex items-center justify-center gap-2 shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Unggah Karya Baru</span>
            </Link>
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

          {/* Project List Items - Grid Card Persegi */}
          {projects.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-ink-150 shadow-xs">
              <EmptyState
                title="Belum Ada Karya yang Diunggah"
                description="Anda belum memiliki proyek tugas akhir atau inovasi yang terdaftar di portofolio."
              />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-ink-150 shadow-xs">
              <EmptyState
                title="Tidak Ada Karya yang Cocok"
                description="Coba sesuaikan kata kunci pencarian atau reset filter kategori karya Anda."
                action={{
                  label: "Reset Filter",
                  onClick: () => {
                    setSearchQuery("")
                    setFilterStatus("all")
                  },
                }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="relative group bg-white rounded-2xl border border-ink-150 shadow-xs hover:border-primary/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Hover Action Overlay (Sama seperti Admin Moderasi) */}
                  <Link
                    href={`/student/my-projects/${project.id}`}
                    className="absolute inset-0 bg-ink/75 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 flex flex-col items-center justify-center p-4 text-center cursor-pointer no-underline"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 hover:bg-white text-white hover:text-ink flex items-center justify-center backdrop-blur-md shadow-xl transition-all duration-200 transform scale-90 group-hover:scale-100 mb-2">
                      <Eye className="w-6 h-6" />
                    </div>
                    <span className="text-white text-xs font-semibold tracking-wide drop-shadow-sm">
                      Lihat Detail Karya
                    </span>
                  </Link>

                  {/* Thumbnail Cover Header (Persegi / Proporsional, Tanpa Label Jurusan & Status Floating) */}
                  <div className="relative aspect-[16/10] w-full bg-ink-100 overflow-hidden border-b border-ink-100">
                    {project.isPrivate ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-ink-100 via-ink-150 to-ink-200/90 text-ink-600 p-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-white/90 shadow-xs flex items-center justify-center text-ink-600 mb-1.5">
                          <Lock className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-ink-700">Karya Privat</span>
                        <span className="text-[10px] text-ink-400 mt-0.5">Thumbnail terproteksi</span>
                      </div>
                    ) : project.coverImage ? (
                      <Image
                        src={project.coverImage}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-rose-100/70 text-primary p-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-white/90 shadow-xs flex items-center justify-center text-primary mb-1">
                          {project.major === "TKJ" ? (
                            <Wifi className="w-5 h-5" />
                          ) : project.major.toLowerCase().includes("kimia") || project.major === "KA" ? (
                            <FlaskConical className="w-5 h-5" />
                          ) : (
                            <FileCode className="w-5 h-5" />
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-ink-500">Pratinjau Belum Diunggah</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      {/* Tanggal & Status Kurasi (Menggantikan Icon Mata Views) */}
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-[11px] text-ink-400 font-medium">Diajukan: {project.submittedAt}</span>
                        {project.status === "verified" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Terkurasi</span>
                          </span>
                        ) : project.status === "revisi" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-bold">
                            <AlertCircle className="w-3 h-3" />
                            <span>Perlu Revisi</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-bold">
                            <Clock className="w-3 h-3" />
                            <span>Belum Dikurasi</span>
                          </span>
                        )}
                      </div>
                      <h2
                        className="font-heading text-base font-bold text-ink line-clamp-1 group-hover:text-primary transition"
                        title={project.title}
                      >
                        {project.title}
                      </h2>
                      <p className="font-sans text-xs text-ink-600 line-clamp-2 leading-relaxed mt-1">
                        {project.description}
                      </p>
                    </div>

                    {/* Tech stack chips */}
                    <div className="flex flex-wrap gap-1 min-h-[1.5rem] items-center pt-0.5">
                      {project.techStack.length > 0 ? (
                        <>
                          {project.techStack.slice(0, 3).map((tech, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-ink-100 text-ink-700 text-[10px] font-mono font-medium truncate max-w-[110px]"
                            >
                              {tech}
                            </span>
                          ))}
                          {project.techStack.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-ink-100 text-ink-400 text-[10px] font-mono font-medium">
                              +{project.techStack.length - 3}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[11px] text-ink-300 italic">Belum ada instrumen</span>
                      )}
                    </div>

                    {/* Footer info: Pembimbing & Nilai (Tanpa Tombol Edit Draf) */}
                    <div className="pt-3 border-t border-ink-150 flex items-center justify-between text-xs mt-auto">
                      <span className="text-ink-600 truncate text-[11px]" title={project.mentor}>
                        Pembimbing: <strong className="text-ink font-semibold">{project.mentor}</strong>
                      </span>
                      {project.score ? (
                        <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                          Nilai: {project.score}/100
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
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
      {activeTab === "profil" && <StudentProfileView />}

      {/* ──────────────── TAB 5: PENGATURAN AKUN ──────────────── */}
      {activeTab === "pengaturan" && <AccountSettings />}
    </DashboardLayout>
  )
}

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={null}>
      <StudentDashboardContent />
    </Suspense>
  )
}
