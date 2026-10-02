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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Menunggu Verifikasi</span>
              <span className="text-xl font-extrabold text-amber-600 block mt-0.5">
                {countPending}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Mitra Disetujui</span>
              <span className="text-xl font-extrabold text-emerald-600 block mt-0.5">
                {countDisetujui}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Pengajuan Ditolak</span>
              <span className="text-xl font-extrabold text-rose-600 block mt-0.5">
                {countDitolak}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Total Mitra DUDI</span>
              <span className="text-xl font-extrabold text-slate-900 block mt-0.5">
                {countTotal || countPending + countDisetujui + countDitolak}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("antrian")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "antrian"
                ? "bg-[#891337] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Antrian Verifikasi Mitra</span>
            {countPending > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
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
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
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
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedItem(item)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 inline mr-1" />
                              Review
                            </button>
                            <button
                              type="button"
                              disabled={actionLoading === item.userId}
                              onClick={() => handleAction(item.userId, "setujui")}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition cursor-pointer disabled:opacity-50"
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
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition cursor-pointer disabled:opacity-50"
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

        {/* MODAL REVIEW DETAIL & AKSI */}
        {selectedItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
            onClick={(e) => e.target === e.currentTarget && setSelectedItem(null)}
          >
            <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Detail Pengajuan Mitra BKK
                </p>
                <h2 className="font-heading text-lg font-bold text-slate-900">
                  {selectedItem.namaPerusahaan}
                </h2>
              </div>

              <div className="px-6 py-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Nama Kontak PIC</span>
                    <span className="font-semibold text-slate-800 block mt-0.5">{selectedItem.namaKontak}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Email Terdaftar</span>
                    <span className="font-semibold text-slate-800 block mt-0.5 font-mono truncate">
                      {selectedItem.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Bidang Industri</span>
                    <span className="font-semibold text-slate-800 block mt-0.5">
                      {selectedItem.bidang || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Tanggal Registrasi</span>
                    <span className="font-semibold text-slate-800 block mt-0.5">
                      {formatDate(selectedItem.terdaftarPada)}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block font-medium mb-1">Dokumen Legalitas</span>
                  {selectedItem.dokumenUrl ? (
                    <a
                      href={selectedItem.dokumenUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#891337] hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Lihat Berkas Dokumen (PDF / Foto)
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Tidak ada dokumen dilampirkan</span>
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

              <div className="px-6 pb-6 pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItem(null)
                    setShowTolakInput(false)
                    setCatatanTolak("")
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition cursor-pointer"
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
