"use client"

/**
 * ThemeWatcher — penjaga tema yang dipasang sekali di root layout.
 *
 * Skrip anti-kedip di layout sudah memasang kelas `.dark` sebelum halaman
 * dicat. Komponen ini melanjutkan tugasnya setelah React hidup:
 *   1. menyamakan state dengan pilihan tersimpan,
 *   2. menerapkan ulang setiap kali pindah halaman — area login boleh gelap,
 *      halaman publik selalu dipaksa terang,
 *   3. ikut berubah saat pengaturan perangkat berubah (mode "system"),
 *   4. ikut berubah saat tema diganti dari halaman Pengaturan.
 *
 * Tidak merender apa pun.
 */

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { THEME_CHANGE_EVENT, applyThemeMode, getStoredTheme } from "@/lib/theme"

export default function ThemeWatcher() {
  const pathname = usePathname()

  // Dipanggil ulang tiap navigasi, termasuk dari landing ke dashboard dan
  // sebaliknya, supaya kelas `.dark` tidak tertinggal di halaman publik.
  useEffect(() => {
    applyThemeMode(getStoredTheme(), pathname ?? "/")
  }, [pathname])

  // Perubahan dari luar navigasi: pengaturan perangkat dan halaman Pengaturan.
  useEffect(() => {
    const reapply = () => applyThemeMode(getStoredTheme())

    const media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null
    const onSystemChange = () => {
      // Hanya mode "system" yang boleh ikut berubah; pilihan eksplisit menang.
      if (getStoredTheme() === "system") reapply()
    }

    window.addEventListener(THEME_CHANGE_EVENT, reapply)
    media?.addEventListener("change", onSystemChange)

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, reapply)
      media?.removeEventListener("change", onSystemChange)
    }
  }, [])

  return null
}
