"use client"

import React, { useState, useEffect, use } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { projectShowcases, projectDetails, creatorProfiles, projectCreatorIds } from "@/lib/adminData"
import type { ProjectDocument } from "@/lib/adminData"
import AdminLayout from "@/components/admin/AdminLayout"
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  User,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  Check,
  X,
  FolderOpen,
  FileText,
  FileImage,
  Link2,
  Video,
  Eye,
  IdCard,
  Users,
  Mail,
  GraduationCap,
  type LucideIcon,
} from "lucide-react"

/** Ikon & warna baris berkas pendukung sesuai jenis berkasnya. */
const docTypeStyles: Record<ProjectDocument["type"], { icon: LucideIcon; tone: string; label: string }> = {
  pdf: { icon: FileText, tone: "bg-rose-50 text-rose-600 border-rose-100", label: "Dokumen PDF" },
  image: { icon: FileImage, tone: "bg-sky-50 text-sky-600 border-sky-100", label: "Gambar" },
  link: { icon: Link2, tone: "bg-violet-50 text-violet-600 border-violet-100", label: "Tautan" },
  video: { icon: Video, tone: "bg-amber-50 text-amber-600 border-amber-100", label: "Video" },
}

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

  // Berkas pendukung yang sudah ditinjau admin pada panel kurasi
  const [reviewedDocs, setReviewedDocs] = useState<string[]>([])

  // Panel detail kreator karya (id profil kreator yang sedang dibuka)
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null)

  // Kunci scroll halaman di belakang selama kartu kreator terbuka.
  // Lenis (smooth scroll) mengabaikan `overflow: hidden`, jadi instance-nya
  // dihentikan sementara lalu dijalankan kembali saat kartu ditutup.
  useEffect(() => {
    if (!selectedCreatorId) return

    const html = document.documentElement
    const body = document.body
    const previousHtmlOverflow = html.style.overflow
    const previousBodyOverflow = body.style.overflow

    html.style.overflow = "hidden"
    body.style.overflow = "hidden"

    const lenis = (window as unknown as { lenis?: { stop?: () => void; start?: () => void } }).lenis
    lenis?.stop?.()

    return () => {
      html.style.overflow = previousHtmlOverflow
      body.style.overflow = previousBodyOverflow
      lenis?.start?.()
    }
  }, [selectedCreatorId])

  if (!project) {
    return (
      <AdminLayout>
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-lg mx-auto my-12">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800">Karya Tidak Ditemukan</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Karya dengan ID &quot;{projectId}&quot; tidak terdaftar dalam basis data kurasi.
          </p>
          <Link
            href="/admin/moderasi"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#891337] text-white text-xs font-bold hover:bg-[#72102e] transition"
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
      text: `Karya "${project.title}" berhasil diverifikasi dan dipublikasikan ke Katalog Galeri Karya.`,
      type: "success",
    })
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleDeny = () => {
    setStatus("rejected")
    setToastMessage({
      text: `Karya "${project.title}" ditolak. Catatan kurasi telah diteruskan ke siswa.`,
      type: "danger",
    })
    setTimeout(() => setToastMessage(null), 4000)
  }

  const toggleDocReview = (docId: string) => {
    setReviewedDocs((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId],
    )
  }

  const documents = project.documents ?? []
  const availableDocs = documents.filter((doc) => Boolean(doc.url))
  const missingDocs = documents.filter((doc) => !doc.url)
  const requiredMissing = missingDocs.filter((doc) => doc.required)
  const reviewedAvailable = availableDocs.filter((doc) => reviewedDocs.includes(doc.id))
  const details = projectDetails[project.id]

  // Satu karya bisa punya berapa pun kreator, termasuk lintas jurusan.
  const creators = (projectCreatorIds[project.id] ?? [])
    .map((creatorId) => ({ id: creatorId, profile: creatorProfiles[creatorId] }))
    .filter((entry) => Boolean(entry.profile))

  const isCrossMajor = new Set(creators.map((entry) => entry.profile.major)).size > 1
  const selectedCreator = selectedCreatorId
    ? creators.find((entry) => entry.id === selectedCreatorId)?.profile
    : undefined

  const creatorRows: { icon: LucideIcon; label: string; value: string }[] = selectedCreator
    ? [
        { icon: Users, label: "Kelas", value: selectedCreator.className },
        { icon: GraduationCap, label: "Kompetensi Keahlian", value: selectedCreator.major },
        { icon: Mail, label: "Email Sekolah", value: selectedCreator.email },
        { icon: User, label: "Guru Pembimbing", value: selectedCreator.advisor },
        { icon: Calendar, label: "Bergabung Sejak", value: selectedCreator.joinedAt },
        { icon: CheckCircle2, label: "Karya Terverifikasi", value: `${selectedCreator.verifiedWorks} karya` },
      ]
    : []

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

        {/* Modal Kartu Kreator Karya */}
        {selectedCreator &&
          createPortal(
            <>
              {/* Lapisan gelap + blur: berdiri sendiri agar menutup rata seluruh viewport */}
              <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md" />

              {/* Lapisan konten di atas lapisan blur */}
              <div
                data-lenis-prevent
                className="fixed inset-0 z-[101] overflow-y-auto overscroll-contain p-4"
                onClick={() => setSelectedCreatorId(null)}
              >
                <div className="flex min-h-full items-center justify-center">
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Kartu kreator ${selectedCreator.name}`}
                    className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {/* Kepala kartu */}
                    <div className="flex items-center justify-between gap-3 px-5 py-4 bg-[#891337] text-white">
                      <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">
                          Kandaga &middot; SMKN 13 Bandung
                        </p>
                        <h3 className="text-sm font-bold tracking-tight mt-1 truncate">
                          Kartu Kreator Karya
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedCreatorId(null)}
                        title="Tutup kartu kreator"
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-5">
                      {/* Identitas utama */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[#891337]/10 text-[#891337] font-bold text-xl flex items-center justify-center border-2 border-[#891337]/20 shrink-0">
                          {selectedCreator.name.slice(0, 1)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Nama Lengkap
                          </p>
                          <h4 className="text-base font-bold text-slate-900 leading-tight mt-0.5 break-words">
                            {selectedCreator.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 break-words">
                            {selectedCreator.role} &middot; {selectedCreator.className}
                          </p>
                        </div>
                      </div>

                      {/* Nomor induk siswa */}
                      <div className="mt-4 flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <IdCard className="w-4 h-4 text-[#891337] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Nomor Induk Siswa
                          </p>
                          <p className="font-mono text-sm font-bold text-slate-800 tracking-[0.12em] mt-0.5">
                            {selectedCreator.nis}
                          </p>
                        </div>
                      </div>

                      {/* Data rinci — label kiri, nilai kanan */}
                      <dl className="mt-4 border-t border-slate-100 divide-y divide-slate-100">
                        {creatorRows.map((row) => {
                          const RowIcon = row.icon
                          return (
                            <div key={row.label} className="flex items-start justify-between gap-4 py-2.5">
                              <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 pt-0.5">
                                <RowIcon className="w-3 h-3 text-[#891337]/70 shrink-0" />
                                {row.label}
                              </dt>
                              <dd className="text-xs font-semibold text-slate-800 text-right min-w-0 break-words">
                                {row.value}
                              </dd>
                            </div>
                          )
                        })}
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </>,
            document.body,
          )}

        {/* Top Breadcrumb & Action Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/moderasi"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition flex items-center justify-center cursor-pointer shrink-0"
              title="Kembali ke Daftar Kurasi"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Link href="/admin/moderasi" className="hover:text-slate-600">
                  Kurasi Karya
                </Link>
                <span>/</span>
                <span className="text-slate-700 font-medium">Detail Karya</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 line-clamp-1">
                {project.title}
              </h1>
            </div>
          </div>

          {/* Status Badge jika sudah diverifikasi / ditolak */}
          {status === "approved" ? (
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 shadow-xs shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Karya Terverifikasi
            </span>
          ) : status === "rejected" ? (
            <span className="px-3.5 py-1.5 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200 flex items-center gap-1.5 shadow-xs shrink-0">
              <XCircle className="w-4 h-4 text-rose-600" />
              Karya Ditolak (Denied)
            </span>
          ) : null}
        </div>

        {/* Grid Content Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Kolom Kiri: Visual Showcase & Profil Siswa (5 Kolom) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Foto Pratinjau Karya */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="relative h-72 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-inner">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  priority
                  className="object-cover"
                />
                {/* Pill Kategori */}
                 <span className="absolute top-3.5 right-3.5 bg-white text-slate-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                   {project.category}
                 </span>
               </div>

              {/* Baris Meta: Tanggal Unggah */}
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Diunggah {project.uploadedAt || "28 Sep 2026"}</span>
              </div>

              {/* Status Kurasi Karya */}
              {status === "approved" ? (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Status: Terverifikasi
                </div>
              ) : status === "rejected" ? (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5">
                  <X className="w-3.5 h-3.5" />
                  Status: Ditolak
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Status: Menunggu Kurasi
                </div>
              )}
            </div>

            {/* Profil Siswa / Kreator */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Informasi Kreator Siswa
                </h3>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isCrossMajor && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#891337] bg-[#891337]/10 border border-[#891337]/20 px-2 py-1 rounded-full">
                      Lintas Jurusan
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-full">
                    {creators.length} Kreator
                  </span>
                </div>
              </div>

              {creators.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-3 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200">
                  Belum ada data kreator untuk karya ini.
                </p>
              ) : (
                <div className="space-y-2.5 pt-1">
                  {creators.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 p-2.5 rounded-2xl border border-slate-100 bg-slate-50/70"
                    >
                      <div className="w-11 h-11 rounded-full bg-[#891337]/10 text-[#891337] font-bold text-sm flex items-center justify-center border border-[#891337]/20 shrink-0">
                        {entry.profile.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-900 leading-tight truncate">
                          {entry.profile.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {entry.profile.role} &middot; {entry.profile.className}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedCreatorId(entry.id)}
                        title={`Lihat detail ${entry.profile.name}`}
                        aria-label={`Lihat detail ${entry.profile.name}`}
                        className="w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-[#891337] hover:border-[#891337]/30 hover:bg-[#891337]/5 flex items-center justify-center transition cursor-pointer shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Berkas & Tautan Pendukung Karya — panel peninjauan admin */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <FolderOpen className="w-4 h-4 text-[#891337] mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Berkas &amp; Tautan Pendukung
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {reviewedAvailable.length} dari {availableDocs.length} berkas sudah ditinjau
                    </p>
                  </div>
                </div>
                <span
                   className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                     requiredMissing.length === 0
                       ? "bg-emerald-100 text-emerald-800"
                       : "bg-amber-100 text-amber-800"
                   }`}
                >
                  {requiredMissing.length === 0
                    ? "Berkas Wajib Lengkap"
                    : `${requiredMissing.length} Berkas Wajib Kurang`}
                </span>
              </div>

              {documents.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-3.5 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200">
                  Belum ada berkas pendukung yang diunggah siswa.
                </p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => {
                    const docMeta = docTypeStyles[doc.type]
                    const DocIcon = docMeta.icon
                    const isReviewed = reviewedDocs.includes(doc.id)

                    return (
                       <div
                         key={doc.id}
                         className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors ${
                           doc.url
                             ? "bg-slate-50/70 border-slate-200/70 hover:border-[#891337]/30"
                             : "bg-slate-50/40 border-dashed border-slate-200"
                         }`}
                       >
                         <div
                           className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                             doc.url ? docMeta.tone : "bg-slate-100 text-slate-300 border-slate-200"
                           }`}
                         >
                           <DocIcon className="w-4 h-4" />
                         </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1.5">
                            <span className="truncate">{doc.name}</span>
                            {doc.required && (
                              <span className="text-[9px] font-bold text-[#891337] bg-[#891337]/10 px-1.5 py-0.5 rounded-full uppercase shrink-0">
                                Wajib
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                            {doc.url
                              ? `${docMeta.label} · ${doc.meta ?? "Tersedia"}`
                              : "Belum dilampirkan siswa"}
                          </p>
                        </div>

                         {doc.url ? (
                           <div className="flex items-center gap-1.5 shrink-0">
                             <button
                               type="button"
                               onClick={() => toggleDocReview(doc.id)}
                               title={isReviewed ? "Batalkan tanda sudah ditinjau" : "Tandai berkas sudah ditinjau"}
                               aria-pressed={isReviewed}
                               className={`w-8 h-8 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                                 isReviewed
                                   ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                   : "bg-white border-slate-200 text-slate-300 hover:text-slate-500 hover:border-slate-300"
                               }`}
                             >
                               <Check className="w-3.5 h-3.5" />
                             </button>
                             <a
                               href={doc.url}
                               target="_blank"
                               rel="noopener noreferrer"
                               title={`Buka ${doc.name}`}
                               className="px-3 py-2 rounded-lg bg-[#891337] hover:bg-[#72102e] text-white text-[11px] font-bold flex items-center gap-1.5 transition"
                             >
                               <ExternalLink className="w-3.5 h-3.5" />
                               Buka
                             </a>
                           </div>
                         ) : (
                           <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg shrink-0">
                             Kosong
                           </span>
                         )}
                      </div>
                    )
                  })}
                </div>
              )}

            </div>
           </div>

          {/* Kolom Kanan: Detail Inovasi & Rubrik Kurasi (7 Kolom) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Kartu Deskripsi & Latar Belakang */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {project.title}
                </h2>
              </div>

              <div className="pt-2 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Ringkasan & Abstrak Karya
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                  {project.description}
                </p>
              </div>

            </div>

            {/* Deskripsi Lengkap Proyek */}
            {details && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#891337]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Deskripsi Lengkap Proyek
                  </h3>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Gambaran Umum &amp; Latar Belakang
                  </h4>
                  {details.overview.map((paragraph, index) => (
                    <p key={index} className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Tujuan &amp; Sasaran
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4 leading-relaxed">
                    {details.objectives.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Cakupan &amp; Isi Proyek
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-600 list-disc pl-4 leading-relaxed">
                    {details.scope.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Fitur Unggulan &amp; Nilai Guna
                  </h4>
                  <ul className="space-y-2">
                    {details.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Catatan Reviewer & Keputusan Akhir */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#891337]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Catatan Kurator / Feedback ke Siswa
                </h3>
              </div>

              <textarea
                rows={3}
                placeholder="Tuliskan catatan apresiasi atau poin perbaikan untuk siswa (opsional)..."
                value={curationNote}
                onChange={(e) => setCurationNote(e.target.value)}
                className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#891337]/15 focus:border-[#891337] transition font-sans leading-relaxed"
              />

              <div className="flex items-center gap-2.5 pt-4 mt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleDeny}
                  className={`px-4 py-2.5 rounded-xl text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer ${
                    status === "rejected"
                      ? "bg-rose-700 text-white ring-2 ring-rose-400 shadow-sm"
                      : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  {status === "rejected" ? "Telah Ditolak" : "Tolak Karya"}
                </button>

                <button
                  type="button"
                  onClick={handleVerify}
                  className={`px-4 py-2.5 rounded-xl text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
                    status === "approved"
                      ? "bg-emerald-700 text-white ring-2 ring-emerald-400"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
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
    </AdminLayout>
  )
}
