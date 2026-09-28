"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import {
  ArrowRight,
  Sparkles,
  Lock,
  User,
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

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || ""

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Demo accounts for instant testing of all 5 roles
  const demoAccounts = [
    {
      roleName: "Students",
      icon: GraduationCap,
      color: "from-rose-500 to-pink-600",
      username: "siswa13",
      email: "siswa@smkn13bdg.sch.id",
      role: "student",
    },
    {
      roleName: "Admin",
      icon: ShieldCheck,
      color: "from-[#891337] to-[#a61743]",
      username: "admin13",
      email: "admin@smkn13bdg.sch.id",
      role: "admin",
    },
    {
      roleName: "Company",
      icon: Building2,
      color: "from-blue-600 to-indigo-700",
      username: "mitra_perusahaan",
      email: "hr@mitrainovasi.co.id",
      role: "company",
    },
    {
      roleName: "Teacher",
      icon: BookOpen,
      color: "from-amber-600 to-orange-600",
      username: "guru13",
      email: "guru@smkn13bdg.sch.id",
      role: "teacher",
    },
    {
      roleName: "BKK",
      icon: Briefcase,
      color: "from-emerald-600 to-teal-700",
      username: "bkk13",
      email: "bkk@smkn13bdg.sch.id",
      role: "bkk",
    },
  ]

  const handleSelectDemo = (username: string) => {
    setIdentifier(username)
    setPassword("password123")
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError("Kredensial tidak valid. Silakan periksa username/email dan password Anda.")
        setLoading(false)
        return
      }

      // Fetch session to obtain user role for precise redirection
      const sessionRes = await fetch("/api/auth/session")
      const sessionData = await sessionRes.json()

      const userRole = sessionData?.user?.role || "student"
      const normalizedRole = userRole.toLowerCase() === "students" ? "student" : userRole.toLowerCase()

      // Redirect to designated role page or specified callback
      if (callbackUrl && callbackUrl.startsWith("/dashboard")) {
        router.push(callbackUrl)
      } else {
        router.push(`/dashboard/${normalizedRole}`)
      }
      router.refresh()
    } catch (err) {
      setError("Terjadi kesalahan saat masuk. Silakan coba lagi.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafc] text-zinc-900 font-sans selection:bg-[#90133b] selection:text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-rose-100/40 via-pink-50/20 to-transparent blur-3xl pointer-events-none" />

      {/* Floating Pill Navigation */}
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
              href="/register"
              className="bg-gradient-to-r from-[#891337] to-[#a61743] hover:from-[#76102f] hover:to-[#92143b] text-white px-5 py-2 rounded-full font-bold tracking-wide transition-all shadow-md shadow-[#891337]/25"
            >
              Daftar Akun
            </Link>
          </div>
        </div>
      </header>

      {/* Main Login Card Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8 z-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-zinc-200/90 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.09)] max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left Column: Form Section */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-[#90133b] text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Portal Masuk Multi-Role</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                Selamat Datang Kembali
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                Akses dashboard khusus sesuai dengan peran Anda di Kandaga SMKN 13 Bandung.
              </p>
            </div>

            {/* Error Message Banner */}
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Username / Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Masukkan username atau email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#90133b] transition bg-zinc-50/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#891337] to-[#a61743] hover:from-[#76102f] hover:to-[#92143b] text-white py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-md shadow-[#891337]/30 cursor-pointer active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <span>Memproses...</span>
                ) : (
                  <>
                    <span>Masuk Ke Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* OAuth Login Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Atau Masuk Dengan
              </span>
            </div>

            {/* OAuth Buttons (Google, GitHub, Facebook, LinkedIn) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/dashboard/student" })}
                className="py-2.5 px-3 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition flex items-center justify-center gap-1.5"
              >
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => signIn("github", { callbackUrl: "/dashboard/student" })}
                className="py-2.5 px-3 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition flex items-center justify-center gap-1.5"
              >
                <span>GitHub</span>
              </button>
              <button
                type="button"
                onClick={() => signIn("facebook", { callbackUrl: "/dashboard/student" })}
                className="py-2.5 px-3 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition flex items-center justify-center gap-1.5"
              >
                <span>Facebook</span>
              </button>
              <button
                type="button"
                onClick={() => signIn("linkedin", { callbackUrl: "/dashboard/student" })}
                className="py-2.5 px-3 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition flex items-center justify-center gap-1.5"
              >
                <span>LinkedIn</span>
              </button>
            </div>

            <p className="text-center text-xs text-zinc-500 mt-6">
              Belum memiliki akun Kandaga?{" "}
              <Link href="/register" className="font-bold text-[#90133b] hover:underline">
                Daftar sekarang
              </Link>
            </p>
          </div>

          {/* Right Column: Role Quick Select Shortcuts Panel */}
          <div className="lg:col-span-5 bg-gradient-to-br from-zinc-900 via-zinc-950 to-[#3b0818] p-6 sm:p-8 text-white flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-zinc-800">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-rose-300">
                  Uji Coba 5 Peran (Roles)
                </span>
              </div>

              <h2 className="text-xl font-bold tracking-tight mb-2">
                Uji Akses Cepat Per-Role
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Klik salah satu role di bawah untuk mengisi kredensial secara otomatis dan menguji halaman khusus role tersebut:
              </p>

              <div className="space-y-2.5">
                {demoAccounts.map((acc) => {
                  const Icon = acc.icon
                  const isSelected = identifier === acc.username
                  return (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleSelectDemo(acc.username)}
                      className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-rose-950/60 border-rose-500 text-white shadow-lg"
                          : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${acc.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{acc.roleName}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-mono">
                              {acc.role}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-400 font-mono block">
                            {acc.username}
                          </span>
                        </div>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-rose-400" />
                      ) : (
                        <span className="text-[11px] font-medium text-rose-400 opacity-80">
                          Pilih
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Password Demo: <code className="text-rose-300 font-mono">password123</code></span>
              <span className="text-zinc-500">Kandaga v2.6</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-zinc-500 border-t border-zinc-200/60">
        © {new Date().getFullYear()} SMKN 13 Bandung • Major Gallery & Industrial Portal
      </footer>
    </div>
  )
}
