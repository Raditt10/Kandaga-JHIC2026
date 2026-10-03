"use client"

/**
 * DashboardLayout — chrome bersama untuk dashboard Siswa dan Guru.
 *
 * Sebelumnya layout ini memakai sidebar gelap maroon dengan pemilih role,
 * berbeda dari dashboard Administrator. Sekarang seluruh chromenya memakai
 * `DashboardShell` (gaya dashboard admin: sidebar terang + header putih),
 * sehingga kelima dashboard punya bahasa desain yang sama.
 *
 * API komponen ini SENGAJA dipertahankan (roleTitle, roleSlug, badgeColor,
 * icon, tabs, activeTab, onTabChange) supaya halaman Siswa dan Guru tidak
 * perlu diubah. Keduanya berpindah tab lewat state, bukan lewat route, jadi
 * menu di sidebar dirender sebagai tombol (`onSelect`), bukan tautan.
 */

import React from "react"
import DashboardShell, {
  type ShellNavItem,
} from "@/components/dashboard/DashboardShell"

export interface DashboardTab {
  id: string
  label: string
  icon: React.ElementType
  badge?: string
}

interface DashboardLayoutProps {
  roleTitle: string
  roleSlug: "student" | "admin" | "company" | "teacher" | "bkk"
  /** Gradien aksen chip ikon peran. Opsional — default aksen Kandaga. */
  badgeColor?: string
  icon: React.ElementType
  tabs?: DashboardTab[]
  activeTab?: string
  onTabChange?: (tabId: string) => void
  /**
   * Judul halaman untuk breadcrumb. Dipakai halaman yang berdiri sendiri
   * (mis. /student/create-project) — bukan halaman bertab.
   */
  pageTitle?: string
  children: React.ReactNode
}

export default function DashboardLayout({
  roleTitle,
  roleSlug,
  badgeColor,
  icon,
  tabs = [],
  activeTab,
  onTabChange,
  pageTitle,
  children,
}: DashboardLayoutProps) {
  const navItems: ShellNavItem[] = tabs.map((tab) => ({
    key: tab.id,
    label: tab.label,
    icon: tab.icon,
    badge: tab.badge,
    active: activeTab === tab.id,
    onSelect: () => onTabChange?.(tab.id),
  }))

  const searchPlaceholder =
    roleSlug === "teacher"
      ? "Cari karya, siswa bimbingan, atau riwayat kurasi..."
      : "Cari karya, peluang magang, atau data profil..."

  return (
    <DashboardShell
      navItems={navItems}
      roleLabel={roleTitle}
      roleIcon={icon}
      roleAccent={badgeColor}
      navSectionLabel="Menu Navigasi"
      searchPlaceholder={searchPlaceholder}
      pageTitle={pageTitle}
      breadcrumbHref={`/${roleSlug}`}
    >
      {children}
    </DashboardShell>
  )
}
