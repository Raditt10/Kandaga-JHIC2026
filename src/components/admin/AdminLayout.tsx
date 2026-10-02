"use client"

/**
 * AdminLayout — chrome dashboard Administrator.
 *
 * Sejak penyeragaman design, seluruh struktur visual admin (sidebar terang
 * yang bisa dilipat, header pencarian, kartu identitas pengguna, palet
 * `slate` + aksen #891337) dipindahkan ke `DashboardShell` supaya bisa dipakai
 * bersama oleh dashboard Siswa, Guru, Perusahaan, dan BKK.
 *
 * Layout ini sekarang hanya mendefinisikan DAFTAR MENU khas administrator;
 * urusan tampilan sepenuhnya milik DashboardShell.
 */

import React from "react"
import {
  Briefcase,
  FileCheck2,
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
  Users,
} from "lucide-react"
import DashboardShell, {
  type ShellNavItem,
} from "@/components/dashboard/DashboardShell"
import { usersDatabase } from "@/lib/users"
import { systemAuditLogs } from "@/lib/adminData"

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
      label: "Pengguna",
      href: "/admin/pengguna",
      icon: Users,
      badge: `${usersDatabase.length}`,
    },
    {
      key: "moderasi",
      label: "Moderasi",
      href: "/admin/moderasi",
      icon: FileCheck2,
    },
    {
      key: "audit-log",
      label: "Audit Log",
      href: "/admin/audit-log",
      icon: ScrollText,
      badge: `${systemAuditLogs.length}`,
    },
    {
      key: "bkk",
      label: "BKK & Mitra",
      href: "/admin/bkk",
      icon: Briefcase,
    },
  ]

  return (
    <DashboardShell
      navItems={navItems}
      roleLabel="Administrator"
      roleIcon={ShieldCheck}
      searchPlaceholder="Cari karya siswa, pengguna, atau audit log..."
    >
      {children}
    </DashboardShell>
  )
}
