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

import React, { createContext, useContext } from "react"
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

const AdminLayoutContext = createContext(false)

export default function AdminLayout({
  children,
  initialCollapsed,
}: {
  children: React.ReactNode
  initialCollapsed?: boolean
}) {
  const isNested = useContext(AdminLayoutContext)
  if (isNested) {
    return <>{children}</>
  }
  const navItems: ShellNavItem[] = [
    {
      key: "dashboard",
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      exact: true,
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
      key: "pengguna",
      label: "Kelola Pengguna",
      href: "/admin/pengguna",
      icon: Users,
    },
  ]

  const settingsItems: ShellNavItem[] = [
    {
      key: "pengaturan",
      label: "Pengaturan",
      href: "/admin/pengaturan?tab=sistem",
      icon: Settings,
    },
  ]

  return (
    <AdminLayoutContext.Provider value={true}>
      <DashboardShell
        initialCollapsed={initialCollapsed}
        navItems={navItems}
        settingsItems={settingsItems}
        profileHref="/admin/pengaturan?tab=akun"
        roleLabel="Administrator"
        searchPlaceholder="Cari karya siswa, pengguna, atau audit log..."
      >
        {children}
      </DashboardShell>
    </AdminLayoutContext.Provider>
  )
}
