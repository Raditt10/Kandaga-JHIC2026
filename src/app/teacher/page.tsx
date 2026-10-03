"use client";

import React, { useEffect, useState } from "react"
import DashboardLayout, { DashboardTab } from "@/components/DashboardLayout"
import AccountSettings from "@/components/settings/AccountSettings"
import { useSession } from "next-auth/react"
import {
  BookOpen,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  ClipboardCheck,
  Users,
  History,
  Search,
  ExternalLink,
  Award,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  FileCode,
  FlaskConical,
  Wifi,
  Filter,
  X,
  Settings
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
    action: "approve" | "revisi"
  } | null>(null)
  const [notes, setNotes] = useState("")
  const [score, setScore] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

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

  const bukaReview = (item: TProject, action: "approve" | "revisi") => {
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
    {
      id: "pengaturan",
      label: "Pengaturan",
      icon: Settings,
    },
  ]

  return (
    <DashboardLayout
      roleTitle="Guru Kurator"
      roleSlug="teacher"
      icon={BookOpen}
      tabs={teacherTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* ── Status pemuatan, pesan, dan lingkup kurasi ── */}
      {loading && (
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-600">
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

      {scope?.majorName && (
        <p className="text-xs text-zinc-500">
          Lingkup kurasi Anda: <strong className="text-zinc-800">{scope.majorName}</strong> — hanya karya
          jurusan ini yang tampil.
        </p>
      )}

      {/* ──────────────── TAB 1: DASHBOARD GURU ──────────────── */}
      {activeTab === "dashboard" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-950 via-orange-950 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-200 text-xs font-semibold mb-3">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Portal Penilaian & Pembimbingan Karya Siswa</span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Selamat Bertugas, {session?.user?.username || "Bapak/Ibu Guru"}! 👨‍🏫
              </h1>
              <p className="font-sans text-amber-100 text-sm max-w-[65ch] mt-2 leading-relaxed">
                Sebagai Guru Pembimbing, Anda memverifikasi kelayakan karya siswa, memberikan penilaian standar ISO/BNSP, dan menyetujui penayangan portofolio di galeri utama Kandaga.
              </p>

              {/* User Session Detail */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/15 text-xs">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-amber-200 block text-xs font-medium">NIP / Username Guru</span>
                  <span className="font-mono font-bold text-white text-sm mt-0.5 block">{session?.user?.username || "guru.pembimbing"}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-amber-200 block text-xs font-medium">Email Akademik</span>
                  <span className="font-mono font-bold text-white text-sm mt-0.5 block truncate">{session?.user?.email || "guru@smkn13bandung.sch.id"}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-amber-200 block text-xs font-medium">Otoritas Kurasi</span>
                  <span className="font-bold text-amber-300 text-sm mt-0.5 block">VERIFIKATOR SEKOLAH</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assessment Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="font-heading text-xs font-semibold text-zinc-500 uppercase tracking-wider">Antrean Verifikasi Pending</h2>
              <p className="font-heading text-3xl font-extrabold text-amber-600 mt-2">{stats.menunggu} Proyek</p>
              <span className="text-xs text-zinc-500 font-medium mt-1 block">Menunggu kurasi dan review Anda</span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h2 className="font-heading text-xs font-semibold text-zinc-500 uppercase tracking-wider">Disetujui Publikasi</h2>
              <p className="font-heading text-3xl font-extrabold text-emerald-600 mt-2">{stats.disetujui} Proyek</p>
              <span className="text-xs text-zinc-500 font-medium mt-1 block">Telah tayang di Galeri Utama Kandaga</span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h2 className="font-heading text-xs font-semibold text-zinc-500 uppercase tracking-wider">Rata-Rata Nilai Riset</h2>
              <p className="font-heading text-3xl font-extrabold text-blue-600 mt-2">
                {rataNilai ? `${rataNilai} / 100` : "— / 100"}
              </p>
              <span className="text-xs text-zinc-500 font-medium mt-1 block">
                {bernilai.length > 0
                  ? `Dari ${bernilai.length} karya yang sudah dinilai`
                  : "Belum ada karya yang diberi nilai"}
              </span>
            </div>
          </div>

          {/* Quick Preview Antrean */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-zinc-900">Perlu Verifikasi Segera</h2>
                <p className="text-xs text-zinc-500 max-w-[65ch]">Karya yang baru diajukan oleh siswa dan memerlukan validasi materi tugas akhir.</p>
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
                  className="p-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        {item.major}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">{item.classRoom}</span>
                    </div>
                    <h3 className="font-heading text-base font-bold text-zinc-900">{item.title}</h3>
                    <p className="text-xs text-zinc-500 font-medium">Diajukan oleh: {item.studentName}</p>
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
                      className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-xl text-xs font-bold transition cursor-pointer"
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
          <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-zinc-900">
              Antrean Penilaian & Kurasi Karya Siswa
            </h1>
            <p className="font-sans text-xs sm:text-sm text-zinc-500 mt-1 max-w-[65ch]">
              Tinjau kelayakan metodologi riset, kualitas implementasi kode, dan dokumentasi karya sebelum diberikan hak tayang di galeri publik.
            </p>
          </div>

          <div className="space-y-4">
            {curationQueue.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-heading text-base font-bold text-zinc-800">Semua Antrean Selesai</h3>
                <p className="text-xs text-zinc-500 mt-1">Tidak ada karya yang menunggu review saat ini.</p>
              </div>
            ) : (
              curationQueue.map((item) => (
                <div
                  key={item.id}
                  className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          {item.major}
                        </span>
                        <span className="text-xs font-semibold text-zinc-500">{item.category}</span>
                        <span className="text-zinc-300">•</span>
                        <span className="text-xs text-zinc-400">Diajukan: {item.submittedAt}</span>
                      </div>
                      <h2 className="font-heading text-lg font-bold text-zinc-900 pt-1">{item.title}</h2>
                      <p className="text-xs text-zinc-600">
                        Oleh: <strong>{item.studentName}</strong> ({item.classRoom})
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200 text-xs font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Menunggu Penilaian</span>
                    </div>
                  </div>

                  <p className="font-sans text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-[65ch]">
                    {item.summary}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {item.techStack.map((tech, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 text-xs font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs text-zinc-500">Standar Rubrik: ISO 9001 / BNSP SMKN 13</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRevision(item.id)}
                        className="px-4 py-2 border border-zinc-200 text-zinc-700 hover:bg-zinc-100 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Minta Revisi Siswa
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
              ))
            )}
          </div>
        </div>
      )}

      {/* ──────────────── TAB 3: SISWA BIMBINGAN ──────────────── */}
      {activeTab === "siswa-bimbingan" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-zinc-900">
              Daftar Siswa Bimbingan Tugas Akhir
            </h1>
            <p className="font-sans text-xs sm:text-sm text-zinc-500 mt-1 max-w-[65ch]">
              Monitoring progres portofolio dan kelayakan karya siswa bimbingan akademik Anda.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-3">Nama Siswa</th>
                  <th className="pb-3 px-3">Kelas / Jurusan</th>
                  <th className="pb-3 px-3">Judul Proyek Tugas Akhir</th>
                  <th className="pb-3 px-3">Status Kurasi</th>
                  <th className="pb-3 px-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {siswa.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-zinc-500">
                      Belum ada siswa terdaftar di jurusan Anda.
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
                    <tr key={k.id} className="hover:bg-zinc-50 transition">
                      <td className="py-3 px-3 font-bold text-zinc-900">{s.name}</td>
                      <td className="py-3 px-3 text-zinc-600 font-mono">{s.class}</td>
                      <td className="py-3 px-3 text-zinc-800">{k.title}</td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 bg-zinc-100 text-zinc-800 rounded-md font-semibold text-[11px]">
                          {STATUS_KURASI[k.status] ?? k.status}
                          {typeof k.score === "number" ? ` • Nilai ${k.score}` : ""}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => setActiveTab("antrean")}
                          className="text-amber-700 font-bold hover:underline cursor-pointer"
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
      )}

      {/* ──────────────── TAB 4: RIWAYAT KURASI ──────────────── */}
      {activeTab === "riwayat" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-zinc-900">
              Riwayat Karya yang Telah Disetujui
            </h1>
            <p className="font-sans text-xs sm:text-sm text-zinc-500 mt-1 max-w-[65ch]">
              Arsip karya portofolio siswa yang telah Anda setujui dan berhasil dipublikasikan di Galeri Utama Kandaga.
            </p>
          </div>

          <div className="space-y-3">
            {verifiedHistory.map((item) => (
              <div key={item.id} className="p-5 bg-white rounded-2xl border border-zinc-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Disetujui: {item.verifiedAt}
                    </span>
                    <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md">
                      {item.major}
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-zinc-900">{item.title}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Siswa: {item.studentName} • Nilai: <strong className="text-emerald-700">{item.score} / 100</strong></p>
                  <p className="text-xs text-zinc-600 mt-1 italic">&ldquo;{item.notes}&rdquo;</p>
                </div>

                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full self-start sm:self-center shrink-0">
                  Tayang di Galeri
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* ──────────────── DIALOG KURASI ──────────────── */}
      {review && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-zinc-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-zinc-900">
                  {review.action === "approve"
                    ? "Setujui & Publikasikan Karya"
                    : "Minta Revisi Karya"}
                </h2>
                <p className="text-xs text-zinc-500 mt-1 max-w-[65ch]">{review.item.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setReview(null)}
                aria-label="Tutup dialog"
                className="p-1.5 rounded-lg hover:bg-zinc-100 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4 text-zinc-500" />
              </button>
            </div>

            {review.action === "approve" && (
              <div className="space-y-1.5">
                <label htmlFor="nilai-kurasi" className="text-xs font-bold text-zinc-700">
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
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="catatan-kurasi" className="text-xs font-bold text-zinc-700">
                Catatan {review.action === "revisi" ? "(wajib, min. 10 karakter)" : "(opsional)"}
              </label>
              <textarea
                id="catatan-kurasi"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  review.action === "revisi"
                    ? "Jelaskan bagian yang perlu diperbaiki…"
                    : "Catatan penilaian untuk siswa…"
                }
                className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
              {review.action === "revisi" && (
                <p className="text-[11px] text-zinc-500">
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
                className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
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
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {submitting
                  ? "Menyimpan…"
                  : review.action === "approve"
                    ? "Setujui & Publikasikan"
                    : "Kirim Catatan Revisi"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ──────────────── TAB 5: PENGATURAN AKUN ──────────────── */}
      {activeTab === "pengaturan" && <AccountSettings />}
    </DashboardLayout>
  );
}
