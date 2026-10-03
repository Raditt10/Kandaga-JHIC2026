"use client"

import React, { useState } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import { Settings, Shield, Bell, Globe, Save, Check } from "lucide-react"

export default function AdminPengaturanPage() {
  const [siteName, setSiteName] = useState("Kandaga — Galeri Digital SMKN 13 Bandung")
  const [siteDescription, setSiteDescription] = useState(
    "Etalase digital karya terbaik siswa SMKN 13 Bandung — terverifikasi sekolah, terbuka untuk industri."
  )
  const [allowPublicRegistration, setAllowPublicRegistration] = useState(true)
  const [autoVerifyCompany, setAutoVerifyCompany] = useState(false)
  const [emailNotification, setEmailNotification] = useState(true)
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2500)
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <h1 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#891337]" />
              Pengaturan Sistem
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Konfigurasi umum aplikasi, kebijakan moderasi, dan preferensi notifikasi admin.
            </p>
          </div>

          {isSaved && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              Tersimpan
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* General Site Config */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Globe className="w-4 h-4 text-slate-400" />
              Identitas & Metadata Platform
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nama Platform
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#891337]/15 focus:border-[#891337]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Deskripsi Singkat / Tagline
                </label>
                <textarea
                  rows={3}
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#891337]/15 focus:border-[#891337]"
                />
              </div>
            </div>
          </div>

          {/* Moderation & Registration Policy */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Shield className="w-4 h-4 text-slate-400" />
              Kebijakan Akses & Moderasi
            </h2>

            <div className="space-y-3.5">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    Pendaftaran Mitra Industri Terbuka
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Izinkan perusahaan industri mendaftar mandiri via form publik.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={allowPublicRegistration}
                  onChange={(e) => setAllowPublicRegistration(e.target.checked)}
                  className="w-4 h-4 text-[#891337] rounded border-slate-300 focus:ring-[#891337] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    Verifikasi Otomatis Akun Mitra
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Langsung aktifkan akun mitra tanpa approval manual BKK (tidak disarankan).
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoVerifyCompany}
                  onChange={(e) => setAutoVerifyCompany(e.target.checked)}
                  className="w-4 h-4 text-[#891337] rounded border-slate-300 focus:ring-[#891337] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Notifications */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Bell className="w-4 h-4 text-slate-400" />
              Notifikasi Sistem
            </h2>

            <div className="space-y-3.5">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    Notifikasi Email Aktivitas Baru
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Kirim email ringkasan kurasi karya atau registrasi mitra baru ke admin.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotification}
                  onChange={(e) => setEmailNotification(e.target.checked)}
                  className="w-4 h-4 text-[#891337] rounded border-slate-300 focus:ring-[#891337] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#891337] hover:bg-[#6b1426] text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
