"use client"

/**
 * BKKLayout — chrome dashboard Koordinator BKK.
 *
 * Sebelumnya layout ini memakai navbar atas setinggi 56px dengan token warna
 * Kandaga (ink/primary), berbeda dari dashboard Administrator. Sekarang
 * chromenya memakai `DashboardShell` agar seragam dengan dashboard lain:
 * sidebar terang yang bisa dilipat + header putih + token Kandaga (`ink`
 * untuk warna netral, `primary` untuk aksen).
 *
 * API komponen dipertahankan (`children`, `pageTitle`) supaya keempat halaman
 * /bkk/* tidak perlu diubah. Menu tetap 4: Dashboard, Verifikasi Akun,
 * Antrian Kontak, Manajemen Mitra.
 *
 * Heading hierarchy halaman yang memakai layout ini tetap:
 *   navbar/sidebar: landmark navigation (bukan heading)
 *   h1: judul halaman (di dalam {children})
 */

import React from "react"
import {
  Briefcase,
  Building2,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShieldCheck,
} from "lucide-react"
import DashboardShell, {
  type ShellNavItem,
} from "@/components/dashboard/DashboardShell"

const NAV_ITEMS: ShellNavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/bkk",
    icon: LayoutDashboard,
    // `exact` wajib: kalau tidak, menu ini ikut menyala di /bkk/verifikasi,
    // /bkk/kontak, dan /bkk/mitra.
    exact: true,
  },
  {
    key: "verifikasi",
    label: "Verifikasi Akun",
    href: "/bkk/verifikasi",
    icon: ShieldCheck,
  },
  {
    key: "kontak",
    label: "Antrian Kontak",
    href: "/bkk/kontak",
    icon: MessageSquare,
  },
  {
    key: "mitra",
    label: "Manajemen Mitra",
    href: "/bkk/mitra",
    icon: Building2,
  },
]

export default function BKKLayout({
  children,
  pageTitle,
}: {
  children: React.ReactNode
  pageTitle?: string
}) {
  return (
    <DashboardShell
      brandHref="/bkk"
      navItems={NAV_ITEMS}
      profileHref="/bkk/profil"
      settingsItems={[
        {
          key: "pengaturan",
          label: "Pengaturan",
          href: "/bkk/pengaturan",
          icon: Settings,
        },
      ]}
      roleLabel="Koordinator BKK"
      roleIcon={Briefcase}
      searchPlaceholder="Cari perusahaan, permintaan kontak, atau siswa..."
      pageTitle={pageTitle}
      breadcrumbHref="/bkk"
      signOutCallbackUrl="/"
    >
      {children}
    </DashboardShell>
  )
}
