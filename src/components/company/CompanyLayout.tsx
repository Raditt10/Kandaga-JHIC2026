"use client";

/**
 * CompanyLayout — layout khusus dashboard perusahaan mitra.
 *
 * Berbeda dari DashboardLayout generik karena:
 * - Navbar khusus company dengan 4 menu sesuai alurMitra.md §3
 * - Tidak memakai landing Navbar (mencegah tumpang tindih UI)
 * - Menampilkan chip status verifikasi perusahaan
 * - Avatar + nama perusahaan di kanan navbar
 *
 * Heading hierarchy halaman yang menggunakan layout ini:
 *   Navbar: landmark navigation (bukan heading)
 *   h1: judul halaman (di dalam {children})
 */

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  Building2, Search, Bookmark, ClipboardList,
  User, LogOut, ChevronDown, Menu, X,
  CheckCircle2,
} from "lucide-react";

const NAV_ITEMS = [
  {
    href:  "/company/katalog",
    label: "Jelajahi Katalog",
    icon:  Search,
    desc:  "Temukan talenta siswa",
  },
  {
    href:  "/company/tersimpan",
    label: "Talenta Tersimpan",
    icon:  Bookmark,
    desc:  "Bookmark karya",
  },
  {
    href:  "/company/riwayat",
    label: "Riwayat Permintaan",
    icon:  ClipboardList,
    desc:  "Status ajuan minat",
  },
  {
    href:  "/company/profil",
    label: "Profil Perusahaan",
    icon:  User,
    desc:  "Edit data perusahaan",
  },
] as const;

interface CompanyLayoutProps {
  children: React.ReactNode;
  /** Judul halaman untuk breadcrumb (opsional) */
  pageTitle?: string;
}

export default function CompanyLayout({ children, pageTitle }: CompanyLayoutProps) {
  const { data: session } = useSession();
  const pathname          = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const companyName = session?.user?.name ?? "Perusahaan";
  const email       = session?.user?.email ?? "";

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">

      {/* ── Top navbar company ── */}
      <header className="sticky top-0 z-50 border-b border-ink-150 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">

            {/* Logo */}
            <Link href="/company" className="flex items-center gap-2 shrink-0 group">
              <div className="w-7 h-7 relative rounded-full overflow-hidden ring-1 ring-ink/5 transition-transform group-hover:scale-105">
                <Image src="/logo.png" alt="Kandaga" fill className="object-contain" priority />
              </div>
              <span className="font-heading font-extrabold text-sm bg-gradient-to-r from-ink via-primary to-primary bg-clip-text text-transparent hidden sm:block">
                KANDAGA
              </span>
              {/* Badge mitra */}
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                Mitra
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Navigasi dashboard mitra">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/");
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

            {/* Avatar + dropdown profil */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-ink-150 bg-white hover:bg-ink-100 transition-colors text-sm"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {companyName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block max-w-[120px] truncate text-xs font-semibold text-ink">
                    {companyName}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-ink-300 transition-transform ${profileOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-ink-150 rounded-2xl shadow-lg p-2 z-50">
                    <div className="px-3 py-2 border-b border-ink-150 mb-1">
                      <p className="text-xs font-bold text-ink truncate">{companyName}</p>
                      <p className="text-xs text-ink-600 truncate font-mono">{email}</p>
                    </div>
                    <Link
                      href="/company/profil"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-ink-700 hover:bg-ink-100 transition-colors"
                    >
                      <User className="w-4 h-4 text-ink-300" aria-hidden="true" />
                      Profil Perusahaan
                    </Link>
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
            {NAV_ITEMS.map(({ href, label, icon: Icon, desc }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
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
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-ink-600">{desc}</p>
                  </div>
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

      {/* ── Konten halaman ── */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb / page title */}
        {pageTitle && (
          <div className="mb-6 flex items-center gap-2 text-sm text-ink-600">
            <Link href="/company" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-ink">{pageTitle}</span>
          </div>
        )}
        {children}
      </main>

    </div>
  );
}
