"use client"

import React, { useState, use, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import DashboardLayout from "@/components/DashboardLayout"
import {
  AVATAR_CACHE_BASE,
  PROFILE_CACHE_BASE,
  readUserCache,
} from "@/lib/user-cache"
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  AlertCircle,
  Loader2,
  ImageIcon,
  GraduationCap,
  ExternalLink,
  Eye,
  Pencil,
  Trash2,
  ShoppingBag,
} from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

interface StudentDetailProject {
  id: string
  title: string
  description: string
  major: string
  majorLabel: string
  category?: string
  studentName: string
  studentClass: string
  studentAvatar?: string
  advisor?: {
    name?: string
    role?: string
    reviewNotes?: string
  }
  createdAt: string
  status: string
  score: number | null
  reviewNotes: string | null
  coverImage: string | null
  galleryImages: string[]
  tools: string[]
  solutionHighlights?: string[]
  isPrivate: boolean
  metrics?: {
    views?: number
    likes?: number
  }
  links?: {
    githubUrl?: string
    demoUrl?: string
  }
}

function formatTanggal(iso: string | null | undefined): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

export default function StudentProjectDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const projectId = resolvedParams.id

  const router = useRouter()
  const { data: session } = useSession()

  const [project, setProject] = useState<StudentDetailProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRequestDeleteModal, setShowRequestDeleteModal] = useState(false)
  const [confirmTitleInput, setConfirmTitleInput] = useState("")
  const [userAvatar, setUserAvatar] = useState<string | null>(null)

  useEffect(() => {
    const userId = session?.user?.id
    if (!userId) return

    const cached = readUserCache<string>(AVATAR_CACHE_BASE, userId)
    if (cached) {
      setUserAvatar(cached)
      return
    }

    const cachedProfile = readUserCache<{ photoUrl?: string }>(PROFILE_CACHE_BASE, userId)
    if (cachedProfile?.photoUrl) {
      setUserAvatar(cachedProfile.photoUrl)
      return
    }

    if (session?.user?.image) {
      setUserAvatar(session.user.image)
    }
  }, [session?.user?.id, session?.user?.image])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch(`/api/student/projects/${projectId}`, { cache: "no-store" })
        const data = await res.json()
        if (!alive) return
        if (!res.ok) {
          setLoadError(data.error || "Karya tidak ditemukan.")
        } else {
          setProject(data.project)
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

  if (loading) {
    return (
      <DashboardLayout
        roleTitle="Siswa"
        roleSlug="student"
        icon={GraduationCap}
        activeTab="karya-saya"
        breadcrumbLabel="Karya Saya"
        breadcrumbHref="/student?tab=karya-saya"
        pageTitle="Detail Karya"
      >
        <div className="p-16 flex items-center justify-center text-ink-600 gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm font-medium">Memuat detail karya…</span>
        </div>
      </DashboardLayout>
    )
  }

  if (loadError || !project) {
    return (
      <DashboardLayout
        roleTitle="Siswa"
        roleSlug="student"
        icon={GraduationCap}
        activeTab="karya-saya"
        breadcrumbLabel="Karya Saya"
        breadcrumbHref="/student?tab=karya-saya"
        pageTitle="Detail Karya"
      >
        <div className="p-12 text-center bg-white rounded-2xl border border-ink-150 shadow-xs max-w-lg mx-auto my-12">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-ink">Karya Tidak Ditemukan</h2>
          <p className="text-xs text-ink-600 mt-1 mb-6">
            {loadError ?? `Karya dengan ID "${projectId}" tidak terdaftar dalam portofolio Anda.`}
          </p>
          <Link
            href="/student?tab=karya-saya"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Karya
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const isApproved = project.status === "approved"
  const isRevisi = project.status === "revisi"

  const handleDelete = async (confirmationTitle?: string) => {
    setDeleting(true)
    setActionError(null)
    try {
      const res = await fetch(`/api/student/projects/${projectId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(confirmationTitle ? { confirmationTitle } : {}),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Gagal menghapus karya.")
      router.push("/student?tab=karya-saya&deleted=true")
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal menghapus karya.")
      setDeleting(false)
      setShowDeleteModal(false)
      setShowRequestDeleteModal(false)
    }
  }

  return (
    <DashboardLayout
      roleTitle="Siswa"
      roleSlug="student"
      icon={GraduationCap}
      activeTab="karya-saya"
      breadcrumbLabel="Karya Saya"
      breadcrumbHref="/student?tab=karya-saya"
      pageTitle={project.title}
    >
      <div className="space-y-6 animate-in fade-in duration-200 pb-12">
        {/* Tombol Kembali (Arrow Left) */}
        <div>
          <Link
            href="/student?tab=karya-saya"
            className="p-2.5 rounded-xl border border-ink-150 hover:bg-ink-100 text-ink-600 hover:text-ink transition inline-flex items-center justify-center cursor-pointer bg-white shadow-xs"
            title="Kembali ke Daftar Karya"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Kolom Kiri: Gambar, Kreator, Metadata (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Box Cover Image */}
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink-300 p-4 text-center">
                    <ImageIcon className="w-10 h-10 stroke-[1.5]" />
                    <span className="text-xs font-medium">Gambar sampul belum diunggah</span>
                  </div>
                )}
              </div>

              {/* Tanggal & Status Kurasi (Menggantikan posisi Nilai: belum dinilai) */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-ink-100 border border-ink-150 text-xs">
                <div className="flex items-center gap-1.5 text-ink-600">
                  <Calendar className="w-3.5 h-3.5 text-ink-400" />
                  <span>Diajukan {formatTanggal(project.createdAt)}</span>
                </div>
                <div>
                  {isApproved ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Terkurasi</span>
                    </span>
                  ) : isRevisi ? (
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
              </div>
            </div>

            {/* Informasi Siswa Kreator */}
            <div className="bg-white p-5 rounded-2xl border border-ink-150 shadow-xs space-y-3.5">
              <h3 className="text-sm font-bold text-ink">
                Informasi Kreator Siswa
              </h3>
              <div className="flex items-center gap-3 pt-1">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-ink-150 bg-ink-100 shrink-0 shadow-2xs flex items-center justify-center">
                  <Image
                    src={
                      userAvatar ||
                      (project.studentAvatar && project.studentAvatar !== "/images/siswa.webp"
                        ? project.studentAvatar
                        : null) ||
                      (session?.user?.image as string | null) ||
                      project.studentAvatar ||
                      "/images/siswa.webp"
                    }
                    alt={project.studentName || "Foto siswa"}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-ink leading-tight truncate">{project.studentName}</h4>
                  <p className="text-xs text-ink-600 mt-0.5">
                    {project.studentClass} · {project.majorLabel}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-ink-150 flex items-center justify-between text-xs text-ink-600">
                <span>Guru Pembimbing:</span>
                <span className="font-semibold text-ink-700">
                  {project.advisor?.name || "Guru Pembimbing"}
                </span>
              </div>
            </div>

            {/* Tautan Proyek (GitHub / Live Demo) */}
            {(project.links?.githubUrl || project.links?.demoUrl) && (
              <div className="bg-white p-5 rounded-2xl border border-ink-150 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-ink">
                  Tautan Eksternal Proyek
                </h3>
                <div className="space-y-2">
                  {project.links?.demoUrl && (
                    <a
                      href={project.links.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-ink-50 hover:bg-ink-100 border border-ink-150 text-xs font-semibold text-ink-700 flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-primary" />
                        <span>Live Demo / Aplikasi Aktif</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-ink-400 group-hover:text-primary transition" />
                    </a>
                  )}
                  {project.links?.githubUrl && (
                    <a
                      href={project.links.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-ink-50 hover:bg-ink-100 border border-ink-150 text-xs font-semibold text-ink-700 flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-ink-700" />
                        <span>Repository Berkas / GitHub</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-ink-400 group-hover:text-ink-700 transition" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Kolom Kanan: Detail Konten, Catatan Kurasi (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Box Abstrak & Ringkasan */}
            <div className="bg-white p-6 rounded-2xl border border-ink-150 shadow-xs space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-heading font-bold text-ink leading-snug">
                  {project.title}
                </h2>
              </div>

              <div className="pt-2 space-y-2">
                <h3 className="text-sm font-bold text-ink">
                  Ringkasan & Abstrak Karya
                </h3>
                <p className="text-xs sm:text-sm text-ink-700 leading-relaxed font-sans bg-ink-100/70 p-4 rounded-2xl border border-ink-150 whitespace-pre-line">
                  {project.description || "Tidak ada rincian deskripsi karya."}
                </p>
              </div>

              {/* Fitur Utama / Solusi Unggulan */}
              {project.solutionHighlights && project.solutionHighlights.length > 0 && (() => {
                const bludItem = project.solutionHighlights.find((h) =>
                  h.includes("Komersialisasi BLUD")
                )
                const cleanHighlights = project.solutionHighlights.filter(
                  (h) => !h.includes("Komersialisasi BLUD")
                )

                // Parse tipe & estimasi harga dari string BLUD
                // Contoh: "Tersedia Komersialisasi BLUD (Produk Jadi / Lisensi — Estimasi: 1.299.000)"
                let bludType = ""
                let bludEstimasi = ""
                if (bludItem) {
                  const match = bludItem.match(/\(([^)]+)\)/)
                  if (match) {
                    const inner = match[1]
                    const parts = inner.split("—")
                    bludType = parts[0].trim()
                    if (parts[1]) {
                      bludEstimasi = parts[1].replace("Estimasi:", "").trim()
                    }
                  }
                }

                return (
                  <>
                    {cleanHighlights.length > 0 && (
                      <div className="pt-2 space-y-2">
                        <h3 className="text-sm font-bold text-ink">
                          Fitur Utama & Solusi Unggulan
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {cleanHighlights.map((feat, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-ink-50 border border-ink-150 text-xs font-medium text-ink-700 flex items-start gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {bludItem && (
                      <div className="pt-2 space-y-2">
                        <h3 className="text-sm font-bold text-ink">
                          Penjualan Karya
                        </h3>
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <ShoppingBag className="w-4 h-4 text-amber-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-amber-800">
                              Karya ini tersedia untuk dijual
                            </p>
                            <p className="text-xs text-amber-700 mt-0.5">
                              Tipe: <span className="font-semibold">{bludType || "—"}</span>
                            </p>
                            {bludEstimasi && (
                              <p className="text-xs text-amber-700 mt-0.5">
                                Estimasi harga:{" "}
                                <span className="font-semibold">Rp {bludEstimasi}</span>
                              </p>
                            )}
                            <p className="text-[11px] text-amber-600/80 mt-1.5 leading-relaxed">
                              Komersialisasi melalui skema BLUD Teaching Factory. Hubungi sekolah untuk
                              informasi pembelian atau kerja sama.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}

              {/* Alat & Teknologi yang Dipakai */}
              <div className="pt-2 space-y-2">
                <h3 className="text-sm font-bold text-ink">
                  Alat & Teknologi yang Dipakai
                </h3>
                {project.tools && project.tools.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {project.tools.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-ink-100 border border-ink-150 text-xs font-mono font-medium text-ink-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-ink-400 italic">
                    Belum mencantumkan instrumen atau teknologi.
                  </p>
                )}
              </div>
            </div>

            {/* Catatan Pembimbing / Feedback ke Siswa */}
            <div className="bg-white p-6 rounded-2xl border border-ink-150 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-ink">
                  Catatan Pembimbing & Hasil Kurasi
                </h3>
                {project.score !== null && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Skor: {project.score}/100
                  </span>
                )}
              </div>

              {project.reviewNotes || project.advisor?.reviewNotes ? (
                <div className="p-4 rounded-2xl border border-ink-150 bg-ink-50/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-ink-500">
                    <span className="font-semibold text-ink-700">
                      Umpan Balik Guru Pembimbing
                    </span>
                    <span className="text-[11px]">{project.advisor?.name}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-ink-800 leading-relaxed font-sans">
                    {project.reviewNotes || project.advisor?.reviewNotes}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 text-center py-6">
                  <Clock className="w-8 h-8 text-amber-500/70 mx-auto mb-2" />
                  <p className="text-xs font-medium text-ink-700">
                    Belum Ada Catatan Kurasi dari Pembimbing
                  </p>
                  <p className="text-[11px] text-ink-400 mt-1 max-w-sm mx-auto">
                    Karya Anda sedang dalam antrean kurasi. Hasil penilaian dan catatan arahan akan ditampilkan di sini setelah guru memeriksa karya.
                  </p>
                </div>
              )}
            </div>

            {/* Tombol Aksi: Edit Draft Karya & Hapus Karya */}
            <div className="bg-white p-5 rounded-2xl border border-ink-150 shadow-xs space-y-3">
              {actionError && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href={`/student/create-project?edit=${project.id}`}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>{project.isPrivate || project.status === "private" ? "Edit Draft Karya" : "Edit Karya"}</span>
                </Link>

                {isApproved ? (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmTitleInput("")
                      setActionError(null)
                      setShowRequestDeleteModal(true)
                    }}
                    disabled={deleting}
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 text-xs font-bold transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ajukan Hapus Karya</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActionError(null)
                      setShowDeleteModal(true)
                    }}
                    disabled={deleting}
                    className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 text-xs font-bold transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Karya</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Karya (Belum Terverifikasi Guru) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-ink-150 shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">Hapus Karya Ini?</h3>
                <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                  Apakah Anda yakin ingin menghapus karya <strong className="text-ink font-semibold">"{project.title}"</strong>? Karya ini belum diverifikasi dan akan dipindahkan ke arsip.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-ink-150">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-ink-150 text-ink-700 hover:bg-ink-50 text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete()}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer disabled:opacity-60 shadow-xs"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus Karya</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Ajukan Hapus Karya (Sudah Terverifikasi Guru) */}
      {showRequestDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-ink-150 shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-ink">Ajukan Hapus Karya</h3>
                <p className="text-xs text-ink-600 leading-relaxed">
                  Karya ini telah <strong className="text-emerald-700 font-semibold">terverifikasi resmi oleh guru pembimbing</strong>. Untuk mengonfirmasi pengajuan hapus karya ini, silakan ketik nama karya di bawah ini secara persis.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-ink-600 uppercase tracking-wider mb-1">
                  Nama Karya
                </label>
                <div className="p-3 rounded-xl bg-ink-50 border border-ink-150 font-mono text-xs font-bold text-ink select-all break-words">
                  {project.title}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Ketik nama karya di atas untuk konfirmasi:
                </label>
                <input
                  type="text"
                  value={confirmTitleInput}
                  onChange={(e) => setConfirmTitleInput(e.target.value)}
                  placeholder="Ketik persis seperti nama karya di atas..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 text-xs font-sans outline-hidden bg-white transition"
                  autoFocus
                />
                {confirmTitleInput.length > 0 && (
                  <div className={`mt-1.5 text-[11px] font-medium flex items-center gap-1.5 ${
                    confirmTitleInput.trim() === project.title.trim()
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}>
                    {confirmTitleInput.trim() === project.title.trim() ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Nama karya sesuai</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Nama karya belum sesuai</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-ink-150">
              <button
                type="button"
                onClick={() => {
                  setShowRequestDeleteModal(false)
                  setConfirmTitleInput("")
                }}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-ink-150 text-ink-700 hover:bg-ink-50 text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmTitleInput.trim())}
                disabled={deleting || confirmTitleInput.trim() !== project.title.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ajukan Hapus Karya</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
