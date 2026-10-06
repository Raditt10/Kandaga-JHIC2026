"use client"

/**
 * DashboardShell — chrome bersama untuk SELURUH dashboard role.
 *
 * Dibuat dengan menyalin gaya visual dashboard Administrator (sidebar terang
 * yang bisa dilipat + header putih dengan pencarian, mail, notifikasi, dan
 * kartu identitas pengguna + token Kandaga `ink` dan `primary`), lalu
 * diparameterkan supaya dipakai juga oleh dashboard Siswa, Guru, Perusahaan,
 * dan BKK.
 *
 * Sebelumnya ada tiga pola chrome berbeda di aplikasi ini:
 *   1. admin        → sidebar terang, palet slate
 *   2. siswa/guru   → sidebar gelap maroon (DashboardLayout)
 *   3. perusahaan/BKK → navbar atas h-14 (CompanyLayout/BKKLayout)
 * Shell ini menghapus perbedaan itu: kelima dashboard sekarang memakai
 * struktur, jarak, radius, dan palet yang sama.
 *
 * Mendukung dua mode navigasi:
 *   - `href`     → navigasi antar-route (Perusahaan, BKK, Admin)
 *   - `onSelect` → navigasi antar-tab dalam satu halaman (Siswa, Guru), yang
 *                  datanya memang dimuat sekali lalu ditukar lewat state.
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from "react"

/**
 * useLayoutEffect di klien, useEffect di server.
 *
 * useLayoutEffect memperingatkan bila dipanggil saat render di server, jadi
 * pilihannya ditentukan sekali di level modul — browser memakai
 * useLayoutEffect (berjalan sebelum halaman digambar), server memakai
 * useEffect yang aman.
 */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { EmptyState } from "@/components/ui/EmptyState"
import { useSidebarPreference } from "@/components/dashboard/SidebarPreferenceProvider"
import {
  AVATAR_CACHE_BASE,
  PROFILE_CACHE_BASE,
  clearUserCache,
  purgeLegacyAccountCache,
  readUserCache,
  writeUserCache,
} from "@/lib/user-cache"
import {
  Bell,
  ChevronDown,
  ExternalLink,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  User,
  X,
} from "lucide-react"
import { onAvatarUpdate } from "@/lib/socket"

export interface ShellNavItem {
  /** Kunci unik untuk list rendering. */
  key: string
  label: string
  icon: React.ElementType
  /** Menu berbasis route. */
  href?: string
  /** Menu berbasis tab dalam satu halaman. */
  onSelect?: () => void
  /** Dipakai mode tab: tandai menu yang sedang aktif. */
  active?: boolean
  /**
   * Cocokkan `href` secara persis (tanpa memeriksa sub-route). Dipakai untuk
   * menu root seperti `/bkk` dan `/admin/dashboard` supaya tidak ikut menyala
   * saat sub-halaman dibuka.
   */
  exact?: boolean
  badge?: string
}

interface DashboardShellProps {
  navItems: ShellNavItem[]
  /** Label peran, tampil sebagai sub-judul di bawah nama pengguna. */
  roleLabel: string
  /**
   * Ikon peran — SENGAJA tidak dirender lagi.
   *
   * Dulu tampil sebagai chip kotak marun di navbar, tepat di antara tombol
   * lonceng dan foto profil. Chip itu dihapus karena hanya hiasan tanpa
   * fungsi klik, dan informasinya sudah ada di label peran pada menu profil.
   * Prop ini tetap diterima supaya kontrak pemanggil (AdminLayout, BKKLayout,
   * CompanyLayout, DashboardLayout) tidak perlu diubah — jangan dirender lagi.
   */
  roleIcon?: React.ElementType
  /** Kelas gradien chip ikon peran — ikut tidak dipakai lagi, lihat `roleIcon`. */
  roleAccent?: string
  /** Judul grup menu di sidebar. */
  navSectionLabel?: string
  searchPlaceholder?: string
  /** URL tujuan menu Profil Saya di header dropdown. */
  profileHref?: string
  /** Callback opsional jika Profil Saya berbasis tab halaman. */
  onProfileSelect?: () => void
  /** Label menu pengaturan tambahan (opsional). */
  settingsLabel?: string
  /**
   * Menu tambahan di blok dropdown profil (mis. "Pengaturan").
   * Dipakai supaya setiap role punya entri pengaturan yang seragam.
   */
  settingsItems?: ShellNavItem[]
  /** Status awal sidebar terlipat (opsional, dari server cookie). */
  initialCollapsed?: boolean
  signOutCallbackUrl?: string
  /** Bila diisi, tampilkan breadcrumb di atas konten. */
  pageTitle?: string
  /** Tujuan tautan logo/brand Kandaga di sidebar (default: ke beranda dashboard role). */
  brandHref?: string
  /** Label untuk tautan pertama pada breadcrumb (default: "Dashboard"). */
  breadcrumbLabel?: string
  /** Tujuan tautan pada breadcrumb. */
  breadcrumbHref?: string
  children: React.ReactNode
}

