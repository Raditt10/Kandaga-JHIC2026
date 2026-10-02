"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  FileCheck2,
  Clock,
  TrendingUp,
  Building2,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Heart,
  Users,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { projectShowcases, ProjectShowcase, recentIndustryPartners } from "@/lib/adminData"
import AdminLayout from "@/components/admin/AdminLayout"

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const adminName = session?.user?.username || session?.user?.name || "adit"

  return (
    <AdminLayout>
      <div className="space-y-7 animate-in fade-in duration-200">
        {/* Hero Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#6b1426] via-[#891337] to-[#a61743] text-white p-7 sm:p-9 relative overflow-hidden shadow-xl shadow-[#891337]/15">
          <div className="relative z-10 max-w-xl">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              Selamat Datang, <span className="capitalize text-[#fcd5e0]">{adminName}</span>
            </h1>
            <p className="text-rose-100 text-xs sm:text-sm mt-2 leading-relaxed opacity-90">
              Sebagai Administrator, Anda memiliki otoritas penuh untuk mengawasi kurasi karya, memvalidasi mitra, dan memantau status integritas sistem.
            </p>
          </div>
        </div>

        {/* Row of 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Karya Terverifikasi */}
          <Link
            href="/admin/moderasi"
            className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#891337]/30 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition" />
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight block">
                128
              </span>
              <span className="text-xs font-bold text-slate-700 block mt-1">
                Karya Terverifikasi
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Dari total 142 karya diunggah
              </span>
            </div>
          </Link>

          {/* Card 2: Karya Belum Terverifikasi */}
          <Link
            href="/admin/moderasi"
            className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#891337]/30 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <Clock className="w-5 h-5 text-amber-500" />
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition" />
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight block">
                14
              </span>
              <span className="text-xs font-bold text-slate-700 block mt-1">
                Belum Terverifikasi
              </span>
              <span className="text-[11px] text-amber-600 font-medium block mt-0.5">
                Memerlukan kurasi admin
              </span>
            </div>
          </Link>

          {/* Card 3: Tren Karya Terupload */}
          <Link
            href="/admin/trend-karya"
            className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#891337]/30 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <TrendingUp className="w-5 h-5 text-[#891337]" />
              <span className="inline-flex items-center text-xs font-bold text-emerald-600">
                +24.5%
              </span>
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight block">
                +38 Karya
              </span>
              <span className="text-xs font-bold text-slate-700 block mt-1">
                Tren Unggahan Karya
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Peningkatan bulan ini vs lalu
              </span>
            </div>
          </Link>

          {/* Card 4: Industri Bekerja Sama */}
          <Link
            href="/admin/bkk"
            className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#891337]/30 hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition" />
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight block">
                42 Industri
              </span>
              <span className="text-xs font-bold text-slate-700 block mt-1">
                Mitra Kerja Sama
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Kemitraan DUDI & BKK aktif
              </span>
            </div>
          </Link>
        </div>

        {/* Featured Cards: Karya Siswa Terkini (Grid 3 Kolom) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-sm sm:text-base font-extrabold text-slate-900">
              Karya & Portofolio Siswa Terkini
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-full bg-[#891337] text-white flex items-center justify-center transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projectShowcases.slice(0, 3).map((proj) => (
              <ProjectShowcaseCard key={proj.id} proj={proj} />
            ))}
          </div>
        </div>

        {/* Section: Mitra Industri Baru & Pengajuan Siswa PKL */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#891337]" />
                <span>Mitra Industri Baru & Pengajuan Siswa PKL</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Perusahaan yang baru menjalin kemitraan dengan sekolah dan membuka kuota penerimaan magang PKL.
              </p>
            </div>

            <Link
              href="/admin/bkk"
              className="text-xs font-bold text-[#891337] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Kelola di Menu BKK</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentIndustryPartners.map((partner) => (
              <div
                key={partner.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-[#891337]/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Header card: Avatar + Nama + Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#891337] font-extrabold text-xs flex items-center justify-center shrink-0 border border-slate-200/60 shadow-2xs">
                        {partner.initial}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                          {partner.name}
                        </h3>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {partner.field}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                      {partner.badge}
                    </span>
                  </div>

                  {/* Kuota & Jurusan */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        Kuota Pengajuan PKL:
                      </span>
                      <span className="text-xs font-extrabold text-[#891337]">
                        {partner.quotaSiswa} Siswa
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 pt-1.5 border-t border-slate-200/60">
                      <span className="text-[10px] text-slate-400 mr-1">Jurusan:</span>
                      {partner.targetJurusan.map((jur) => (
                        <span
                          key={jur}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-bold shadow-2xs"
                        >
                          {jur}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Posisi Yang Dibuka */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Posisi Dibuka:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {partner.positions.map((pos) => (
                        <span
                          key={pos}
                          className="text-[10px] font-medium text-slate-600 bg-white border border-slate-200/80 rounded-lg px-2 py-0.5"
                        >
                          {pos}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer card */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {partner.mouDate}
                  </span>
                  <Link
                    href="/admin/bkk"
                    className="text-xs font-bold text-[#891337] hover:underline flex items-center gap-1"
                  >
                    Detail Kemitraan
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function ProjectShowcaseCard({ proj }: { proj: ProjectShowcase }) {
  const [isHovered, setIsHovered] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const indexRef = useRef(0)

  useEffect(() => {
    if (isHovered) {
      setDisplayedText("")
      indexRef.current = 0
      const fullText = proj.description

      const typeNextChar = () => {
        if (indexRef.current < fullText.length) {
          indexRef.current += 1
          setDisplayedText(fullText.slice(0, indexRef.current))
          timerRef.current = setTimeout(typeNextChar, 18)
        }
      }

      timerRef.current = setTimeout(typeNextChar, 80)
    } else {
      if (timerRef.current) clearTimeout(timerRef.current)
      setDisplayedText("")
      indexRef.current = 0
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isHovered, proj.description])

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        <div className="relative h-32 w-full rounded-xl overflow-hidden bg-slate-100 mb-3">
          <Image
            src={proj.image}
            alt={proj.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-2.5 right-2.5 bg-white text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm tracking-wide">
            {proj.category}
          </span>
        </div>

        <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#891337] transition-colors min-h-[32px] flex items-center">
          {proj.title}
        </h3>

        {/* Deskripsi singkat dengan animasi mengetik halus */}
        <div className="h-10 mt-1 overflow-hidden flex items-start">
          <p className="text-[11px] text-slate-500 leading-relaxed font-sans line-clamp-2">
            {displayedText}
            {isHovered && (
              <span className="inline-block w-0.5 h-3 bg-[#891337] ml-0.5 align-middle animate-pulse" />
            )}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#891337]/10 text-[#891337] font-bold text-[9px] flex items-center justify-center">
            {proj.author.slice(0, 1)}
          </div>
          <div>
            <span className="font-semibold text-slate-800 block leading-tight">{proj.author}</span>
            <span className="text-[9px] text-slate-400 block">{proj.authorRole}</span>
          </div>
        </div>
        <span className="text-slate-400 font-mono text-[10px]">❤️ {proj.likes}</span>
      </div>
    </div>
  )
}
