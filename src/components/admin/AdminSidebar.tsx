"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  TrendingUp,
  Landmark,
  Briefcase,
  UserPlus,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { usersDatabase } from "@/lib/users"

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: string
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const navItems: NavItem[] = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Kurasi Karya", href: "/admin/moderasi", icon: FileCheck2 },
    { name: "Trend Karya", href: "/admin/trend-karya", icon: TrendingUp },
    { name: "BLUD", href: "/admin/blud", icon: Landmark },
    { name: "BKK & Mitra", href: "/admin/bkk", icon: Briefcase },
    { name: "Rekrutmen PKL/Magang", href: "/admin/pendaftaran-mitra", icon: UserPlus },
    { name: "Kelola Pengguna", href: "/admin/pengguna", icon: Users, badge: `${usersDatabase.length}` },
  ]

  return (
    <aside
      className={`w-full ${
        isSidebarCollapsed ? "xl:w-20 px-3 py-6" : "xl:w-64 2xl:w-72 p-6"
      } shrink-0 border-b xl:border-b-0 xl:border-r border-slate-100 flex flex-col justify-between bg-white transition-all duration-300 ease-in-out xl:sticky xl:top-0 xl:h-screen xl:self-start xl:overflow-y-auto`}
    >
      <div>
        {/* Logo Brand Header & Expand/Collapse Toggle Button */}
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

          {/* Toggle Button Positioned beside the logo */}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer shrink-0"
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

        {/* Navigation Section: OVERVIEW */}
        <div className="mb-7">
          {!isSidebarCollapsed && (
            <span className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3 px-3">
              OVERVIEW
            </span>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={item.name}
                  className={`relative w-full flex items-center ${
                    isSidebarCollapsed
                      ? "xl:justify-center px-3 py-2.5"
                      : "justify-between px-3.5 py-2.5"
                  } rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-100 text-[#891337] font-bold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div
                    className={`flex items-center ${
                      isSidebarCollapsed ? "xl:justify-center" : "gap-3"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-[#891337]" : "text-slate-400"
                      }`}
                    />
                    {!isSidebarCollapsed && (
                      <span className="whitespace-nowrap">{item.name}</span>
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
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section: SETTINGS & LOGOUT */}
      <div className="pt-4 border-t border-slate-100 space-y-1">
        <Link
          href="/admin/pengaturan"
          title="Pengaturan"
          className={`flex items-center ${
            isSidebarCollapsed ? "xl:justify-center px-3 py-2.5" : "gap-3 px-3.5 py-2"
          } rounded-xl text-xs font-semibold transition ${
            pathname === "/admin/pengaturan"
              ? "bg-slate-100 text-[#891337] font-bold shadow-2xs"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Settings
            className={`w-4 h-4 shrink-0 ${
              pathname === "/admin/pengaturan" ? "text-[#891337]" : "text-slate-400"
            }`}
          />
          {!isSidebarCollapsed && (
            <span className="whitespace-nowrap">Pengaturan</span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          title="Keluar"
          className={`w-full flex items-center ${
            isSidebarCollapsed ? "xl:justify-center px-3 py-2.5" : "gap-3 px-3.5 py-2"
          } rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer`}
        >
          <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
          {!isSidebarCollapsed && (
            <span className="whitespace-nowrap">Keluar</span>
          )}
        </button>
      </div>
    </aside>
  )
}
