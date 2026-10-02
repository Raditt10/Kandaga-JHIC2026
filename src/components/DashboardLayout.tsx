"use client";

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  Home,
  GraduationCap,
  Building2,
  BookOpen,
  Briefcase,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Bell,
  Search,
  ExternalLink,
  Layers,
} from "lucide-react"

export interface DashboardTab {
  id: string
  label: string
  icon: React.ElementType
  badge?: string
}

interface DashboardLayoutProps {
  roleTitle: string
  roleSlug: "student" | "admin" | "company" | "teacher" | "bkk"
  badgeColor: string
  icon: React.ElementType
  tabs?: DashboardTab[]
  activeTab?: string
  onTabChange?: (tabId: string) => void
  children: React.ReactNode
}

const allPortalRoles = [
  { slug: "student", label: "Portal Siswa", path: "/student", icon: GraduationCap, color: "from-rose-500 to-pink-600" },
  { slug: "admin", label: "Administrator", path: "/admin/dashboard", icon: ShieldCheck, color: "from-[#891337] to-[#a61743]" },
  { slug: "company", label: "Mitra Perusahaan", path: "/company", icon: Building2, color: "from-blue-600 to-indigo-700" },
  { slug: "teacher", label: "Portal Guru", path: "/teacher", icon: BookOpen, color: "from-amber-600 to-orange-600" },
  { slug: "bkk", label: "Bursa Kerja Khusus", path: "/bkk", icon: Briefcase, color: "from-emerald-600 to-teal-700" },
]

export default function DashboardLayout({
  roleTitle,
  roleSlug,
  icon: Icon,
  tabs = [],
  activeTab,
  onTabChange,
  children,
}: DashboardLayoutProps) {
  const { data: session } = useSession()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false)

  const activeTabObj = tabs.find((t) => t.id === activeTab) || tabs[0]
  const userDisplayName = session?.user?.username || session?.user?.name || "Pengguna Kandaga"
  const userEmail = session?.user?.email || "user@smkn13bandung.sch.id"

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 font-sans flex antialiased">
      {/* ──────────────── 1. BACKDROP UNTUK MOBILE SIDEBAR ──────────────── */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* ──────────────── 2. PROFESSIONAL MAROON SIDEBAR ──────────────── */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-[#180308] via-[#140206] to-[#0f0104] text-white flex flex-col justify-between border-r border-[#3d0b17] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Top Section: Brand + Workspace Switcher + Navigation */}
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar p-4 space-y-5">
          {/* Brand Header */}
          <div className="flex items-center justify-between pt-1 px-1">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 relative rounded-xl overflow-hidden bg-white/10 ring-1 ring-white/20 p-1 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Image
                  src="/logo.png"
                  alt="Kandaga Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-heading font-black text-lg tracking-tight text-white block leading-none">
                  KANDAGA
                </span>
                <span className="text-[10px] font-mono tracking-widest text-rose-300/70 uppercase block mt-1">
                  Portal SMKN 13
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role / Workspace Selector Card (gaya Outcrowd / Task Manager) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${badgeColor} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold text-rose-300/80 uppercase tracking-wider block font-mono">
                    Workspace Role
                  </span>
                  <span className="font-heading font-bold text-xs text-white truncate block">
                    {roleTitle}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 group-hover:text-white transition-transform duration-200 shrink-0 ${
                  isRoleDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Role Switcher */}
            {isRoleDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 p-1.5 rounded-2xl bg-[#22050b] border border-[#4d0e1d] shadow-xl z-50 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  Ganti Portal Role
                </div>
                {allPortalRoles.map((r) => {
                  const RoleIcon = r.icon
                  const isCurrent = r.slug === roleSlug
                  return (
                    <Link
                      key={r.slug}
                      href={r.path}
                      onClick={() => setIsRoleDropdownOpen(false)}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition ${
                        isCurrent
                          ? "bg-[#8B1A2F] text-white font-bold"
                          : "text-zinc-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <RoleIcon className="w-3.5 h-3.5" />
                        <span>{r.label}</span>
                      </div>
                      {isCurrent && <span className="text-[10px] font-mono opacity-80">Aktif</span>}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Navigation Menu Links */}
          <div className="space-y-1 pt-1">
            <span className="px-3 text-[10px] font-extrabold tracking-widest uppercase text-rose-300/50 block mb-2 font-mono">
              Menu Navigasi
            </span>
            {tabs.map((tab) => {
              const TabIcon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    onTabChange && onTabChange(tab.id)
                    setIsMobileSidebarOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? "bg-gradient-to-r from-[#8B1A2F] to-[#a61743] text-white shadow-md shadow-[#8B1A2F]/30 font-bold"
                      : "text-zinc-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TabIcon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? "text-white" : "text-zinc-400 group-hover:text-white"
                      }`}
                    />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-rose-200"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Akses Cepat Website */}
          <div className="space-y-1 pt-4 border-t border-white/10">
            <span className="px-3 text-[10px] font-extrabold tracking-widest uppercase text-rose-300/50 block mb-2 font-mono">
              Akses Galeri & Website
            </span>
            <Link
              href="/"
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition"
            >
              <Home className="w-4 h-4 text-zinc-400" />
              <span>Beranda Utama</span>
            </Link>
            <Link
              href="/galeri-karya"
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition"
            >
              <Layers className="w-4 h-4 text-zinc-400" />
              <span>Galeri Karya Siswa</span>
            </Link>
          </div>
        </div>

        {/* Bottom Section: User Profile & Logout */}
        <div className="p-3 border-t border-white/10 bg-[#120205] space-y-2">
          {/* User Profile Card */}
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B1A2F] to-rose-400 text-white font-bold text-xs flex items-center justify-center uppercase shrink-0 ring-1 ring-white/20">
                {userDisplayName.charAt(0)}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-white truncate block">
                  {userDisplayName}
                </span>
                <span className="text-[10px] text-zinc-400 truncate block font-mono">
                  {userEmail}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              title="Keluar"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-white/10 transition cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ──────────────── 3. MAIN CONTENT CONTAINER ──────────────── */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Header Bar for Dashboard */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-8 flex items-center justify-between shadow-2xs">
          {/* Left: Mobile Toggle & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 transition cursor-pointer"
              aria-label="Buka Sidebar Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-zinc-400 hidden sm:inline">Kandaga</span>
              <span className="text-zinc-300 hidden sm:inline">/</span>
              <span className="font-semibold text-zinc-500 hidden sm:inline">{roleTitle}</span>
              <span className="text-zinc-300 hidden sm:inline">/</span>
              <span className="font-bold text-[#8B1A2F] bg-rose-50 px-2.5 py-1 rounded-lg">
                {activeTabObj?.label || "Dashboard"}
              </span>
            </div>
          </div>

          {/* Right: User Status & Back to Web Link */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-zinc-800">{userDisplayName}</span>
              <span className="text-zinc-400 uppercase text-[10px]">({roleSlug})</span>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lihat Web</span>
            </Link>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-rose-50 text-zinc-600 hover:text-rose-700 text-xs font-bold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
