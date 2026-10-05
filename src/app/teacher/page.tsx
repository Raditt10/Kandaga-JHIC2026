"use client"

import React, { useEffect, useState } from "react"
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

type TStats = { menunggu: number; disetujui: number; revisi: number; siswaBimbingan: number }

const STATUS_KURASI: Record<string, string> = {
  pending: "Menunggu Review",
  approved: "Disetujui",
  revisi: "Perlu Revisi",
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

  // ── Expanded queue item (lihat detail karya sebelum kurasi) ─────────────
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
        setStats(data.stats ?? { menunggu: 0, disetujui: 0, revisi: 0, siswaBimbingan: 0 })
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

  // Bentuk data yang dipakai JSX — nama field dipertahankan dari versi mock.
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

  // Nama fungsi dipertahankan supaya pemanggilan di JSX tidak perlu diubah.
  const handleApprove = (id: string) => {
    const item = queueRaw.find((p) => p.id === id)
    if (item) bukaReview(item, "approve")
  }

  const handleRevision = (id: string) => {
    const item = queueRaw.find((p) => p.id === id)
    if (item) bukaReview(item, "revisi")
  }

  const handleReject = (id: string) => {
    const item = queueRaw.find((p) => p.id === id)
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
      label: "Antrean Verifikasi",
      icon: ClipboardCheck,
      badge: `${curationQueue.length}`,
    },
    {
      id: "siswa-bimbingan",
      label: "Siswa Bimbingan",
      icon: Users,
    },
    {
      id: "riwayat",
      label: "Riwayat Kurasi",
      icon: History,
      badge: `${verifiedHistory.length}`,
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-ink-150 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="font-heading text-xs font-semibold text-ink-600 uppercase tracking-wider">Antrean Verifikasi Pending</h2>
              <p className="font-heading text-3xl font-extrabold text-amber-600 mt-2">{stats.menunggu} Proyek</p>
              <span className="text-xs text-ink-600 font-medium mt-1 block">Menunggu kurasi dan review Anda</span>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-ink-150 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h2 className="font-heading text-xs font-semibold text-ink-600 uppercase tracking-wider">Disetujui Publikasi</h2>
              <p className="font-heading text-3xl font-extrabold text-emerald-600 mt-2">{stats.disetujui} Proyek</p>
              <span className="text-xs text-ink-600 font-medium mt-1 block">Telah tayang di Galeri Utama Kandaga</span>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-ink-150 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h2 className="font-heading text-xs font-semibold text-ink-600 uppercase tracking-wider">Rata-Rata Nilai Riset</h2>
              <p className="font-heading text-3xl font-extrabold text-blue-600 mt-2">
                {rataNilai ? `${rataNilai} / 100` : "— / 100"}
              </p>
              <span className="text-xs text-ink-600 font-medium mt-1 block">
                {bernilai.length > 0
                  ? `Dari ${bernilai.length} karya yang sudah dinilai`
                  : "Belum ada karya yang diberi nilai"}
              </span>
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
                className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
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

      {/* ──────────────── TAB 2: ANTREAN VERIFIKASI ──────────────── */}
      {activeTab === "antrean" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-white rounded-2xl border border-ink-150 shadow-xs">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-ink">
              Antrean Penilaian & Kurasi Karya Siswa
            </h1>
            <p className="font-sans text-xs sm:text-sm text-ink-600 mt-1 max-w-[65ch]">
              Tinjau kelayakan metodologi riset, kualitas implementasi kode, dan dokumentasi karya sebelum diberikan hak tayang di galeri publik.
            </p>
          </div>

          <div className="space-y-4">
            {curationQueue.length === 0 ? (
              <div className="bg-white rounded-2xl border border-ink-150 shadow-xs">
                <EmptyState
                  title="Semua Antrean Selesai"
                  description="Tidak ada karya yang menunggu review saat ini."
                />
              </div>
            ) : (
              curationQueue.map((item) => {
                const isExpanded = expandedId === item.id
                return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-ink-150 shadow-xs overflow-hidden"
                >
                  {/* ── Summary row ── */}
                  <div className="p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                            {item.major}
                          </span>
                          <span className="text-xs font-semibold text-ink-600">{item.category}</span>
                          <span className="text-ink-300">•</span>
                          <span className="text-xs text-ink-300">Diajukan: {item.submittedAt}</span>
                        </div>
                        <h2 className="font-heading text-lg font-bold text-ink pt-1">{item.title}</h2>
                        <p className="text-xs text-ink-600">
                          Oleh: <strong>{item.studentName}</strong> ({item.classRoom})
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Menunggu Penilaian</span>
                      </div>
                    </div>

                    <p className="font-sans text-xs sm:text-sm text-ink-600 leading-relaxed max-w-[65ch]">
                      {item.summary}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {item.techStack.map((tech, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-md bg-ink-100 text-ink-700 text-xs font-mono">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-ink-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Lihat detail toggle */}
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {isExpanded ? "Sembunyikan detail" : "Lihat detail karya lengkap"}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRevision(item.id)}
                          className="px-4 py-2 border border-ink-150 text-ink-700 hover:bg-ink-100 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Minta Revisi Siswa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(item.id)}
                          className="px-4 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Tolak Permanen
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApprove(item.id)}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Setujui &amp; Publikasikan</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── Expandable detail panel ── */}
                  {isExpanded && (
                    <div className="border-t border-ink-150 bg-ink-100/40 p-6 space-y-4 animate-in fade-in duration-150">
                      {/* Cover image */}
                      {item.raw.coverImage && (
                        <div>
                          <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-wider mb-2">Gambar Karya</p>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.raw.coverImage}
                            alt={item.title}
                            className="w-full max-h-64 object-cover rounded-xl border border-ink-200"
                          />
                        </div>
                      )}

                      {/* Full description */}
                      <div>
                        <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-wider mb-1">Deskripsi Lengkap</p>
                        <p className="text-xs text-ink-700 leading-relaxed whitespace-pre-line">
                          {item.summary || "Belum ada deskripsi dari siswa."}
                        </p>
                      </div>

                      {/* Metadata grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-white rounded-xl border border-ink-150">
                          <p className="text-[10px] text-ink-400 uppercase tracking-wider mb-0.5">Guru Pembimbing</p>
                          <p className="font-semibold text-ink">{item.raw.advisorName || "—"}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-ink-150">
                          <p className="text-[10px] text-ink-400 uppercase tracking-wider mb-0.5">Kelas</p>
                          <p className="font-semibold text-ink">{item.classRoom}</p>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-ink-150 col-span-2">
                          <p className="text-[10px] text-ink-400 uppercase tracking-wider mb-1">{item.major === "RPL" ? "Teknologi / Stack" : item.major === "TKJ" ? "Perangkat & Protokol" : "Metode & Instrumen"}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {item.techStack.length > 0
                              ? item.techStack.map((t, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-md bg-ink-100 text-ink-700 text-[11px] font-mono">{t}</span>
                                ))
                              : <span className="text-ink-400">Belum ada data tools.</span>
                            }
                          </div>
                        </div>
                      </div>

                      {/* Action reminder */}
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>Setelah Anda setujui, karya ini akan langsung tayang di Galeri Kandaga dan dapat dilihat publik serta mitra industri.</p>
                      </div>
                    </div>
                  )}
                </div>
                )
              })
            )}
          </div>
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

      {/* ──────────────── TAB 4: RIWAYAT KURASI ──────────────── */}
      {activeTab === "riwayat" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-white rounded-2xl border border-ink-150 shadow-xs">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-ink">
              Riwayat Karya yang Telah Disetujui
            </h1>
            <p className="font-sans text-xs sm:text-sm text-ink-600 mt-1 max-w-[65ch]">
              Arsip karya yang sudah diverifikasi. Klik <strong>Beri Badge</strong> untuk
              memberi apresiasi tambahan — ini terpisah dari keputusan tayang.
            </p>
          </div>

          <div className="space-y-3">
            {verifiedHistory.length === 0 && (
              <div className="bg-white rounded-2xl border border-ink-150 shadow-xs">
                <EmptyState
                  title="Belum Ada Riwayat Kurasi"
                  description="Karya yang telah disetujui akan muncul di sini."
                />
              </div>
            )}

            {verifiedHistory.map((item) => {
              const currentBadge = item.raw.badges?.[0] ?? null
              const TIER_COLOR: Record<string, string> = {
                gold:   "bg-amber-50 text-amber-700 border-amber-200",
                silver: "bg-slate-50 text-slate-600 border-slate-200",
                bronze: "bg-orange-50 text-orange-700 border-orange-200",
              }
              return (
                <div key={item.id} className="p-5 bg-white rounded-2xl border border-ink-150 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left — project info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Disetujui: {item.verifiedAt}
                      </span>
                      <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md">
                        {item.major}
                      </span>
                      {currentBadge && (
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md border ${TIER_COLOR[currentBadge.tier] ?? "bg-ink-100 text-ink-700 border-ink-200"}`}>
                          <Medal className="w-3 h-3" />
                          {currentBadge.name}
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading text-base font-bold text-ink">{item.title}</h3>
                    <p className="text-xs text-ink-600 mt-0.5">
                      Siswa: {item.studentName}
                      {typeof item.score === "number" && (
                        <> &bull; Nilai: <strong className="text-emerald-700">{item.score} / 100</strong></>
                      )}
                    </p>
                    {item.notes && item.notes !== "Tanpa catatan." && (
                      <p className="text-xs text-ink-600 mt-1 italic">&ldquo;{item.notes}&rdquo;</p>
                    )}
                  </div>

                  {/* Right — actions */}
                  <div className="flex items-center gap-2 shrink-0 self-start">
                    <button
                      type="button"
                      onClick={() => { setBadgeTarget(item.raw); setBadgeError(null) }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition cursor-pointer"
                    >
                      <Medal className="w-3.5 h-3.5" />
                      {currentBadge ? "Ganti Badge" : "Beri Badge"}
                    </button>
                    <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                      Tayang di Galeri
                    </span>
                  </div>
                </div>
              )
            })}
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
