"use client"

import React, { useState } from "react"
import Image from "next/image"
import { projectShowcases } from "@/lib/adminData"
import { Check, X, ShieldAlert, Sparkles } from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"

export default function AdminModerasiPage() {
  const [projects, setProjects] = useState(projectShowcases)
  const [statusMap, setStatusMap] = useState<Record<string, "approved" | "rejected">>({})

  const handleApprove = (id: string) => {
    setStatusMap((prev) => ({ ...prev, [id]: "approved" }))
  }

  const handleReject = (id: string) => {
    setStatusMap((prev) => ({ ...prev, [id]: "rejected" }))
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Moderasi & Kurasi Galeri</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#891337]/10 text-[#891337]">
              {projects.length} Pengajuan
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tinjau karya inovasi siswa sebelum dipublikasikan ke Galeri Utama portofolio Kandaga.
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((proj) => {
          const status = statusMap[proj.id]

          return (
            <div
              key={proj.id}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 rounded-xl overflow-hidden bg-slate-100 mb-3">
                  <Image
                    src={proj.image}
                    alt={proj.title}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {proj.category}
                  </span>
                  {status && (
                    <span
                      className={`absolute top-2.5 right-2.5 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        status === "approved" ? "bg-emerald-600" : "bg-rose-600"
                      }`}
                    >
                      {status === "approved" ? "Disetujui" : "Ditolak"}
                    </span>
                  )}
                </div>

                <h2 className="font-bold text-sm text-slate-900 leading-snug">
                  {proj.title}
                </h2>
                <p className="text-[11px] text-slate-500 mt-1">
                  Karya oleh: <span className="font-semibold text-slate-700">{proj.author}</span> ({proj.authorRole})
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2">
                {status ? (
                  <div
                    className={`w-full py-2 rounded-xl text-center text-xs font-bold ${
                      status === "approved"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {status === "approved"
                      ? "✓ Karya Telah Disetujui ke Galeri"
                      : "✕ Pengajuan Telah Ditolak"}
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleApprove(proj.id)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Setujui</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(proj.id)}
                      className="flex-1 py-2 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 border border-rose-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>Tolak</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  </AdminLayout>
)
}
