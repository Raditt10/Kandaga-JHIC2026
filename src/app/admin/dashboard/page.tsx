"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  FileCheck2,
  Clock,
  Eye,
  Building2,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { useSession } from "next-auth/react"
import AdminLayout from "@/components/admin/AdminLayout"
import { EmptyState } from "@/components/ui/EmptyState"

/**
 * Dashboard Administrator.
 *
 * Sebelumnya seluruh angka di halaman ini ditulis langsung di dalam komponen
 * ("128", "14", "+38 Karya", "42 Industri") dan daftar karya serta mitranya
 * berasal dari array mock di lib/adminData.ts. Akibatnya dashboard tidak pernah
 * berubah walau data di database bertambah, dan tombolnya menampilkan informasi
 * yang tidak sesuai kenyataan.
 *
 * Sekarang semua angka diambil dari GET /api/admin/stats yang menghitungnya
 * langsung dari database. Selama memuat ditampilkan "—", dan bila gagal
 * ditampilkan pesan error — tidak ada lagi angka karangan sebagai pengganti.
 *
 * CATATAN soal bagian "Mitra Industri": kartu mock sebelumnya menampilkan
 * "Kuota Pengajuan PKL" dan "Posisi Dibuka". Kedua data itu TIDAK ADA di skema
 * database (model Company hanya punya nama, bidang, status verifikasi, dan
 * tanggal verifikasi), jadi bagian itu diganti dengan data yang benar-benar
 * tersedia. Menampilkan kuota & posisi memerlukan penambahan field baru di
 * skema — itu keputusan produk, bukan sesuatu yang boleh dikarang.
 */

