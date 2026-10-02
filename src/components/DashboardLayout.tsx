"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  ShieldAlert,
  GraduationCap,
  Building2,
  BookOpen,
  Briefcase,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  Layers,
  Upload,
  FolderOpen,
} from "lucide-react";

export type RoleSlug = "student" | "admin" | "company" | "teacher" | "bkk";

interface DashboardLayoutProps {
  roleTitle: string;
  roleSlug: RoleSlug;
  badgeColor?: string;
  icon?: React.ElementType;
  pageTitle?: string;
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const ROLE_NAV_ITEMS: Record<RoleSlug, NavItem[]> = {
  student: [
    { href: "/student", label: "Ringkasan", icon: Layers },
    { href: "/student/my-projects", label: "Karya Saya", icon: FolderOpen },
    { href: "/student/create-project", label: "Unggah Karya", icon: Upload },
    { href: "/gallery", label: "Galeri Publik", icon: ExternalLink },
  ],
  admin: [
    { href: "/admin", label: "Tata Kelola", icon: ShieldCheck },
    { href: "/gallery", label: "Galeri Publik", icon: ExternalLink },
  ],
  teacher: [
    { href: "/teacher", label: "Kurasi Karya", icon: BookOpen },
    { href: "/gallery", label: "Galeri Publik", icon: ExternalLink },
  ],
  company: [
    { href: "/company", label: "Katalog Talenta", icon: Building2 },
    { href: "/gallery", label: "Galeri Publik", icon: ExternalLink },
  ],
  bkk: [
    { href: "/bkk", label: "Dashboard BKK", icon: Briefcase },
    { href: "/gallery", label: "Galeri Publik", icon: ExternalLink },
  ],
};

const ROLE_PREVIEW_TABS = [
  { slug: "student" as const, label: "Siswa", roleName: "Student", icon: GraduationCap },
  { slug: "teacher" as const, label: "Guru Kurator", roleName: "Teacher", icon: BookOpen },
  { slug: "admin" as const, label: "Admin Sekolah", roleName: "Admin", icon: ShieldCheck },
  { slug: "bkk" as const, label: "BKK", roleName: "BKK", icon: Briefcase },
  { slug: "company" as const, label: "Mitra Industri", roleName: "Company", icon: Building2 },
];

export default function DashboardLayout({
  roleTitle,
  roleSlug,
  icon: Icon,
  pageTitle,
  children,
}: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const rawRole = (session?.user?.role || "student").toLowerCase();
  const normalizedCurrentRole: RoleSlug =
    rawRole === "students" || rawRole === "student"
      ? "student"
      : rawRole === "admin"
      ? "admin"
      : rawRole === "teacher"
      ? "teacher"
      : rawRole === "company"
      ? "company"
      : rawRole === "bkk"
      ? "bkk"
      : "student";

  const isRoleMatching = normalizedCurrentRole === roleSlug;
  const navItems = ROLE_NAV_ITEMS[roleSlug] || ROLE_NAV_ITEMS.student;
  const userName = session?.user?.username || session?.user?.name || "Pengguna";
  const userEmail = session?.user?.email || "pengguna@smkn13bdg.sch.id";

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-ink font-sans flex flex-col selection:bg-primary selection:text-white">
      {/* ── Top Dedicated App Shell Header ── */}
      <header className="sticky top-0 z-50 border-b border-ink-150 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            {/* Brand Logo & Role Pill */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 relative rounded-full overflow-hidden ring-1 ring-ink/10 transition-transform group-hover:scale-105 bg-white">
                  <Image src="/logo.png" alt="Kandaga Logo" fill className="object-contain p-0.5" priority />
                </div>
                <div className="hidden sm:block">
                  <span className="font-heading font-extrabold text-sm tracking-tight text-ink">
                    KANDAGA
                  </span>
                </div>
              </Link>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cream border border-ink-150 text-primary text-xs font-bold tracking-wide">
                {Icon && <Icon className="w-3.5 h-3.5 text-primary" aria-hidden="true" />}
                <span>{roleTitle}</span>
              </span>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1" aria-label={`Navigasi Portal ${roleTitle}`}>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const ItemIcon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-primary text-white shadow-xs"
                        : "text-ink-700 hover:bg-cream hover:text-ink"
                    }`}
                  >
                    <ItemIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Profile Dropdown & Mobile Toggle */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-ink-150 bg-white hover:bg-cream transition-colors text-xs cursor-pointer shadow-xs"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                >
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block max-w-[120px] truncate font-semibold text-ink">
                    {userName}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-ink-300 transition-transform ${profileOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-ink-150 rounded-2xl shadow-xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-ink-150 mb-1">
                      <p className="text-xs font-bold text-ink truncate font-heading">{userName}</p>
                      <p className="text-xs text-ink-600 truncate font-mono">{userEmail}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-cream text-primary text-[10px] font-bold uppercase tracking-wider">
                        Peran: {session?.user?.role || roleSlug}
                      </span>
                    </div>

                    <Link
                      href="/"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-ink-700 hover:bg-cream transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-ink-300" aria-hidden="true" />
                      <span>Beranda Sekolah</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Keluar Sesi</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger */}
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-1.5 rounded-lg text-ink-700 hover:bg-cream transition-colors cursor-pointer"
                aria-label="Menu navigasi mobile"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-ink-150 bg-white px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const ItemIcon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isActive ? "bg-primary text-white" : "text-ink-700 hover:bg-cream"
                  }`}
                >
                  <ItemIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-ink-150">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Main Operational Workspace ── */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Bar */}
        <div className="mb-6 flex items-center gap-2 text-xs text-ink-600">
          <Link href="/" className="hover:text-primary transition-colors">
            Kandaga
          </Link>
          <span aria-hidden="true">/</span>
          <Link href={`/${roleSlug}`} className="hover:text-primary transition-colors font-medium">
            Portal {roleTitle}
          </Link>
          {pageTitle && (
            <>
              <span aria-hidden="true">/</span>
              <span className="font-semibold text-ink">{pageTitle}</span>
            </>
          )}
        </div>

        {/* Role Mismatch Warning Notice (With valid non-404 route link) */}
        {!isRoleMatching && session?.user && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <p className="font-heading font-bold text-amber-950">Pemberitahuan Hak Akses Akun</p>
                <p className="text-amber-800 mt-0.5">
                  Akun Anda masuk dengan peran <strong className="uppercase font-mono">{session.user.role}</strong>. Halaman ini adalah area kerja khusus peran <strong className="uppercase font-mono">{roleSlug}</strong>.
                </p>
              </div>
            </div>
            <Link
              href={`/${normalizedCurrentRole}`}
              className="inline-flex items-center justify-center px-3.5 py-1.5 bg-amber-700 text-white rounded-xl font-semibold text-xs hover:bg-amber-800 transition shrink-0"
            >
              Buka Portal {session.user.role}
            </Link>
          </div>
        )}

        {/* Dynamic Workspace Content */}
        {children}

        {/* ── Pitch & Demo Quick Role Switcher Bar ── */}
        <section aria-label="Simulasi Akses Peran" className="mt-12 p-4 sm:p-5 bg-white rounded-2xl border border-ink-150 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-heading text-xs font-bold text-ink">
                Simulasi Akses Peran (Mode Presentasi & Pitch JHIC)
              </p>
              <p className="text-xs text-ink-600 mt-0.5">
                Beralih cepat antar 5 peran untuk meninjau tata kerja kurasi dan verifikasi Kandaga.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {ROLE_PREVIEW_TABS.map((tab) => {
                const TabIcon = tab.icon;
                const isCurrentTab = roleSlug === tab.slug;
                return (
                  <Link
                    key={tab.slug}
                    href={`/${tab.slug}`}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isCurrentTab
                        ? "bg-primary text-white shadow-xs"
                        : "bg-cream text-ink-700 border border-ink-150 hover:bg-white hover:text-primary"
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* ── Compact Operational Footer ── */}
      <footer className="border-t border-ink-150 bg-white py-4 px-4 sm:px-8 text-center text-xs text-ink-600">
        <p>
          Kandaga © {new Date().getFullYear()} SMK Negeri 13 Bandung · Analis Kimia · Rekayasa Perangkat Lunak · Teknik Komputer Jaringan
        </p>
      </footer>
    </div>
  );
}
