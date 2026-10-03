"use client"

import React, { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import {
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Building2,
  Sparkles,
  ShieldCheck,
  Briefcase,
} from "lucide-react"

interface MajorItem {
  id: string
  name: string
  fullName: string
}

function RegisterFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") === "company" ? "company" : "student"

  // Role: Only Public Roles (Internal roles admin, bkk, teacher removed)
  const [role, setRole] = useState<"student" | "company">(defaultRole)

  // Common Fields
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Student Specific Fields
  const [currentClass, setCurrentClass] = useState("")
  const [selectedMajorId, setSelectedMajorId] = useState("")
  const [nis, setNis] = useState("")
  const [majors, setMajors] = useState<MajorItem[]>([
    { id: "rpl", name: "RPL", fullName: "Rekayasa Perangkat Lunak" },
    { id: "tkj", name: "TKJ", fullName: "Teknik Komputer Jaringan" },
    { id: "ak", name: "Analis Kimia", fullName: "Analis Kimia" },
  ])

  // Company Specific Fields
  const [companyName, setCompanyName] = useState("")
  const [industryField, setIndustryField] = useState("")

  // Form State
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  // Fetch majors on mount from API
  useEffect(() => {
    async function loadMajors() {
      try {
        const res = await fetch("/api/auth/register")
        if (res.ok) {
          const data = await res.json()
          if (data.majors && data.majors.length > 0) {
            setMajors(data.majors)
            if (!selectedMajorId) {
              setSelectedMajorId(data.majors[0].id)
            }
          }
        }
      } catch {
        // Fallback to static majors
      }
    }
    loadMajors()
  }, [])

  // Auto-select first major once loaded
  useEffect(() => {
    if (majors.length > 0 && !selectedMajorId) {
      setSelectedMajorId(majors[0].id)
    }
  }, [majors, selectedMajorId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Common validations
    if (!username.trim()) {
      setError("Nama lengkap / username wajib diisi.")
      return
    }
    if (!email.trim()) {
      setError("Alamat email wajib diisi.")
      return
    }
    if (!password || password.length < 6) {
      setError("Kata sandi minimal 6 karakter.")
      return
    }

    // Role-specific validations
    if (role === "student") {
      if (!currentClass.trim()) {
        setError("Kelas saat ini wajib diisi (contoh: XII RPL 1, XI TKJ 2).")
        return
      }
    } else if (role === "company") {
      if (!companyName.trim()) {
        setError("Nama perusahaan atau instansi wajib diisi.")
        return
      }
    }

    setLoading(true)

    try {
      const payload: Record<string, any> = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role,
      }

      if (role === "student") {
        payload.class = currentClass.trim()
        payload.majorId = selectedMajorId
        if (nis.trim()) {
          payload.nis = nis.trim()
        }
      } else if (role === "company") {
        payload.companyName = companyName.trim()
        if (industryField.trim()) {
          payload.field = industryField.trim()
        }
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Gagal melakukan registrasi akun.")
        setLoading(false)
        return
      }

      // Success handling
      if (role === "student") {
        setSuccess("Pendaftaran berhasil! Mengarahkan ke sesi Anda...")
        
        // Auto sign-in for student
        const loginRes = await signIn("credentials", {
          identifier: username.trim(),
          password: password.trim(),
          redirect: false,
        })

        if (loginRes?.ok) {
          router.push("/student")
          router.refresh()
        } else {
          router.push("/auth/login?registered=student")
        }
      } else {
        // Company accounts start with pending verification status
        setSuccess("Pendaftaran mitra berhasil! Akun Anda telah dicatat untuk diverifikasi oleh BKK.")
        setTimeout(() => {
          router.push("/mitra/menunggu")
        }, 1200)
      }
    } catch {
      setError("Terjadi kendala koneksi ke server. Silakan coba lagi beberapa saat.")
      setLoading(false)
    }
  }

  return (
    <div
      suppressHydrationWarning
      className="relative min-h-screen w-full bg-[#a61743] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#a61743] selection:text-white overflow-hidden py-8 sm:py-12"
    >
      {/* Background Graphic Design: Diagonal rounded pills matching login page in white & maroon theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="whitePillBrightReg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.28" />
            </linearGradient>
            <linearGradient id="whitePillMediumReg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.18" />
            </linearGradient>
            <linearGradient id="whitePillSoftReg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.12" />
            </linearGradient>
          </defs>

          {/* Top-Left Diagonal Rounded Pills (Crisp White) */}
          <g transform="rotate(-35 250 200)">
            <rect x="-180" y="-140" width="130" height="640" rx="65" fill="url(#whitePillMediumReg)" />
            <rect x="0" y="-180" width="160" height="740" rx="80" fill="url(#whitePillBrightReg)" />
            <rect x="210" y="-100" width="110" height="520" rx="55" fill="url(#whitePillMediumReg)" />
            <rect x="360" y="-50" width="75" height="380" rx="37.5" fill="url(#whitePillSoftReg)" />
          </g>

          {/* Bottom-Right Diagonal Rounded Pills (Crisp White) */}
          <g transform="rotate(-35 1200 700)">
            <rect x="960" y="440" width="80" height="460" rx="40" fill="url(#whitePillSoftReg)" />
            <rect x="1080" y="340" width="130" height="620" rx="65" fill="url(#whitePillMediumReg)" />
            <rect x="1250" y="260" width="165" height="760" rx="82.5" fill="url(#whitePillBrightReg)" />
            <rect x="1460" y="320" width="140" height="660" rx="70" fill="url(#whitePillMediumReg)" />
          </g>
        </svg>
      </div>

      {/* Main Floating Card matching Login layout */}
      <div className="relative z-10 w-full max-w-5xl xl:max-w-6xl bg-white rounded-3xl lg:rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] border border-white/40 p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Register Form */}
        <div className="w-full flex flex-col justify-between py-2 sm:py-3">
          {/* Top Header: Back Link & Switch Link */}
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              aria-label="Kembali ke Beranda"
              className="w-8 h-8 rounded-md bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-900 transition shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
              <span>Sudah punya akun?</span>
              <Link
                href="/auth/login"
                className="font-semibold text-[#a61743] hover:underline transition"
              >
                Masuk
              </Link>
            </div>
          </div>

          {/* Form Content */}
          <div className="w-full max-w-[420px] mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Daftar Akun Baru
            </h1>
            <p className="text-sm text-zinc-500 mt-1.5 mb-5">
              Pilih peran Anda dan lengkapi data untuk mengakses platform Kandaga.
            </p>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="mb-4 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{success}</span>
              </div>
            )}

            {/* Role Switcher: Only Public Roles (Siswa & Mitra Industri) */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-zinc-700 mb-2">
                Pilih Peran Pendaftaran
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition cursor-pointer ${
                    role === "student"
                      ? "border-[#a61743] bg-[#a61743]/5 text-zinc-900 ring-1 ring-[#a61743]"
                      : "border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:bg-zinc-50/50"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition ${
                      role === "student"
                        ? "bg-[#a61743] text-white"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">Siswa SMK</div>
                    <div className="text-[11px] text-zinc-500">Portofolio & Magang</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("company")}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition cursor-pointer ${
                    role === "company"
                      ? "border-[#a61743] bg-[#a61743]/5 text-zinc-900 ring-1 ring-[#a61743]"
                      : "border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:bg-zinc-50/50"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition ${
                      role === "company"
                        ? "bg-[#a61743] text-white"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">Mitra Industri</div>
                    <div className="text-[11px] text-zinc-500">Rekrutmen & PKL</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Common Field: Username / Nama Lengkap */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  {role === "student" ? "Nama Lengkap / Username Siswa" : "Nama Lengkap Narahubung (PIC)"}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={role === "student" ? "Contoh: Ahmad Zaki" : "Contoh: Budi Santoso"}
                  className="w-full px-3.5 py-2.5 rounded-md border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#a61743]/15 focus:border-[#a61743] transition bg-white"
                  required
                />
              </div>

              {/* Common Field: Email */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Alamat Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-3.5 py-2.5 rounded-md border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#a61743]/15 focus:border-[#a61743] transition bg-white"
                  required
                />
              </div>

              {/* Student Role Additional Fields */}
              {role === "student" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Current Class (Kelas Saat Ini) */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center justify-between">
                        <span>Kelas Saat Ini</span>
                        <span className="text-[10px] text-[#a61743] font-medium">Wajib</span>
                      </label>
                      <input
                        type="text"
                        value={currentClass}
                        onChange={(e) => setCurrentClass(e.target.value)}
                        placeholder="Contoh: XII RPL 1"
                        className="w-full px-3.5 py-2.5 rounded-md border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#a61743]/15 focus:border-[#a61743] transition bg-white"
                        required
                      />
                    </div>

                    {/* NIS */}
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center justify-between">
                        <span>NIS</span>
                        <span className="text-[10px] text-zinc-400 font-normal">Opsional</span>
                      </label>
                      <input
                        type="text"
                        value={nis}
                        onChange={(e) => setNis(e.target.value)}
                        placeholder="1324001"
                        className="w-full px-3.5 py-2.5 rounded-md border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#a61743]/15 focus:border-[#a61743] transition bg-white"
                      />
                    </div>
                  </div>

                  {/* Major Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      Kompetensi Keahlian / Jurusan
                    </label>
                    <select
                      value={selectedMajorId}
                      onChange={(e) => setSelectedMajorId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-md border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#a61743]/15 focus:border-[#a61743] transition bg-white"
                    >
                      {majors.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} - {m.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Company Role Additional Fields */}
              {role === "company" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center justify-between">
                      <span>Nama Perusahaan / Instansi</span>
                      <span className="text-[10px] text-[#a61743] font-medium">Wajib</span>
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Contoh: PT Sintesis Digital Nusantara"
                      className="w-full px-3.5 py-2.5 rounded-md border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#a61743]/15 focus:border-[#a61743] transition bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center justify-between">
                      <span>Bidang Industri</span>
                      <span className="text-[10px] text-zinc-400 font-normal">Opsional</span>
                    </label>
                    <input
                      type="text"
                      value={industryField}
                      onChange={(e) => setIndustryField(e.target.value)}
                      placeholder="Contoh: Teknologi Informasi & Software"
                      className="w-full px-3.5 py-2.5 rounded-md border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#a61743]/15 focus:border-[#a61743] transition bg-white"
                    />
                  </div>
                </>
              )}

              {/* Common Field: Password */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-md border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#a61743]/15 focus:border-[#a61743] transition bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#242c4b] hover:bg-[#1a2038] text-white py-3 rounded-md text-sm font-semibold transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer mt-4 shadow-xs"
              >
                {loading ? "Memproses Registrasi..." : "Daftar Sekarang"}
              </button>
            </form>

            {/* Note regarding internal roles */}
            <p className="text-[11px] text-zinc-400 text-center mt-4 leading-relaxed">
              Akun pengelola sekolah (Admin, Guru, BKK) hanya dapat dibuat melalui administrator utama.
            </p>
          </div>
        </div>

        {/* Right Column: Matched styling with login page */}
        <div className="hidden lg:flex w-full h-full min-h-[580px] rounded-2xl lg:rounded-[28px] bg-[#9c153e] relative overflow-hidden items-center justify-center p-8 text-white">
          {/* Subtle branding and highlights inside the right container */}
          <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6 shadow-md">
              <div className="w-10 h-10 relative">
                <Image src="/logo.png" alt="Kandaga Logo" fill className="object-contain" priority />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
              Kandaga SMKN 13
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-8">
              Pusat galeri karya teknologi, kurasi keahlian vokasi, dan jembatan kolaborasi industri terpercaya.
            </p>

            <div className="w-full space-y-3 text-left">
              <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Portofolio & Rekomendasi</h3>
                  <p className="text-[11px] text-white/70 mt-0.5 leading-normal">
                    Pamerkan karya terbaik siswa RPL, TKJ, dan Analis Kimia langsung ke publik.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Briefcase className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Jejaring Magang & PKL</h3>
                  <p className="text-[11px] text-white/70 mt-0.5 leading-normal">
                    Kemudahan verifikasi kemitraan industri oleh BKK untuk penyaluran talenta kerja.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Ekosistem Terintegrasi</h3>
                  <p className="text-[11px] text-white/70 mt-0.5 leading-normal">
                    Kolaborasi terpusat antara siswa, pembimbing sekolah, dan mitra dunia industri.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#a61743] text-white text-sm">
          Memuat formulir pendaftaran...
        </div>
      }
    >
      <RegisterFormContent />
    </Suspense>
  )
}
