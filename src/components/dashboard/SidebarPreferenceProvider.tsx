"use client"

/**
 * SidebarPreferenceProvider — menitipkan preferensi lipat sidebar dari server
 * ke `DashboardShell`.
 *
 * Kenapa perlu titip-menitip lewat context?
 *
 * Preferensi ini disimpan di cookie (`kandaga_sidebar_collapsed`) dan
 * localStorage. Halaman-halaman dashboard adalah komponen klien, jadi mereka
 * tidak bisa membaca cookie saat server merender. Akibatnya HTML server selalu
 * tercetak dalam keadaan sidebar TERBUKA, lalu klien mengoreksinya setelah
 * hidup. Karena `<aside>`-nya memakai `transition-all duration-300`, koreksi
 * itu terlihat sebagai animasi sidebar yang mengembang lalu mengempis setiap
 * kali halaman dimuat ulang.
 *
 * Layout per-peran (`app/<peran>/layout.tsx`) adalah komponen server, jadi
 * dialah yang membaca cookie itu — sebelum halaman apa pun dirender. Nilainya
 * lalu diturunkan lewat provider ini supaya `DashboardShell` bisa memakainya
 * sebagai keadaan awal. Server dan klien pun merender hal yang sama, sehingga
 * tidak ada koreksi, tidak ada animasi, dan tidak ada hydration mismatch.
 */

import React, { createContext, useContext } from "react"

/**
 * `null` berarti tidak ada provider di atasnya — mis. komponen ini dipakai di
 * tempat yang belum punya layout per-peran. Dalam keadaan itu `DashboardShell`
 * kembali ke cara lama: membaca preferensi setelah mount.
 */
const SidebarPreferenceContext = createContext<boolean | null>(null)

export function SidebarPreferenceProvider({
  initialCollapsed,
  children,
}: {
  initialCollapsed: boolean
  children: React.ReactNode
}) {
  return (
    <SidebarPreferenceContext.Provider value={initialCollapsed}>
      {children}
    </SidebarPreferenceContext.Provider>
  )
}

export function useSidebarPreference(): boolean | null {
  return useContext(SidebarPreferenceContext)
}
