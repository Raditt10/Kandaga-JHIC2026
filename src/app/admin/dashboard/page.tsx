"use client"

import React from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { useSession } from "next-auth/react"
import { usersDatabase } from "@/lib/users"
import {
  ShieldCheck,
  Users,
  Shield,
  Lock,
  UserCheck,
  Server,
} from "lucide-react"

export default function AdminDashboardPage() {
  const { data: session } = useSession()

  return (
    <DashboardLayout
      roleTitle="Administrator Portal"
      roleSlug="admin"
      badgeColor="from-[#891337] to-[#a61743]"
      icon={ShieldCheck}
    >
      {/* Header Welcome Card */}
      <div className="bg-gradient-to-r from-zinc-950 via-[#4e0e20] to-[#891337] rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-rose-200 text-xs font-bold mb-3">
            <Server className="w-3.5 h-3.5" />
            <span>Sistem Manajemen & Kontrol Hak Akses Kandaga</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Portal Administrator 🛡️
          </h1>
          <p className="text-zinc-300 text-xs sm:text-sm max-w-2xl mt-2 leading-relaxed">
            Sebagai Administrator, Anda memiliki otoritas penuh untuk mengelola pengguna, menetapkan 5 jenis peran (Role), serta mengkonfigurasi kebijakan keamanan.
          </p>

          {/* User Session Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/15 text-xs">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-rose-200 block text-[11px] font-medium">Admin Active User</span>
              <span className="font-mono font-bold text-white text-sm">{session?.user?.username || "-"}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-rose-200 block text-[11px] font-medium">Email Terdaftar</span>
              <span className="font-mono font-bold text-white text-sm">{session?.user?.email || "-"}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <span className="text-rose-200 block text-[11px] font-medium">Otoritas System</span>
              <span className="font-mono font-bold text-emerald-400 text-sm uppercase">FULL CONTROL ADMIN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin System Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-500 uppercase">Total User Terdaftar</span>
            <Users className="w-4 h-4 text-[#90133b]" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900">{usersDatabase.length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">● Real-time Memory Storage</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-500 uppercase">5 Multi Roles</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900">5 Roles Active</p>
          <span className="text-[11px] text-zinc-500 font-medium mt-1 inline-block">Students, Admin, Company, Teacher, BKK</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-500 uppercase">RBAC Middleware</span>
            <Lock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">Aktif & Strict</p>
          <span className="text-[11px] text-zinc-500 font-medium mt-1 inline-block">Proteksi Rute /[role]/dashboard</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-500 uppercase">Non-Nullable Fields</span>
            <UserCheck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-900">4 Fields Mandatory</p>
          <span className="text-[11px] text-zinc-500 font-medium mt-1 inline-block">username, email, password, role</span>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-zinc-900">Daftar Pengguna Sistem (5 Roles)</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Setiap pengguna terikat dengan 4 field utama non-nullable.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">No</th>
                <th className="pb-3 px-3">Username (Non-Nullable)</th>
                <th className="pb-3 px-3">Email (Non-Nullable)</th>
                <th className="pb-3 px-3">Role Assigned (Non-Nullable)</th>
                <th className="pb-3 px-3">Status Akses Halaman</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-mono">
              {usersDatabase.map((u, idx) => (
                <tr key={u.id} className="hover:bg-zinc-50 transition">
                  <td className="py-3 px-3 text-zinc-400 font-bold">{idx + 1}</td>
                  <td className="py-3 px-3 font-bold text-zinc-900">{u.username}</td>
                  <td className="py-3 px-3 text-zinc-600">{u.email}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase font-sans ${
                        u.role === "admin"
                          ? "bg-rose-100 text-rose-800"
                          : u.role === "company"
                          ? "bg-blue-100 text-blue-800"
                          : u.role === "teacher"
                          ? "bg-amber-100 text-amber-800"
                          : u.role === "bkk"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-zinc-500 font-sans text-[11px]">
                    Hanya dapat mengakses <code className="text-[#90133b] font-bold">/{u.role}/dashboard</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}
