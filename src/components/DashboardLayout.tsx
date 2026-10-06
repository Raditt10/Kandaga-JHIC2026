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
import { useRouter } from "next/navigation"
import {
  Settings,
  LayoutDashboard,
  FolderGit2,
  Briefcase,
  Clock,
  Users,
  CheckCircle2,
} from "lucide-react"
import DashboardShell, {
  type ShellNavItem,
} from "@/components/dashboard/DashboardShell"

export interface DashboardTab {
  id: string
  label: string
  icon: React.ElementType
  badge?: string
}

const DEFAULT_STUDENT_TABS: DashboardTab[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "karya-saya", label: "Karya Saya", icon: FolderGit2 },
  { id: "magang", label: "Peluang Magang & BKK", icon: Briefcase },
]

const DEFAULT_TEACHER_TABS: DashboardTab[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "antrean", label: "Kurasi Karya", icon: FolderGit2 },
  { id: "karya-terverifikasi", label: "Karya Terverifikasi", icon: CheckCircle2 },
]

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
  /** Label untuk tautan pertama pada breadcrumb (mis. "Karya Saya" atau "Dashboard"). */
  breadcrumbLabel?: string
  /** URL tujuan tautan pertama pada breadcrumb. */
  breadcrumbHref?: string
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
  breadcrumbLabel,
  breadcrumbHref,
  children,
}: DashboardLayoutProps) {
  const router = useRouter()

  const effectiveTabs =
    tabs.length > 0
      ? tabs
      : roleSlug === "student"
      ? DEFAULT_STUDENT_TABS
      : roleSlug === "teacher"
      ? DEFAULT_TEACHER_TABS
      : []

  // Menu Profil dan Pengaturan dipusatkan di dropdown header akun (navbar kanan atas)
  const navItems: ShellNavItem[] = effectiveTabs
    .filter((tab) => tab.id !== "profil" && tab.id !== "pengaturan")
    .map((tab) => ({
      key: tab.id,
      label: tab.label,
      icon: tab.icon,
      badge: tab.badge,
      active: activeTab === tab.id,
      onSelect: () => {
        if (onTabChange) {
          onTabChange(tab.id)
        } else {
          router.push(tab.id === "dashboard" ? `/${roleSlug}` : `/${roleSlug}?tab=${tab.id}`)
        }
      },
    }))

  const profileTab = effectiveTabs.find((t) => t.id === "profil")
  const onProfileSelect =
    onTabChange && (profileTab || roleSlug === "student" || roleSlug === "teacher")
      ? () => onTabChange("profil")
      : roleSlug === "student" || roleSlug === "teacher"
      ? () => router.push(`/${roleSlug}?tab=profil`)
      : undefined

  const settingsTab = effectiveTabs.find((t) => t.id === "pengaturan")
  const settingsItems: ShellNavItem[] =
    roleSlug === "student" || roleSlug === "teacher"
      ? [
          {
            key: "pengaturan",
            label: settingsTab?.label || "Pengaturan",
            icon: settingsTab?.icon || Settings,
            active: activeTab === "pengaturan",
            onSelect: () => {
              if (onTabChange) {
                onTabChange("pengaturan")
              } else {
                router.push(`/${roleSlug}?tab=pengaturan`)
              }
            },
          },
        ]
      : []

  const searchPlaceholder =
    roleSlug === "teacher"
      ? "Cari karya, siswa, atau riwayat kurasi..."
      : "Cari karya, peluang magang, atau data profil..."

  const resolvedBreadcrumbLabel =
    breadcrumbLabel ||
    (activeTab === "karya-saya"
      ? "Karya Saya"
      : activeTab === "antrean"
      ? "Kurasi Karya"
      : activeTab === "karya-terverifikasi"
      ? "Karya Terverifikasi"
      : "Dashboard")

  const resolvedBreadcrumbHref =
    breadcrumbHref ||
    (activeTab === "karya-saya"
      ? `/${roleSlug}?tab=karya-saya`
      : activeTab === "antrean"
      ? `/${roleSlug}?tab=antrean`
      : `/${roleSlug}`)

  return (
    <DashboardShell
      brandHref={`/${roleSlug}`}
      navItems={navItems}
      settingsItems={settingsItems}
      onProfileSelect={onProfileSelect}
      profileHref={`/${roleSlug}`}
      roleLabel={roleTitle}
      roleIcon={icon}
      roleAccent={badgeColor}
      navSectionLabel="Menu Navigasi"
      searchPlaceholder={searchPlaceholder}
      pageTitle={pageTitle}
      breadcrumbLabel={resolvedBreadcrumbLabel}
      breadcrumbHref={resolvedBreadcrumbHref}
    >
      {children}
    </DashboardShell>
  )
}
