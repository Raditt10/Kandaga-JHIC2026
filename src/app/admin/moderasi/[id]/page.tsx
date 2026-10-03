"use client"

import React, { useState, use } from "react"
import Image from "next/image"
import Link from "next/link"
import { projectShowcases } from "@/lib/adminData"
import AdminLayout from "@/components/admin/AdminLayout"
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Heart,
  Calendar,
  ShieldCheck,
  Sparkles,
  FileCheck,
  AlertTriangle,
  MessageSquare,
  Check,
  X,
} from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function AdminDetailModerasiPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const projectId = resolvedParams.id

  const project = projectShowcases.find((p) => p.id === projectId)

  // Status karya: "pending" | "approved" | "rejected"
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending")
  const [curationNote, setCurationNote] = useState("")
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "danger" } | null>(null)

  if (!project) {
    return (
      <AdminLayout>
        <div className="p-12 text-center bg-white rounded-2xl border border-ink-150 shadow-xs max-w-lg mx-auto my-12">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-ink">Karya Tidak Ditemukan</h2>
          <p className="text-xs text-ink-600 mt-1 mb-6">
            Karya dengan ID &quot;{projectId}&quot; tidak terdaftar dalam basis data kurasi.
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

  const handleVerify = () => {
    setStatus("approved")
    setToastMessage({
      text: `Karya "${project.title}" berhasil diverifikasi dan disetujui untuk tayang di Galeri Utama!`,
      type: "success",
    })
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleDeny = () => {
    setStatus("rejected")
    setToastMessage({
      text: `Karya "${project.title}" ditolak (denied). Catatan kurasi telah diteruskan ke siswa.`,
      type: "danger",
    })
    setTimeout(() => setToastMessage(null), 4000)
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-200 pb-12">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-xl border flex items-center gap-3 animate-in slide-in-from-top-3 duration-300 max-w-md ${
              toastMessage.type === "success"
                ? "bg-emerald-900/90 text-white border-emerald-500 backdrop-blur-md"
                : "bg-rose-900/90 text-white border-rose-500 backdrop-blur-md"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-300 shrink-0" />
            )}
            <p className="text-xs font-medium leading-relaxed">{toastMessage.text}</p>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="ml-auto p-1 text-white/70 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Breadcrumb & Action Navigation */}
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
                <Link href="/admin/moderasi" className="hover:text-ink-600 transition">
                  Kurasi Karya
                </Link>
                <span>/</span>
                <span className="text-ink font-medium">Detail Karya</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-ink mt-0.5 line-clamp-1">
                {project.title}
              </h1>
            </div>
          </div>

          {/* Action Buttons: Verifikasi & Denied (Skala diperkecil dan disesuaikan) */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {status === "approved" ? (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Karya Terverifikasi
                </span>
                <button
                  type="button"
                  onClick={handleDeny}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-ink-600 hover:text-rose-600 hover:bg-rose-50 border border-ink-150 transition cursor-pointer"
                >
                  Ubah ke Tolak
                </button>
              </div>
            ) : status === "rejected" ? (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 flex items-center gap-1.5 shadow-2xs">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  Karya Ditolak (Denied)
                </span>
                <button
                  type="button"
                  onClick={handleVerify}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-ink-600 hover:text-emerald-600 hover:bg-emerald-50 border border-ink-150 transition cursor-pointer"
                >
                  Ubah ke Verifikasi
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDeny}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95"
                >
                  <X className="w-3.5 h-3.5" />
                  Tolak Karya (Denied)
                </button>

                <button
                  type="button"
                  onClick={handleVerify}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  Verifikasi & Setujui
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Grid Content Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Kolom Kiri: Visual Showcase & Profil Siswa (5 Kolom) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Foto Pratinjau Karya */}
            <div className="bg-white p-4 rounded-2xl border border-ink-150 shadow-xs space-y-4">
              <div className="relative h-72 w-full rounded-xl overflow-hidden bg-ink-100 border border-ink-150 shadow-inner">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  priority
                  className="object-cover"
                />
                {/* Pill Kategori */}
                <span className="absolute top-3.5 right-3.5 bg-white text-ink text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {project.category}
                </span>

                {/* Badge Status */}
                <div className="absolute bottom-3.5 left-3.5">
                  {status === "approved" ? (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-md flex items-center gap-1.5">
                      <Check className="w-3 h-3" /> Status: Terverifikasi
                    </span>
                  ) : status === "rejected" ? (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-md flex items-center gap-1.5">
                      <X className="w-3 h-3" /> Status: Ditolak
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-md flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Status: Menunggu Kurasi
                    </span>
                  )}
                </div>
              </div>

              {/* Baris Meta: Tanggal & Apresiasi */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-ink-100 border border-ink-150 text-xs">
                <div className="flex items-center gap-1.5 text-ink-600">
                  <Calendar className="w-3.5 h-3.5 text-ink-300" />
                  <span>Diunggah {project.uploadedAt || "28 Sep 2026"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  <span>{project.likes} Apresiasi</span>
                </div>
              </div>
            </div>

            {/* Profil Siswa / Kreator */}
            <div className="bg-white p-5 rounded-2xl border border-ink-150 shadow-xs space-y-3.5">
              <h3 className="text-xs font-bold text-ink-300 uppercase tracking-wider">
                Informasi Kreator Siswa
              </h3>
              <div className="flex items-center gap-3 pt-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold text-base flex items-center justify-center border border-primary/20 shrink-0">
                  {project.author.slice(0, 1)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-ink leading-tight">
                    {project.author}
                  </h4>
                  <p className="text-xs text-ink-600 mt-0.5">{project.authorRole}</p>
                  <p className="text-[11px] text-ink-300 mt-0.5">SMK Negeri 13 Bandung</p>
                </div>
              </div>

              <div className="pt-3 border-t border-ink-150 flex items-center justify-between text-xs text-ink-600">
                <span>Status Akun:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                  Terdaftar & Aktif
                </span>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Detail Inovasi & Rubrik Kurasi (7 Kolom) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Kartu Deskripsi & Latar Belakang */}
            <div className="bg-white p-6 rounded-2xl border border-ink-150 shadow-xs space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full inline-block mb-2">
                  Kompetensi Keahlian {project.category}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-ink leading-snug">
                  {project.title}
                </h2>
              </div>

              <div className="pt-2 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-300">
                  Ringkasan & Abstrak Karya
                </h3>
                <p className="text-xs sm:text-sm text-ink-700 leading-relaxed font-sans bg-ink-100/70 p-4 rounded-xl border border-ink-150">
                  {project.description}
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-300">
                  Fitur Unggulan & Nilai Guna
                </h3>
                <ul className="text-xs text-ink-600 space-y-2 list-disc pl-5 leading-relaxed">
                  <li>Penerapan konsep industri modern sesuai kurikulum berbasis Teaching Factory SMKN 13.</li>
                  <li>Antarmuka ramah pengguna dengan performa teruji pada lingkungan lokal maupun cloud.</li>
                  <li>Dapat langsung dipresentasikan pada bursa kerja khusus (BKK) dan mitra industri DUDI.</li>
                </ul>
              </div>
            </div>

            {/* Rubrik Penilaian & Standar Kualitas */}
            <div className="bg-white p-6 rounded-2xl border border-ink-150 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-300">
                Pemeriksaan Standar Kelayakan (Quality Gate)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-ink-100 border border-ink-150 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Orisinalitas</span>
                  </div>
                  <p className="text-[11px] text-ink-600 leading-snug">
                    Tugas akhir siswa mandiri tanpa pelanggaran hak cipta.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-ink-100 border border-ink-150 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                    <Sparkles className="w-4 h-4" />
                    <span>Relevansi Industri</span>
                  </div>
                  <p className="text-[11px] text-ink-600 leading-snug">
                    Memenuhi standar kebutuhan mitra DUDI untuk magang PKL.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-ink-100 border border-ink-150 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                    <FileCheck className="w-4 h-4" />
                    <span>Kelengkapan Data</span>
                  </div>
                  <p className="text-[11px] text-ink-600 leading-snug">
                    Dokumentasi dan deskripsi terisi lengkap dan jelas.
                  </p>
                </div>
              </div>
            </div>

            {/* Catatan Reviewer & Keputusan Akhir */}
            <div className="bg-white p-6 rounded-2xl border border-ink-150 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                  Catatan Kurator / Feedback ke Siswa
                </h3>
              </div>

              <textarea
                rows={3}
                placeholder="Tuliskan catatan apresiasi atau poin perbaikan untuk siswa (opsional)..."
                value={curationNote}
                onChange={(e) => setCurationNote(e.target.value)}
                className="w-full text-xs p-3.5 rounded-xl border border-ink-150 bg-ink-100/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition font-sans leading-relaxed"
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-xs text-ink-300">
                  Perubahan status akan langsung tersinkronisasi ke dashboard siswa.
                </p>

                {/* Tombol aksi bawah (skala diperkecil & disesuaikan) */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleDeny}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95 ${
                      status === "rejected"
                        ? "bg-rose-700 text-white ring-2 ring-rose-400"
                        : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    {status === "rejected" ? "Telah Ditolak" : "Tolak Karya (Denied)"}
                  </button>

                  <button
                    type="button"
                    onClick={handleVerify}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95 ${
                      status === "approved"
                        ? "bg-emerald-700 text-white ring-2 ring-emerald-400"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {status === "approved" ? "Telah Disetujui" : "Verifikasi & Setujui"}
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
