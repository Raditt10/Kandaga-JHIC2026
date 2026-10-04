"use client"

import React, { useState, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { getDashboardUrl } from "@/lib/auth"
import { Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react"

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || ""

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)


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
        setError("Kredensial tidak valid. Silakan periksa email/username dan password Anda.")
        setLoading(false)
        return
      }

      // Fetch session to obtain user role for precise redirection
      const sessionRes = await fetch("/api/auth/session")
      const sessionData = await sessionRes.json()

      const userRole = sessionData?.user?.role || "student"
      const normalizedRole =
        userRole.toLowerCase() === "students" ? "student" : userRole.toLowerCase()
      const verificationStatus = sessionData?.user?.verificationStatus as string | null

      // Khusus company: cek status verifikasi sebelum redirect ke dashboard
      if (normalizedRole === "company") {
        if (!verificationStatus || verificationStatus === "pending") {
          router.push("/mitra/menunggu")
          return
        }
        if (verificationStatus === "ditolak") {
          router.push("/mitra/ditolak")
          return
        }
      }

      // Redirect ke dashboard sesuai role atau callbackUrl
      const dest = callbackUrl || getDashboardUrl(normalizedRole)
      router.push(dest)
      router.refresh()
    } catch (err) {
      setError("Terjadi kesalahan saat masuk. Silakan coba lagi.")
      setLoading(false)
    }
  }

  return (
    <div
      suppressHydrationWarning
      className="relative min-h-screen w-full bg-[#a61743] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#a61743] selection:text-white overflow-hidden"
    >
      {/* Background Graphic Design: Diagonal rounded pills matching reference in white & maroon theme */}
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

          {/* Top-Left Diagonal Rounded Pills (Crisp White) */}
          <g transform="rotate(-35 250 200)">
            <rect x="-180" y="-140" width="130" height="640" rx="65" fill="url(#whitePillMedium)" />
            <rect x="0" y="-180" width="160" height="740" rx="80" fill="url(#whitePillBright)" />
            <rect x="210" y="-100" width="110" height="520" rx="55" fill="url(#whitePillMedium)" />
            <rect x="360" y="-50" width="75" height="380" rx="37.5" fill="url(#whitePillSoft)" />
          </g>

          {/* Bottom-Right Diagonal Rounded Pills (Crisp White) */}
          <g transform="rotate(-35 1200 700)">
            <rect x="960" y="440" width="80" height="460" rx="40" fill="url(#whitePillSoft)" />
            <rect x="1080" y="340" width="130" height="620" rx="65" fill="url(#whitePillMedium)" />
            <rect x="1250" y="260" width="165" height="760" rx="82.5" fill="url(#whitePillBright)" />
            <rect x="1460" y="320" width="140" height="660" rx="70" fill="url(#whitePillMedium)" />
          </g>
        </svg>
      </div>

      {/* Main Floating Card */}
      <div className="relative z-10 w-full max-w-5xl xl:max-w-6xl bg-white rounded-3xl lg:rounded-[32px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] border border-white/40 p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Login Form */}
        <div className="w-full flex flex-col justify-between py-2 sm:py-4">
          {/* Top Header: Back Link */}
          <div className="flex items-center mb-6">
            <Link
              href="/"
              aria-label="Kembali"
              className="w-8 h-8 rounded-md bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 hover:text-zinc-900 transition shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* Form Content */}
          <div className="w-full max-w-[380px] mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Selamat Datang Kembali
            </h1>
            <p className="text-sm text-zinc-500 mt-2 mb-6">
              Masuk untuk mengakses portofolio dan dashboard Anda.
            </p>

            {/* Error Alert */}
            {error && (
              <div className="mb-5 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: callbackUrl || "/student" })}
              className="w-full py-2.5 px-4 rounded-md border border-zinc-200/90 hover:bg-zinc-50 hover:border-zinc-300 font-medium text-sm text-zinc-700 flex items-center justify-center gap-2.5 transition shadow-xs cursor-pointer"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>Lanjutkan dengan Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200" />
              </div>
              <span className="relative bg-white px-3 text-xs text-zinc-400 font-normal">
                atau dengan email
              </span>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Email / Username
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="nama@email.com atau username"
                  className="w-full px-3.5 py-2.5 rounded-md border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#a61743]/15 focus:border-[#a61743] transition bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#242c4b] hover:bg-[#1a2038] text-white py-3 rounded-md text-sm font-semibold transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer mt-1 shadow-xs"
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>

            {/* Account Registration Links */}
            <div className="text-center text-xs text-zinc-500 mt-5 space-y-1.5">
              <p>
                Belum punya akun?{" "}
                <Link
                  href="/auth/register"
                  className="font-semibold text-[#a61743] underline underline-offset-2 hover:text-[#8B1A2F] transition"
                >
                  Daftar sekarang
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

        {/* Right Column: ilustrasi siswa (RPL · Analis Kimia · TKJ) */}
        <div className="relative hidden lg:block w-full h-full min-h-[560px] rounded-2xl lg:rounded-[28px] overflow-hidden bg-[#7C0215]">
          {/* Dasar marun — gradiennya disamakan dengan tepi atas ilustrasi agar menyatu */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, #7C0215 0%, #8C051A 55%, #8F071C 100%)" }}
            aria-hidden="true"
          />

          <Image
            src="/images/models.png"
            alt="Ilustrasi siswa jurusan RPL, Analis Kimia, dan TKJ"
            fill
            priority
            sizes="(min-width: 1280px) 512px, 448px"
            className="object-contain object-bottom select-none"
            draggable={false}
          />

          {/* Pelembut sambungan: gradien identik dengan latar, diposisikan tepat
              menutupi tepi atas ilustrasi (kotak 1:1 selebar panel, menempel bawah),
              lalu memudar ke bawah sehingga tidak ada garis batas terlihat */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 aspect-square"
            style={{
              background: "linear-gradient(90deg, #7C0215 0%, #8C051A 55%, #8F071C 100%)",
              WebkitMaskImage:
                "linear-gradient(180deg, #000 0%, rgba(0,0,0,0.5) 8%, rgba(0,0,0,0) 20%)",
              maskImage:
                "linear-gradient(180deg, #000 0%, rgba(0,0,0,0.5) 8%, rgba(0,0,0,0) 20%)",
            }}
            aria-hidden="true"
          />
        </div>

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#a61743] text-white text-sm">
          Memuat...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  )
}
