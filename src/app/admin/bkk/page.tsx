"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  Building2,
  CheckCircle2,
  Eye,
  ExternalLink,
  Search,
  Filter,
  Loader2,
  ShieldCheck,
} from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"

type AntrianItem = {
  userId: string
  namaKontak: string
  email: string
  namaPerusahaan: string
  bidang: string | null
  dokumenUrl: string | null
  terdaftarPada: string
}

type MitraItem = {
  userId: string
  namaKontak: string
  email: string
  namaPerusahaan: string
  bidang: string | null
  dokumenUrl: string | null
  status: "pending" | "disetujui" | "ditolak"
  catatanVerifikasi: string | null
  verifiedBy: string | null
  verifiedAt: string | null
  terdaftarPada: string
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

export default function AdminBkkPage() {
  const [activeTab, setActiveTab] = useState<"antrian" | "semua">("antrian")
  const [antrian, setAntrian] = useState<AntrianItem[]>([])
  const [allMitra, setAllMitra] = useState<MitraItem[]>([])
  const [loading, setLoading] = useState(true)

  // Filter & Search untuk tab semua
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const [antrianRes, mitraRes] = await Promise.all([
          fetch("/api/bkk/verifikasi"),
          fetch("/api/bkk/mitra"),
        ])

        if (!active) return

        if (antrianRes.ok) {
          const data = await antrianRes.json()
          if (active) setAntrian(data.items || [])
        }
        if (mitraRes.ok) {
          // /api/bkk/mitra mengembalikan { items, summary }
          const data = await mitraRes.json()
          if (active) setAllMitra(data.items || data.companies || [])
        }
      } catch (err) {
        console.error("Gagal memuat data BKK:", err)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  // Summary counts
  const countPending = antrian.length

  // Filtered Mitra
  const filteredMitra = allMitra.filter((m) => {
    const matchStatus = statusFilter === "all" ? true : m.status === statusFilter
    const matchSearch =
      m.namaPerusahaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.namaKontak.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.bidang && m.bidang.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchStatus && matchSearch
  })

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header Info */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#891337]" />
              <span>Bursa Kerja Khusus (BKK) & Kemitraan Industri</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola langsung verifikasi akun mitra perusahaan, izin rekrutmen, dan kemitraan DUDI dari panel Admin.
            </p>
          </div>

          <Link
            href="/bkk"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0"
          >
            <span>Buka Portal Publik BKK</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("antrian")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "antrian"
                ? "bg-[#891337] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Antrian Verifikasi Mitra</span>
            {countPending > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === "antrian" ? "bg-white text-[#891337]" : "bg-amber-100 text-amber-700"
                }`}
              >
                {countPending}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("semua")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "semua"
                ? "bg-[#891337] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Direktori Semua Mitra ({allMitra.length})</span>
          </button>
        </div>

        {/* TAB 1: ANTRIAN VERIFIKASI */}
        {activeTab === "antrian" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading text-sm font-bold text-slate-900">
                  Antrian Verifikasi Berkas Perusahaan
                </h2>
                <p className="text-[11px] text-slate-400">
                  Tinjau legalitas dan putuskan persetujuan akun perusahaan (FIFO: pengajuan terlama di atas).
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#891337]" />
                <span className="text-xs">Memuat antrian verifikasi...</span>
              </div>
            ) : antrian.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-bold text-slate-700">Semua Antrian Selesai Diproses</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tidak ada pengajuan mitra perusahaan yang sedang menunggu verifikasi saat ini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider">
                      <th className="pb-2.5 font-bold">PERUSAHAAN</th>
                      <th className="pb-2.5 font-bold">KONTAK PIC</th>
                      <th className="pb-2.5 font-bold">BIDANG INDUSTRI</th>
                      <th className="pb-2.5 font-bold">DOKUMEN</th>
                      <th className="pb-2.5 font-bold">TANGGAL DAFTAR</th>
                      <th className="pb-2.5 font-bold text-right">AKSI VERIFIKASI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {antrian.map((item) => (
                      <tr key={item.userId} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 pr-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block leading-tight">
                                {item.namaPerusahaan}
                              </span>
                              <span className="text-[10px] text-amber-600 font-medium block mt-0.5">
                                Menunggu Verifikasi
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 pr-3">
                          <span className="font-semibold text-slate-800 block">{item.namaKontak}</span>
                          <span className="text-[11px] text-slate-400 block font-mono">{item.email}</span>
                        </td>
                        <td className="py-3.5 pr-3 text-slate-600">
                          {item.bidang || "—"}
                        </td>
                        <td className="py-3.5 pr-3">
                          {item.dokumenUrl ? (
                            <a
                              href={item.dokumenUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#891337] hover:underline"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Berkas Legalitas</span>
                            </a>
                          ) : (
                            <span className="text-slate-300 text-[11px] italic">Tidak ada berkas</span>
                          )}
                        </td>
                        <td className="py-3.5 pr-3 text-slate-500 font-mono text-[11px]">
                          {formatDate(item.terdaftarPada)}
                        </td>
                        <td className="py-3.5 text-right">
                          <Link
                            href={`/admin/bkk/verifikasi/${item.userId}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                            title="Buka halaman review pengajuan"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SEMUA MITRA INDUSTRI */}
        {activeTab === "semua" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari perusahaan, PIC, atau email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#891337]/15 focus:border-[#891337]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#891337]/15 cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="disetujui">Disetujui</option>
                  <option value="pending">Menunggu</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#891337]" />
                <span className="text-xs">Memuat direktori mitra...</span>
              </div>
            ) : filteredMitra.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">Tidak ada mitra ditemukan</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Sesuaikan kata kunci pencarian atau filter status Anda.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider">
                      <th className="pb-2.5 font-bold">PERUSAHAAN</th>
                      <th className="pb-2.5 font-bold">KONTAK PIC</th>
                      <th className="pb-2.5 font-bold">BIDANG</th>
                      <th className="pb-2.5 font-bold">STATUS</th>
                      <th className="pb-2.5 font-bold">TANGGAL VERIFIKASI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredMitra.map((mitra) => (
                      <tr key={mitra.userId} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 pr-3">
                          <span className="font-bold text-slate-900 block leading-tight">
                            {mitra.namaPerusahaan}
                          </span>
                          {mitra.catatanVerifikasi && (
                            <span className="text-[10px] text-rose-600 block mt-0.5">
                              Alasan: {mitra.catatanVerifikasi}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 pr-3">
                          <span className="font-semibold text-slate-800 block">{mitra.namaKontak}</span>
                          <span className="text-[11px] text-slate-400 block font-mono">{mitra.email}</span>
                        </td>
                        <td className="py-3.5 pr-3 text-slate-600">
                          {mitra.bidang || "—"}
                        </td>
                        <td className="py-3.5 pr-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              mitra.status === "disetujui"
                                ? "bg-emerald-100 text-emerald-800"
                                : mitra.status === "ditolak"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {mitra.status}
                          </span>
                        </td>
                        <td className="py-3.5 pr-3 text-slate-500 font-mono text-[11px]">
                          {mitra.verifiedAt ? formatDate(mitra.verifiedAt) : formatDate(mitra.terdaftarPada)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </AdminLayout>
  )
}
