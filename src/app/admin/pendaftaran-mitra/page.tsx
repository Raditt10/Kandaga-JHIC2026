"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  UserPlus,
  Building2,
  FileCheck2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Eye,
  Plus,
  Loader2,
  AlertCircle,
  FileText,
  RefreshCw,
} from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"
import { EmptyState } from "@/components/ui/EmptyState"

type RegistrationItem = {
  userId: string
  namaKontak: string
  email: string
  namaPerusahaan: string
  bidang: string | null
  dokumenUrl: string | null
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

export default function AdminPendaftaranMitraPage() {
  const [items, setItems] = useState<RegistrationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Modal review
  const [selectedItem, setSelectedItem] = useState<RegistrationItem | null>(null)
  const [catatanTolak, setCatatanTolak] = useState("")
  const [showTolakInput, setShowTolakInput] = useState(false)

  const fetchQueue = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/bkk/verifikasi")
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

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
          message: action === "setujui" ? "Pendaftaran mitra berhasil disetujui!" : "Pendaftaran mitra ditolak.",
        })
        setSelectedItem(null)
        setShowTolakInput(false)
        setCatatanTolak("")
        await fetchQueue()
      } else {
        setNotification({ type: "error", message: result.error || "Gagal memproses pendaftaran." })
      }
    } catch {
      setNotification({ type: "error", message: "Terjadi kesalahan jaringan." })
    } finally {
      setActionLoading(null)
      setTimeout(() => setNotification(null), 4000)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-5 rounded-2xl bg-white border border-ink-150 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-lg font-bold text-ink flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              <span>Pendaftaran & Onboarding Mitra Industri</span>
            </h1>
            <p className="text-xs text-ink-600 mt-0.5">
              Kelola pengajuan akun perusahaan baru, verifikasi berkas legalitas, dan aktivasi kemitraan DUDI.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/mitra/daftar"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink-100 hover:bg-ink-150 text-ink-700 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0"
            >
              <span>Formulir Publik Mitra</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Notification */}
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

        {/* Step Guide Banner */}
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

        {/* Antrian Pendaftaran Masuk */}
        <div className="bg-white rounded-2xl border border-ink-150 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-sm font-bold text-ink flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Antrian Pendaftaran Mitra Masuk</span>
                {items.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {items.length} Baru
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-ink-300 mt-0.5">
                Tinjau berkas pendaftaran calon mitra industri baru sebelum memberikan akses sistem.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchQueue}
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
              <span className="text-xs">Memuat pengajuan mitra baru...</span>
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title="Tidak Ada Pendaftaran Tertunda"
              description="Semua pengajuan pendaftaran mitra industri baru telah selesai diproses."
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
                      <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Dokumen</th>
                      <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Terdaftar</th>
                      <th className="text-right px-5 py-3.5 font-semibold text-ink-700 font-heading pr-5">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-150 bg-white">
                    {items.map((item) => (
                      <tr key={item.userId} className="hover:bg-ink-100/50 transition-colors">
                        <td className="px-5 py-4">
                          <span className="font-semibold text-ink block text-sm leading-tight">
                            {item.namaPerusahaan}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 mt-1">
                            <Clock className="w-3 h-3" />
                            Menunggu Persetujuan
                          </span>
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
                              <span>Lihat Berkas</span>
                            </a>
                          ) : (
                            <span className="text-ink-600 italic text-xs">Tidak ada</span>
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
                              Detail
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

        {/* Modal Review */}
        {selectedItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
            onClick={(e) => e.target === e.currentTarget && setSelectedItem(null)}
          >
            <div className="w-full max-w-lg bg-white rounded-2xl border border-ink-150 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
              <div className="px-6 pt-6 pb-4 border-b border-ink-150">
                <p className="text-[11px] font-bold text-ink-300 uppercase tracking-wider mb-1">
                  Verifikasi Berkas Kemitraan
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
                    <span className="text-[11px] text-ink-300 block font-medium">Email Kontak</span>
                    <span className="font-semibold text-ink block mt-0.5 font-mono truncate">
                      {selectedItem.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-ink-300 block font-medium">Bidang Usaha</span>
                    <span className="font-semibold text-ink block mt-0.5">
                      {selectedItem.bidang || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-ink-300 block font-medium">Waktu Registrasi</span>
                    <span className="font-semibold text-ink block mt-0.5">
                      {formatDate(selectedItem.terdaftarPada)}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-ink-300 block font-medium mb-1">Berkas Dokumen Pendukung</span>
                  {selectedItem.dokumenUrl ? (
                    <a
                      href={selectedItem.dokumenUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Buka Dokumen Legalitas (PDF / Dokumen)
                    </a>
                  ) : (
                    <span className="text-ink-300 italic">Tidak ada dokumen diunggah</span>
                  )}
                </div>

                {showTolakInput && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                    <label className="block text-xs font-bold text-rose-800">
                      Alasan Penolakan Pendaftaran <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={catatanTolak}
                      onChange={(e) => setCatatanTolak(e.target.value)}
                      placeholder="Jelaskan alasan penolakan secara jelas untuk perusahaan (min. 10 karakter)..."
                      className="w-full p-2.5 rounded-lg border border-rose-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                    <div className="flex justify-between items-center text-[10px] text-rose-600">
                      <span>Wajib diisi</span>
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
                      Tolak
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
