"use client"

import React, { useEffect, useState, useMemo } from "react"
import Image from "next/image"
import DashboardLayout, { DashboardTab } from "@/components/DashboardLayout"
import AccountSettings from "@/components/settings/AccountSettings"
import { EmptyState } from "@/components/ui/EmptyState"
import { useSession } from "next-auth/react"
import {
  BookOpen,
  CheckCircle,
  Award,
  Clock,
  LayoutDashboard,
  ClipboardCheck,
  Users,
  History,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  FileCode,
  FlaskConical,
  Wifi,
  Filter,
  X,
  Settings,
  Loader2,
  Medal,
  Eye,
  ChevronDown,
  FolderGit2,
  ArrowUpRight,
} from "lucide-react"

// ── Tipe data dari /api/teacher/projects ────────────────────────────────
type TeacherScope = { majorName: string | null; projectType: string | null } | null

type TProject = {
  id: string
  title: string
  summary: string
  category: string
  majorLabel: string
  studentName: string
  studentClass: string
  advisorName: string
  submittedAt: string
  publishedAt: string | null
  status: string
  score: number | null
  reviewNotes: string | null
  techStack: string[]
  badges: { badgeId: number; name: string; tier: string; awardedAt: string }[]
  coverImage: string | null
}

type TSiswa = {
  id: string
  name: string
  class: string
  nis: string
  totalKarya: number
  disetujui: number
  menunggu: number
  karya: { id: string; title: string; status: string; score: number | null }[]
}

type TStats = { menunggu: number; disetujui: number; revisi: number; ditolak?: number; siswaBimbingan: number }

const PAGE_SIZE = 6

const STATUS_TABS: { key: string; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Menunggu" },
  { key: "approved", label: "Disetujui" },
  { key: "revisi", label: "Perlu Revisi" },
  { key: "rejected", label: "Ditolak" },
]

const STATUS_STYLE: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  pending: "bg-amber-50 text-amber-700 border-amber-200/60",
  revisi: "bg-blue-50 text-blue-700 border-blue-200/60",
  rejected: "bg-rose-50 text-rose-700 border-rose-200/60",
}

const STATUS_LABEL: Record<string, string> = {
  approved: "Disetujui",
  pending: "Menunggu",
  revisi: "Perlu Revisi",
  rejected: "Ditolak",
}

const STATUS_KURASI: Record<string, string> = {
  pending: "Menunggu Review",
  approved: "Disetujui",
  revisi: "Perlu Revisi",
  rejected: "Ditolak",
  private: "Disembunyikan Siswa",
}

