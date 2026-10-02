"use client"

import React from "react"
import Link from "next/link"
import { Briefcase, Building2, ExternalLink, Users } from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"

function AdminBkkContent() {
  const stats = [
    { label: "Mitra Industri Aktif", val: "18 Perusahaan", icon: Building2, color: "text-blue-600 bg-blue-50" },
    { label: "Lowongan PKL Tersedia", val: "24 Posisi", icon: Briefcase, color: "text-emerald-600 bg-emerald-50" },
    { label: "Siswa Terhubung", val: "142 Siswa", icon: Users, color: "text-purple-600 bg-purple-50" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Bursa Kerja Khusus (BKK) & Kemitraan Industri</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pusat koordinasi rekrutmen magang PKL dan penyaluran kerja alumni SMKN 13 Bandung.
          </p>
        </div>

        <Link
          href="/bkk"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#891337] hover:bg-[#72102e] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
        >
          <span>Buka Portal Publik BKK</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${s.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">{s.label}</span>
                <span className="text-base font-extrabold text-slate-900 block mt-0.5">{s.val}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Action Banner Card */}
      <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#891337] flex items-center justify-center mx-auto mb-2">
          <Briefcase className="w-7 h-7" />
        </div>
        <h2 className="font-heading font-extrabold text-base text-slate-900">
          Kemitraan DUDI & Penyaluran Karir
        </h2>
        <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
          Kelola verifikasi profil perusahaan mitra, buka lowongan magang atau rekrutmen kerja, dan pantau status penerimaan siswa SMK Negeri 13 Bandung.
        </p>

        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/bkk"
            className="px-5 py-2.5 bg-[#891337] hover:bg-[#72102e] text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span>Masuk ke Manajemen BKK</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AdminBkkPage() {
  return (
    <AdminLayout>
      <AdminBkkContent />
    </AdminLayout>
  )
}
