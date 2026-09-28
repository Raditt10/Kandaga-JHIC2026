"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import {
  LogOut,
  ShieldAlert,
  User,
  Mail,
  ShieldCheck,
  GraduationCap,
  Building2,
  BookOpen,
  Briefcase,
  ExternalLink,
} from "lucide-react"

interface DashboardLayoutProps {
  roleTitle: string
  roleSlug: "student" | "admin" | "company" | "teacher" | "bkk"
  badgeColor: string
  icon: React.ElementType
  children: React.ReactNode
}

export default function DashboardLayout({
  roleTitle,
  roleSlug,
  badgeColor,
  icon: Icon,
  children,
}: DashboardLayoutProps) {
  const { data: session } = useSession()

  const currentRole = (session?.user?.role || "student").toLowerCase()
  const normalizedCurrentRole =
    currentRole === "students" ? "student" : currentRole === "bkk" ? "bkk" : currentRole

  const isRoleMatching = normalizedCurrentRole === roleSlug

  return (
    <div className="min-h-screen bg-[#fafafc] text-zinc-900 font-sans selection:bg-[#90133b] selection:text-white flex flex-col justify-between">
      {/* Top Floating Pill Header */}
      <header className="sticky top-4 z-50 px-4 w-full">
        <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-xl border border-zinc-200/80 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.08)] rounded-full px-6 py-3 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-1 group">
            <div className="w-8 h-8 relative rounded-full overflow-hidden shadow-xs ring-1 ring-zinc-900/5 transition-transform duration-200 group-hover:scale-105 shrink-0">
              <Image src="/logo.png" alt="Kandaga Logo" fill className="object-contain" priority />
            </div>
            <span className="inline-flex items-center select-none -ml-0.5 bg-gradient-to-r from-zinc-950 via-[#4e0e20] to-[#a61743] bg-clip-text text-transparent">
              <span className="font-tangerine font-bold text-3xl leading-none inline-block -translate-y-[1px]">K</span>
              <span className="font-extrabold text-[15px] tracking-tight -ml-0.5">andaga</span>
            </span>
          </Link>

          {/* User Session Info Badge */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100/80 border border-zinc-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-zinc-800">{session?.user?.username || "Pengguna"}</span>
              <span className="text-zinc-400">•</span>
              <span className="text-zinc-500 font-mono text-[11px]">{session?.user?.email}</span>
            </div>

            <div className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${badgeColor} flex items-center gap-1.5 shadow-xs`}>
              <Icon className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider">{roleTitle}</span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition cursor-pointer"
              title="Keluar / Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        {/* Security / Access Verification Banner */}
        {!isRoleMatching && session?.user && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold">Peringatan Hak Akses Role</p>
                <p className="text-amber-700 font-normal">
                  Role Anda saat ini adalah <strong className="uppercase">{session.user.role}</strong>. Halaman ini diproteksi khusus untuk role <strong className="uppercase">{roleSlug}</strong>.
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/${normalizedCurrentRole}`}
              className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold text-xs hover:bg-amber-700 transition"
            >
              Ke Portal {session.user.role}
            </Link>
          </div>
        )}

        {children}
      </main>

      {/* Role Navigation Bar Footer */}
      <footer className="bg-white border-t border-zinc-200 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            <span className="font-bold text-zinc-800">Kandaga RBAC System</span> • 5 Protected Role Dashboards
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-zinc-400 font-semibold mr-1">Switch Role View:</span>
            {[
              { slug: "student", label: "Student", icon: GraduationCap },
              { slug: "admin", label: "Admin", icon: ShieldCheck },
              { slug: "company", label: "Company", icon: Building2 },
              { slug: "teacher", label: "Teacher", icon: BookOpen },
              { slug: "bkk", label: "BKK", icon: Briefcase },
            ].map((r) => (
              <Link
                key={r.slug}
                href={`/dashboard/${r.slug}`}
                className={`px-3 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition ${
                  roleSlug === r.slug
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                <span>{r.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
