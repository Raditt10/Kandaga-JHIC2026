import React from "react"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminHeader from "@/components/admin/AdminHeader"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col xl:flex-row font-sans antialiased text-slate-800">
      {/* ──────────────── 1. LEFT SIDEBAR ──────────────── */}
      <AdminSidebar />

      {/* ──────────────── 2. MAIN CONTENT AREA ──────────────── */}
      <main className="flex-1 p-6 sm:p-8 space-y-7 bg-white min-w-0">
        <AdminHeader />
        {children}
      </main>
    </div>
  )
}
