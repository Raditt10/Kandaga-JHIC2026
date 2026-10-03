"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import {
  ArrowLeft,
  ChevronRight,
  Building2,
  Mail,
  Contact,
  CalendarDays,
  Briefcase,
  FileText,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Check,
  X,
} from "lucide-react"

type StatusMitra = "pending" | "disetujui" | "ditolak"

type MitraDetail = {
  userId: string
  namaKontak: string
  email: string
  namaPerusahaan: string
  bidang: string | null
  dokumenUrl: string | null
  status: StatusMitra
  catatanVerifikasi: string | null
  verifiedBy: string | null
  verifiedAt: string | null
  terdaftarPada: string
}

/**
 * Konteks halaman asal review. Dipakai supaya satu tampilan review yang sama
 * bisa dipakai dari menu BKK maupun Approval Rekrutmen Mitra — breadcrumb,
 * tombol kembali, dan label keputusan ikut menyesuaikan.
 */
export type MitraReviewOrigin = {
  /** URL daftar/antrian yang menjadi asal navigasi */
  queueHref: string
  /** Label breadcrumb halaman asal */
  queueLabel: string
  /** Label breadcrumb halaman aktif */
  currentLabel: string
  /** Judul kartu identitas perusahaan */
  companyCardTitle: string
  /** Label tombol persetujuan */
  approveLabel: string
  /** Label tombol penolakan */
  rejectLabel: string
  /** Pesan sukses setelah disetujui */
  approveSuccess: string
  /** Pesan sukses setelah ditolak */
  rejectSuccess: string
}

export const bkkReviewOrigin: MitraReviewOrigin = {
  queueHref: "/admin/bkk",
  queueLabel: "BKK & Kemitraan",
  currentLabel: "Review Pengajuan",
  companyCardTitle: "Perusahaan Mitra",
  approveLabel: "Setujui Kemitraan",
  rejectLabel: "Tolak Pengajuan",
  approveSuccess: "Akun mitra berhasil disetujui. Notifikasi dikirim otomatis ke perusahaan.",
  rejectSuccess: "Pengajuan mitra ditolak. Alasan Anda dikirim ke perusahaan.",
}

export const rekrutmenReviewOrigin: MitraReviewOrigin = {
  queueHref: "/admin/pendaftaran-mitra",
  queueLabel: "Pendaftaran Mitra",
  currentLabel: "Review Permohonan Rekrutmen",
  companyCardTitle: "Perusahaan Pemohon Rekrutmen",
  approveLabel: "Setujui Rekrutmen",
  rejectLabel: "Tolak Permohonan",
  approveSuccess: "Permohonan rekrutmen disetujui — kuota siap dibuka ke siswa.",
  rejectSuccess: "Permohonan rekrutmen ditolak. Alasan Anda dikirim ke perusahaan.",
}

interface MitraReviewViewProps {
  userId: string
  origin: MitraReviewOrigin
}

