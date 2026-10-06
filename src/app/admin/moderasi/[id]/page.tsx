"use client"

/**
 * Detail moderasi karya untuk admin.
 *
 * SEBELUMNYA halaman ini membaca `projectShowcases` dari lib/adminData.ts —
 * array mock di dalam kode — dan tombol "Verifikasi & Setujui" / "Tolak Karya"
 * hanya memanggil setState lokal. Halaman tetap menampilkan pesan
 * "berhasil diverifikasi dan disetujui untuk tayang di Galeri Utama!" padahal
 * TIDAK ADA data yang berubah: karya tetap berstatus pending selamanya.
 *
 * Sekarang halaman ini:
 *   - memuat karya sungguhan dari GET  /api/admin/projects/[id],
 *   - menyimpan keputusan lewat PATCH /api/admin/projects/[id],
 *   - menampilkan pesan sukses HANYA setelah server membalas sukses,
 *   - menampilkan pesan galat bila penyimpanan gagal.
 */

import React, { useState, use, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import AdminLayout from "@/components/admin/AdminLayout"
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  ShieldCheck,
  Sparkles,
  FileCheck,
  AlertTriangle,
  MessageSquare,
  Check,
  X,
  Loader2,
  ImageIcon,
  Gauge,
} from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

type Status = "pending" | "approved" | "revisi" | "rejected"

interface AdminProject {
  id: string
  title: string
  summary: string
  category: string
  major: string
  majorLabel: string
  studentName: string
  studentClass: string
  advisorName: string
  submittedAt: string
  publishedAt: string | null
  status: string
  score: number | null
  reviewNotes: string | null
  coverImage: string | null
  techStack: string[]
}

