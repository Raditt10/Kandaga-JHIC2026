"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Users,
  FileCheck2,
  ScrollText,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Heart,
  ArrowUpRight,
  Plus,
  MoreVertical,
} from "lucide-react"
import { usersDatabase } from "@/lib/users"
import { systemAuditLogs, projectShowcases, mentorsList } from "@/lib/adminData"
import AdminLayout from "@/components/admin/AdminLayout"

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-7 animate-in fade-in duration-200">
      {/* Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#6b1426] via-[#891337] to-[#a61743] text-white p-7 sm:p-9 relative overflow-hidden shadow-xl shadow-[#891337]/15">
        <div className="relative z-10 max-w-xl">
          <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-[10px] font-bold uppercase tracking-wider mb-3">
            PORTAL ADMINISTRATOR KANDAGA
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
            Kelola Portofolio Digital & Hak Akses SMKN 13
          </h1>
          <p className="text-rose-100 text-xs sm:text-sm mt-2 leading-relaxed opacity-90">
            Sebagai Superadministrator, Anda memiliki otoritas penuh untuk mengawasi kurasi karya, memvalidasi mitra, dan memantau status integritas sistem.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Link
              href="/admin/pengguna"
              className="bg-black/90 hover:bg-black text-white px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>Kelola Pengguna</span>
              <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-xs">
                →
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Row of 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/pengguna"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#891337] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">5 Akun Terdaftar</span>
              <span className="text-xs font-bold text-slate-800">Manajemen Multi-Role</span>
            </div>
          </div>
          <MoreVertical className="w-4 h-4 text-slate-300" />
        </Link>

        <Link
          href="/admin/moderasi"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">12 Proyek Masuk</span>
              <span className="text-xs font-bold text-slate-800">Moderasi Galeri</span>
            </div>
          </div>
          <MoreVertical className="w-4 h-4 text-slate-300" />
        </Link>

        <Link
          href="/admin/audit-log"
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">4 Log Aktivitas</span>
              <span className="text-xs font-bold text-slate-800">Audit & Keamanan</span>
            </div>
          </div>
          <MoreVertical className="w-4 h-4 text-slate-300" />
        </Link>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">94% Integritas</span>
              <span className="text-xs font-bold text-slate-800">Sistem & Server Aktif</span>
            </div>
          </div>
          <MoreVertical className="w-4 h-4 text-slate-300" />
        </div>
      </div>

      {/* Featured Cards: Karya Siswa Terkini */}
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
          {projectShowcases.map((proj) => (
            <div
              key={proj.id}
              className="group bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="relative h-32 w-full rounded-xl overflow-hidden bg-slate-100 mb-3">
                <Image
                  src={proj.image}
                  alt={proj.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {proj.category}
                </span>
                <button
                  type="button"
                  className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#891337] transition">
                {proj.title}
              </h3>

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
          ))}
        </div>
      </div>

      {/* Bottom Section: Ringkasan Pengguna Sistem (2 col) + Pengawas & Tim (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-sm sm:text-base font-extrabold text-slate-900">
              Daftar Pengguna Sistem
            </h2>
            <Link
              href="/admin/pengguna"
              className="text-xs font-bold text-[#891337] hover:underline cursor-pointer"
            >
              Lihat Semua ({usersDatabase.length})
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="pb-2.5 font-bold">PENGGUNA</th>
                  <th className="pb-2.5 font-bold">ROLE</th>
                  <th className="pb-2.5 font-bold">DESKRIPSI</th>
                  <th className="pb-2.5 font-bold text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {usersDatabase.slice(0, 4).map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                          {user.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{user.username}</span>
                          <span className="text-[11px] text-slate-400 block">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#891337]/10 text-[#891337] uppercase">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 text-[11px]">
                      {user.role === "admin" && "Superadmin & Kontrol Sistem"}
                      {user.role === "student" && "Siswa Portofolio & PKL"}
                      {user.role === "teacher" && "Kurator Karya & Penilai"}
                      {user.role === "company" && "Mitra Rekruter Industri"}
                      {user.role === "bkk" && "Bursa Kerja Khusus"}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href="/admin/pengguna"
                        className="w-7 h-7 rounded-full bg-slate-100 hover:bg-[#891337] hover:text-white text-slate-600 transition inline-flex items-center justify-center"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pengawas & Tim Panel */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-900">Pengawas & Tim</span>
              <button
                type="button"
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {mentorsList.map((mentor) => (
                <div key={mentor.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {mentor.initial}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">{mentor.name}</p>
                      <p className="text-[10px] text-slate-400">{mentor.role}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-full border border-slate-200 hover:border-[#891337] hover:text-[#891337] text-[10px] font-bold text-slate-600 transition cursor-pointer"
                  >
                    + Detail
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/admin/pengguna"
            className="w-full mt-6 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition text-center cursor-pointer block"
          >
            Lihat Semua Tim
          </Link>
        </div>
      </div>
    </div>
  </AdminLayout>
)
}