const statusStyles: Record<StatusMitra, { label: string; badge: string; icon: React.ElementType }> = {
  pending: {
    label: "Menunggu Verifikasi",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  disetujui: {
    label: "Disetujui",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  ditolak: {
    label: "Ditolak",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
  },
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

export default function MitraReviewView({ userId, origin }: MitraReviewViewProps) {
  const router = useRouter()

  const [mitra, setMitra] = useState<MitraDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [catatan, setCatatan] = useState("")
  const [processing, setProcessing] = useState<"setujui" | "tolak" | null>(null)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const res = await fetch(`/api/bkk/mitra/${userId}`)
        const data = await res.json()
        if (!active) return

        if (!res.ok) {
          setLoadError(data.error || "Gagal memuat data mitra.")
        } else {
          setMitra(data.item)
          setLoadError(null)
        }
      } catch {
        if (active) setLoadError("Terjadi kesalahan jaringan.")
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [userId])

  const isPending = mitra?.status === "pending"
  const catatanValid = catatan.trim().length >= 10

  const submitKeputusan = async (action: "setujui" | "tolak") => {
    if (!mitra || !isPending) return

    if (action === "tolak" && !catatanValid) {
      setFeedback({ type: "error", text: "Alasan penolakan wajib diisi minimal 10 karakter." })
      return
    }

    setProcessing(action)
    setFeedback(null)

    try {
      const res = await fetch("/api/bkk/verifikasi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: mitra.userId, action, catatan: action === "tolak" ? catatan : undefined }),
      })
      const result = await res.json()

      if (!res.ok) {
        setFeedback({ type: "error", text: result.error || "Gagal memproses keputusan verifikasi." })
        return
      }

      setMitra((prev) => (prev ? { ...prev, status: action === "setujui" ? "disetujui" : "ditolak" } : prev))
      setFeedback({
        type: "success",
        text: action === "setujui" ? origin.approveSuccess : origin.rejectSuccess,
      })

      // Kembali ke antrian supaya daftar & statistik ikut diperbarui.
      setTimeout(() => router.push(origin.queueHref), 1600)
    } catch {
      setFeedback({ type: "error", text: "Terjadi kesalahan jaringan saat memproses keputusan." })
    } finally {
      setProcessing(null)
    }
  }

  const status = mitra?.status ?? "pending"
  const StatusIcon = statusStyles[status].icon

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* ── Breadcrumb & tombol kembali ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={origin.queueHref}
              title={`Kembali ke ${origin.queueLabel}`}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition flex items-center justify-center cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Link href={origin.queueHref} className="hover:text-slate-600 transition">
                  {origin.queueLabel}
                </Link>
                <ChevronRight className="w-3 h-3 shrink-0" />
                <span>{origin.currentLabel}</span>
              </div>
              <h1 className="font-heading text-lg font-bold text-slate-900 leading-snug truncate mt-0.5">
                {loading ? "Memuat pengajuan..." : mitra?.namaPerusahaan || origin.currentLabel}
              </h1>
            </div>
          </div>

          {!loading && !loadError && mitra && (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold shrink-0 ${
                statusStyles[status].badge
              }`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {statusStyles[status].label}
            </span>
          )}
        </div>

        {/* ── Umpan balik keputusan ─────────────────────────────────── */}
        {feedback && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#891337]" />
            <span className="text-xs">Memuat detail pengajuan mitra...</span>
          </div>
        ) : loadError || !mitra ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">Data mitra tidak dapat ditampilkan</p>
            <p className="text-xs text-slate-500 mt-1">{loadError}</p>
            <Link
              href={origin.queueHref}
              className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-xl bg-[#891337] hover:bg-[#6b1426] text-white text-xs font-bold transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke {origin.queueLabel}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ── Kolom kiri: identitas & berkas ───────────────────── */}
            <div className="lg:col-span-7 space-y-6">
              {/* Identitas perusahaan */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#891337]/10 text-[#891337] flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {origin.companyCardTitle}
                    </span>
                    <h2 className="font-heading text-base font-bold text-slate-900 leading-snug mt-0.5 break-words">
                      {mitra.namaPerusahaan}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {mitra.bidang || "Bidang industri belum diisi"}
                    </p>
                  </div>
                </div>

                <dl className="border-t border-slate-100 divide-y divide-slate-100">
                  <div className="flex items-start justify-between gap-4 py-3">
                    <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 pt-0.5">
                      <Contact className="w-3.5 h-3.5 text-[#891337]/70" />
                      Nama Kontak PIC
                    </dt>
                    <dd className="text-xs font-semibold text-slate-800 text-right break-words">
                      {mitra.namaKontak}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 py-3">
                    <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 pt-0.5">
                      <Mail className="w-3.5 h-3.5 text-[#891337]/70" />
                      Email Terdaftar
                    </dt>
                    <dd className="text-xs font-semibold text-slate-800 text-right font-mono break-all">
                      {mitra.email}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 py-3">
                    <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 pt-0.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#891337]/70" />
                      Bidang Industri
                    </dt>
                    <dd className="text-xs font-semibold text-slate-800 text-right break-words">
                      {mitra.bidang || "—"}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 py-3">
                    <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 pt-0.5">
                      <CalendarDays className="w-3.5 h-3.5 text-[#891337]/70" />
                      Tanggal Registrasi
                    </dt>
                    <dd className="text-xs font-semibold text-slate-800 text-right">
                      {formatDate(mitra.terdaftarPada)}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Dokumen legalitas */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#891337]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Dokumen Legalitas Perusahaan
                  </h3>
                </div>

                {mitra.dokumenUrl ? (
                  <a
                    href={mitra.dokumenUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-300 transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-slate-800 truncate">
                          Berkas legalitas terunggah
                        </span>
                        <span className="block text-[11px] text-slate-500 truncate">{mitra.dokumenUrl}</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#891337] shrink-0">
                      Buka
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </a>
                ) : (
                  <p className="text-xs text-slate-400 italic p-4 rounded-2xl bg-slate-50/70 border border-slate-100">
                    Mitra tidak melampirkan dokumen legalitas.
                  </p>
                )}
              </div>

              {/* Panduan peninjauan */}
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#891337]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Hal yang Perlu Ditinjau
                  </h3>
                </div>
                <ul className="space-y-2">
                  {[
                    "Kesesuaian nama perusahaan pada berkas legalitas dengan data pendaftaran.",
                    "Relevansi bidang industri mitra dengan program keahlian siswa SMKN 13 Bandung.",
                    "Validitas kontak PIC (nama dan email resmi perusahaan) untuk komunikasi lanjutan.",
                  ].map((poin) => (
                    <li key={poin} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                      <Check className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span>{poin}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Kolom kanan: keputusan verifikasi ─────────────────── */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-6 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Keputusan Verifikasi
                  </h3>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-600">
                      Catatan untuk Mitra
                      <span className="text-slate-400 font-medium ml-1">
                        (opsional saat menyetujui, wajib saat menolak)
                      </span>
                    </label>
                    <textarea
                      rows={5}
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      disabled={!isPending || processing !== null}
                      placeholder="Tulis alasan penolakan atau catatan tambahan agar mitra dapat menindaklanjuti (minimal 10 karakter untuk penolakan)..."
                      className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#891337]/15 focus:border-[#891337] transition font-sans leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Catatan dikirim sebagai notifikasi ke mitra</span>
                      <span className={catatanValid ? "text-emerald-600 font-bold" : ""}>
                        {catatan.trim().length} / 10 karakter
                      </span>
                    </div>
                  </div>

                  {isPending ? (
                    <div className="space-y-2.5">
                      <button
                        type="button"
                        disabled={processing !== null || !catatanValid}
                        onClick={() => submitKeputusan("tolak")}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing === "tolak" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        {origin.rejectLabel}
                      </button>

                      <button
                        type="button"
                        disabled={processing !== null}
                        onClick={() => submitKeputusan("setujui")}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm shadow-emerald-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing === "setujui" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        {origin.approveLabel}
                      </button>

                      <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                        Keputusan langsung tersinkronisasi ke status akun mitra dan dikirim sebagai notifikasi.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className={`p-4 rounded-2xl border text-xs font-semibold ${statusStyles[status].badge}`}>
                        <span className="flex items-center gap-1.5">
                          <StatusIcon className="w-4 h-4 shrink-0" />
                          Pengajuan ini sudah diproses
                        </span>
                        {mitra.catatanVerifikasi && (
                          <p className="mt-2 font-medium leading-relaxed">Alasan: {mitra.catatanVerifikasi}</p>
                        )}
                      </div>

                      <dl className="border-t border-slate-100 divide-y divide-slate-100">
                        <div className="flex items-start justify-between gap-4 py-3">
                          <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-0.5">
                            Diverifikasi Oleh
                          </dt>
                          <dd className="text-xs font-semibold text-slate-800 text-right">
                            {mitra.verifiedBy || "—"}
                          </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4 py-3">
                          <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-0.5">
                            Tanggal Verifikasi
                          </dt>
                          <dd className="text-xs font-semibold text-slate-800 text-right">
                            {mitra.verifiedAt ? formatDate(mitra.verifiedAt) : "—"}
                          </dd>
                        </div>
                      </dl>

                      <Link
                        href={origin.queueHref}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Kembali ke {origin.queueLabel}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