type RecentProject = {
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

type RecentPartner = {
  id: string
  name: string
  field: string | null
  verifiedAt: string | null
}

type AdminStats = {
  projects: { total: number; pending: number; approved: number; revisi: number; rejected: number }
  users: { total: number; student: number; teacher: number; company: number; bkk: number; admin: number }
  companies: { total: number; pending: number; disetujui: number; ditolak: number }
  contacts: Record<string, number>
  totalViews: number
  averageScore: number | null
  majors: { id: string; code: string; label: string; students: number; teachers: number; projects: number }[]
  recentProjects: RecentProject[]
  recentPartners: RecentPartner[]
}

type LoadState = "loading" | "ready" | "error"

function formatDate(value: string | null): string {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const adminName = session?.user?.username || session?.user?.name || "Admin"

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [state, setState] = useState<LoadState>("loading")

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as AdminStats
        if (cancelled) return
        setStats(data)
        setState("ready")
      } catch (error) {
        if (cancelled) return
        console.error("Gagal memuat statistik admin:", error)
        setState("error")
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const projectTotal = stats?.projects.total ?? 0
  const projectApproved = stats?.projects.approved ?? 0
  const projectPending = stats?.projects.pending ?? 0
  const partnerApproved = stats?.companies.disetujui ?? 0
  const partnerPending = stats?.companies.pending ?? 0

  return (
    <AdminLayout>
      <div className="space-y-7 animate-in fade-in duration-200">
        {/* Hero Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-primary-dark to-primary text-white p-7 sm:p-9 relative overflow-hidden shadow-xl shadow-primary/15">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl pr-28 sm:pr-40 md:pr-0">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              Selamat Datang, <span className="capitalize">{adminName}</span>
            </h1>
            <p className="text-rose-100 text-xs sm:text-sm mt-2 leading-relaxed opacity-90">
              Sebagai Administrator, Anda memiliki otoritas penuh untuk mengawasi kurasi karya,
              memvalidasi mitra, dan memantau status integritas sistem.
            </p>
          </div>

          {/* Model Chibi Admin */}
          <div className="absolute right-1 sm:right-6 md:right-8 lg:right-12 -top-2 sm:-top-3 md:-top-4 w-36 sm:w-48 md:w-56 lg:w-64 h-48 sm:h-60 md:h-68 lg:h-76 pointer-events-none select-none z-10">
            <div className="relative w-full h-full">
              <Image
                src="/images/admin.webp"
                alt="Ilustrasi Administrator"
                fill
                sizes="(max-width: 640px) 144px, (max-width: 768px) 200px, 260px"
                priority
                className="object-contain object-top drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
              />
            </div>
          </div>
        </div>

        {/* Peringatan bila data gagal dimuat - tidak ada angka pengganti */}
        {state === "error" && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200/70">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-rose-700">Statistik gagal dimuat</p>
              <p className="text-[11px] text-rose-600 mt-0.5 leading-relaxed">
                Angka di bawah tidak ditampilkan karena tidak ada data yang bisa
                dipertanggungjawabkan. Muat ulang halaman untuk mencoba lagi.
              </p>
            </div>
          </div>
        )}

        {/* Row of 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Karya Terverifikasi */}
          <Link
            href="/admin/moderasi"
            className="group p-5 rounded-2xl bg-white border border-ink-150 shadow-xs hover:border-primary/30 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <FileCheck2 className="w-5 h-5 text-primary" />
              <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-primary transition" />
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight block">
                {state === "loading" ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : projectApproved}
              </span>
              <span className="text-xs font-bold text-ink-700 block mt-1">Karya Terverifikasi</span>
              <span className="text-[11px] text-ink-300 block mt-0.5">
                Dari total {projectTotal} karya diunggah
              </span>
            </div>
          </Link>

          {/* Card 2: Karya Belum Terverifikasi */}
          <Link
            href="/admin/moderasi"
            className="group p-5 rounded-2xl bg-white border border-ink-150 shadow-xs hover:border-primary/30 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <Clock className="w-5 h-5 text-primary" />
              <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-primary transition" />
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight block">
                {state === "loading" ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : projectPending}
              </span>
              <span className="text-xs font-bold text-ink-700 block mt-1">Belum Terverifikasi</span>
              <span className="text-[11px] text-ink-400 font-medium block mt-0.5">
                {projectPending > 0 ? "Memerlukan kurasi admin" : "Tidak ada antrean menunggu"}
              </span>
            </div>
          </Link>

          {/* Card 3: Total Tayangan Karya */}
          <Link
            href="/admin/trend-karya"
            className="group p-5 rounded-2xl bg-white border border-ink-150 shadow-xs hover:border-primary/30 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <Eye className="w-5 h-5 text-primary" />
              <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-primary transition" />
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight block">
                {state === "loading" ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : (stats?.totalViews ?? 0).toLocaleString("id-ID")}
              </span>
              <span className="text-xs font-bold text-ink-700 block mt-1">Total Tayangan Karya</span>
              <span className="text-[11px] text-ink-300 block mt-0.5">
                {stats?.averageScore !== null && stats?.averageScore !== undefined
                  ? `Rata-rata nilai kurasi ${stats.averageScore}`
                  : "Belum ada nilai kurasi"}
              </span>
            </div>
          </Link>

          {/* Card 4: Industri Bekerja Sama */}
          <Link
            href="/admin/bkk"
            className="group p-5 rounded-2xl bg-white border border-ink-150 shadow-xs hover:border-primary/30 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <Building2 className="w-5 h-5 text-primary" />
              <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-primary transition" />
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight block">
                {state === "loading" ? <Loader2 className="w-6 h-6 animate-spin text-ink-300" /> : partnerApproved}
              </span>
              <span className="text-xs font-bold text-ink-700 block mt-1">Mitra Kerja Sama</span>
              <span className="text-[11px] text-ink-300 block mt-0.5">
                {partnerPending > 0 ? `${partnerPending} menunggu verifikasi` : "Semua mitra sudah diverifikasi"}
              </span>
            </div>
          </Link>
        </div>

        {/* Featured Cards: Karya Siswa Terkini (Grid 3 Kolom) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-sm sm:text-base font-extrabold text-ink">
              Karya &amp; Portofolio Siswa Terkini
            </h2>
          </div>

          {state === "ready" && stats && stats.recentProjects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-ink-150 p-6 shadow-xs">
              <EmptyState
                title="Belum Ada Karya"
                description="Karya akan muncul di sini setelah siswa mengunggahnya."
                compact
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(stats?.recentProjects ?? []).slice(0, 3).map((proj) => (
                <ProjectCard key={proj.id} proj={proj} />
              ))}
            </div>
          )}
        </div>

        {/* Section: Mitra Industri Terverifikasi */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-sm sm:text-base font-extrabold text-ink flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span>Mitra Industri Terverifikasi</span>
              </h2>
              <p className="text-[11px] text-ink-300 mt-0.5">
                Perusahaan yang sudah lolos verifikasi BKK dan aktif bekerja sama dengan sekolah.
              </p>
            </div>

            <Link
              href="/admin/bkk"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Kelola di Menu BKK</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {state === "ready" && stats && stats.recentPartners.length === 0 ? (
            <div className="bg-white rounded-2xl border border-ink-150 p-6 shadow-xs">
              <EmptyState
                title="Belum Ada Mitra Terverifikasi"
                description="Pendaftaran mitra menunggu ditinjau di menu Verifikasi Mitra."
                compact
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(stats?.recentPartners ?? []).map((partner) => (
                <div
                  key={partner.id}
                  className="bg-white rounded-2xl border border-ink-150 p-5 shadow-xs hover:shadow-md hover:border-primary/30 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-ink-100 text-primary font-extrabold text-sm flex items-center justify-center shrink-0 border border-ink-150">
                        {partner.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-ink leading-snug line-clamp-1">
                          {partner.name}
                        </h3>
                        <span className="text-[10px] text-ink-300 block mt-0.5">
                          {partner.field || "Bidang belum diisi"}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                      Terverifikasi
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-ink-150 flex items-center justify-between text-[11px]">
                    <span className="text-[10px] text-ink-300 font-mono">
                      {formatDate(partner.verifiedAt)}
                    </span>
                    <Link
                      href="/admin/bkk"
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      Detail Kemitraan
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

/**
 * Kartu karya terkini. Data berasal dari /api/admin/stats
 * (recentProjects), bukan lagi dari array mock.
 */
function ProjectCard({ proj }: { proj: RecentProject }) {
  const [isHovered, setIsHovered] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const indexRef = useRef(0)

  useEffect(() => {
    if (isHovered) {
      setDisplayedText("")
      indexRef.current = 0
      const fullText = proj.summary

      const typeNextChar = () => {
        if (indexRef.current < fullText.length) {
          indexRef.current += 1
          setDisplayedText(fullText.slice(0, indexRef.current))
          timerRef.current = setTimeout(typeNextChar, 18)
        }
      }

      timerRef.current = setTimeout(typeNextChar, 80)
    } else {
      if (timerRef.current) clearTimeout(timerRef.current)
      setDisplayedText("")
      indexRef.current = 0
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isHovered, proj.summary])

  const cover = proj.coverImage || "/images/preview-rpl.jpg"

  return (
    <Link
      href={`/admin/moderasi/${proj.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-2xl border border-ink-150 p-3 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        <div className="relative h-32 w-full rounded-xl overflow-hidden bg-ink-100 mb-3">
          <Image
            src={cover}
            alt={proj.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-2.5 right-2.5 bg-white text-ink text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm tracking-wide">
            {proj.category}
          </span>
          {proj.status !== "approved" && (
            <span className="absolute bottom-2.5 left-2.5 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase">
              {proj.status}
            </span>
          )}
        </div>

        <h3 className="text-xs font-bold text-ink line-clamp-2 leading-snug group-hover:text-primary transition-colors min-h-[32px] flex items-center">
          {proj.title}
        </h3>

        {/* Deskripsi singkat dengan animasi mengetik halus */}
        <div className="h-10 mt-1 overflow-hidden flex items-start">
          <p className="text-[11px] text-ink-600 leading-relaxed font-sans line-clamp-2">
            {displayedText}
            {isHovered && (
              <span className="inline-block w-0.5 h-3 bg-primary ml-0.5 align-middle animate-pulse" />
            )}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-ink-150 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[9px] flex items-center justify-center">
            {proj.studentName.slice(0, 1)}
          </div>
          <div>
            <span className="font-semibold text-ink block leading-tight">{proj.studentName}</span>
            <span className="text-[9px] text-ink-300 block">{proj.studentClass}</span>
          </div>
        </div>
        <span className="text-ink-300 font-mono text-[10px] flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {proj.score !== null ? `Nilai ${proj.score}` : formatDate(proj.submittedAt)}
        </span>
      </div>
    </Link>
  )
}
