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

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
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
} from "lucide-react"

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
  /** Label menu kanan bawah; default "Lihat Website". */
  settingsLabel?: string
  /**
   * Menu tambahan di blok SETTINGS, dirender di atas "Lihat Website".
   * Dipakai supaya setiap role punya entri "Pengaturan" yang seragam.
   */
  settingsItems?: ShellNavItem[]
  signOutCallbackUrl?: string
  /** Bila diisi, tampilkan breadcrumb di atas konten. */
  pageTitle?: string
  /** Tujuan tautan "Dashboard" pada breadcrumb. */
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

export default function DashboardShell({
  navItems,
  roleLabel,
  navSectionLabel = "OVERVIEW",
  searchPlaceholder = "Cari...",
  settingsLabel = "Lihat Website",
  settingsItems = [],
  signOutCallbackUrl = "/auth/login",
  pageTitle,
  breadcrumbHref = "/",
  children,
}: DashboardShellProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // ── Notifikasi nyata dari database (sebelumnya lonceng hanya hiasan) ──
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState<TNotif[]>([])
  const [unread, setUnread] = useState(0)

  // ── Menu dropdown profil pengguna di header ──
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [userMenuOpen])

  useEffect(() => {
    setUserMenuOpen(false)
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
        className={`w-full ${
          isSidebarCollapsed ? "xl:w-20 px-3 py-6" : "xl:w-64 2xl:w-72 p-6"
        } shrink-0 border-b xl:border-b-0 xl:border-r border-ink-150 flex flex-col justify-between bg-white transition-all duration-300 ease-in-out xl:sticky xl:top-0 xl:h-screen xl:self-start xl:overflow-y-auto`}
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
              href="/"
              aria-label="Beranda Kandaga"
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
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden xl:block p-1.5 rounded-xl text-ink-600 hover:text-ink hover:bg-ink-100 transition cursor-pointer shrink-0"
              title={isSidebarCollapsed ? "Perbesar Sidebar" : "Perkecil Sidebar"}
              aria-label={isSidebarCollapsed ? "Perbesar Sidebar" : "Perkecil Sidebar"}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-ink-600" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-ink-600" />
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

                const className = `relative w-full flex items-center ${
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
            <div className="relative">
              <button
                type="button"
                title="Notifikasi"
                aria-label={`Notifikasi${unread > 0 ? `, ${unread} belum dibaca` : ""}`}
                aria-expanded={notifOpen}
                onClick={() => {
                  setNotifOpen((v) => !v)
                  if (!notifOpen) muatNotifikasi()
                }}
                className="w-9 h-9 rounded-xl bg-ink-100 hover:bg-ink-100 border border-ink-150 flex items-center justify-center text-ink-600 hover:text-ink transition relative cursor-pointer"
              >
                <Bell className="w-4 h-4" aria-hidden="true" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[85vw] bg-white border border-ink-150 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-ink-150">
                    <span className="text-xs font-bold text-ink">Notifikasi</span>
                    {unread > 0 && (
                      <button
                        type="button"
                        onClick={() => tandaiDibaca()}
                        className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-ink-150">
                    {notifs.length === 0 ? (
                      <p className="px-4 py-6 text-center text-xs text-ink-600">
                        Belum ada notifikasi.
                      </p>
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
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-primary-dark text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-primary/10 group-hover:ring-primary/25 transition">
                  {userName.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="block text-xs font-bold text-ink leading-tight">
                    {userName}
                  </span>
                  <span className="block text-[10px] text-ink-600 font-medium">
                    {roleLabel}
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-dark text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {userName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-ink truncate">{userName}</p>
                      <p className="text-[11px] text-ink-500 truncate">{session?.user?.email || ""}</p>
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {roleLabel}
                      </span>
                    </div>
                  </div>

                  {/* Navigasi Settings & Website */}
                  <div className="space-y-0.5 py-1">
                    {settingsItems.map((item) => {
                      const Icon = item.icon
                      const active =
                        item.active ??
                        (item.href
                          ? pathname === item.href ||
                            (!item.exact && pathname.startsWith(`${item.href}/`))
                          : false)

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

                    <Link
                      href="/"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-ink-700 hover:bg-ink-100 hover:text-ink transition"
                    >
                      <ExternalLink className="w-4 h-4 text-ink-500" />
                      <span>{settingsLabel}</span>
                    </Link>
                  </div>

                  {/* Garis Pemisah */}
                  <div className="border-t border-ink-150/70 my-1" />

                  {/* Tombol Logout */}
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false)
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
              Dashboard
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
