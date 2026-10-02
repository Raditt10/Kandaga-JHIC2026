"use client";

import React, { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import { useSession } from "next-auth/react";
import { usersDatabase } from "@/lib/users";
import {
  ShieldCheck,
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  Briefcase,
  Search,
  ExternalLink,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");

  const adminName = session?.user?.username || session?.user?.name || "Administrator";

  const studentCount = usersDatabase.filter((u) => u.role === "student").length;
  const teacherCount = usersDatabase.filter((u) => u.role === "teacher").length;
  const companyCount = usersDatabase.filter((u) => u.role === "company").length;
  const bkkCount = usersDatabase.filter((u) => u.role === "bkk").length;

  const filteredUsers = usersDatabase.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      selectedRoleFilter === "all" || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return {
          label: "Admin Sekolah",
          style: "bg-rose-50 text-primary border-primary/20",
        };
      case "teacher":
        return {
          label: "Guru Kurator",
          style: "bg-amber-50 text-amber-900 border-amber-300",
        };
      case "company":
        return {
          label: "Mitra Industri",
          style: "bg-blue-50 text-blue-900 border-blue-200",
        };
      case "bkk":
        return {
          label: "Koordinator BKK",
          style: "bg-emerald-50 text-emerald-900 border-emerald-300",
        };
      case "student":
      default:
        return {
          label: "Siswa",
          style: "bg-cream text-ink-700 border-ink-150",
        };
    }
  };

  return (
    <DashboardLayout
      roleTitle="Administrator"
      roleSlug="admin"
      icon={ShieldCheck}
      pageTitle="Tata Kelola"
    >
      {/* ── Welcome Banner (Kandaga School Governance) ── */}
      <section aria-labelledby="admin-welcome-heading" className="mb-8 rounded-3xl bg-primary text-white p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-accent text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>Tata Kelola Institusional SMKN 13 Bandung</span>
          </div>

          <h1 id="admin-welcome-heading" className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Pusat Kendali Administrasi
          </h1>
          <p className="text-white/80 text-sm sm:text-base mt-2 leading-relaxed">
            Kelola otentikasi pengguna, pantau distribusi akun lintas 3 kompetensi keahlian (Analis Kimia, TKJ, RPL), dan pastikan integritas alur verifikasi karya siswa bersama BKK.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-white/90">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Sesi Administrator Aktif: <strong className="font-mono text-white">{adminName}</strong></span>
            </div>
            <span className="hidden sm:inline text-white/30">|</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span>Standar Kebijakan Sekolah Terverifikasi</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Institutional Governance Metrics ── */}
      <section aria-labelledby="admin-metrics-heading" className="mb-8">
        <h2 id="admin-metrics-heading" className="sr-only">
          Statistik Tata Kelola Pengguna
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Siswa */}
          <div className="rounded-2xl border border-ink-150 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-ink-600">Siswa Terdaftar</span>
              <div className="w-8 h-8 rounded-lg bg-cream text-primary flex items-center justify-center">
                <GraduationCap className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>
            <p className="font-heading text-2xl font-extrabold text-ink">{studentCount}</p>
            <p className="text-xs text-ink-600 mt-1">3 Kompetensi Keahlian</p>
          </div>

          {/* Guru Kurator */}
          <div className="rounded-2xl border border-ink-150 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-ink-600">Guru Pembimbing</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
                <BookOpen className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>
            <p className="font-heading text-2xl font-extrabold text-ink">{teacherCount}</p>
            <p className="text-xs text-ink-600 mt-1">Tim Kurator Sekolah</p>
          </div>

          {/* Mitra Perusahaan */}
          <div className="rounded-2xl border border-ink-150 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-ink-600">Mitra Industri (DUDI)</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
                <Building2 className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>
            <p className="font-heading text-2xl font-extrabold text-ink">{companyCount}</p>
            <p className="text-xs text-ink-600 mt-1">Terhubung Melalui BKK</p>
          </div>

          {/* Koordinator BKK */}
          <div className="rounded-2xl border border-ink-150 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-ink-600">Koordinator BKK</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <Briefcase className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>
            <p className="font-heading text-2xl font-extrabold text-ink">{bkkCount}</p>
            <p className="text-xs text-ink-600 mt-1">Penyaring Minat Kerja</p>
          </div>
        </div>
      </section>

      {/* ── User Accounts Governance Table ── */}
      <section aria-labelledby="user-table-heading" className="rounded-2xl border border-ink-150 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-ink-150">
          <div>
            <h2 id="user-table-heading" className="font-heading text-base font-bold text-ink">
              Daftar Pengguna & Hak Akses Sistem
            </h2>
            <p className="text-xs text-ink-600 mt-0.5">
              Distribusi seluruh akun pengguna resmi yang terdaftar pada platform Kandaga SMKN 13.
            </p>
          </div>

          {/* Controls: Search and Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-ink-150 text-xs text-ink focus:outline-hidden focus:border-primary w-48 sm:w-56"
              />
            </div>

            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-ink-150 text-xs text-ink focus:outline-hidden focus:border-primary bg-white cursor-pointer"
            >
              <option value="all">Semua Peran</option>
              <option value="student">Siswa</option>
              <option value="teacher">Guru Kurator</option>
              <option value="company">Mitra Industri</option>
              <option value="bkk">Koordinator BKK</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-ink-150 text-ink-500 font-semibold uppercase tracking-wider">
                <th className="pb-3 px-3">No</th>
                <th className="pb-3 px-3">Pengguna</th>
                <th className="pb-3 px-3">Alamat Email</th>
                <th className="pb-3 px-3">Peran (Role)</th>
                <th className="pb-3 px-3">Tautan Portal Akses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-150">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-ink-600">
                    Tidak ditemukan pengguna yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => {
                  const roleBadge = getRoleBadge(u.role);
                  return (
                    <tr key={u.id} className="hover:bg-cream/40 transition-colors">
                      <td className="py-3 px-3 text-ink-400 font-mono font-medium">{idx + 1}</td>
                      <td className="py-3 px-3 font-semibold text-ink">{u.username}</td>
                      <td className="py-3 px-3 text-ink-600 font-mono">{u.email}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadge.style}`}>
                          {roleBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <Link
                          href={`/${u.role}`}
                          className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-primary hover:underline"
                        >
                          <span>/{u.role}</span>
                          <ExternalLink className="w-3 h-3 text-ink-400" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  );
}
