"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Search,
  Filter,
  X,
  FolderGit2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"

/**
 * Kurasi Karya & Moderasi Galeri.
 *
 * Sebelumnya daftar karya di halaman ini berasal dari array mock
 * `projectShowcases` di lib/adminData.ts. Karena itu keputusan moderasi diambil
 * atas karya yang tidak ada di database, dan jumlah "karya" yang ditampilkan
 * tidak pernah berkurang walau admin sudah memutuskan.
 *
 * Sekarang daftar diambil dari GET /api/admin/projects (termasuk karya yang
 * belum dimoderasi), lengkap dengan tab status yang jumlahnya dihitung dari
 * database. Penyaringan dan paginasi dilakukan di server supaya halaman tetap
 * ringan ketika jumlah karya bertambah.
 */

const PAGE_SIZE = 6

type AdminProject = {
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

type Counts = { total: number; pending: number; approved: number; revisi: number; rejected: number }

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

export default function AdminModerasiPage() {
  const [items, setItems] = useState<AdminProject[]>([])
  const [counts, setCounts] = useState<Counts | null>(null)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [page, setPage] = useState(1)

  const [state, setState] = useState<"loading" | "ready" | "error">("loading")

  // Tunda pencarian supaya tidak memanggil API pada setiap ketikan.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [searchQuery])

  useEffect(() => {
    let cancelled = false
    setState("loading")

    const params = new URLSearchParams()
    params.set("status", statusFilter)
    params.set("page", String(page))
    params.set("pageSize", String(PAGE_SIZE))
    if (categoryFilter !== "all") params.set("type", categoryFilter)
    if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim())

    ;(async () => {
      try {
        const res = await fetch(`/api/admin/projects?${params.toString()}`, { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as {
          items: AdminProject[]
          total: number
          totalPages: number
          counts: Counts
        }
        if (cancelled) return
        setItems(json.items)
        setTotal(json.total)
        setTotalPages(Math.max(1, json.totalPages))
        setCounts(json.counts)
        setState("ready")
      } catch (error) {
        if (cancelled) return
        console.error("Gagal memuat daftar karya:", error)
        setState("error")
      }
    })()

    return () => {
      cancelled = true
    }
  }, [statusFilter, categoryFilter, debouncedQuery, page])

  const startItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const endItem = Math.min(total, page * PAGE_SIZE)

  const resetFilters = () => {
    setSearchQuery("")
    setCategoryFilter("all")
    setStatusFilter("all")
    setPage(1)
  }

  const countFor = (key: string): number | null => {
    if (!counts) return null
    if (key === "all") return counts.total
    return counts[key as keyof Counts] ?? 0
  }

  return (
    <AdminLayout>
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
                Daftar karya inovasi dan portofolio siswa Kandaga ({total} karya). Hover kartu untuk membuka halaman kurasi.
              </p>
            </div>

            {/* Filtering & Search Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-ink-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari karya / siswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-8 py-1.5 rounded-xl border border-ink-150 text-xs bg-ink-100/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
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
                    setPage(1)
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

          {/* Tab status — jumlahnya dihitung dari database */}
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
                    setPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                    active
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-ink-600 border-ink-150 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {tab.label}
                  {n !== null && (
                    <span className={`ml-1.5 ${active ? "text-white/80" : "text-ink-300"}`}>{n}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {state === "error" && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200/70">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-rose-700">Daftar karya gagal dimuat</p>
              <p className="text-[11px] text-rose-600 mt-0.5">
                Karya tidak ditampilkan untuk menghindari keputusan moderasi atas data yang tidak sahih.
              </p>
            </div>
          </div>
        )}

        {/* Projects Cards Grid */}
        {state === "loading" ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-ink-150 shadow-xs">
            <Loader2 className="w-6 h-6 animate-spin text-ink-300 mx-auto" />
            <p className="text-xs text-ink-300 mt-2">Memuat karya dari database...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-ink-150 shadow-xs">
            <p className="text-xs text-ink-300">
              {statusFilter === "pending"
                ? "Tidak ada karya yang menunggu kurasi. Antrean bersih."
                : "Tidak ada karya yang sesuai dengan filter atau kata kunci."}
            </p>
            {(searchQuery || categoryFilter !== "all" || statusFilter !== "all") && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <div
            key={`${statusFilter}-${categoryFilter}-${debouncedQuery}-${page}`}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in-50 duration-300"
          >
            {items.map((proj) => (
              <div
                key={proj.id}
                className="relative group p-4 rounded-2xl bg-white border border-ink-150 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <Link
                  href={`/admin/moderasi/${proj.id}`}
                  className="absolute inset-0 bg-ink/75 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 flex flex-col items-center justify-center p-4 text-center cursor-pointer no-underline"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 hover:bg-white text-white hover:text-ink flex items-center justify-center backdrop-blur-md shadow-xl transition-all duration-200 transform scale-90 group-hover:scale-100 mb-2">
                    <Eye className="w-6 h-6" />
                  </div>
                  <span className="text-white text-xs font-semibold tracking-wide drop-shadow-sm">
                    Lihat Detail Karya
                  </span>
                </Link>

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
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                    onClick={() => setPage(idx + 1)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      page === idx + 1
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
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
              <span className="font-bold text-ink">{total}</span>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
