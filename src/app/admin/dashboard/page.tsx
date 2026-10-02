"use client"

import React, { useState } from "react"
import DashboardLayout, { DashboardTab } from "@/components/DashboardLayout"
import { useSession } from "next-auth/react"
import { usersDatabase } from "@/lib/users"
import {
  ShieldCheck,
  Users,
  Shield,
  Lock,
  UserCheck,
  Server,
  LayoutDashboard,
  FileCheck2,
  ScrollText,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus
} from "lucide-react"

// Mock Audit Log Sistem
const systemAuditLogs = [
  {
    id: "log-1",
    timestamp: "02 Okt 2026, 15:20 WIB",
    user: "admin.kandaga",
    action: "ROLE_ASSIGNMENT",
    detail: "Menetapkan peran BKK kepada pengguna bkk.smkn13",
    status: "SUCCESS",
  },
  {
    id: "log-2",
    timestamp: "02 Okt 2026, 14:45 WIB",
    user: "guru.pembimbing",
    action: "CURATION_APPROVAL",
    detail: "Menyetujui proyek 'EduClass — LMS & Presensi QR' ke Galeri Utama",
    status: "SUCCESS",
  },
  {
    id: "log-3",
    timestamp: "02 Okt 2026, 11:10 WIB",
    user: "pt.mitra-industri",
    action: "INTERNSHIP_POSTED",
    detail: "Membuka lowongan magang PKL 'Junior Frontend Engineer'",
    status: "SUCCESS",
  },
  {
    id: "log-4",
    timestamp: "01 Okt 2026, 21:05 WIB",
    user: "siswa.smkn13",
    action: "PROJECT_SUBMISSION",
    detail: "Mengunggah proyek tugas akhir baru ke antrean kurasi",
    status: "SUCCESS",
  },
]