/** Notifikasi dari /api/notifications — dipakai lonceng di header. */
type TNotif = {
  id: string
  type: string
  title: string
  content: string
  isRead: boolean
  createdAt: string
}

let globalSidebarCollapsed: boolean | null = null

function readSidebarCollapsedPreference(): boolean {
  if (globalSidebarCollapsed !== null) {
    return globalSidebarCollapsed
  }
  if (typeof window !== "undefined") {
    try {
      const match = document.cookie.match(/(?:^|; )kandaga_sidebar_collapsed=([^;]*)/)
      if (match) {
        const val = match[1] === "true"
        globalSidebarCollapsed = val
        return val
      }
      const local = localStorage.getItem("kandaga_sidebar_collapsed")
      if (local !== null) {
        const val = local === "true"
        globalSidebarCollapsed = val
        return val
      }
    } catch {}
  }
  return false
}

function writeSidebarCollapsedPreference(val: boolean) {
  globalSidebarCollapsed = val
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("kandaga_sidebar_collapsed", String(val))
      document.cookie = `kandaga_sidebar_collapsed=${val}; path=/; max-age=31536000; SameSite=Lax`
    } catch {}
  }
}

export default function DashboardShell({
  initialCollapsed,
  navItems,
  roleLabel,
  navSectionLabel = "OVERVIEW",
  searchPlaceholder = "Cari...",
  profileHref,
  onProfileSelect,
  settingsLabel = "Lihat Website",
  settingsItems = [],
  signOutCallbackUrl = "/auth/login",
  pageTitle,
  brandHref,
  breadcrumbLabel = "Dashboard",
  breadcrumbHref = "/",
  children,
}: DashboardShellProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  /*
   * Preferensi dari server, kalau ada.
   *
   * Layout per-peran (`app/<peran>/layout.tsx`) membaca cookie
   * `kandaga_sidebar_collapsed` saat server merender dan menitipkannya lewat
   * context. Nilainya sudah tersedia pada render pertama, jadi HTML server
   * sudah tercetak dalam keadaan yang benar.
   *
   * Urutan prioritas: prop `initialCollapsed` (dipakai dashboard Admin yang
   * punya layout sendiri) → context dari layout per-peran → `null` bila tidak
   * ada keduanya.
   */
  const serverCollapsed = useSidebarPreference()
  const resolvedInitialCollapsed =
    typeof initialCollapsed === "boolean" ? initialCollapsed : serverCollapsed

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof resolvedInitialCollapsed === "boolean") {
      globalSidebarCollapsed = resolvedInitialCollapsed
      return resolvedInitialCollapsed
    }
    /*
     * JANGAN membaca localStorage/cookie di sini.
     *
     * Nilai itu tidak ada saat server merender, jadi render pertama server
     * selalu "terbuka"; di klien pembacaannya bisa menghasilkan "terlipat".
     * Perbedaan itu membuat HTML server tidak sama dengan render pertama
     * klien, dan React melaporkannya sebagai
     * "Hydration failed because the server rendered HTML didn't match".
     *
     * Preferensi tersimpan tetap dipakai, tapi diterapkan setelah komponen
     * hidup — lihat layout effect di bawah. Jalur ini hanya terpakai kalau
     * tidak ada server yang menitipkan nilainya.
     */
    return false
  })

  /*
   * Terapkan preferensi tersimpan sesudah mount.
   *
   * Sengaja memakai layout effect, bukan useEffect: koreksinya harus terjadi
   * SEBELUM browser menggambar, kalau tidak sidebar sempat terlihat terbuka
   * lalu beranimasi menutup (aside-nya punya `transition-all duration-300`).
   */
  useIsomorphicLayoutEffect(() => {
    if (typeof resolvedInitialCollapsed === "boolean") return
    const pref = readSidebarCollapsedPreference()
    if (pref !== isSidebarCollapsed) {
      setIsSidebarCollapsed(pref)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Selalu persist ke localStorage & cookie bila state berubah
  useEffect(() => {
    writeSidebarCollapsedPreference(isSidebarCollapsed)
  }, [isSidebarCollapsed])

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev)
  }

  const [searchQuery, setSearchQuery] = useState("")

  const userRole = session?.user?.role?.toLowerCase()
  const computedBrandHref =
    brandHref ||
    (pathname?.startsWith("/company")
      ? "/company"
      : pathname?.startsWith("/bkk")
      ? "/bkk"
      : pathname?.startsWith("/admin")
      ? "/admin/dashboard"
      : pathname?.startsWith("/student")
      ? "/student"
      : pathname?.startsWith("/teacher")
      ? "/teacher"
      : navItems.find((item) => item.key === "dashboard" || item.exact)?.href ||
        (breadcrumbHref && breadcrumbHref !== "/" ? breadcrumbHref : "/") ||
        (userRole === "student"
          ? "/student"
          : userRole === "company"
          ? "/company"
          : userRole === "teacher"
          ? "/teacher"
          : userRole === "bkk"
          ? "/bkk"
          : userRole === "admin"
          ? "/admin/dashboard"
          : "/"))

  const computedProfileHref =
    profileHref ||
    (userRole === "student"
      ? "/student?tab=profil"
      : userRole === "company"
      ? "/company/profil"
      : userRole === "teacher"
      ? "/teacher?tab=profil"
      : userRole === "bkk"
      ? "/bkk/profil"
      : "/admin/profil")

  // ── Notifikasi nyata dari database (sebelumnya lonceng hanya hiasan) ──
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const [notifs, setNotifs] = useState<TNotif[]>([])
  const [unread, setUnread] = useState(0)

  // ── Menu dropdown profil pengguna di header ──
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // ── Real-time User Avatar State ──
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null)

  /*
   * Avatar awal dibaca dari cache MILIK AKUN YANG SEDANG MASUK.
   *
   * Sebelumnya kuncinya global (`kandaga_user_avatar`, `kandaga_student_profile`),
   * sehingga di peramban yang dipakai bergantian foto dan data akun sebelumnya
   * ikut tampil di akun berikutnya. Sekarang kuncinya memuat id akun, dan bila
   * id itu belum tersedia pembacaan sengaja dilewati.
   */
  useEffect(() => {
    // Sapu sisa kunci versi lama yang tidak memuat id akun.
    purgeLegacyAccountCache()

    const userId = session?.user?.id
    if (!userId) {
      setUserAvatarUrl(null)
      return
    }

    const cachedAvatar = readUserCache<string>(AVATAR_CACHE_BASE, userId)
    if (cachedAvatar) {
      setUserAvatarUrl(cachedAvatar)
      return
    }

    const cachedProfile = readUserCache<{ photoUrl?: string }>(PROFILE_CACHE_BASE, userId)
    if (cachedProfile?.photoUrl) setUserAvatarUrl(cachedProfile.photoUrl)
  }, [session?.user?.id])

  // Sinkronisasi avatar awal dari endpoint /api/akun
  useEffect(() => {
    let active = true
    if (session?.user?.id) {
      fetch("/api/akun")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (active && data?.akun?.photoUrl) {
            setUserAvatarUrl(data.akun.photoUrl)
            writeUserCache(AVATAR_CACHE_BASE, session?.user?.id, data.akun.photoUrl)
          }
        })
        .catch(() => {})
    }
    return () => {
      active = false
    }
  }, [session?.user?.id])

  // Sinkronisasi avatar real-time via Socket.IO
  useEffect(() => {
    const unsubscribe = onAvatarUpdate((data) => {
      if (!data.userId || data.userId === session?.user?.id) {
        setUserAvatarUrl(data.photoUrl)
        writeUserCache(AVATAR_CACHE_BASE, data.userId ?? session?.user?.id, data.photoUrl)
      }
    })
    return unsubscribe
  }, [session?.user?.id])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserMenuOpen(false)
        setNotifOpen(false)
      }
    }

    if (userMenuOpen || notifOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [userMenuOpen, notifOpen])

  useEffect(() => {
    setUserMenuOpen(false)
    setNotifOpen(false)
  }, [pathname])

  const muatNotifikasi = async () => {
    try {
      const res = await fetch("/api/notifications?limit=8", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setNotifs(data.items ?? [])
      setUnread(data.unread ?? 0)
    } catch {
      // Lonceng dibiarkan kosong bila gagal; tidak mengganggu halaman.
    }
  }

  useEffect(() => {
    if (session?.user?.id) muatNotifikasi()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  const tandaiDibaca = async (id?: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id ? { id } : { all: true }),
      })
    } finally {
      muatNotifikasi()
    }
  }

  /** Kotak pencarian mengarah ke galeri publik — satu-satunya data yang bisa dicari lintas peran. */
  const kirimPencarian = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    setNotifOpen(false)
    router.push(`/gallery?q=${encodeURIComponent(q)}`)
  }

  const userName =
    session?.user?.username || session?.user?.name || "Pengguna Kandaga"

  const isItemActive = (item: ShellNavItem) => {
    if (typeof item.active === "boolean") return item.active
    if (!item.href) return false
    if (pathname === item.href) return true
    return item.exact ? false : pathname.startsWith(item.href + "/")
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col xl:flex-row font-sans antialiased text-ink">
      {/* ──────────────── 1. SIDEBAR ──────────────── */}
      <aside
        data-sidebar="true"
        data-lenis-prevent="true"
        suppressHydrationWarning
        className={`w-full ${
          isSidebarCollapsed ? "xl:w-20 px-3 py-6 xl:overflow-visible" : "xl:w-64 2xl:w-72 p-6 xl:overflow-y-auto"
        } shrink-0 border-b xl:border-b-0 xl:border-r border-ink-150 flex flex-col justify-between bg-white transition-all duration-300 ease-in-out xl:sticky xl:top-0 xl:h-screen xl:self-start z-30`}
      >
        <div>
          {/* Brand + tombol lipat sidebar */}
          <div
            className={`flex items-center ${
              isSidebarCollapsed
                ? "xl:flex-col xl:gap-3 xl:justify-center justify-between"
                : "justify-between"
            } mb-8`}
          >
            <Link
              href={computedBrandHref}
              aria-label="Dashboard Kandaga"
              className="flex items-center gap-2 group shrink-0"
            >
              <div className="w-8 h-8 relative rounded-full overflow-hidden shadow-xs ring-1 ring-ink/5 transition-transform duration-200 group-hover:scale-105 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Kandaga Logo"
                  fill sizes="32px"
                  className="object-contain"
                  priority
                />
              </div>
              {!isSidebarCollapsed && (
                <span className="select-none font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-ink via-[#4e0e20] to-primary-dark bg-clip-text text-transparent group-hover:from-ink-700 group-hover:to-[#b81d4a] transition-all duration-300 whitespace-nowrap">
                  KANDAGA
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={toggleSidebar}
              className="group relative hidden xl:block p-1.5 rounded-xl text-ink-600 hover:text-ink hover:bg-ink-100 transition cursor-pointer shrink-0"
              title={isSidebarCollapsed ? "Perbesar Sidebar" : "Perkecil Sidebar"}
              aria-label={isSidebarCollapsed ? "Perbesar Sidebar" : "Perkecil Sidebar"}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-ink-600" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-ink-600" />
              )}
              {isSidebarCollapsed && (
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden xl:group-hover:flex items-center px-2.5 py-1 text-xs font-semibold text-white bg-ink rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                >
                  Perbesar Sidebar
                </span>
              )}
            </button>
          </div>

          {/* Navigasi utama */}
          <div className="mb-7">
            {!isSidebarCollapsed && (
              <span className="block text-[11px] font-bold text-ink-600 tracking-wider uppercase mb-3 px-3">
                {navSectionLabel}
              </span>
            )}
            <nav className="space-y-1" aria-label={`Navigasi ${roleLabel}`}>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = isItemActive(item)

                const className = `group relative w-full flex items-center ${
                  isSidebarCollapsed
                    ? "xl:justify-center px-3 py-2.5"
                    : "justify-between px-3.5 py-2.5"
                } rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-ink-100 text-primary font-bold shadow-2xs"
                    : "text-ink-600 hover:bg-ink-100 hover:text-ink"
                }`

                const content = (
                  <>
                    <div
                      className={`flex items-center ${
                        isSidebarCollapsed ? "xl:justify-center" : "gap-3"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-primary" : "text-ink-600"
                        }`}
                        aria-hidden="true"
                      />
                      {!isSidebarCollapsed && (
                        <span className="whitespace-nowrap">{item.label}</span>
                      )}
                    </div>
                    {!isSidebarCollapsed && item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "bg-ink-100 text-ink-600"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isSidebarCollapsed && item.badge && (
                      <span className="hidden xl:block absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                    )}
                    {isSidebarCollapsed && (
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden xl:group-hover:flex items-center px-2.5 py-1 text-xs font-semibold text-white bg-ink rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                      >
                        {item.label}
                        {item.badge && (
                          <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 text-white font-mono">
                            {item.badge}
                          </span>
                        )}
                      </span>
                    )}
                  </>
                )

                if (item.href) {
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      title={item.label}
                      aria-current={isActive ? "page" : undefined}
                      className={className}
                    >
                      {content}
                    </Link>
                  )
                }

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={item.onSelect}
                    title={item.label}
                    aria-current={isActive ? "page" : undefined}
                    className={className}
                  >
                    {content}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Footer Sidebar / Copyright - hanya tampil saat sidebar terbuka */}
        {!isSidebarCollapsed && (
          <div className="pt-2 mt-auto shrink-0">
            <div className="px-2 text-[11px] text-ink-400 select-none">
              <p>
                &copy; {new Date().getFullYear()} SMK Negeri 13 Bandung
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* ──────────────── 2. AREA KONTEN ──────────────── */}
      <main className="flex-1 p-6 sm:p-8 space-y-7 bg-white min-w-0">
        {/* Header: pencarian + aksi + identitas pengguna */}
        <div className="flex items-center justify-between gap-4">
          <form onSubmit={kirimPencarian} className="flex-1 relative max-w-lg">
            <Search
              className="w-4 h-4 text-ink-600 absolute left-4 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <label className="sr-only" htmlFor="dashboard-search">
              Cari di dashboard
            </label>
            <input
              id="dashboard-search"
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ink-100 border border-ink-150 text-xs text-ink placeholder:text-ink-600 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition"
            />
          </form>

          <div className="flex items-center gap-3">
            {/* Lonceng notifikasi — datanya nyata dari /api/notifications.
                Tombol "Pesan" dihapus karena aplikasi ini tidak punya sistem
                pesan; sebelumnya hanya hiasan tanpa handler. */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                title="Notifikasi"
                aria-label={`Notifikasi${unread > 0 ? `, ${unread} belum dibaca` : ""}`}
                aria-expanded={notifOpen}
                onClick={() => {
                  setNotifOpen((v) => !v)
                  if (!notifOpen) muatNotifikasi()
                }}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition relative cursor-pointer ${
                  notifOpen
                    ? "bg-ink-150 text-ink border-ink-200 shadow-2xs"
                    : "bg-ink-100 hover:bg-ink-150/70 border-ink-150 text-ink-600 hover:text-ink"
                }`}
              >
                <Bell className="w-4 h-4" aria-hidden="true" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[85vw] bg-white border border-ink-150 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-ink-150 bg-ink-50/50">
                    <span className="text-xs font-bold text-ink">Notifikasi</span>
                    <div className="flex items-center gap-2">
                      {unread > 0 && (
                        <button
                          type="button"
                          onClick={() => tandaiDibaca()}
                          className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                        >
                          Tandai semua dibaca
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setNotifOpen(false)}
                        title="Tutup Notifikasi"
                        aria-label="Tutup Notifikasi"
                        className="p-1 rounded-lg text-ink-400 hover:text-ink hover:bg-ink-100 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div data-lenis-prevent="true" className="max-h-80 overflow-y-auto divide-y divide-ink-150">
                    {notifs.length === 0 ? (
                      <EmptyState
                        compact
                        title="Belum Ada Notifikasi"
                        description="Notifikasi terbaru Anda akan muncul di sini."
                      />
                    ) : (
                      notifs.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => !n.isRead && tandaiDibaca(n.id)}
                          className={`w-full text-left px-4 py-3 hover:bg-ink-100 transition cursor-pointer ${
                            n.isRead ? "" : "bg-rose-50/40"
                          }`}
                        >
                          <span className="block text-xs font-bold text-ink">
                            {n.title}
                          </span>
                          <span className="block text-[11px] text-ink-600 mt-0.5 leading-relaxed">
                            {n.content}
                          </span>
                          <span className="block text-[10px] text-ink-600 mt-1">
                            {new Date(n.createdAt).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── User Profile Dropdown Menu (Pengaturan, Lihat Website, Keluar) ── */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className={`flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl transition-all duration-150 cursor-pointer text-left select-none group ${
                  userMenuOpen ? "bg-ink-100 shadow-2xs" : "hover:bg-ink-100/70"
                }`}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-primary-dark text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-primary/10 group-hover:ring-primary/25 transition overflow-hidden relative shrink-0">
                  {userAvatarUrl ? (
                    <Image
                      src={userAvatarUrl}
                      alt={userName}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    userName.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="hidden sm:block text-left max-w-[160px] md:max-w-[200px]">
                  <span className="block text-xs font-bold text-ink leading-tight truncate">
                    {userName}
                  </span>
                  <span className="block text-[10px] text-ink-500 font-medium truncate font-mono">
                    {session?.user?.email || ""}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-ink-500 transition-transform duration-200 hidden sm:block ${
                    userMenuOpen ? "rotate-180 text-primary" : "group-hover:text-ink-700"
                  }`}
                  aria-hidden="true"
                />
              </button>

              {/* Dropdown Menu Box */}
              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white border border-ink-150 shadow-xl shadow-black/10 p-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150"
                  role="menu"
                  aria-orientation="vertical"
                >
                  {/* Header Profil Akun */}
                  <div className="px-3 py-2.5 mb-1 bg-ink-50/70 rounded-xl border border-ink-100/60 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-dark text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 overflow-hidden relative">
                      {userAvatarUrl ? (
                        <Image
                          src={userAvatarUrl}
                          alt={userName}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        userName.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-ink truncate">{userName}</p>
                      <p className="text-[11px] text-ink-500 truncate">{session?.user?.email || ""}</p>
                    </div>
                  </div>

                  {/* Navigasi Profil & Pengaturan */}
                  <div className="space-y-0.5 py-1">
                    {/* Profil Saya */}
                    {onProfileSelect ? (
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false)
                          onProfileSelect()
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-ink-700 hover:bg-ink-100 hover:text-ink transition cursor-pointer text-left"
                      >
                        <User className="w-4 h-4 text-ink-500" />
                        <span>Profil Saya</span>
                      </button>
                    ) : (
                      <Link
                        href={computedProfileHref}
                        onClick={() => setUserMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                          pathname === computedProfileHref
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-ink-700 hover:bg-ink-100 hover:text-ink"
                        }`}
                      >
                        <User
                          className={`w-4 h-4 ${
                            pathname === computedProfileHref ? "text-primary" : "text-ink-500"
                          }`}
                        />
                        <span>Profil Saya</span>
                      </Link>
                    )}

                    {/* Menu Pengaturan Tambahan */}
                    {settingsItems.map((item) => {
                      const Icon = item.icon
                      const active =
                        item.active ??
                        (item.href
                          ? pathname === item.href ||
                            (!item.exact && pathname.startsWith(`${item.href}/`))
                          : false)

                      if (item.onSelect) {
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false)
                              item.onSelect?.()
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                              active
                                ? "bg-primary/10 text-primary font-bold"
                                : "text-ink-700 hover:bg-ink-100 hover:text-ink"
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-ink-500"}`} />
                            <span>{item.label}</span>
                          </button>
                        )
                      }

                      return (
                        <Link
                          key={item.key}
                          href={item.href ?? "#"}
                          onClick={() => setUserMenuOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                            active
                              ? "bg-primary/10 text-primary font-bold"
                              : "text-ink-700 hover:bg-ink-100 hover:text-ink"
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-ink-500"}`} />
                          <span>{item.label}</span>
                        </Link>
                      )
                    })}
                  </div>

                  {/* Garis Pemisah */}
                  <div className="border-t border-ink-150/70 my-1" />

                  {/* Tombol Logout */}
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false)
                      // Jangan tinggalkan data akun ini di peramban bersama.
                      clearUserCache(session?.user?.id)
                      signOut({ callbackUrl: signOutCallbackUrl })
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Keluar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Breadcrumb opsional */}
        {pageTitle && (
          <div className="flex items-center gap-2 text-xs">
            <Link
              href={breadcrumbHref}
              className="font-semibold text-ink-600 hover:text-ink-700 transition"
            >
              {breadcrumbLabel}
            </Link>
            <span className="text-ink-300" aria-hidden="true">
              /
            </span>
            <span className="font-bold text-primary bg-rose-50 px-2.5 py-1 rounded-lg">
              {pageTitle}
            </span>
          </div>
        )}

        {children}
      </main>
    </div>
  )
}
