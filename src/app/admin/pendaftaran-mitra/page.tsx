"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  Eye,
  Loader2,
  RefreshCw,
} from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"

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

/** Langkah alur approval rekrutmen PKL/magang. */
const approvalSteps = [
  {
    title: "Pengajuan Kuota",
    description:
      "Mitra mengajukan permohonan rekrutmen PKL/magang beserta rincian posisi dan jumlah kuota yang dibutuhkan.",
  },
  {
    title: "Verifikasi Berkas",
    description:
      "Admin atau Tim BKK memeriksa keabsahan berkas permohonan dan kesesuaian bidang dengan jurusan siswa.",
  },
  {
    title: "Approval Rekrutmen",
    description:
      "Permohonan disetujui atau ditolak; kuota rekrutmen dinyatakan terbuka setelah disetujui admin.",
  },
  {
    title: "Penempatan Siswa",
    description:
      "Siswa melamar pada kuota yang telah disetujui hingga proses penempatan PKL/magang selesai.",
  },
]
export default function AdminPendaftaranMitraPage() {
  const [items, setItems] = useState<RegistrationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadQueue = async (mode: "initial" | "manual" = "manual") => {
    if (mode === "manual") setRefreshing(true)
    try {
      const res = await fetch("/api/bkk/verifikasi")
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
    } catch (err) {
      console.error("Gagal memuat antrian approval rekrutmen:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const res = await fetch("/api/bkk/verifikasi")
        if (!active) return
        if (res.ok) {
          const data = await res.json()
          if (active) setItems(data.items || [])
        }
      } catch (err) {
        console.error("Gagal memuat antrian approval rekrutmen:", err)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <h1 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#891337]" />
            <span>Approval Rekrutmen PKL & Magang</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verifikasi dan setujui permohonan rekrutmen PKL/magang dari mitra industri sebelum kuota dibuka ke siswa.
          </p>
        </div>

        {/* Panduan Alur Approval */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-zinc-800 text-white shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-300">
              Alur Approval Rekrutmen PKL / Magang
            </h2>
            <span className="hidden sm:block text-[10px] font-medium text-slate-400">
              4 langkah verifikasi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
            {approvalSteps.map((step, index) => (
              <div
                key={step.title}
                className="h-full p-4 rounded-xl border border-white/10 bg-white/[0.04] transition-colors hover:border-white/20 hover:bg-white/[0.07]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 shrink-0 rounded-lg bg-[#891337] text-white text-[11px] font-bold flex items-center justify-center ring-1 ring-inset ring-white/20">
                    {index + 1}
                  </span>
                  <h3 className="text-[13px] font-bold leading-tight text-white">{step.title}</h3>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400 mt-2.5">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Antrian Approval Rekrutmen */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Antrian Approval Rekrutmen</span>
                {items.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {items.length} Baru
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tinjau permohonan rekrutmen PKL/magang dari mitra industri sebelum kuota dibuka ke siswa.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadQueue("manual")}
              disabled={refreshing}
              title="Segarkan antrian"
              aria-label="Segarkan antrian"
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-[#891337] hover:bg-[#891337]/5 hover:border-[#891337]/30 flex items-center justify-center transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#891337]" />
              <span className="text-xs">Memuat permohonan rekrutmen...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-bold text-slate-700">Tidak Ada Permohonan Tertunda</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Semua permohonan rekrutmen PKL/magang telah selesai diproses.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider">
                    <th className="pb-2.5 font-bold">PERUSAHAAN MITRA</th>
                    <th className="pb-2.5 font-bold">KONTAK PIC</th>
                    <th className="pb-2.5 font-bold">POSISI / BIDANG PKL</th>
                    <th className="pb-2.5 font-bold">BERKAS PERMOHONAN</th>
                    <th className="pb-2.5 font-bold">TANGGAL PENGAJUAN</th>
                    <th className="pb-2.5 font-bold text-right">AKSI APPROVAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.map((item) => (
                    <tr key={item.userId} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 pr-3">
                        <span className="font-bold text-slate-900 block leading-tight">
                          {item.namaPerusahaan}
                        </span>
                        <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
                          Menunggu Approval
                        </span>
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
                            <span>Lihat Berkas</span>
                          </a>
                        ) : (
                          <span className="text-slate-300 italic text-[11px]">Tidak ada berkas</span>
                        )}
                      </td>
                      <td className="py-3.5 pr-3 text-slate-500 font-mono text-[11px]">
                        {formatDate(item.terdaftarPada)}
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          href={`/admin/pendaftaran-mitra/${item.userId}`}
                          title="Buka halaman review permohonan"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
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

      </div>
    </AdminLayout>
  )
}
