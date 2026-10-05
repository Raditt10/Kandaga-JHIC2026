"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Building2,
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  ExternalLink,
  Search,
  Filter,
  Loader2,
  ShieldCheck,
  Check,
  RefreshCw,
} from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"
import { EmptyState } from "@/components/ui/EmptyState"
import { FilterDropdown } from "@/components/ui/FilterDropdown"

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
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Modal detail
  const [selectedItem, setSelectedItem] = useState<AntrianItem | null>(null)
  const [catatanTolak, setCatatanTolak] = useState("")
  const [showTolakInput, setShowTolakInput] = useState(false)

  // Filter & Search untuk tab semua
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const fetchAntrian = useCallback(async () => {
    try {
      const res = await fetch("/api/bkk/verifikasi")
      if (res.ok) {
        const data = await res.json()
        setAntrian(data.items || [])
      }
    } catch (err) {
      console.error("Gagal load antrian:", err)
    }
  }, [])

  const fetchAllMitra = useCallback(async () => {
    try {
      const res = await fetch("/api/bkk/mitra")
      if (res.ok) {
        const data = await res.json()
        setAllMitra(data.companies || [])
      }
    } catch (err) {
      console.error("Gagal load semua mitra:", err)
    }
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchAntrian(), fetchAllMitra()])
    setLoading(false)
  }, [fetchAntrian, fetchAllMitra])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAction = async (userId: string, action: "setujui" | "tolak", catatan?: string) => {
    if (action === "tolak" && (!catatan || catatan.trim().length < 10)) {
      setNotification({ type: "error", message: "Alasan penolakan minimal 10 karakter." })
      return
    }

    setActionLoading(userId)
    try {
      const res = await fetch("/api/bkk/verifikasi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, catatan }),
      })
      const result = await res.json()

      if (res.ok) {
        setNotification({
          type: "success",
          message: action === "setujui" ? "Perusahaan mitra berhasil disetujui!" : "Pengajuan mitra ditolak.",
        })
        setSelectedItem(null)
        setShowTolakInput(false)
        setCatatanTolak("")
        await loadData()
      } else {
        setNotification({ type: "error", message: result.error || "Gagal memproses pengajuan." })
      }
    } catch {
      setNotification({ type: "error", message: "Terjadi kesalahan jaringan." })
    } finally {
      setActionLoading(null)
      setTimeout(() => setNotification(null), 4000)
    }
  }

  // Summary counts
  const countPending = antrian.length
  const countDisetujui = allMitra.filter((m) => m.status === "disetujui").length
  const countDitolak = allMitra.filter((m) => m.status === "ditolak").length
  const countTotal = allMitra.length

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
        <div className="p-5 rounded-2xl bg-white border border-ink-150 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-lg font-bold text-ink flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span>Bursa Kerja Khusus (BKK) & Kemitraan Industri</span>
            </h1>
            <p className="text-xs text-ink-600 mt-0.5">
              Kelola langsung verifikasi akun mitra perusahaan, izin rekrutmen, dan kemitraan DUDI dari panel Admin.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/mitra/daftar"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 shadow-2xs"
            >
              <span>Formulir Publik Mitra</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/bkk"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-ink-100 hover:bg-ink-150 text-ink-700 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0"
            >
              <span>Buka Portal Publik BKK</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Notification Alert */}
        {notification && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-xs underline cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Step Guide Banner Alur Pendaftaran */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-ink to-ink text-white shadow-xs">
          <h2 className="text-xs font-mono uppercase tracking-wider text-rose-300 font-bold mb-3">
            Alur Pendaftaran & Verifikasi Kemitraan (DUDI)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px] mb-1.5">
                1
              </span>
              <h3 className="font-bold">Pengisian Form</h3>
              <p className="text-[11px] text-white/70 mt-0.5">
                Perusahaan mengisi profil dan melampirkan berkas legalitas (SIUP/NIB/Company Profile).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px] mb-1.5">
                2
              </span>
              <h3 className="font-bold">Kurasi Legalitas</h3>
              <p className="text-[11px] text-white/70 mt-0.5">
                Admin atau Tim BKK memverifikasi keabsahan dokumen dan bidang industri.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px] mb-1.5">
                3
              </span>
              <h3 className="font-bold">Persetujuan Akun</h3>
              <p className="text-[11px] text-white/70 mt-0.5">
                Akun diaktifkan, kredensial login dikirim otomatis via email ke kontak PIC perusahaan.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
              <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px] mb-1.5">
                4
              </span>
              <h3 className="font-bold">Rekrutmen PKL</h3>
              <p className="text-[11px] text-white/70 mt-0.5">
                Mitra membuka kuota magang dan dapat mem-bookmark karya siswa di galeri.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-ink-150 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-ink-300 font-medium block">Menunggu Verifikasi</span>
              <span className="text-xl font-extrabold text-amber-600 block mt-0.5">
                {countPending}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-ink-150 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-ink-300 font-medium block">Mitra Disetujui</span>
              <span className="text-xl font-extrabold text-emerald-600 block mt-0.5">
                {countDisetujui}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-ink-150 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-ink-300 font-medium block">Pengajuan Ditolak</span>
              <span className="text-xl font-extrabold text-rose-600 block mt-0.5">
                {countDitolak}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-ink-150 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-ink-300 font-medium block">Total Mitra DUDI</span>
              <span className="text-xl font-extrabold text-ink block mt-0.5">
                {countTotal || countPending + countDisetujui + countDitolak}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-ink-150 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("antrian")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "antrian"
                ? "bg-primary text-white shadow-xs"
                : "text-ink-600 hover:bg-ink-100"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Antrian Pendaftaran & Verifikasi</span>
            {countPending > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === "antrian" ? "bg-white text-primary" : "bg-amber-100 text-amber-700"
                }`}
              >
                {countPending}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("semua")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "semua"
                ? "bg-primary text-white shadow-xs"
                : "text-ink-600 hover:bg-ink-100"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Direktori Semua Mitra ({allMitra.length})</span>
          </button>
        </div>

        {/* TAB 1: ANTRIAN VERIFIKASI */}
        {activeTab === "antrian" && (
          <div className="bg-white rounded-2xl border border-ink-150 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading text-sm font-bold text-ink">
                  Antrian Verifikasi Berkas Perusahaan
                </h2>
                <p className="text-[11px] text-ink-300">
                  Tinjau legalitas dan putuskan persetujuan akun perusahaan (FIFO: pengajuan terlama di atas).
                </p>
              </div>

              <button
                type="button"
                onClick={loadData}
                title="Segarkan antrian"
                aria-label="Segarkan antrian"
                className="p-2.5 rounded-xl border border-ink-150 bg-white text-ink-400 hover:text-primary hover:border-primary transition cursor-pointer shrink-0 shadow-2xs"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-ink-300 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs">Memuat antrian verifikasi...</span>
              </div>
            ) : antrian.length === 0 ? (
              <EmptyState
                title="Semua Antrian Selesai Diproses"
                description="Tidak ada pengajuan mitra perusahaan yang sedang menunggu verifikasi saat ini."
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-ink-150 bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-ink-100 border-b border-ink-150">
                        <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Perusahaan</th>
                        <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Kontak PIC</th>
                        <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Bidang Industri</th>
                        <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Dokumen</th>
                        <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Terdaftar</th>
                        <th className="text-right px-5 py-3.5 font-semibold text-ink-700 font-heading pr-5">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-150 bg-white">
                      {antrian.map((item) => (
                        <tr key={item.userId} className="hover:bg-ink-100/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-semibold text-ink block text-sm leading-tight">
                                  {item.namaPerusahaan}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 mt-1">
                                  <Clock className="w-3 h-3" />
                                  Menunggu Verifikasi
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-medium text-ink block text-sm">{item.namaKontak}</span>
                            <span className="text-xs text-ink-600 block font-mono mt-0.5">{item.email}</span>
                          </td>
                          <td className="px-5 py-4 text-ink-700 text-sm">
                            {item.bidang || "—"}
                          </td>
                          <td className="px-5 py-4">
                            {item.dokumenUrl ? (
                              <a
                                href={item.dokumenUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark transition"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Berkas Legalitas</span>
                              </a>
                            ) : (
                              <span className="text-ink-600 text-xs italic">Tidak ada berkas</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-ink-600 text-sm">
                            {formatDate(item.terdaftarPada)}
                          </td>
                          <td className="px-5 py-4 text-right pr-5">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedItem(item)}
                                className="px-3 py-1.5 rounded-xl border border-ink-150 hover:bg-ink-100 text-ink text-xs font-semibold transition cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 inline mr-1" />
                                Review
                              </button>
                              <button
                                type="button"
                                disabled={actionLoading === item.userId}
                                onClick={() => handleAction(item.userId, "setujui")}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
                              >
                                Setujui
                              </button>
                              <button
                                type="button"
                                disabled={actionLoading === item.userId}
                                onClick={() => {
                                  setSelectedItem(item)
                                  setShowTolakInput(true)
                                }}
                                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                              >
                                Tolak
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SEMUA MITRA INDUSTRI */}
        {activeTab === "semua" && (
          <div className="bg-white rounded-2xl border border-ink-150 p-5 shadow-xs space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-ink-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari perusahaan, PIC, atau email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-ink-150 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>

              <div className="shrink-0">
                <FilterDropdown
                  label="Status"
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                  options={[
                    { value: "all", label: "Semua", count: allMitra.length },
                    { value: "disetujui", label: "Disetujui", count: countDisetujui },
                    { value: "pending", label: "Menunggu", count: countPending },
                    { value: "ditolak", label: "Ditolak", count: countDitolak },
                  ]}
                />
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-ink-300 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs">Memuat direktori mitra...</span>
              </div>
            ) : filteredMitra.length === 0 ? (
              <EmptyState
                title="Tidak Ada Mitra Ditemukan"
                description="Sesuaikan kata kunci pencarian atau filter status Anda."
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-ink-150 bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-ink-100 border-b border-ink-150">
                        <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Perusahaan</th>
                        <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Kontak PIC</th>
                        <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Bidang</th>
                        <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Status</th>
                        <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink-150 bg-white">
                      {filteredMitra.map((mitra) => (
                        <tr key={mitra.userId} className="hover:bg-ink-100/50 transition-colors">
                          <td className="px-5 py-4">
                            <span className="font-semibold text-ink block text-sm leading-tight">
                              {mitra.namaPerusahaan}
                            </span>
                            {mitra.catatanVerifikasi && (
                              <span className="text-xs text-rose-600 block mt-0.5">
                                Alasan: {mitra.catatanVerifikasi}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-medium text-ink block text-sm">{mitra.namaKontak}</span>
                            <span className="text-xs text-ink-600 block font-mono mt-0.5">{mitra.email}</span>
                          </td>
                          <td className="px-5 py-4 text-ink-700 text-sm">
                            {mitra.bidang || "—"}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${
                                mitra.status === "disetujui"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : mitra.status === "ditolak"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {mitra.status === "disetujui" ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : mitra.status === "ditolak" ? (
                                <XCircle className="w-3.5 h-3.5" />
                              ) : (
                                <Clock className="w-3.5 h-3.5" />
                              )}
                              <span className="capitalize">{mitra.status}</span>
                            </span>
                          </td>
                          <td className="px-5 py-4 text-ink-600 text-sm">
                            {mitra.verifiedAt ? formatDate(mitra.verifiedAt) : formatDate(mitra.terdaftarPada)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODAL REVIEW DETAIL & AKSI */}
        {selectedItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
            onClick={(e) => e.target === e.currentTarget && setSelectedItem(null)}
          >
            <div className="w-full max-w-lg bg-white rounded-2xl border border-ink-150 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="px-6 pt-6 pb-4 border-b border-ink-150">
                <p className="text-[11px] font-bold text-ink-300 uppercase tracking-wider mb-1">
                  Detail Pengajuan Mitra BKK
                </p>
                <h2 className="font-heading text-lg font-bold text-ink">
                  {selectedItem.namaPerusahaan}
                </h2>
              </div>

              <div className="px-6 py-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-ink-300 block font-medium">Nama Kontak PIC</span>
                    <span className="font-semibold text-ink block mt-0.5">{selectedItem.namaKontak}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-ink-300 block font-medium">Email Terdaftar</span>
                    <span className="font-semibold text-ink block mt-0.5 font-mono truncate">
                      {selectedItem.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-ink-300 block font-medium">Bidang Industri</span>
                    <span className="font-semibold text-ink block mt-0.5">
                      {selectedItem.bidang || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-ink-300 block font-medium">Tanggal Registrasi</span>
                    <span className="font-semibold text-ink block mt-0.5">
                      {formatDate(selectedItem.terdaftarPada)}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-ink-300 block font-medium mb-1">Dokumen Legalitas</span>
                  {selectedItem.dokumenUrl ? (
                    <a
                      href={selectedItem.dokumenUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Lihat Berkas Dokumen (PDF / Foto)
                    </a>
                  ) : (
                    <span className="text-ink-300 italic">Tidak ada dokumen dilampirkan</span>
                  )}
                </div>

                {showTolakInput && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                    <label className="block text-xs font-bold text-rose-800">
                      Alasan Penolakan Pengajuan <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={catatanTolak}
                      onChange={(e) => setCatatanTolak(e.target.value)}
                      placeholder="Jelaskan alasan penolakan agar mitra dapat merevisi (minimal 10 karakter)..."
                      className="w-full p-2.5 rounded-lg border border-rose-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                    <div className="flex justify-between items-center text-[10px] text-rose-600">
                      <span>Wajib diisi untuk dikirimkan ke mitra</span>
                      <span>{catatanTolak.trim().length} / 10 karakter</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 pb-6 pt-2 flex items-center justify-end gap-2 border-t border-ink-150">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItem(null)
                    setShowTolakInput(false)
                    setCatatanTolak("")
                  }}
                  className="px-4 py-2 rounded-xl border border-ink-150 hover:bg-ink-100 text-ink-600 text-xs font-semibold transition cursor-pointer"
                >
                  Tutup
                </button>

                {!showTolakInput ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowTolakInput(true)}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition cursor-pointer"
                    >
                      Tolak Pengajuan
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading === selectedItem.userId}
                      onClick={() => handleAction(selectedItem.userId, "setujui")}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
                    >
                      Setujui Kemitraan
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={actionLoading === selectedItem.userId || catatanTolak.trim().length < 10}
                    onClick={() => handleAction(selectedItem.userId, "tolak", catatanTolak)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    Konfirmasi Tolak
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