function formatTanggal(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

export default function AdminDetailModerasiPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const projectId = resolvedParams.id

  const [project, setProject] = useState<AdminProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [curationNote, setCurationNote] = useState("")
  const [scoreInput, setScoreInput] = useState("")
  const [saving, setSaving] = useState<Status | null>(null)
  const [toast, setToast] = useState<{ text: string; type: "success" | "danger" } | null>(null)

  const showToast = useCallback((text: string, type: "success" | "danger") => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 5000)
  }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/projects/${projectId}`, { cache: "no-store" })
        const data = await res.json()
        if (!alive) return
        if (!res.ok) {
          setLoadError(data.error || "Karya tidak ditemukan.")
        } else {
          setProject(data.project)
          setCurationNote(data.project.reviewNotes ?? "")
          setScoreInput(data.project.score === null ? "" : String(data.project.score))
        }
      } catch {
        if (alive) setLoadError("Gagal menghubungi server.")
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [projectId])

  /** Kirim keputusan ke server. Status lokal HANYA berubah bila server sukses. */
  const submitDecision = async (action: Status) => {
    if (!project || saving) return

    if (action === "rejected" && curationNote.trim().length < 10) {
      showToast("Alasan penolakan wajib diisi minimal 10 karakter supaya siswa tahu sebabnya.", "danger")
      return
    }

    setSaving(action)
    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: action === "approved" ? "approve" : action,
          reviewNotes: curationNote.trim(),
          score: scoreInput === "" ? undefined : Number(scoreInput),
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        showToast(data.error || "Gagal menyimpan keputusan moderasi.", "danger")
        return
      }

      setProject(data.project)
      setCurationNote(data.project.reviewNotes ?? "")
      showToast(data.message || "Keputusan tersimpan.", action === "approved" ? "success" : "danger")
    } catch {
      showToast("Gagal menghubungi server. Keputusan tidak tersimpan.", "danger")
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-16 flex items-center justify-center text-ink-600 gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Memuat karya…</span>
        </div>
      </AdminLayout>
    )
  }

  if (loadError || !project) {
    return (
      <AdminLayout>
        <div className="p-12 text-center bg-white rounded-2xl border border-ink-150 shadow-xs max-w-lg mx-auto my-12">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-ink">Karya Tidak Ditemukan</h2>
          <p className="text-xs text-ink-600 mt-1 mb-6">
            {loadError ?? `Karya dengan ID "${projectId}" tidak terdaftar dalam basis data kurasi.`}
          </p>
          <Link
            href="/admin/moderasi"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Kurasi Karya
          </Link>
        </div>
      </AdminLayout>
    )
  }

  const status = (["pending", "approved", "revisi", "rejected"] as const).includes(
    project.status as Status
  )
    ? (project.status as Status)
    : "pending"

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-200 pb-12">
        {toast && (
          <div
            className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-xl border flex items-center gap-3 animate-in slide-in-from-top-3 duration-300 max-w-md ${
              toast.type === "success"
                ? "bg-emerald-900/90 text-white border-emerald-500 backdrop-blur-md"
                : "bg-rose-900/90 text-white border-rose-500 backdrop-blur-md"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-300 shrink-0" />
            )}
            <p className="text-xs font-medium leading-relaxed">{toast.text}</p>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-auto p-1 text-white/70 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Breadcrumb & aksi */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-ink-150 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/moderasi"
              className="p-2 rounded-xl border border-ink-150 hover:bg-ink-100 text-ink-600 transition flex items-center justify-center cursor-pointer shrink-0"
              title="Kembali ke Daftar Kurasi"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs text-ink-300">
                <Link href="/admin/moderasi" className="hover:text-ink-600">
                  Kurasi Karya
                </Link>
                <span>/</span>
                <span className="text-ink-700 font-medium">Detail Karya</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-ink mt-0.5 line-clamp-1">
                {project.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            {status === "approved" ? (
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Karya Terverifikasi
                </span>
                <button
                  type="button"
                  onClick={() => submitDecision("rejected")}
                  disabled={saving !== null}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-ink-600 hover:text-rose-600 hover:bg-rose-50 border border-ink-150 transition cursor-pointer disabled:opacity-50"
                >
                  {saving === "rejected" ? "Menyimpan…" : "Ubah ke Tolak"}
                </button>
              </div>
            ) : status === "rejected" ? (
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-2 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200 flex items-center gap-1.5 shadow-xs">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Karya Ditolak
                </span>
                <button
                  type="button"
                  onClick={() => submitDecision("approved")}
                  disabled={saving !== null}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-ink-600 hover:text-emerald-600 hover:bg-emerald-50 border border-ink-150 transition cursor-pointer disabled:opacity-50"
                >
                  {saving === "approved" ? "Menyimpan…" : "Ubah ke Verifikasi"}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => submitDecision("rejected")}
                  disabled={saving !== null}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  {saving === "rejected" ? "Menyimpan…" : "Tolak Karya"}
                </button>

                <button
                  type="button"
                  onClick={() => submitDecision("approved")}
                  disabled={saving !== null}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer shadow-emerald-600/20 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {saving === "approved" ? "Menyimpan…" : "Verifikasi & Setujui"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Kolom kiri */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-ink-150 shadow-xs space-y-4">
              <div className="relative h-72 w-full rounded-2xl overflow-hidden bg-ink-100 border border-ink-150 shadow-inner">
                {project.coverImage ? (
                  <Image
                    src={project.coverImage}
                    alt={project.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 420px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink-300">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-[11px]">Siswa belum mengunggah gambar sampul</span>
                  </div>
                )}

                <span className="absolute top-3.5 right-3.5 bg-ink/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/10 shadow-sm">
                  {project.category}
                </span>

                <div className="absolute bottom-3.5 left-3.5">
                  {status === "approved" ? (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-md flex items-center gap-1.5">
                      <Check className="w-3 h-3" /> Terverifikasi
                    </span>
                  ) : status === "rejected" ? (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-md flex items-center gap-1.5">
                      <X className="w-3 h-3" /> Ditolak
                    </span>
                  ) : status === "revisi" ? (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-sky-600 text-white shadow-md flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3" /> Perlu Revisi
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-md flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Menunggu Kurasi
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-ink-100 border border-ink-150 text-xs">
                <div className="flex items-center gap-1.5 text-ink-600">
                  <Calendar className="w-3.5 h-3.5 text-ink-300" />
                  <span>Diajukan {formatTanggal(project.submittedAt)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-ink-600">
                  <Gauge className="w-3.5 h-3.5 text-ink-300" />
                  <span>Nilai: {project.score === null ? "belum dinilai" : project.score}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-ink-150 shadow-xs space-y-3.5">
              <h3 className="text-xs font-bold text-ink-300 uppercase tracking-wider">
                Informasi Kreator Siswa
              </h3>
              <div className="flex items-center gap-3 pt-1">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary font-bold text-base flex items-center justify-center border border-primary/20 shrink-0">
                  {project.studentName.slice(0, 1)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-ink leading-tight">{project.studentName}</h4>
                  <p className="text-xs text-ink-600 mt-0.5">
                    {project.studentClass} · {project.majorLabel}
                  </p>
                  <p className="text-[11px] text-ink-300 mt-0.5">SMK Negeri 13 Bandung</p>
                </div>
              </div>

              <div className="pt-3 border-t border-ink-150 flex items-center justify-between text-xs text-ink-600">
                <span>Guru Pembimbing:</span>
                <span className="font-semibold text-ink-700">{project.advisorName}</span>
              </div>
            </div>
          </div>

          {/* Kolom kanan */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-ink-150 shadow-xs space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full inline-block mb-2">
                  Kompetensi Keahlian {project.category}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-ink leading-snug">{project.title}</h2>
              </div>

              <div className="pt-2 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-300">
                  Ringkasan & Abstrak Karya
                </h3>
                <p className="text-xs sm:text-sm text-ink-700 leading-relaxed font-sans bg-ink-100/70 p-4 rounded-2xl border border-ink-150">
                  {project.summary}
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-300">
                  Alat & Teknologi yang Dipakai
                </h3>
                {project.techStack.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-full bg-ink-100 border border-ink-150 text-[11px] font-medium text-ink-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-ink-300">
                    Siswa tidak mencantumkan alat atau teknologi.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-ink-150 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-300">
                Pemeriksaan Standar Kelayakan (Quality Gate)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-ink-100 border border-ink-150 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Orisinalitas</span>
                  </div>
                  <p className="text-[11px] text-ink-600 leading-snug">
                    Tugas akhir siswa mandiri tanpa pelanggaran hak cipta.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-ink-100 border border-ink-150 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                    <Sparkles className="w-4 h-4" />
                    <span>Relevansi Industri</span>
                  </div>
                  <p className="text-[11px] text-ink-600 leading-snug">
                    Memenuhi standar kebutuhan mitra DUDI untuk magang PKL.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-ink-100 border border-ink-150 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                    <FileCheck className="w-4 h-4" />
                    <span>Kelengkapan Data</span>
                  </div>
                  <p className="text-[11px] text-ink-600 leading-snug">
                    {project.coverImage
                      ? "Gambar sampul dan deskripsi sudah terisi."
                      : "Gambar sampul belum diunggah siswa."}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-ink-150 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-ink">
                Catatan Moderator / Feedback ke Siswa
              </h3>

              <textarea
                rows={3}
                placeholder="Tuliskan catatan apresiasi atau poin perbaikan untuk siswa. Wajib diisi minimal 10 karakter bila karya ditolak."
                value={curationNote}
                onChange={(e) => setCurationNote(e.target.value)}
                className="w-full text-xs p-3.5 rounded-2xl border border-ink-150 bg-ink-100/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition font-sans leading-relaxed"
              />

              <div className="flex items-center gap-3">
                <label htmlFor="score" className="text-xs font-semibold text-ink-700 shrink-0">
                  Nilai kelayakan (0–100)
                </label>
                <input
                  id="score"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="opsional"
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  className="w-28 text-xs p-2 rounded-xl border border-ink-150 bg-ink-100/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-xs text-ink-300">
                  Keputusan disimpan ke database dan siswa menerima notifikasi.
                </p>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => submitDecision("revisi")}
                    disabled={saving !== null}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 disabled:opacity-50"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {saving === "revisi" ? "Menyimpan…" : "Kembalikan untuk Revisi"}
                  </button>

                  <button
                    type="button"
                    onClick={() => submitDecision("rejected")}
                    disabled={saving !== null}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 ${
                      status === "rejected"
                        ? "bg-rose-700 text-white ring-2 ring-rose-400 shadow-sm"
                        : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                    }`}
                  >
                    <X className="w-4 h-4" />
                    {saving === "rejected" ? "Menyimpan…" : status === "rejected" ? "Telah Ditolak" : "Tolak Karya"}
                  </button>

                  <button
                    type="button"
                    onClick={() => submitDecision("approved")}
                    disabled={saving !== null}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50 ${
                      status === "approved"
                        ? "bg-emerald-700 text-white ring-2 ring-emerald-400"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    {saving === "approved" ? "Menyimpan…" : status === "approved" ? "Telah Disetujui" : "Verifikasi & Setujui"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
