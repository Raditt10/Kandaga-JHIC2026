"use client"

/**
 * AdminLayout — chrome dashboard Administrator.
 *
 * Seluruh struktur visual admin (sidebar terang yang bisa dilipat, header
 * pencarian, kartu identitas pengguna, token Kandaga `ink` + `primary`) ada di
 * `DashboardShell` supaya dipakai bersama dashboard Siswa, Guru, Perusahaan,
 * dan BKK. File ini hanya mendefinisikan DAFTAR MENU khas administrator.
 *
 * Daftar menu diselaraskan dengan hasil merge branch `admin-section`:
 * halaman Audit Log dihapus di sana dan digantikan halaman Pengaturan,
 * ditambah Trend Karya, BLUD, dan Pendaftaran Mitra.
 */

import React from "react"
import {
  Briefcase,
  FileCheck2,
  Landmark,
  LayoutDashboard,
  Settings,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react"
import DashboardShell, {
  type ShellNavItem,
} from "@/components/dashboard/DashboardShell"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navItems: ShellNavItem[] = [
    {
      key: "dashboard",
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      key: "pengguna",
      label: "Kelola Pengguna",
      href: "/admin/pengguna",
      icon: Users,
    },
    {
      key: "moderasi",
      label: "Kurasi Karya",
      href: "/admin/moderasi",
      icon: FileCheck2,
    },
    {
      key: "trend-karya",
      label: "Trend Karya",
      href: "/admin/trend-karya",
      icon: TrendingUp,
    },
    {
      key: "blud",
      label: "BLUD",
      href: "/admin/blud",
      icon: Landmark,
    },
    {
      key: "bkk",
      label: "BKK & Mitra",
      href: "/admin/bkk",
      icon: Briefcase,
    },
    {
      key: "pendaftaran-mitra",
      label: "Pendaftaran Mitra",
      href: "/admin/pendaftaran-mitra",
      icon: UserPlus,
    },
  ]

  const settingsItems: ShellNavItem[] = [
    {
      key: "pengaturan",
      label: "Pengaturan",
      href: "/admin/pengaturan",
      icon: Settings,
    },
  ]

  return (
    <DashboardShell
      navItems={navItems}
      settingsItems={settingsItems}
      roleLabel="Administrator"
      searchPlaceholder="Cari karya siswa, pengguna, atau audit log..."
    >
      {children}
    </DashboardShell>
  )
}
