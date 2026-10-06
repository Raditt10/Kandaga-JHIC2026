"use client"

import React, { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import AccountSettings from "@/components/settings/AccountSettings"
import AdminProfileView from "@/components/profile/AdminProfileView"
import { Settings, Shield, Bell, Globe, Save, Check, User, KeyRound } from "lucide-react"

function AdminPengaturanContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState<"profil" | "akun" | "sistem">(
    tabParam === "profil" ? "profil" : tabParam === "akun" ? "akun" : "sistem"
  )

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "profil" || tab === "akun" || tab === "sistem") {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (tab: "profil" | "akun" | "sistem") => {
    setActiveTab(tab)
    router.replace(`/admin/pengaturan?tab=${tab}`)
  }

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
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* Tab Switcher */}
      <div className="inline-flex p-1 bg-ink-100 rounded-2xl border border-ink-150 gap-1 flex-wrap">
        <button
          type="button"
          onClick={() => handleTabChange("profil")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "profil"
              ? "bg-white text-ink shadow-xs"
              : "text-ink-600 hover:text-ink hover:bg-white/50"
          }`}
        >
          <User className="w-4 h-4 text-primary" />
          Profil Administrator
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("akun")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "akun"
              ? "bg-white text-ink shadow-xs"
              : "text-ink-600 hover:text-ink hover:bg-white/50"
          }`}
        >
          <KeyRound className="w-4 h-4 text-primary" />
          Akun & Keamanan
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("sistem")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "sistem"
              ? "bg-white text-ink shadow-xs"
              : "text-ink-600 hover:text-ink hover:bg-white/50"
          }`}
        >
          <Settings className="w-4 h-4 text-primary" />
          Pengaturan Sistem
        </button>
      </div>

      {activeTab === "profil" ? (
        <AdminProfileView />
      ) : activeTab === "akun" ? (
        <AccountSettings />
      ) : (
        <>
          {/* Header */}
          <div className="p-5 rounded-2xl bg-white border border-ink-150 shadow-xs flex items-center justify-between">
            <div>
              <h1 className="font-heading text-lg font-bold text-ink flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Pengaturan Sistem
              </h1>
              <p className="text-xs text-ink-600 mt-0.5">
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
          <div className="p-6 rounded-2xl bg-white border border-ink-150 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-ink flex items-center gap-2 border-b border-ink-150 pb-3">
              <Globe className="w-4 h-4 text-ink-300" />
              Identitas & Metadata Platform
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  Nama Platform
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-ink-150 text-xs bg-ink-100 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  Deskripsi Singkat / Tagline
                </label>
                <textarea
                  rows={3}
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-ink-150 text-xs bg-ink-100 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Moderation & Registration Policy */}
          <div className="p-6 rounded-2xl bg-white border border-ink-150 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-ink flex items-center gap-2 border-b border-ink-150 pb-3">
              <Shield className="w-4 h-4 text-ink-300" />
              Kebijakan Akses & Moderasi
            </h2>

            <div className="space-y-3.5">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-ink block">
                    Pendaftaran Mitra Industri Terbuka
                  </span>
                  <span className="text-[11px] text-ink-300 block">
                    Izinkan perusahaan industri mendaftar mandiri via form publik.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={allowPublicRegistration}
                  onChange={(e) => setAllowPublicRegistration(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-ink-300 focus:ring-primary cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-ink block">
                    Verifikasi Otomatis Akun Mitra
                  </span>
                  <span className="text-[11px] text-ink-300 block">
                    Langsung aktifkan akun mitra tanpa approval manual BKK (tidak disarankan).
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoVerifyCompany}
                  onChange={(e) => setAutoVerifyCompany(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-ink-300 focus:ring-primary cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Notifications */}
          <div className="p-6 rounded-2xl bg-white border border-ink-150 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-ink flex items-center gap-2 border-b border-ink-150 pb-3">
              <Bell className="w-4 h-4 text-ink-300" />
              Notifikasi Sistem
            </h2>

            <div className="space-y-3.5">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-ink block">
                    Notifikasi Email Aktivitas Baru
                  </span>
                  <span className="text-[11px] text-ink-300 block">
                    Kirim email ringkasan kurasi karya atau registrasi mitra baru ke admin.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotification}
                  onChange={(e) => setEmailNotification(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-ink-300 focus:ring-primary cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </button>
          </div>
        </form>
        </>
      )}
    </div>
  )
}

export default function AdminPengaturanPage() {
  return (
    <AdminLayout>
      <Suspense fallback={<div className="p-6 text-xs text-ink-500">Memuat pengaturan...</div>}>
        <AdminPengaturanContent />
      </Suspense>
    </AdminLayout>
  )
}
