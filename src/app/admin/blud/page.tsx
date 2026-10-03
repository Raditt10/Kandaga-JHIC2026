"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  Landmark,
  ExternalLink,
  Search,
} from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"

interface BludContract {
  id: string
  clientName: string
  serviceName: string
  jurusan: "RPL" | "TKJ" | "Analis Kimia"
  contractValue: string
  studentsInvolved: number
  mentor: string
  status: "Pengerjaan" | "Selesai" | "Menunggu SPK"
  startDate: string
}

export default function AdminBludPage() {
  const [filterJurusan, setFilterJurusan] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const bludServices = [
    {
      title: "Jasa Uji Baku Mutu Air & Sampel Kimia",
      jurusan: "Analis Kimia",
      desc: "Pengujian parameter COD, BOD, pH, dan logam berat bersertifikasi ISO 17025 untuk industri manufaktur & tekstil.",
      priceRange: "Mulai Rp 1.500.000 / batch",
      activeProjects: 5,
    },
    {
      title: "Pengembangan Web App & Sistem Informasi",
      jurusan: "RPL",
      desc: "Pembuatan aplikasi web kustom (Next.js, Laravel), portal pegawai, dashboard analitik, dan sistem absensi QR dinamis.",
      priceRange: "Mulai Rp 8.000.000 / sistem",
      activeProjects: 4,
    },
    {
      title: "Instalasi Jaringan Fiber Optic & Server",
      jurusan: "TKJ",
      desc: "Penataan kabel terstruktur, konfigurasi routerboard MikroTik, setup firewall keamanan, dan integrasi cloud VPS.",
      priceRange: "Mulai Rp 3.500.000 / titik",
      activeProjects: 3,
    },
  ]

  const contracts: BludContract[] = [
    {
      id: "CTR-2026-001",
      clientName: "PT Tirta Kencana Lestari",
      serviceName: "Uji Baku Mutu Air Limbah Industri (Batch 4)",
      jurusan: "Analis Kimia",
      contractValue: "Rp 12.500.000",
      studentsInvolved: 4,
      mentor: "Ahmad Hidayat, S.Pd.",
      status: "Pengerjaan",
      startDate: "28 Sep 2026",
    },
    {
      id: "CTR-2026-002",
      clientName: "CV Agro Inovasi Mandiri",
      serviceName: "Sistem Manajemen Inventaris & POS Berbasis Web",
      jurusan: "RPL",
      contractValue: "Rp 18.000.000",
      studentsInvolved: 5,
      mentor: "Dr. Budi Santoso",
      status: "Pengerjaan",
      startDate: "20 Sep 2026",
    },
    {
      id: "CTR-2026-003",
      clientName: "Klinik Medika Sehat",
      serviceName: "Instalasi Jaringan LAN & Keamanan Server Medis",
      jurusan: "TKJ",
      contractValue: "Rp 9.800.000",
      studentsInvolved: 3,
      mentor: "Leonardo Samsul",
      status: "Selesai",
      startDate: "12 Sep 2026",
    },
    {
      id: "CTR-2026-004",
      clientName: "PT Biofar Perkasa Nusantara",
      serviceName: "Analisis Uji Kadar Spektrofotometri Senyawa Organik",
      jurusan: "Analis Kimia",
      contractValue: "Rp 15.200.000",
      studentsInvolved: 4,
      mentor: "Siti Rahmawati, M.T.",
      status: "Menunggu SPK",
      startDate: "02 Okt 2026",
    },
  ]

  const filteredContracts = contracts.filter((c) => {
    const matchJurusan = filterJurusan === "all" ? true : c.jurusan === filterJurusan
    const matchSearch =
      c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchJurusan && matchSearch
  })

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2.5">
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#891337]/10 border border-[#891337]/15">
                <span className="absolute inset-0 rounded-xl bg-[#891337]/25 animate-blud-glow" aria-hidden="true" />
                <Landmark className="relative w-5 h-5 text-[#891337] animate-blud-pop" />
              </span>
              <span>Badan Layanan Umum Daerah (BLUD) & Teaching Factory</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Unit usaha komersial SMKN 13 Bandung untuk kerja sama jasa profesional dengan industri dan masyarakat.
            </p>
          </div>

          <Link
            href="/blud"
            target="_blank"
            title="Masuk ke portal BLUD"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0"
          >
            <span>Masuk BLUD</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Section: Layanan Komersial BLUD */}
        <div className="space-y-3">
          <h2 className="font-heading text-sm font-bold text-slate-900">
            Katalog Layanan Komersial Sekolah (Teaching Factory)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bludServices.map((svc) => (
              <div
                key={svc.title}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">
                      {svc.jurusan}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {svc.activeProjects} Proyek Aktif
                    </span>
                  </div>
                  <h3 className="font-heading text-sm font-bold text-slate-900 mb-2 leading-snug">
                    {svc.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">
                    {svc.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{svc.priceRange}</span>
                  <button
                    type="button"
                    onClick={() => alert(`Detail penawaran untuk ${svc.title}`)}
                    className="text-xs font-bold text-[#891337] hover:underline"
                  >
                    Brosur Jasa →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Daftar Kontrak & Transaksi Jasa BLUD */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-sm font-bold text-slate-900">
                Daftar Kontrak Kerja Sama BLUD Berjalan
              </h2>
              <p className="text-[11px] text-slate-400">
                Pencatatan Surat Perintah Kerja (SPK) dan realisasi pembayaran dari mitra industri.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kontrak / klien..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#891337]/15 focus:border-[#891337]"
                />
              </div>

              <select
                value={filterJurusan}
                onChange={(e) => setFilterJurusan(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#891337]/15"
              >
                <option value="all">Semua Bidang</option>
                <option value="RPL">RPL</option>
                <option value="TKJ">TKJ</option>
                <option value="Analis Kimia">Analis Kimia</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="pb-2.5 font-bold">KLIEN INDUSTRI & PROYEK</th>
                  <th className="pb-2.5 font-bold">BIDANG</th>
                  <th className="pb-2.5 font-bold">TIM & PEMBIMBING</th>
                  <th className="pb-2.5 font-bold">NILAI KONTRAK</th>
                  <th className="pb-2.5 font-bold">STATUS</th>
                  <th className="pb-2.5 font-bold text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredContracts.map((ctr) => (
                  <tr key={ctr.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 pr-3">
                      <span className="font-bold text-slate-900 block leading-tight">
                        {ctr.clientName}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {ctr.serviceName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                        No. SPK: {ctr.id} • Mulai: {ctr.startDate}
                      </span>
                    </td>
                    <td className="py-3.5 pr-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {ctr.jurusan}
                      </span>
                    </td>
                    <td className="py-3.5 pr-3">
                      <span className="font-semibold text-slate-800 block">
                        {ctr.studentsInvolved} Siswa Magang TEFA
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Pembimbing: {ctr.mentor}
                      </span>
                    </td>
                    <td className="py-3.5 pr-3 font-mono font-bold text-slate-900 text-xs">
                      {ctr.contractValue}
                    </td>
                    <td className="py-3.5 pr-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          ctr.status === "Selesai"
                            ? "bg-emerald-100 text-emerald-800"
                            : ctr.status === "Pengerjaan"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {ctr.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => alert(`Detail SPK ${ctr.id} - ${ctr.clientName}`)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                      >
                        Detail SPK
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
