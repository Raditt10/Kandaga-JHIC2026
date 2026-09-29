"use client"

import React from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import {
  ShieldAlert,
  GraduationCap,
  Building2,
  BookOpen,
  Briefcase,
  ShieldCheck,
  LogOut,
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
      {/* Landing Page Navbar */}
      <Navbar />

      {/* Main Content Area sitting below fixed navbar */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-24 sm:pt-28 pb-12 flex-1">
        {/* Role Sub-Header Banner */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${badgeColor} flex items-center gap-1.5 shadow-xs`}>
              <Icon className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider">{roleTitle}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-zinc-800">{session?.user?.username || "Pengguna"}</span>
              <span>({session?.user?.email})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-3 py-1.5 text-xs font-bold text-zinc-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer flex items-center gap-1.5 border border-zinc-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

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
              href={`/${normalizedCurrentRole}/dashboard`}
              className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold text-xs hover:bg-amber-700 transition"
            >
              Ke Portal {session.user.role}
            </Link>
          </div>
        )}

        {children}

        {/* Demo Quick Role Switcher Bar */}
        <div className="mt-12 p-4 bg-white rounded-2xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <span className="font-bold text-zinc-800">Switch Role Portal View:</span>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { slug: "student", label: "Student", icon: GraduationCap },
              { slug: "admin", label: "Admin", icon: ShieldCheck },
              { slug: "company", label: "Company", icon: Building2 },
              { slug: "teacher", label: "Teacher", icon: BookOpen },
              { slug: "bkk", label: "BKK", icon: Briefcase },
            ].map((r) => (
              <Link
                key={r.slug}
                href={`/${r.slug}/dashboard`}
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
      </main>

      {/* Landing Page Footer */}
      <Footer />
    </div>
  )
}
