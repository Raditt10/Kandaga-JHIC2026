"use client"

/**
 * DashboardShell — chrome bersama untuk SELURUH dashboard role.
 *
 * Dibuat dengan menyalin gaya visual dashboard Administrator (sidebar terang
 * yang bisa dilipat + header putih dengan pencarian, mail, notifikasi, dan
 * kartu identitas pengguna + palet `slate` dengan aksen #891337), lalu
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

import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  Bell,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
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
  /** Ikon peran — ditampilkan sebagai chip kecil di header. */
  roleIcon?: React.ElementType
  /** Kelas gradien Tailwind untuk chip ikon peran. */
  roleAccent?: string
  /** Judul grup menu di sidebar. */
  navSectionLabel?: string
  searchPlaceholder?: string
  /** Label menu kanan bawah; default "Lihat Website". */
  settingsLabel?: string
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

const DEFAULT_ACCENT = "from-[#891337] to-[#a61743]"

export default function DashboardShell({
  navItems,
  roleLabel,
  roleIcon: RoleIcon,
  roleAccent = DEFAULT_ACCENT,
  navSectionLabel = "OVERVIEW",
  searchPlaceholder = "Cari...",
  settingsLabel = "Lihat Website",
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
    <div className="min-h-screen w-full bg-white flex flex-col xl:flex-row font-sans antialiased text-slate-800">
      {/* ──────────────── 1. SIDEBAR ──────────────── */}
      <aside
        className={`w-full ${
          isSidebarCollapsed ? "xl:w-20 px-3 py-6" : "xl:w-64 2xl:w-72 p-6"
        } shrink-0 border-b xl:border-b-0 xl:border-r border-slate-100 flex flex-col justify-between bg-white transition-all duration-300 ease-in-out xl:sticky xl:top-0 xl:h-screen xl:self-start xl:overflow-y-auto`}
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
              <div className="w-8 h-8 relative rounded-full overflow-hidden shadow-xs ring-1 ring-zinc-900/5 transition-transform duration-200 group-hover:scale-105 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Kandaga Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              {!isSidebarCollapsed && (
                <span className="select-none font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-zinc-950 via-[#4e0e20] to-[#a61743] bg-clip-text text-transparent group-hover:from-zinc-900 group-hover:to-[#b81d4a] transition-all duration-300 whitespace-nowrap">
                  KANDAGA
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden xl:block p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer shrink-0"
              title={isSidebarCollapsed ? "Perbesar Sidebar" : "Perkecil Sidebar"}
              aria-label={isSidebarCollapsed ? "Perbesar Sidebar" : "Perkecil Sidebar"}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-slate-600" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-slate-600" />
              )}
            </button>
          </div>

          {/* Navigasi utama */}
          <div className="mb-7">
            {!isSidebarCollapsed && (
              <span className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3 px-3">
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
                    ? "bg-slate-100 text-[#891337] font-bold shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
                          isActive ? "text-[#891337]" : "text-slate-400"
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
                            ? "bg-[#891337]/10 text-[#891337]"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isSidebarCollapsed && item.badge && (
                      <span className="hidden xl:block absolute top-2 right-2 w-2 h-2 rounded-full bg-[#891337]" />
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

        {/* Bagian bawah: akses web + keluar */}
        <div className="pt-4 border-t border-slate-100 space-y-1">
          {!isSidebarCollapsed && (
            <span className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2 px-3">
              SETTINGS
            </span>
          )}
          <Link
            href="/"
            title={settingsLabel}
            className={`flex items-center ${
              isSidebarCollapsed
                ? "xl:justify-center px-3 py-2.5"
                : "gap-3 px-3.5 py-2"
            } rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition`}
          >
            <Settings className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
            {!isSidebarCollapsed && (
              <span className="whitespace-nowrap">{settingsLabel}</span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: signOutCallbackUrl })}
            title="Keluar"
            className={`w-full flex items-center ${
              isSidebarCollapsed
                ? "xl:justify-center px-3 py-2.5"
                : "gap-3 px-3.5 py-2"
            } rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer`}
          >
            <LogOut className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
            {!isSidebarCollapsed && (
              <span className="whitespace-nowrap">Keluar</span>
            )}
          </button>
        </div>
      </aside>

      {/* ──────────────── 2. AREA KONTEN ──────────────── */}
      <main className="flex-1 p-6 sm:p-8 space-y-7 bg-white min-w-0">
        {/* Header: pencarian + aksi + identitas pengguna */}
        <div className="flex items-center justify-between gap-4">
          <form onSubmit={kirimPencarian} className="flex-1 relative max-w-lg">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"
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
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#891337]/15 focus:border-[#891337] transition"
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
                className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-800 transition relative cursor-pointer"
              >
                <Bell className="w-4 h-4" aria-hidden="true" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#891337] text-white text-[9px] font-bold flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[85vw] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">Notifikasi</span>
                    {unread > 0 && (
                      <button
                        type="button"
                        onClick={() => tandaiDibaca()}
                        className="text-[11px] font-semibold text-[#891337] hover:underline cursor-pointer"
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifs.length === 0 ? (
                      <p className="px-4 py-6 text-center text-xs text-slate-400">
                        Belum ada notifikasi.
                      </p>
                    ) : (
                      notifs.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => !n.isRead && tandaiDibaca(n.id)}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition cursor-pointer ${
                            n.isRead ? "" : "bg-rose-50/40"
                          }`}
                        >
                          <span className="block text-xs font-bold text-slate-800">
                            {n.title}
                          </span>
                          <span className="block text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {n.content}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-1">
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

            {RoleIcon && (
              <span
                title={roleLabel}
                className={`hidden sm:flex w-9 h-9 rounded-xl bg-gradient-to-br ${roleAccent} text-white items-center justify-center shadow-xs`}
              >
                <RoleIcon className="w-4 h-4" aria-hidden="true" />
              </span>
            )}

            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#891337] to-[#a61743] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {userName.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-slate-900 leading-tight">
                  {userName}
                </span>
                <span className="block text-[10px] text-slate-400 font-medium">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb opsional */}
        {pageTitle && (
          <div className="flex items-center gap-2 text-xs">
            <Link
              href={breadcrumbHref}
              className="font-semibold text-slate-400 hover:text-slate-700 transition"
            >
              Dashboard
            </Link>
            <span className="text-slate-300" aria-hidden="true">
              /
            </span>
            <span className="font-bold text-[#891337] bg-rose-50 px-2.5 py-1 rounded-lg">
              {pageTitle}
            </span>
          </div>
        )}

        {children}
      </main>
    </div>
  )
}