export default function AdminDashboardPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [usersList, setUsersList] = useState(usersDatabase)
  const [userSearch, setUserSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const adminTabs: DashboardTab[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "users",
      label: "Manajemen Pengguna",
      icon: Users,
      badge: `${usersList.length}`,
    },
    {
      id: "kurasi",
      label: "Moderasi Galeri",
      icon: FileCheck2,
    },
    {
      id: "audit-log",
      label: "Audit Log & Keamanan",
      icon: ScrollText,
      badge: `${systemAuditLogs.length}`,
    },
  ]

  const filteredUsers = usersList.filter((u) => {
    const matchRole = roleFilter === "all" ? true : u.role === roleFilter
    const matchSearch =
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    return matchRole && matchSearch
  })

  return (
    <DashboardLayout
      roleTitle="Administrator Portal"
      roleSlug="admin"
      badgeColor="from-[#891337] to-[#a61743]"
      icon={ShieldCheck}
      tabs={adminTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* ──────────────── TAB 1: DASHBOARD ADMIN ──────────────── */}
      {activeTab === "dashboard" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Header Welcome Card */}
          <div className="bg-gradient-to-r from-zinc-950 via-[#4e0e20] to-[#891337] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-rose-200 text-xs font-semibold mb-3">
                <Server className="w-3.5 h-3.5" />
                <span>Sistem Manajemen & Kontrol Hak Akses Kandaga</span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Portal Administrator 🛡️
              </h1>
              <p className="font-sans text-zinc-300 text-sm max-w-[65ch] mt-2 leading-relaxed">
                Sebagai Administrator, Anda memiliki otoritas penuh untuk mengelola pengguna, menetapkan 5 jenis peran (Student, Teacher, Company, Admin, BKK), dan mengawasi integritas keamanan sistem.
              </p>

              {/* User Session Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/15 text-xs">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-rose-200 block text-xs font-medium">Admin Active User</span>
                  <span className="font-mono font-bold text-white text-sm mt-0.5 block">{session?.user?.username || "admin.kandaga"}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-rose-200 block text-xs font-medium">Email Terdaftar</span>
                  <span className="font-mono font-bold text-white text-sm mt-0.5 block truncate">{session?.user?.email || "admin@smkn13bandung.sch.id"}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                  <span className="text-rose-200 block text-xs font-medium">Tingkat Otoritas</span>
                  <span className="font-bold text-emerald-400 text-sm mt-0.5 block">SUPERADMINISTRATOR</span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin System Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-zinc-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Pengguna</span>
                <Users className="w-4 h-4 text-[#8B1A2F]" />
              </div>
              <p className="font-heading text-3xl font-extrabold text-zinc-900">{usersList.length}</p>
              <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">● Akun Terdata di Sistem</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-zinc-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">5 Multi Roles</span>
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <p className="font-heading text-3xl font-extrabold text-zinc-900">5 Role</p>
              <span className="text-xs text-zinc-500 font-medium mt-1 inline-block">Student, Teacher, Co, BKK, Admin</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-zinc-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">RBAC Proxy</span>
                <Lock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="font-heading text-3xl font-extrabold text-emerald-600">Aktif & Strict</p>
              <span className="text-xs text-zinc-500 font-medium mt-1 inline-block">Proteksi Rute /[role]</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-zinc-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Database Health</span>
                <UserCheck className="w-4 h-4 text-purple-600" />
              </div>
              <p className="font-heading text-3xl font-extrabold text-zinc-900">PostgreSQL</p>
              <span className="text-xs text-emerald-700 font-medium mt-1 inline-block">Ekstensi citext & pgcrypto siap</span>
            </div>
          </div>

          {/* Quick Preview Table */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-zinc-900">Daftar Pengguna Aktif</h2>
                <p className="text-xs text-zinc-500 max-w-[65ch]">Ringkasan akun yang terdaftar dalam sistem autentikasi multi-role.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("users")}
                className="text-xs font-bold text-[#8B1A2F] hover:underline cursor-pointer"
              >
                Kelola Semua Pengguna ({usersList.length})
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 px-3">Username</th>
                    <th className="pb-3 px-3">Email</th>
                    <th className="pb-3 px-3">Role Assigned</th>
                    <th className="pb-3 px-3">Akses Rute</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-mono">
                  {usersList.slice(0, 4).map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50 transition">
                      <td className="py-3 px-3 font-bold text-zinc-900">{u.username}</td>
                      <td className="py-3 px-3 text-zinc-600">{u.email}</td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase font-sans bg-zinc-100 text-zinc-800">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-sans text-zinc-500 text-[11px]">
                        /{u.role}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 2: MANAJEMEN PENGGUNA ──────────────── */}
      {activeTab === "users" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs">
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-zinc-900">
                Manajemen Pengguna & Penugasan Peran
              </h1>
              <p className="font-sans text-xs sm:text-sm text-zinc-500 mt-1 max-w-[65ch]">
                Kelola hak akses pengguna untuk 5 peran sistem (Student, Teacher, Company, Admin, BKK) sesuai kebijakan RBAC Kandaga.
              </p>
            </div>
            <button
              type="button"
              onClick={() => alert("Formulir penambahan pengguna baru")}
              className="px-4 py-2 bg-[#8B1A2F] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#701026] transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah User Baru</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-zinc-200/80 shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari username atau email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#8B1A2F]"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {[
                { id: "all", label: "Semua Role" },
                { id: "student", label: "Student" },
                { id: "teacher", label: "Teacher" },
                { id: "company", label: "Company" },
                { id: "bkk", label: "BKK" },
                { id: "admin", label: "Admin" },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRoleFilter(r.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    roleFilter === r.id
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-3">No</th>
                  <th className="pb-3 px-3">Username</th>
                  <th className="pb-3 px-3">Email Terdaftar</th>
                  <th className="pb-3 px-3">Role Assigned</th>
                  <th className="pb-3 px-3">Status Akses</th>
                  <th className="pb-3 px-3">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-mono">
                {filteredUsers.map((u, idx) => (
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
                    <td className="py-3 px-3 font-sans text-emerald-600 font-semibold text-[11px]">
                      Aktif (Allowed)
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <button
                        type="button"
                        onClick={() => alert(`Ubah peran atau reset password untuk ${u.username}`)}
                        className="text-[#8B1A2F] font-bold hover:underline cursor-pointer"
                      >
                        Ubah Akses
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 3: MODERASI GALERI ──────────────── */}
      {activeTab === "kurasi" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-zinc-900">
              Moderasi & Pengawasan Galeri Utama
            </h1>
            <p className="font-sans text-xs sm:text-sm text-zinc-500 mt-1 max-w-[65ch]">
              Monitoring karya yang tayang di galeri publik dari jurusan Rekayasa Perangkat Lunak, Teknik Komputer Jaringan, dan Analis Kimia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs space-y-2">
              <span className="text-xs font-bold text-rose-700 uppercase">Rekayasa Perangkat Lunak</span>
              <p className="font-heading text-3xl font-extrabold text-zinc-900">42 Karya</p>
              <p className="text-xs text-zinc-500">Tayang di Galeri Publik • Terkurasi Guru Pembimbing</p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs space-y-2">
              <span className="text-xs font-bold text-blue-700 uppercase">Teknik Komputer Jaringan</span>
              <p className="font-heading text-3xl font-extrabold text-zinc-900">38 Karya</p>
              <p className="text-xs text-zinc-500">Tayang di Galeri Publik • Terkurasi Guru Pembimbing</p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs space-y-2">
              <span className="text-xs font-bold text-emerald-700 uppercase">Analis Kimia</span>
              <p className="font-heading text-3xl font-extrabold text-zinc-900">45 Karya</p>
              <p className="text-xs text-zinc-500">Tayang di Galeri Publik • Standar Laboratorium ISO</p>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── TAB 4: AUDIT LOG ──────────────── */}
      {activeTab === "audit-log" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-white rounded-3xl border border-zinc-200/90 shadow-xs">
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-zinc-900">
              Audit Log & Aktivitas Keamanan Sistem
            </h1>
            <p className="font-sans text-xs sm:text-sm text-zinc-500 mt-1 max-w-[65ch]">
              Pencatatan riwayat aktivitas penting dalam sistem (perubahan role, kurasi karya, dan posting lowongan) untuk integritas audit.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 shadow-xs space-y-3">
            {systemAuditLogs.map((log) => (
              <div key={log.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-zinc-400">{log.timestamp}</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 font-mono font-bold text-[11px]">
                      {log.action}
                    </span>
                  </div>
                  <p className="font-semibold text-zinc-900">{log.detail}</p>
                  <p className="text-zinc-500">Inisiator: <strong className="font-mono">{log.user}</strong></p>
                </div>

                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md font-bold text-[11px] self-start sm:self-center">
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