function tanggal(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

/** Karya antrean → bentuk yang dipakai tab "Antrean". */
function toQueueItem(p: TProject) {
  return {
    id: p.id,
    title: p.title,
    studentName: p.studentName,
    classRoom: p.studentClass,
    major: p.majorLabel,
    category: p.category,
    submittedAt: tanggal(p.submittedAt),
    summary: p.summary,
    techStack: p.techStack,
    status: p.status,
    raw: p,
  }
}

/** Karya riwayat → bentuk yang dipakai tab "Riwayat Kurasi". */
function toHistoryItem(p: TProject) {
  return {
    id: p.id,
    title: p.title,
    studentName: p.studentName,
    major: p.majorLabel,
    verifiedAt: tanggal(p.publishedAt),
    score: p.score,
    notes: p.reviewNotes ?? "Tanpa catatan.",
    status: p.status,
    raw: p,
  }
}

export default function TeacherDashboardPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchQuery, setSearchQuery] = useState("")

  // ── Data dari database ──────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scope, setScope] = useState<TeacherScope>(null)
  const [stats, setStats] = useState<TStats>({
    menunggu: 0,
    disetujui: 0,
    revisi: 0,
    siswaBimbingan: 0,
  })
  const [queueRaw, setQueueRaw] = useState<TProject[]>([])
  const [historyRaw, setHistoryRaw] = useState<TProject[]>([])
  const [siswa, setSiswa] = useState<TSiswa[]>([])

  // ── Dialog kurasi ───────────────────────────────────────────────────
  const [review, setReview] = useState<{
    item: TProject
    action: "approve" | "revisi" | "reject"
  } | null>(null)
  const [notes, setNotes] = useState("")
  const [score, setScore] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // ── Dialog badge ────────────────────────────────────────────────────────
  const [badgeTarget, setBadgeTarget] = useState<TProject | null>(null)
  const [badgeSubmitting, setBadgeSubmitting] = useState(false)
  const [badgeError, setBadgeError] = useState<string | null>(null)

  // ── Filter, pencarian & paginasi kurasi karya ────────────────────────────
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [curationSearch, setCurationSearch] = useState("")
  const [debouncedCurationQuery, setDebouncedCurationQuery] = useState("")
  const [curationPage, setCurationPage] = useState(1)
  const [detailProject, setDetailProject] = useState<TProject | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedCurationQuery(curationSearch)
      setCurationPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [curationSearch])

  // Bila pengguna mengakses tab riwayat, arahkan ke antrean kurasi dengan filter disetujui
  useEffect(() => {
    if (activeTab === "riwayat") {
      setStatusFilter("approved")
      setActiveTab("antrean")
    }
  }, [activeTab])

  // ── Expanded queue item (fallback detail inline) ─────────────────────────
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const muat = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/teacher/projects", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Gagal memuat data kurasi.")
      } else {
        if (data.error) setError(data.error)
        setScope(data.scope ?? null)
        setStats(data.stats ?? { menunggu: 0, disetujui: 0, revisi: 0, ditolak: 0, siswaBimbingan: 0 })
        setQueueRaw(data.antrean ?? [])
        setHistoryRaw(data.riwayat ?? [])
        setSiswa(data.siswa ?? [])
      }
    } catch {
      setError("Terjadi kesalahan koneksi saat memuat data kurasi.")
    }
    setLoading(false)
  }

  useEffect(() => {
    muat()
    // sengaja hanya sekali saat halaman dibuka
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Gabungkan semua karya antrean & riwayat dalam lingkup guru
  const allProjects = useMemo(() => {
    const map = new Map<string, TProject>()
    for (const p of queueRaw) map.set(p.id, p)
    for (const p of historyRaw) map.set(p.id, p)
    return Array.from(map.values())
  }, [queueRaw, historyRaw])

  const countFor = (key: string): number => {
    if (key === "all") return allProjects.length
    return allProjects.filter((p) => p.status === key).length
  }

  // Filter karya berdasarkan status, kategori jurusan, dan kata kunci pencarian
  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false
      if (debouncedCurationQuery.trim()) {
        const q = debouncedCurationQuery.trim().toLowerCase()
        const text = `${p.title} ${p.studentName} ${p.studentClass} ${p.advisorName} ${p.summary} ${p.category} ${p.majorLabel}`.toLowerCase()
        if (!text.includes(q)) return false
      }
      return true
    })
  }, [allProjects, statusFilter, categoryFilter, debouncedCurationQuery])

  const totalCuration = filteredProjects.length
  const totalPages = Math.max(1, Math.ceil(totalCuration / PAGE_SIZE))
  const paginatedProjects = useMemo(() => {
    const start = (curationPage - 1) * PAGE_SIZE
    return filteredProjects.slice(start, start + PAGE_SIZE)
  }, [filteredProjects, curationPage])

  const startItem = totalCuration === 0 ? 0 : (curationPage - 1) * PAGE_SIZE + 1
  const endItem = Math.min(totalCuration, curationPage * PAGE_SIZE)

  const resetFilters = () => {
    setCurationSearch("")
    setCategoryFilter("all")
    setStatusFilter("all")
    setCurationPage(1)
  }

  // Bentuk data yang dipakai JSX
  const curationQueue = queueRaw
    .map(toQueueItem)
    .filter((item) =>
      searchQuery.trim() === ""
        ? true
        : `${item.title} ${item.studentName} ${item.major}`
            .toLowerCase()
            .includes(searchQuery.trim().toLowerCase())
    )
  const verifiedHistory = historyRaw.map(toHistoryItem)

  const bernilai = historyRaw.filter((p) => typeof p.score === "number")
  const rataNilai =
    bernilai.length > 0
      ? (bernilai.reduce((a, p) => a + (p.score as number), 0) / bernilai.length).toFixed(1)
      : null

  const bukaReview = (item: TProject, action: "approve" | "revisi" | "reject") => {
    setReview({ item, action })
    setNotes("")
    setScore("")
    setFormError(null)
  }

  const handleApprove = (id: string) => {
    const item = allProjects.find((p) => p.id === id)
    if (item) bukaReview(item, "approve")
  }

  const handleRevision = (id: string) => {
    const item = allProjects.find((p) => p.id === id)
    if (item) bukaReview(item, "revisi")
  }

  const handleReject = (id: string) => {
    const item = allProjects.find((p) => p.id === id)
    if (item) bukaReview(item, "reject")
  }

  const kirimReview = async () => {
    if (!review) return
    if (review.action === "revisi" && notes.trim().length < 10) {
      setFormError("Catatan revisi wajib diisi, minimal 10 karakter.")
      return
    }
    setSubmitting(true)
    setFormError(null)
    try {
      const res = await fetch(`/api/teacher/projects/${review.item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: review.action,
          reviewNotes: notes,
          score: score === "" ? undefined : Number(score),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error || "Gagal menyimpan hasil kurasi.")
        setSubmitting(false)
        return
      }
      setToast(
        review.action === "approve"
          ? "Karya disetujui dan kini tayang di Galeri Kandaga."
          : review.action === "reject"
          ? "Karya ditolak. Siswa sudah menerima notifikasi."
          : "Catatan revisi sudah dikirim ke akun siswa."
      )
      setReview(null)
      setDetailProject(null)
      setSubmitting(false)
      muat()
    } catch {
      setFormError("Terjadi kesalahan koneksi.")
      setSubmitting(false)
    }
  }

  const kirimBadge = async (tier: string | null) => {
    if (!badgeTarget) return
    setBadgeSubmitting(true)
    setBadgeError(null)
    try {
      const res = await fetch(`/api/teacher/projects/${badgeTarget.id}/badge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      })
      const data = await res.json()
      if (!res.ok) {
        setBadgeError(data.error ?? "Gagal memproses badge.")
        setBadgeSubmitting(false)
        return
      }
      setToast(tier ? `Badge "${data.badges?.[0]?.name}" diberikan.` : "Badge karya berhasil dicabut.")
      setBadgeTarget(null)
      setDetailProject(null)
      muat()
    } catch {
      setBadgeError("Terjadi kesalahan koneksi.")
    } finally {
      setBadgeSubmitting(false)
    }
  }

  const teacherTabs: DashboardTab[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "antrean",
      label: "Kurasi Karya",
      icon: FolderGit2,
      badge: stats.menunggu > 0 ? `${stats.menunggu}` : undefined,
    },
    {
      id: "siswa-bimbingan",
      label: "Siswa Bimbingan",
      icon: Users,
    },
  ]

  return (
    <DashboardLayout
      roleTitle="Teacher / Guru Portal"
      roleSlug="teacher"
      badgeColor="from-amber-600 to-orange-600"
      icon={BookOpen}
      tabs={teacherTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* ── Status pemuatan, pesan, dan lingkup kurasi ── */}
      {loading && (
        <div className="p-4 rounded-2xl bg-ink-100 border border-ink-150 text-xs font-semibold text-ink-600">
          Memuat data kurasi dari database…
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {toast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between gap-3">
          <span>{toast}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="shrink-0 text-emerald-700 hover:underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* ──────────────── TAB 1: DASHBOARD GURU ──────────────── */}
      {activeTab === "dashboard" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-primary-dark to-primary text-white p-7 sm:p-9 relative overflow-hidden shadow-xl shadow-primary/15">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-xl pr-28 sm:pr-40 md:pr-0">
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                Selamat Bertugas, <span className="capitalize">{session?.user?.username || session?.user?.name || "Bapak/Ibu Guru"}</span>!
              </h1>
              <p className="text-rose-100 text-xs sm:text-sm mt-2 leading-relaxed opacity-90">
                Sebagai Guru Pembimbing, Anda memverifikasi kelayakan karya siswa, memberikan penilaian standar ISO/BNSP, dan menyetujui penayangan portofolio di galeri utama Kandaga.
              </p>
            </div>

            {/* Model Chibi Guru */}
            <div className="absolute right-1 sm:right-6 md:right-8 lg:right-12 -top-2 sm:-top-3 md:-top-4 w-36 sm:w-48 md:w-56 lg:w-64 h-48 sm:h-60 md:h-68 lg:h-76 pointer-events-none select-none z-10">
              <div className="relative w-full h-full">
                <Image
                  src="/images/guru.webp"
                  alt="Ilustrasi Guru"
                  fill
                  sizes="(max-width: 640px) 144px, (max-width: 768px) 200px, 260px"
                  priority
                  className="object-contain object-top drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
                />
              </div>
            </div>
          </div>

          {/* Assessment Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setActiveTab("antrean")}
              className="group p-5 rounded-2xl bg-white border border-ink-150 shadow-xs hover:border-primary/30 hover:shadow-md transition flex flex-col justify-between text-left cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <Clock className="w-5 h-5 text-primary" />
                <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-primary transition" />
              </div>
              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight block">
                  {stats.menunggu}
                </span>
                <span className="text-xs font-bold text-ink-700 block mt-1">Antrean Verifikasi Pending</span>
                <span className="text-[11px] text-ink-400 block mt-0.5">
                  Menunggu kurasi dan review Anda
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("antrean")}
              className="group p-5 rounded-2xl bg-white border border-ink-150 shadow-xs hover:border-primary/30 hover:shadow-md transition flex flex-col justify-between text-left cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <CheckCircle className="w-5 h-5 text-primary" />
                <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-primary transition" />
              </div>
              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight block">
                  {stats.disetujui}
                </span>
                <span className="text-xs font-bold text-ink-700 block mt-1">Disetujui Publikasi</span>
                <span className="text-[11px] text-ink-400 block mt-0.5">
                  Telah tayang di Galeri Utama Kandaga
                </span>
              </div>
            </button>

            <div className="p-5 rounded-2xl bg-white border border-ink-150 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <Award className="w-5 h-5 text-primary" />
                <ArrowUpRight className="w-4 h-4 text-ink-300" />
              </div>
              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight block">
                  {rataNilai ? `${rataNilai} / 100` : "— / 100"}
                </span>
                <span className="text-xs font-bold text-ink-700 block mt-1">Rata-Rata Nilai Riset</span>
                <span className="text-[11px] text-ink-400 block mt-0.5">
                  {bernilai.length > 0
                    ? `Dari ${bernilai.length} karya yang sudah dinilai`
                    : "Belum ada karya yang diberi nilai"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Preview Antrean */}
          <div className="bg-white rounded-2xl p-6 border border-ink-150 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-ink">Perlu Verifikasi Segera</h2>
                <p className="text-xs text-ink-600 max-w-[65ch]">Karya yang baru diajukan oleh siswa dan memerlukan validasi materi tugas akhir.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("antrean")}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua Antrean ({curationQueue.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {curationQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-ink-150 bg-ink-100/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        {item.major}
                      </span>
                      <span className="text-xs text-ink-300 font-mono">{item.classRoom}</span>
                    </div>
                    <h3 className="font-heading text-base font-bold text-ink">{item.title}</h3>
                    <p className="text-xs text-ink-600 font-medium">Diajukan oleh: {item.studentName}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleApprove(item.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Setujui</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRevision(item.id)}
                      className="px-4 py-2 bg-ink-150 hover:bg-ink-150 text-ink rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Revisi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 2: KURASI KARYA & MODERASI GALERI ──────────────── */}
      {(activeTab === "antrean" || activeTab === "kurasi") && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header & Filter Controls Bar */}
          <div className="p-5 rounded-2xl bg-white border border-ink-150 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-heading text-lg font-bold text-ink flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-primary" />
                  <span>Kurasi Karya &amp; Moderasi Galeri</span>
                </h1>
                <p className="text-xs text-ink-600 mt-0.5">
                  Daftar karya inovasi dan portofolio siswa Kandaga ({totalCuration} karya). Hover kartu untuk membuka halaman kurasi.
                </p>
              </div>

              {/* Filtering & Search Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-ink-300 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari karya / siswa..."
                    value={curationSearch}
                    onChange={(e) => {
                      setCurationSearch(e.target.value)
                      setCurationPage(1)
                    }}
                    className="pl-8 pr-8 py-1.5 rounded-xl border border-ink-150 text-xs bg-ink-100/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition"
                  />
                  {curationSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setCurationSearch("")
                        setCurationPage(1)
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-600 cursor-pointer"
                      aria-label="Bersihkan pencarian"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-ink-300" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value)
                      setCurationPage(1)
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl border border-ink-150 bg-white text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary/15 cursor-pointer font-medium"
                  >
                    <option value="all">Semua Kategori</option>
                    <option value="RPL">RPL (Rekayasa Perangkat Lunak)</option>
                    <option value="TKJ">TKJ (Teknik Komputer Jaringan)</option>
                    <option value="KA">Analis Kimia</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tab status — jumlahnya dihitung dinamis dari database */}
            <div className="pt-4 border-t border-ink-150 flex flex-wrap items-center gap-2">
              {STATUS_TABS.map((tab) => {
                const active = statusFilter === tab.key
                const n = countFor(tab.key)
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setStatusFilter(tab.key)
                      setCurationPage(1)
                    }}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                      active
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-ink-600 border-ink-150 hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-1.5 ${active ? "text-white/80" : "text-ink-300"}`}>{n}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Projects Cards Grid */}
          {loading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-ink-150 shadow-xs">
              <Loader2 className="w-6 h-6 animate-spin text-ink-300 mx-auto" />
              <p className="text-xs text-ink-300 mt-2">Memuat karya dari database...</p>
            </div>
          ) : paginatedProjects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-ink-150 shadow-xs">
              <EmptyState
                title={
                  statusFilter === "pending"
                    ? "Antrean Kurasi Bersih"
                    : "Karya Tidak Ditemukan"
                }
                description={
                  statusFilter === "pending"
                    ? "Tidak ada karya yang menunggu kurasi saat ini."
                    : "Tidak ada karya yang sesuai dengan filter atau kata kunci pencarian."
                }
                action={
                  curationSearch || categoryFilter !== "all" || statusFilter !== "all"
                    ? {
                        label: "Reset Filter",
                        onClick: resetFilters,
                      }
                    : undefined
                }
              />
            </div>
          ) : (
            <div
              key={`${statusFilter}-${categoryFilter}-${debouncedCurationQuery}-${curationPage}`}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in-50 duration-300"
            >
              {paginatedProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="relative group p-4 rounded-2xl bg-white border border-ink-150 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setDetailProject(proj)}
                    className="absolute inset-0 bg-ink/75 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 flex flex-col items-center justify-center p-4 text-center cursor-pointer border-none"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 hover:bg-white text-white hover:text-ink flex items-center justify-center backdrop-blur-md shadow-xl transition-all duration-200 transform scale-90 group-hover:scale-100 mb-2">
                      <Eye className="w-6 h-6" />
                    </div>
                    <span className="text-white text-xs font-semibold tracking-wide drop-shadow-sm">
                      Lihat Detail &amp; Kurasi Karya
                    </span>
                  </button>

                  <div>
                    <div className="relative h-44 rounded-xl overflow-hidden bg-ink-100 mb-3">
                      <Image
                        src={proj.coverImage || "/images/preview-rpl.jpg"}
                        alt={proj.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2.5 right-2.5 z-10 bg-ink/70 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-white/10">
                        {proj.category}
                      </span>
                      <span
                        className={`absolute bottom-2.5 left-2.5 z-10 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                          STATUS_STYLE[proj.status] ?? "bg-white text-ink border-ink-150"
                        }`}
                      >
                        {STATUS_LABEL[proj.status] ?? proj.status}
                      </span>
                    </div>

                    <h2 className="font-bold text-sm text-ink group-hover:text-primary transition-colors leading-snug line-clamp-2">
                      {proj.title}
                    </h2>
                    <p className="text-xs text-ink-600 mt-1.5 line-clamp-2 leading-relaxed font-sans">
                      {proj.summary}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-ink-150 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-[9px] flex items-center justify-center shrink-0">
                        {proj.studentName.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-ink text-xs block leading-tight line-clamp-1">
                          {proj.studentName}
                        </span>
                        <span className="text-[10px] text-ink-300 block">
                          {proj.studentClass} • {proj.advisorName}
                        </span>
                      </div>
                    </div>
                    <span className="text-ink-600 font-medium text-[11px] shrink-0 font-mono">
                      {proj.score !== null ? `Nilai ${proj.score}` : "Belum dinilai"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-ink-150 shadow-xs text-xs text-ink-600">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={curationPage <= 1}
                  onClick={() => setCurationPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-xl border border-ink-150 bg-white flex items-center justify-center text-ink-600 hover:bg-ink-100 hover:text-ink disabled:opacity-35 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Halaman sebelumnya"
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurationPage(idx + 1)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        curationPage === idx + 1
                          ? "bg-primary text-white shadow-xs"
                          : "bg-ink-100 text-ink-600 hover:bg-ink-150 border border-ink-150"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={curationPage >= totalPages}
                  onClick={() => setCurationPage((p) => Math.min(totalPages, p + 1))}
                  className="w-8 h-8 rounded-xl border border-ink-150 bg-white flex items-center justify-center text-ink-600 hover:bg-ink-100 hover:text-ink disabled:opacity-35 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Halaman berikutnya"
                  aria-label="Halaman berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span>Menampilkan karya</span>
                <span className="font-bold text-ink">
                  {startItem}–{endItem}
                </span>
                <span>dari</span>
                <span className="font-bold text-ink">{totalCuration}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────── TAB 3: SISWA BIMBINGAN ──────────────── */}
      {activeTab === "siswa-bimbingan" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-white rounded-2xl border border-ink-150 shadow-xs">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-ink">
              Daftar Siswa Bimbingan Tugas Akhir
            </h1>
            <p className="font-sans text-xs sm:text-sm text-ink-600 mt-1 max-w-[65ch]">
              Monitoring progres portofolio dan kelayakan karya siswa bimbingan akademik Anda.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-ink-150 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-ink-100 border-b border-ink-150">
                    <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Nama Siswa</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Kelas / Jurusan</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Judul Proyek Tugas Akhir</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Status Kurasi</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-ink-700 font-heading pr-5">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-150 bg-white">
                  {siswa.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8">
                        <EmptyState
                          compact
                          title="Belum Ada Siswa Terdaftar"
                          description="Belum ada siswa terdaftar di jurusan Anda."
                        />
                      </td>
                    </tr>
                  )}

                  {siswa.flatMap((s) => {
                    // Satu baris per karya; siswa tanpa karya tetap ditampilkan.
                    const karya =
                      s.karya.length > 0
                        ? s.karya
                        : [{ id: `${s.id}-kosong`, title: "Belum mengajukan karya", status: "", score: null }];

                    return karya.map((k) => (
                      <tr key={k.id} className="hover:bg-ink-100/50 transition-colors">
                        <td className="px-5 py-4 font-semibold text-ink text-sm">{s.name}</td>
                        <td className="px-5 py-4 text-ink-600 font-mono text-sm">{s.class}</td>
                        <td className="px-5 py-4 text-ink text-sm">{k.title}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-ink-100 text-ink-700 rounded-full border border-ink-200 font-semibold text-xs">
                            {STATUS_KURASI[k.status] ?? k.status}
                            {typeof k.score === "number" ? ` • Nilai ${k.score}` : ""}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right pr-5">
                          <button
                            type="button"
                            onClick={() => setActiveTab("antrean")}
                            className="px-3 py-1.5 rounded-xl border border-ink-150 hover:bg-ink-100 text-primary hover:text-primary-dark text-xs font-semibold transition cursor-pointer"
                          >
                            Lihat antrean
                          </button>
                        </td>
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── MODAL DETAIL & KURASI KARYA ──────────────── */}
      {detailProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-ink-150 shadow-2xl overflow-hidden my-8 animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-ink-150 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-ink">
                    Detail &amp; Kurasi Karya
                  </h2>
                  <p className="text-xs text-ink-600 mt-0.5">
                    {detailProject.studentName} ({detailProject.studentClass}) &bull; {detailProject.majorLabel}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailProject(null)}
                aria-label="Tutup detail karya"
                className="p-2 rounded-xl text-ink-400 hover:text-ink hover:bg-ink-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Cover Image & Badges */}
              <div className="relative h-60 w-full rounded-2xl overflow-hidden bg-ink-100 border border-ink-150">
                <Image
                  src={detailProject.coverImage || "/images/preview-rpl.jpg"}
                  alt={detailProject.title}
                  fill
                  className="object-cover"
                />
                <span className="absolute top-3 right-3 z-10 bg-ink/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/10">
                  {detailProject.category}
                </span>
                <span
                  className={`absolute bottom-3 left-3 z-10 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                    STATUS_STYLE[detailProject.status] ?? "bg-white text-ink border-ink-150"
                  }`}
                >
                  {STATUS_LABEL[detailProject.status] ?? detailProject.status}
                </span>
              </div>

              {/* Title & Metadata */}
              <div>
                <div className="flex items-center gap-2 text-xs text-ink-400 mb-1">
                  <span>Diajukan: {tanggal(detailProject.submittedAt)}</span>
                  {detailProject.publishedAt && (
                    <>
                      <span>&bull;</span>
                      <span className="text-emerald-600 font-medium">Tayang: {tanggal(detailProject.publishedAt)}</span>
                    </>
                  )}
                  {detailProject.score !== null && (
                    <>
                      <span>&bull;</span>
                      <span className="font-bold text-primary font-mono">Nilai: {detailProject.score}/100</span>
                    </>
                  )}
                </div>
                <h3 className="font-heading text-xl font-bold text-ink leading-snug">
                  {detailProject.title}
                </h3>
              </div>

              {/* Student and Advisor Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-ink-100/60 border border-ink-150">
                  <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-1">Siswa Pengaju</p>
                  <p className="font-bold text-ink text-sm">{detailProject.studentName}</p>
                  <p className="text-ink-600 text-xs mt-0.5">{detailProject.studentClass}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-ink-100/60 border border-ink-150">
                  <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-1">Guru Pembimbing</p>
                  <p className="font-bold text-ink text-sm">{detailProject.advisorName || "—"}</p>
                  <p className="text-ink-600 text-xs mt-0.5">Jurusan {detailProject.majorLabel}</p>
                </div>
              </div>

              {/* Summary / Description */}
              <div>
                <h4 className="text-xs font-bold text-ink-700 uppercase tracking-wider mb-2">
                  Deskripsi &amp; Abstrak Karya
                </h4>
                <p className="text-xs sm:text-sm text-ink-600 leading-relaxed whitespace-pre-line bg-ink-100/30 p-4 rounded-2xl border border-ink-150">
                  {detailProject.summary}
                </p>
              </div>

              {/* Tech Stack */}
              {detailProject.techStack && detailProject.techStack.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-ink-700 uppercase tracking-wider mb-2">
                    Teknologi / Peralatan
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {detailProject.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-ink-100 text-ink-700 text-xs font-mono font-medium border border-ink-150"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Badges */}
              {detailProject.badges && detailProject.badges.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Medal className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-900">
                        {detailProject.badges[0].name}
                      </span>
                      <p className="text-[11px] text-amber-700">
                        Diberikan pada {tanggal(detailProject.badges[0].awardedAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBadgeTarget(detailProject)
                      setBadgeError(null)
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition cursor-pointer"
                  >
                    Ubah Badge
                  </button>
                </div>
              )}

              {/* Existing Notes */}
              {detailProject.reviewNotes && (
                <div className="p-4 rounded-2xl bg-ink-100/50 border border-ink-150 text-xs">
                  <p className="font-bold text-ink-700 mb-1">Catatan Kurasi Terakhir:</p>
                  <p className="text-ink-600 italic">&ldquo;{detailProject.reviewNotes}&rdquo;</p>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="p-5 border-t border-ink-150 bg-ink-100/30 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setBadgeTarget(detailProject)
                  setBadgeError(null)
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition cursor-pointer"
              >
                <Medal className="w-4 h-4" />
                <span>{detailProject.badges?.length ? "Kelola Badge" : "Beri Badge"}</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => bukaReview(detailProject, "revisi")}
                  className="px-4 py-2 border border-ink-150 text-ink-700 hover:bg-ink-100 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Minta Revisi
                </button>
                <button
                  type="button"
                  onClick={() => bukaReview(detailProject, "reject")}
                  className="px-4 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Tolak Karya
                </button>
                <button
                  type="button"
                  onClick={() => bukaReview(detailProject, "approve")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Setujui &amp; Publikasikan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ──────────────── DIALOG BADGE ──────────────── */}
      {badgeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-ink-150 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-base font-bold text-ink flex items-center gap-2">
                  <Medal className="w-4 h-4 text-amber-600" />
                  Apresiasi Badge Karya
                </h2>
                <p className="text-xs text-ink-600 mt-0.5 line-clamp-2">{badgeTarget.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setBadgeTarget(null)}
                aria-label="Tutup dialog badge"
                className="p-1.5 rounded-lg hover:bg-ink-100 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4 text-ink-600" />
              </button>
            </div>

            <p className="text-xs text-ink-600 leading-relaxed">
              Pilih tingkat apresiasi untuk karya ini. Badge bersifat opsional dan
              <strong> tidak</strong> mengubah status tayang karya.
            </p>

            {/* Badge tier buttons */}
            <div className="space-y-2">
              {([
                { tier: "gold",   label: "Karya Unggulan", desc: "Karya terbaik jurusan, di atas rata-rata",    color: "border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800" },
                { tier: "silver", label: "Karya Terpilih", desc: "Karya berkualitas dan layak disorot",          color: "border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700" },
                { tier: "bronze", label: "Karya Baik",     desc: "Karya memenuhi standar dengan baik",          color: "border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700" },
              ] as const).map(({ tier, label, desc, color }) => {
                const isActive = badgeTarget.badges?.[0]?.tier === tier
                return (
                  <button
                    key={tier}
                    type="button"
                    disabled={badgeSubmitting}
                    onClick={() => kirimBadge(tier)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left transition cursor-pointer disabled:opacity-50 ${color} ${isActive ? "ring-2 ring-offset-1 ring-amber-400" : ""}`}
                  >
                    <div>
                      <p className="text-xs font-bold">{label} {isActive && <span className="ml-1 text-[10px] font-semibold opacity-70">(aktif)</span>}</p>
                      <p className="text-[10px] opacity-70 mt-0.5">{desc}</p>
                    </div>
                    <Medal className="w-4 h-4 shrink-0" />
                  </button>
                )
              })}
            </div>

            {/* Remove badge */}
            {badgeTarget.badges?.length > 0 && (
              <button
                type="button"
                disabled={badgeSubmitting}
                onClick={() => kirimBadge(null)}
                className="w-full px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                Cabut Badge
              </button>
            )}

            {badgeError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {badgeError}
              </div>
            )}

            {badgeSubmitting && (
              <div className="flex items-center justify-center gap-2 text-xs text-ink-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses…
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────── DIALOG KURASI ──────────────── */}
      {review && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-ink-150 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-ink">
                  {review.action === "approve"
                    ? "Setujui & Publikasikan Karya"
                    : review.action === "reject"
                    ? "Tolak Karya Secara Permanen"
                    : "Minta Revisi Karya"}
                </h2>
                <p className="text-xs text-ink-600 mt-1 max-w-[65ch]">{review.item.title}</p>
                {review.action === "reject" && (
                  <p className="text-xs text-rose-600 mt-1 font-semibold">
                    ⚠ Penolakan bersifat final. Karya tidak bisa dikembalikan ke antrean oleh guru.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setReview(null)}
                aria-label="Tutup dialog"
                className="p-1.5 rounded-lg hover:bg-ink-100 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4 text-ink-600" />
              </button>
            </div>

            {review.action === "approve" && (
              <div className="space-y-1.5">
                <label htmlFor="nilai-kurasi" className="text-xs font-bold text-ink-700">
                  Nilai kurasi (opsional, 0-100)
                </label>
                <input
                  id="nilai-kurasi"
                  type="number"
                  min={0}
                  max={100}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="mis. 92"
                  className="w-full rounded-xl border border-ink-150 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="catatan-kurasi" className="text-xs font-bold text-ink-700">
                Catatan {review.action === "revisi" || review.action === "reject" ? "(wajib, min. 10 karakter)" : "(opsional)"}
              </label>
              <textarea
                id="catatan-kurasi"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  review.action === "revisi"
                    ? "Jelaskan bagian yang perlu diperbaiki…"
                    : review.action === "reject"
                    ? "Jelaskan alasan penolakan karya ini…"
                    : "Catatan penilaian untuk siswa…"
                }
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                  review.action === "reject"
                    ? "border-rose-200 focus:ring-rose-500/30"
                    : "border-ink-150 focus:ring-emerald-500/30"
                }`}
              />
              {(review.action === "revisi" || review.action === "reject") && (
                <p className="text-[11px] text-ink-600">
                  Siswa akan menerima notifikasi berisi catatan ini.
                </p>
              )}
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {formError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReview(null)}
                className="px-4 py-2 rounded-xl border border-ink-150 text-xs font-bold text-ink-700 hover:bg-ink-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={kirimReview}
                disabled={submitting}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer disabled:opacity-60 ${
                  review.action === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : review.action === "reject"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {submitting
                  ? "Menyimpan…"
                  : review.action === "approve"
                    ? "Setujui & Publikasikan"
                    : review.action === "reject"
                    ? "Tolak Permanen"
                    : "Kirim Catatan Revisi"}
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
