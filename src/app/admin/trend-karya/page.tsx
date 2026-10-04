"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  TrendingUp,
  Eye,
  ArrowUpRight,
  Award,
  BarChart3,
  Loader2,
  AlertCircle,
} from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"

/**
 * Analitik Tren Karya.
 *
 * Sebelumnya halaman ini berisi angka yang ditulis langsung di komponen
 * ("142", "+24.5%", "1.240", "48%", "+133% 6 bln") dan daftar "Topik Teknologi
 * Populer" serta karya terpopuler dari array mock di lib/adminData.ts.
 *
 * Sekarang seluruh angka dihitung dari database lewat GET /api/admin/trends.
 * Yang sengaja TIDAK ditampilkan karena memang tidak ada datanya:
 *   - "Topik Teknologi Populer" per jurusan: endpoint tren tidak mengumpulkan
 *     data tools per jurusan, jadi bagian itu diganti rincian terkurasi/belum.
 *   - Like/apresiasi: skema tidak menyimpan like sama sekali (kolom `stars` pada
 *     projects hanya catatan bintang, bukan jumlah like), jadi diganti jumlah
 *     tayangan yang memang tercatat di `viewCount`.
 */

const MONTHS_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
]

function formatMonth(value: string): string {
  const [y, m] = value.split("-")
  const idx = Number.parseInt(m, 10) - 1
  if (Number.isNaN(idx) || idx < 0 || idx > 11) return value
  return `${MONTHS_ID[idx]} ${y.slice(2)}`
}

type Trends = {
  totals: {
    projects: number
    approved: number
    pending: number
    views: number
    averageScore: number | null
    scoredCount: number
    approvalRate: number
  }
  byMajor: { code: string; label: string; total: number; approved: number }[]
  byYear: { year: number; total: number }[]
  byStatus: { status: string; count: number }[]
  monthly: { month: string; total: number }[]
  topViewed: {
    id: string
    title: string
    viewCount: number
    stars: number
    category: string
    status: string
    score: number | null
  }[]
}

const MAJOR_STYLE: Record<string, { color: string; badgeColor: string }> = {
  RPL: { color: "border-rose-200 bg-rose-50/50 text-primary", badgeColor: "bg-rose-100 text-primary" },
  TKJ: { color: "border-blue-200 bg-blue-50/50 text-blue-700", badgeColor: "bg-blue-100 text-blue-800" },
  KA: { color: "border-emerald-200 bg-emerald-50/50 text-emerald-700", badgeColor: "bg-emerald-100 text-emerald-800" },
}

