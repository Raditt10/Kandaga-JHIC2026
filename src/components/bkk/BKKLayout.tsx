"use client";

/**
 * BKKLayout — layout khusus dashboard Koordinator BKK.
 * Navbar dengan 4 menu: Dashboard, Verifikasi Akun, Antrian Kontak, Manajemen Mitra
 *
 * Heading hierarchy halaman yang menggunakan layout ini:
 *   Navbar: landmark navigation
 *   h1: judul halaman (di dalam {children})
 */

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard, ShieldCheck, MessageSquare,
  Building2, LogOut, ChevronDown, Menu, X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/bkk",             label: "Dashboard",        icon: LayoutDashboard },
  { href: "/bkk/verifikasi",  label: "Verifikasi Akun",  icon: ShieldCheck },
  { href: "/bkk/kontak",      label: "Antrian Kontak",   icon: MessageSquare },
  { href: "/bkk/mitra",       label: "Manajemen Mitra",  icon: Building2 },
] as const;

export default function BKKLayout({
  children,
  pageTitle,
}: {
  children: React.ReactNode;
  pageTitle?: string;
}) {
  const { data: session } = useSession();
  const pathname          = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);

  const userName = session?.user?.name ?? "Koordinator BKK";
  const email    = session?.user?.email ?? "";

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">

      {/* ── Top navbar ── */}
      <header className="sticky top-0 z-50 border-b border-ink-150 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">

            {/* Logo + badge BKK */}
            <Link href="/bkk" className="flex items-center gap-2 shrink-0 group">
              <div className="w-7 h-7 relative rounded-full overflow-hidden ring-1 ring-ink/5 transition-transform group-hover:scale-105">
                <Image src="/logo.png" alt="Kandaga" fill className="object-contain" priority />
              </div>
              <span className="font-heading font-extrabold text-sm bg-gradient-to-r from-ink via-primary to-primary bg-clip-text text-transparent hidden sm:block">
                KANDAGA
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                BKK
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Navigasi dashboard BKK">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== "/bkk" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/8 text-primary"
                        : "text-ink-700 hover:bg-ink-100 hover:text-ink"
                    }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Avatar dropdown */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-ink-150 bg-white hover:bg-ink-100 transition-colors text-sm"
                  aria-expanded={profileOpen}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block max-w-[100px] truncate text-xs font-semibold text-ink">
                    {userName}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-ink-300 transition-transform ${profileOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-ink-150 rounded-2xl shadow-lg p-2 z-50">
                    <div className="px-3 py-2 border-b border-ink-150 mb-1">
                      <p className="text-xs font-bold text-ink truncate">{userName}</p>
                      <p className="text-xs text-ink-600 truncate font-mono">{email}</p>
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                        Koordinator BKK
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-1.5 rounded-lg text-ink-700 hover:bg-ink-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-ink-150 bg-white px-4 py-3 space-y-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== "/bkk" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    isActive ? "bg-primary/8 text-primary" : "text-ink-700 hover:bg-ink-100"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span className="text-sm font-semibold">{label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-ink-150">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                Keluar
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Konten ── */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {pageTitle && (
          <div className="mb-6 flex items-center gap-2 text-sm text-ink-600">
            <Link href="/bkk" className="hover:text-primary transition-colors">Dashboard</Link>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-ink">{pageTitle}</span>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
