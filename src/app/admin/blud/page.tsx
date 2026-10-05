"use client"

import React, { useState } from "react"
import { Landmark, Plus, Search } from "lucide-react"
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
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      title: "Pengembangan Web App & Sistem Informasi",
      jurusan: "RPL",
      desc: "Pembuatan aplikasi web kustom (Next.js, Laravel), portal pegawai, dashboard analitik, dan sistem absensi QR dinamis.",
      priceRange: "Mulai Rp 8.000.000 / sistem",
      activeProjects: 4,
      color: "bg-rose-50 text-primary border-rose-200",
    },
    {
      title: "Instalasi Jaringan Fiber Optic & Server",
      jurusan: "TKJ",
      desc: "Penataan kabel terstruktur, konfigurasi routerboard MikroTik, setup firewall keamanan, dan integrasi cloud VPS.",
      priceRange: "Mulai Rp 3.500.000 / titik",
      activeProjects: 3,
      color: "bg-blue-50 text-blue-700 border-blue-200",
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
        <div className="p-5 rounded-2xl bg-white border border-ink-150 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-lg font-bold text-ink flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary" />
              <span>Badan Layanan Umum Daerah (BLUD) & Teaching Factory</span>
            </h1>
            <p className="text-xs text-ink-600 mt-0.5">
              Unit usaha komersial SMKN 13 Bandung untuk kerja sama jasa profesional dengan industri dan masyarakat.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert("Form pendaftaran proyek jasa BLUD baru")}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kontrak Layanan</span>
            </button>
          </div>
        </div>


        {/* Section: Layanan Komersial BLUD */}
        <div className="space-y-3">
          <h2 className="font-heading text-sm font-bold text-ink">
            Katalog Layanan Komersial Sekolah (Teaching Factory)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bludServices.map((svc) => (
              <div
                key={svc.title}
                className="p-5 rounded-2xl bg-white border border-ink-150 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${svc.color}`}>
                      {svc.jurusan}
                    </span>
                    <span className="text-[11px] font-bold text-ink-600">
                      {svc.activeProjects} Proyek Aktif
                    </span>
                  </div>
                  <h3 className="font-heading text-sm font-bold text-ink mb-2 leading-snug">
                    {svc.title}
                  </h3>
                  <p className="text-xs text-ink-600 leading-relaxed mb-4">
                    {svc.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-ink-150 flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">{svc.priceRange}</span>
                  <button
                    type="button"
                    onClick={() => alert(`Detail penawaran untuk ${svc.title}`)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Brosur Jasa →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Daftar Kontrak & Transaksi Jasa BLUD */}
        <div className="bg-white rounded-2xl border border-ink-150 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-sm font-bold text-ink">
                Daftar Kontrak Kerja Sama BLUD Berjalan
              </h2>
              <p className="text-[11px] text-ink-300">
                Pencatatan Surat Perintah Kerja (SPK) dan realisasi pembayaran dari mitra industri.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-ink-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kontrak / klien..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-ink-150 text-xs bg-ink-100 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                />
              </div>

              <select
                value={filterJurusan}
                onChange={(e) => setFilterJurusan(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-xl border border-ink-150 bg-white text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary/15"
              >
                <option value="all">Semua Bidang</option>
                <option value="RPL">RPL</option>
                <option value="TKJ">TKJ</option>
                <option value="Analis Kimia">Analis Kimia</option>
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-ink-150 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-ink-100 border-b border-ink-150">
                    <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Klien Industri &amp; Proyek</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Bidang</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Tim &amp; Pembimbing</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Nilai Kontrak</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-ink-700 font-heading">Status</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-ink-700 font-heading pr-5">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-150 bg-white">
                  {filteredContracts.map((ctr) => (
                    <tr key={ctr.id} className="hover:bg-ink-100/50 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-semibold text-ink block text-sm leading-tight">
                          {ctr.clientName}
                        </span>
                        <span className="text-xs text-ink-600 block mt-0.5">
                          {ctr.serviceName}
                        </span>
                        <span className="text-xs text-ink-300 font-mono mt-0.5 block">
                          No. SPK: {ctr.id} • Mulai: {ctr.startDate}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                          {ctr.jurusan}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <span className="font-medium text-ink block">
                          {ctr.studentsInvolved} Siswa Magang TEFA
                        </span>
                        <span className="text-xs text-ink-600 block mt-0.5">
                          Pembimbing: {ctr.mentor}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-ink text-sm">
                        {ctr.contractValue}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${
                            ctr.status === "Selesai"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : ctr.status === "Pengerjaan"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {ctr.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right pr-5">
                        <button
                          type="button"
                          onClick={() => alert(`Detail SPK ${ctr.id} - ${ctr.clientName}`)}
                          className="px-3 py-1.5 rounded-xl border border-ink-150 hover:bg-ink-100 text-ink text-xs font-semibold transition cursor-pointer"
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
      </div>
    </AdminLayout>
  )
}
