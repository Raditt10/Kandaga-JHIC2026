"use client"

/**
 * CompanyLayout — chrome dashboard perusahaan mitra.
 *
 * Sebelumnya layout ini memakai navbar atas setinggi 56px dengan token warna
 * Kandaga (ink/primary), berbeda dari dashboard Administrator. Sekarang
 * chromenya memakai `DashboardShell` agar seragam dengan dashboard lain:
 * sidebar terang yang bisa dilipat + header putih + palet `slate` dengan
 * aksen #891337.
 *
 * API komponen dipertahankan (`children`, `pageTitle`) supaya keempat halaman
 * /company/* tidak perlu diubah. Menu berisi 5 item: Dashboard (`/company`),
 * lalu 4 menu alur kerja sesuai alurMitra.md §3. Item "Dashboard" ditambahkan
 * supaya halaman induk /company punya menu yang menyala — sebelumnya halaman
 * itu tampil dengan seluruh menu dalam keadaan mati.
 */

import React from "react"
import {
  Bookmark,
  Building2,
  ClipboardList,
  LayoutDashboard,
  Search,
  User,
} from "lucide-react"
import DashboardShell, {
  type ShellNavItem,
} from "@/components/dashboard/DashboardShell"

const NAV_ITEMS: ShellNavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/company",
    icon: LayoutDashboard,
    // `exact` wajib: tanpa itu menu "Dashboard" ikut menyala di
    // /company/katalog, /company/tersimpan, dan seterusnya — karena semua
    // sub-halaman itu diawali "/company/".
    exact: true,
  },
  {
    key: "katalog",
    label: "Jelajahi Katalog",
    href: "/company/katalog",
    icon: Search,
  },
  {
    key: "tersimpan",
    label: "Talenta Tersimpan",
    href: "/company/tersimpan",
    icon: Bookmark,
  },
  {
    key: "riwayat",
    label: "Riwayat Permintaan",
    href: "/company/riwayat",
    icon: ClipboardList,
  },
  {
    key: "profil",
    label: "Profil Perusahaan",
    href: "/company/profil",
    icon: User,
  },
]

interface CompanyLayoutProps {
  children: React.ReactNode
  /** Judul halaman untuk breadcrumb (opsional) */
  pageTitle?: string
}

export default function CompanyLayout({
  children,
  pageTitle,
}: CompanyLayoutProps) {
  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      roleLabel="Mitra Perusahaan"
      roleIcon={Building2}
      searchPlaceholder="Cari karya siswa atau talenta tersimpan..."
      pageTitle={pageTitle}
      breadcrumbHref="/company"
      signOutCallbackUrl="/"
    >
      {children}
    </DashboardShell>
  )
}