export default function AdminTrendKaryaPage() {
  const [data, setData] = useState<Trends | null>(null)
  const [state, setState] = useState<"loading" | "ready" | "error">("loading")

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch("/api/admin/trends", { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as Trends
        if (cancelled) return
        setData(json)
        setState("ready")
      } catch (error) {
        if (cancelled) return
        console.error("Gagal memuat analitik tren:", error)
        setState("error")
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const totals = data?.totals
  const byMajor = data?.byMajor ?? []
  const monthly = data?.monthly ?? []
  const topViewed = data?.topViewed ?? []

  // Kategori dominan dihitung dari data, bukan ditulis "Web & IoT 48%".
  const dominant = byMajor.length > 0 ? byMajor.reduce((a, b) => (b.total > a.total ? b : a)) : null
  const dominantShare =
    dominant && totals && totals.projects > 0
      ? Math.round((dominant.total / totals.projects) * 1000) / 10
      : 0

  // Perubahan bulanan dihitung dari dua titik data terakhir yang ada.
  const monthlyMax = monthly.length > 0 ? Math.max(...monthly.map((m) => m.total)) : 0
  const monthlyGrowth =
    monthly.length >= 2 && monthly[0].total > 0
      ? Math.round(((monthly[monthly.length - 1].total - monthly[0].total) / monthly[0].total) * 1000) / 10
      : null

  const loadingValue = <Loader2 className="w-5 h-5 animate-spin text-ink-300" />

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-200">
        {state === "error" && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200/70">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-rose-700">Analitik gagal dimuat</p>
              <p className="text-[11px] text-rose-600 mt-0.5 leading-relaxed">
                Angka tidak ditampilkan karena tidak ada data yang bisa
                dipertanggungjawabkan. Muat ulang halaman untuk mencoba lagi.
              </p>
            </div>
          </div>
        )}

        {/* Unified Header & Analytics Overview */}
        <div className="p-5 rounded-2xl bg-white border border-ink-150 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-lg font-bold text-ink flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Trend &amp; Performa Portofolio Siswa</span>
              </h1>
              <p className="text-xs text-ink-600 mt-0.5">
                Pantau performa unggahan proyek dan minat industri terhadap kompetensi siswa, dihitung langsung dari database.
              </p>
            </div>

            <Link
              href="/admin/moderasi"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
            >
              <span>Kurasi Karya</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Inline Data Row */}
          <div className="pt-5 border-t border-ink-150 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <span className="text-[11px] text-ink-300 font-medium block">Karya Terkurasi &amp; Rilis</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                  {state === "loading" ? loadingValue : (totals?.approved ?? 0)}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  {totals ? `${totals.approvalRate}% lolos` : "—"}
                </span>
              </div>
              <span className="text-[11px] text-ink-600 block">
                Dari {totals?.projects ?? 0} karya diunggah
              </span>
            </div>

            <div className="space-y-1 sm:border-l sm:border-ink-150 sm:pl-6">
              <span className="text-[11px] text-ink-300 font-medium block">Menunggu Kurasi</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                  {state === "loading" ? loadingValue : (totals?.pending ?? 0)}
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
                  Antrean
                </span>
              </div>
              <span className="text-[11px] text-ink-600 block">Belum ditinjau admin</span>
            </div>

            <div className="space-y-1 md:border-l md:border-ink-150 md:pl-6">
              <span className="text-[11px] text-ink-300 font-medium block">Total Tayangan</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                  {state === "loading" ? loadingValue : (totals?.views ?? 0).toLocaleString("id-ID")}
                </span>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full">
                  <Eye className="w-3 h-3 inline" />
                </span>
              </div>
              <span className="text-[11px] text-ink-600 block">Dari halaman galeri publik</span>
            </div>

            <div className="space-y-1 md:border-l md:border-ink-150 md:pl-6">
              <span className="text-[11px] text-ink-300 font-medium block">Kompetensi Dominan</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
                  {state === "loading" ? loadingValue : (dominant?.label ?? "—")}
                </span>
              </div>
              <span className="text-[11px] text-indigo-600 font-medium block">
                {dominant ? `${dominantShare}% dari seluruh karya` : "Belum ada karya"}
              </span>
            </div>
          </div>
        </div>

        {/* Section: Tren Tiap Jurusan */}
        <div className="space-y-3">
          <h2 className="font-heading text-sm font-bold text-ink">
            Performa Unggahan Berdasarkan Kompetensi Keahlian
          </h2>

          {state === "ready" && byMajor.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-dashed border-ink-150 text-center">
              <p className="text-xs font-bold text-ink-700">Belum ada karya per jurusan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {byMajor.map((j) => {
                const style = MAJOR_STYLE[j.code] ?? MAJOR_STYLE.RPL
                const share = totals && totals.projects > 0 ? Math.round((j.total / totals.projects) * 1000) / 10 : 0
                const rate = j.total > 0 ? Math.round((j.approved / j.total) * 1000) / 10 : 0

                return (
                  <div
                    key={j.code}
                    className={`p-5 rounded-2xl bg-white border shadow-xs flex flex-col justify-between ${style.color}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${style.badgeColor}`}>
                          {j.code}
                        </span>
                        <span className="text-xs font-bold text-emerald-600">{share}% karya</span>
                      </div>
                      <h3 className="font-heading text-sm font-bold text-ink mb-1">{j.label}</h3>
                      <p className="text-2xl font-extrabold text-ink">
                        {j.approved}{" "}
                        <span className="text-xs font-semibold text-ink-600">Karya Terverifikasi</span>
                      </p>

                      <div className="mt-4 pt-3 border-t border-ink-150 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-ink-600">Total diunggah</span>
                          <span className="font-bold text-ink font-mono">{j.total}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-ink-600">Lolos kurasi</span>
                          <span className="font-bold text-ink font-mono">{rate}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-ink-100 overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${rate}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Section: Karya Terpopuler & Grafik Pertumbuhan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Karya terpopuler berdasarkan tayangan */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-ink-150 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-sm font-bold text-ink flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Karya Paling Banyak Dilihat</span>
              </h2>
              <span className="text-xs text-ink-300 font-medium">Berdasarkan jumlah tayangan</span>
            </div>

            {state === "ready" && topViewed.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-ink-150 text-center">
                <p className="text-xs font-bold text-ink-700">Belum ada data tayangan</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topViewed.map((proj, idx) => (
                  <div
                    key={proj.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-ink-150 bg-ink-100/50 hover:bg-ink-100 transition"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-ink leading-snug line-clamp-1">
                          {proj.title}
                        </h4>
                        <p className="text-[11px] text-ink-600 mt-0.5">
                          <span className="font-medium text-ink-700">{proj.category}</span>
                          {proj.score !== null && <span> • Nilai kurasi {proj.score}</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-ink-150 text-ink uppercase">
                        {proj.status}
                      </span>
                      <span className="text-ink-600 flex items-center gap-1 font-mono text-[11px]">
                        <Eye className="w-3.5 h-3.5" />
                        {proj.viewCount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grafik Pertumbuhan Bulanan */}
          <div className="bg-white rounded-2xl border border-ink-150 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-sm font-bold text-ink">Pertumbuhan Karya Bulanan</h2>
                {monthlyGrowth !== null && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      monthlyGrowth >= 0 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                    }`}
                  >
                    {monthlyGrowth >= 0 ? "+" : ""}
                    {monthlyGrowth}%
                  </span>
                )}
              </div>

              {state === "ready" && monthly.length === 0 ? (
                <div className="py-8 text-center">
                  <BarChart3 className="w-6 h-6 text-ink-300 mx-auto mb-2" />
                  <p className="text-[11px] text-ink-300">Belum ada data bulanan</p>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {monthly.map((d) => (
                    <div key={d.month} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-ink-600">{formatMonth(d.month)}</span>
                        <span className="font-bold text-ink font-mono">{d.total} Karya</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-ink-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary-dark to-primary"
                          style={{ width: monthlyMax > 0 ? `${(d.total / monthlyMax) * 100}%` : "0%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-ink-150 text-center">
              <p className="text-[11px] text-ink-300">
                Dihitung dari tanggal unggah karya yang masih aktif (belum dihapus).
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
