"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import {
  ArrowRight,
  Sparkles,
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  GraduationCap,
  ShieldCheck,
  Building2,
  BookOpen,
  Briefcase,
  CheckCircle2,
} from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()

  // 4 crucial non-nullable fields
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"student" | "admin" | "company" | "teacher" | "bkk">("student")

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  // 5 roles metadata
  const rolesList = [
    {
      id: "student" as const,
      label: "Students",
      subtitle: "Siswa SMKN 13 Bandung",
      description: "Memamerkan karya portofolio & mendaftar magang industri",
      icon: GraduationCap,
      color: "from-rose-500 to-pink-600",
    },
    {
      id: "admin" as const,
      label: "Admin",
      subtitle: "Administrator Sekolah",
      description: "Mengelola sistem, pengguna, dan hak akses portal",
      icon: ShieldCheck,
      color: "from-[#891337] to-[#a61743]",
    },
    {
      id: "company" as const,
      label: "Company",
      subtitle: "Mitra Industri & Perusahaan",
      description: "Merekrut talenta siswa & membuka lowongan magang",
      icon: Building2,
      color: "from-blue-600 to-indigo-700",
    },
    {
      id: "teacher" as const,
      label: "Teacher",
      subtitle: "Guru & Pembimbing Akademik",
      description: "Menilai karya siswa & memberikan rekomendasi riset",
      icon: BookOpen,
      color: "from-amber-600 to-orange-600",
    },
    {
      id: "bkk" as const,
      label: "BKK",
      subtitle: "Bursa Kerja Khusus",
      description: "Fasilitator penyaluran kerja & bursa karir alumni",
      icon: Briefcase,
      color: "from-emerald-600 to-teal-700",
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validation for 4 crucial non-nullable fields
    if (!username.trim()) {
      setError("Username wajib diisi.")
      return
    }
    if (!email.trim()) {
      setError("Email wajib diisi.")
      return
    }
    if (!password.trim()) {
      setError("Password wajib diisi.")
      return
    }
    if (!role) {
      setError("Role wajib dipilih salah satu dari 5 role.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password: password.trim(),
          role: role,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Gagal melakukan registrasi.")
        setLoading(false)
        return
      }

      setSuccess("Registrasi berhasil! Menghubungkan ke dashboard Anda...")

      // Auto sign-in after successful registration
      const loginRes = await signIn("credentials", {
        identifier: username,
        password: password,
        redirect: false,
      })

      if (loginRes?.ok) {
        router.push(`/${role}`)
        router.refresh()
      } else {
        router.push("/auth/login")
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi server. Silakan coba lagi.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafc] text-zinc-900 font-sans selection:bg-[#90133b] selection:text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-rose-100/40 via-pink-50/20 to-transparent blur-3xl pointer-events-none" />

      {/* Floating Header Navigation */}
      <header className="w-full pt-6 px-4 z-20">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl border border-zinc-200/80 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.08)] rounded-full px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 group">
            <div className="w-8 h-8 relative rounded-full overflow-hidden shadow-xs ring-1 ring-zinc-900/5 transition-transform duration-200 group-hover:scale-105 shrink-0">
              <Image src="/logo.png" alt="Kandaga Logo" fill className="object-contain" priority />
            </div>
            <span className="inline-flex items-center select-none -ml-0.5 bg-gradient-to-r from-zinc-950 via-[#4e0e20] to-[#a61743] bg-clip-text text-transparent">
              <span className="font-tangerine font-bold text-3xl leading-none inline-block -translate-y-[1px]">K</span>
              <span className="font-extrabold text-[15px] tracking-tight -ml-0.5">andaga</span>
            </span>
          </Link>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/" className="text-zinc-600 hover:text-zinc-950 transition">
              Beranda
            </Link>
            <Link
              href="/auth/login"
              className="bg-gradient-to-r from-[#891337] to-[#a61743] hover:from-[#76102f] hover:to-[#92143b] text-white px-5 py-2 rounded-full font-bold tracking-wide transition-all shadow-md shadow-[#891337]/25"
            >
              Sudah Punya Akun? Masuk
            </Link>
          </div>
        </div>
      </header>

      {/* Main Register Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8 z-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-zinc-200/90 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.09)] max-w-5xl w-full p-6 sm:p-10">
          
          <div className="mb-8 text-center max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-[#90133b] text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Registrasi Pengguna Baru</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Buat Akun Kandaga Anda
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1.5">
              Lengkapi 4 field wajib (username, email, password, role) untuk mendapatkan akses dashboard khusus.
            </p>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            {/* Step 1: Mandatory Credentials (3 Fields) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Field 1: Username */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>1. Username</span>
                  <span className="text-[10px] text-rose-600 font-extrabold">Wajib</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: siswa_rpl13"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#90133b] transition bg-zinc-50/50"
                    required
                  />
                </div>
              </div>

              {/* Field 2: Email */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>2. Email</span>
                  <span className="text-[10px] text-rose-600 font-extrabold">Wajib</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@smkn13bdg.sch.id"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#90133b] transition bg-zinc-50/50"
                    required
                  />
                </div>
              </div>

              {/* Field 3: Password */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>3. Password</span>
                  <span className="text-[10px] text-rose-600 font-extrabold">Wajib</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#90133b] transition bg-zinc-50/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Role Selection Grid (Field 4 - 5 Roles) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  4. Pilih Role Pengguna (5 Peran Spesifik)
                </label>
                <span className="text-[10px] text-rose-600 font-extrabold">Wajib (Non-Nullable)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {rolesList.map((r) => {
                  const Icon = r.icon
                  const isSelected = role === r.id
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`p-4 rounded-2xl border text-left transition-all duration-200 relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? "border-[#90133b] bg-rose-50/60 ring-2 ring-[#90133b]/30 shadow-md"
                          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/80"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${r.color} flex items-center justify-center text-white shadow-sm`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-[#90133b]" />
                          )}
                        </div>
                        <h3 className="text-sm font-extrabold text-zinc-900">{r.label}</h3>
                        <p className="text-[11px] font-medium text-rose-700 mt-0.5">{r.subtitle}</p>
                        <p className="text-[11px] text-zinc-500 mt-2 leading-tight">
                          {r.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                        <span>Akses: /{r.id}/dashboard</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#891337] to-[#a61743] hover:from-[#76102f] hover:to-[#92143b] text-white py-4 rounded-2xl text-sm font-bold tracking-wide transition-all shadow-lg shadow-[#891337]/30 cursor-pointer active:scale-98 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <span>Mendaftarkan Akun...</span>
                ) : (
                  <>
                    <span>Daftar Sekarang & Masuk Ke Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-zinc-500 mt-8">
            Sudah memiliki akun terdaftar?{" "}
            <Link href="/auth/login" className="font-bold text-[#90133b] hover:underline">
              Masuk ke portal
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-zinc-500 border-t border-zinc-200/60">
        © {new Date().getFullYear()} SMKN 13 Bandung • Major Gallery & Industrial Portal
      </footer>
    </div>
  )
}
