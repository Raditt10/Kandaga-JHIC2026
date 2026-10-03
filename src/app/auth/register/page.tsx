"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { getDashboardUrl } from "@/lib/auth"
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Building2,
  BookOpen,
  Briefcase,
} from "lucide-react"

type RoleId = "student" | "admin" | "company" | "teacher" | "bkk"

export function RegisterFormContent() {
  const router = useRouter()

  // 4 field wajib (non-nullable)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<RoleId>("student")

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

  // Metadata 5 peran — dipakai di daftar pilihan (kiri) dan panel detail (kanan)
  const rolesList = [
    {
      id: "student" as const,
      label: "Students",
      subtitle: "Siswa SMKN 13 Bandung",
      description: "Memamerkan karya portofolio & mendaftar magang industri.",
      icon: GraduationCap,
      color: "from-rose-500 to-pink-600",
      capabilities: [
        "Unggah & kelola karya portofolio",
        "Pantau status verifikasi guru",
        "Daftar magang lewat BKK",
      ],
    },
    {
      id: "admin" as const,
      label: "Admin",
      subtitle: "Administrator Sekolah",
      description: "Mengelola sistem, pengguna, dan hak akses portal.",
      icon: ShieldCheck,
      color: "from-[#891337] to-[#a61743]",
      capabilities: [
        "Kelola pengguna & penetapan peran",
        "Pantau audit log sistem",
        "Atur data jurusan & FAQ",
      ],
    },
    {
      id: "company" as const,
      label: "Company",
      subtitle: "Mitra Industri & Perusahaan",
      description: "Merekrut talenta siswa & membuka lowongan magang.",
      icon: Building2,
      color: "from-blue-600 to-indigo-700",
      capabilities: [
        "Jelajahi katalog karya terverifikasi",
        "Simpan talenta ke daftar tersimpan",
        "Ajukan minat magang / rekrutmen",
      ],
    },
    {
      id: "teacher" as const,
      label: "Teacher",
      subtitle: "Guru & Pembimbing Akademik",
      description: "Menilai karya siswa & memberikan rekomendasi riset.",
      icon: BookOpen,
      color: "from-amber-600 to-orange-600",
      capabilities: [
        "Nilai & verifikasi karya siswa",
        "Tambahkan catatan review",
        "Publikasikan karya ke galeri",
      ],
    },
    {
      id: "bkk" as const,
      label: "BKK",
      subtitle: "Bursa Kerja Khusus",
      description: "Fasilitator penyaluran kerja & bursa karir alumni.",
      icon: Briefcase,
      color: "from-emerald-600 to-teal-700",
      capabilities: [
        "Verifikasi akun perusahaan mitra",
        "Tinjau permintaan kontak ke siswa",
        "Kelola data mitra industri",
      ],
    },
  ]

  const selected = rolesList.find((r) => r.id === role) ?? rolesList[0]
  const SelectedIcon = selected.icon

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

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


        setSuccess("Pendaftaran berhasil! Mengarahkan ke sesi Anda...");

        // Auto sign-in setelah registrasi sukses
        const loginRes = await signIn("credentials", {
        identifier: username,
        password: password,
        redirect: false,
      })

      if (loginRes?.ok) {
        router.push(getDashboardUrl(role))
        router.refresh()
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
      className="relative min-h-screen w-full bg-[#a61743] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#a61743] selection:text-white overflow-hidden"
    >
      {/* Ornamen latar: pill diagonal putih — sama seperti halaman login */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="whitePillBright" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.28" />
            </linearGradient>
            <linearGradient id="whitePillMedium" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.18" />
            </linearGradient>
            <linearGradient id="whitePillSoft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.12" />
            </linearGradient>
          </defs>

          <g transform="rotate(-35 250 200)">
            <rect x="-180" y="-140" width="130" height="640" rx="65" fill="url(#whitePillMedium)" />
            <rect x="0" y="-180" width="160" height="740" rx="80" fill="url(#whitePillBright)" />
            <rect x="210" y="-100" width="110" height="520" rx="55" fill="url(#whitePillMedium)" />
            <rect x="360" y="-50" width="75" height="380" rx="37.5" fill="url(#whitePillSoft)" />
          </g>

          <g transform="rotate(-35 1200 700)">
            <rect x="960" y="440" width="80" height="460" rx="40" fill="url(#whitePillSoft)" />
            <rect x="1080" y="340" width="130" height="620" rx="65" fill="url(#whitePillMedium)" />
            <rect x="1250" y="260" width="165" height="760" rx="82.5" fill="url(#whitePillBright)" />
            <rect x="1460" y="320" width="140" height="660" rx="70" fill="url(#whitePillMedium)" />
          </g>
        </svg>
      </div>

      {/* Kartu utama */}
      <div className="relative z-10 w-full max-w-5xl xl:max-w-6xl bg-white rounded-3xl lg:rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] border border-white/40 p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

        {/* Kolom kiri: formulir */}
        <div className="w-full flex flex-col justify-between py-2 sm:py-4">
          <div className="flex items-center mb-6">
            <Link
              href="/"
              aria-label="Kembali"
              className="w-8 h-8 rounded-md bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-900 transition shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="w-full max-w-[380px] mx-auto">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-100 text-[#a61743] text-[11px] font-bold mb-3">
              <Sparkles className="w-3 h-3" />
              <span>Registrasi Pengguna Baru</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Buat Akun Kandaga Anda
            </h1>
            <p className="text-sm text-zinc-500 mt-2 mb-6">
              Lengkapi username, email, dan password, lalu pilih peran Anda.
            </p>

            {/* Error Alert */}
            {error && (
              <div className="mb-5 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="mb-5 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: siswa_rpl13"
                  className="w-full px-3.5 py-2.5 rounded-md border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#a61743]/15 focus:border-[#a61743] transition bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@smkn13bdg.sch.id"
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
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Field 4: pilih peran */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-2">
                  Pilih Peran Pengguna <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2">
                  {rolesList.map((r) => {
                    const Icon = r.icon
                    const isSelected = role === r.id
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id)}
                        aria-pressed={isSelected}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md border text-left transition cursor-pointer ${
                          isSelected
                            ? "border-[#a61743] bg-rose-50/60 ring-2 ring-[#a61743]/15"
                            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                        }`}
                      >
                        <span
                          className={`w-8 h-8 shrink-0 rounded-lg bg-gradient-to-r ${r.color} flex items-center justify-center text-white`}
                        >
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-semibold text-zinc-900">{r.label}</span>
                          <span className="block text-[11px] text-zinc-500 truncate">{r.subtitle}</span>
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0 text-[#a61743]" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#242c4b] hover:bg-[#1a2038] text-white py-3 rounded-md text-sm font-semibold transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer mt-1 shadow-xs"
              >
                {loading ? (
                  <span>Mendaftarkan akun...</span>
                ) : (
                  <>
                    <span>Daftar Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center text-xs text-zinc-500 mt-5 space-y-1.5">
              <p>
                Sudah punya akun?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-[#a61743] underline underline-offset-2 hover:text-[#8B1A2F] transition"
                >
                  Masuk ke portal
                </Link>
              </p>
              <p className="text-[11px] text-zinc-400">
                Mitra perusahaan?{" "}
                <Link href="/mitra/daftar" className="text-[#a61743] hover:underline font-medium transition">
                  Daftar sebagai mitra
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Kolom kanan: panel detail peran terpilih */}
        {(role !== "student") ? (
          <div className="mb-5">
            <label className="block text-xs font-semibold text-zinc-700 mb-2">
              Pilih Peran Pendaftaran
            </label>
            <div className="grid grid-cols-2 gap-2.5">

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
          ) : (
          <div className="hidden lg:flex w-full h-full min-h-[560px] rounded-2xl lg:rounded-[28px] bg-[#9c153e] relative overflow-hidden flex-col justify-between p-8 text-white">
            {/* Blok atas: identitas peran terpilih */}
            <div className="relative z-10 w-full">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[11px] font-bold mb-8">
                <Sparkles className="w-3 h-3" />
                <span>Peran Terpilih</span>
              </div>

              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selected.color} flex items-center justify-center text-white shadow-lg mb-5`}
              >
                <SelectedIcon className="w-7 h-7" />
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white">{selected.label}</h2>
              <p className="text-sm text-rose-100/80 mt-1">{selected.subtitle}</p>
              <p className="text-sm text-white/70 mt-4 leading-relaxed max-w-[42ch]">
                {selected.description}
              </p>

              {/* Kemampuan peran — mengisi panel sekaligus membantu memilih peran */}
              <ul className="mt-7 space-y-2.5">
                {selected.capabilities.map((cap) => (
                  <li key={cap} className="flex items-start gap-2.5 text-sm text-white/85">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-rose-200" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Blok bawah: tujuan dashboard + catatan */}
            <div className="relative z-10 w-full">
              <div className="pt-6 border-t border-white/15">
                <p className="text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                  Akses Dashboard
                </p>
                <p className="text-sm font-semibold text-white font-mono">
                  {getDashboardUrl(selected.id)}
                </p>
              </div>

              <p className="text-xs text-white/45 mt-5 leading-relaxed max-w-[42ch]">
              Peran menentukan dashboard dan hak akses Anda. Peran tidak bisa diubah sendiri
              setelah akun dibuat — hubungi Admin sekolah bila perlu penyesuaian.
            </p>
          </div>
        </div>
        )}
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
