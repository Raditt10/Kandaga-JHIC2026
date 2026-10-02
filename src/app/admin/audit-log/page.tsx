"use client"

import React, { useState } from "react"
import { systemAuditLogs } from "@/lib/adminData"
import { ScrollText, Search, ShieldCheck } from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"

export default function AdminAuditLogPage() {
  const [logs] = useState(systemAuditLogs)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredLogs = logs.filter(
    (log) =>
      log.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Info & Filter */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Audit Log Sistem</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#891337]/10 text-[#891337]">
              {logs.length} Rekaman
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Catatan riwayat transaksi keamanan, mutasi role, dan aktivitas penting sistem Kandaga.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari audit log..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#891337]/15 focus:border-[#891337]"
          />
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-400 text-[11px]">
                  {log.timestamp}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold text-[10px] text-slate-700">
                  {log.action}
                </span>
              </div>
              <p className="font-semibold text-slate-800 text-sm">{log.detail}</p>
              <p className="text-slate-400 text-[11px]">
                Inisiator: <span className="font-mono text-slate-600">{log.user}</span>
              </p>
            </div>

            <div className="shrink-0">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-[11px] inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                {log.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </AdminLayout>
)
}
