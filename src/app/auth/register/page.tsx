"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { getDashboardUrl } from "@/lib/auth"
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"

type RoleId = "student" | "admin" | "company" | "teacher" | "bkk"

export default function RegisterPage() {
  const router = useRouter()

  // Field wajib (non-nullable)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Peran dikunci ke "student" — pendaftaran publik hanya untuk siswa.
  // Peran lain dibuat dari dashboard sekolah; mitra industri lewat /mitra/daftar.
  const role: RoleId = "student"

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

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
        router.push("/auth/login")
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi server. Silakan coba lagi.")
      setLoading(false)
    }
  }

  return (
    <div
      suppressHydrationWarning
      className="relative min-h-screen w-full bg-[#a61743] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans overflow-hidden"
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
                    {showPassword ? <EyeOff className="w-4 h-4 no-maroon" /> : <Eye className="w-4 h-4 no-maroon" />}
                  </button>
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
                  Coba login
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Kolom kanan: ilustrasi siswa (RPL · Analis Kimia · TKJ) — disamakan dengan halaman login */}
        <div className="relative hidden lg:block w-full h-full min-h-[560px] rounded-2xl lg:rounded-[28px] overflow-hidden bg-[#7C0215]">
          {/* Dasar marun — gradiennya disamakan dengan tepi atas ilustrasi agar menyatu */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, #7C0215 0%, #8C051A 55%, #8F071C 100%)" }}
            aria-hidden="true"
          />

          <Image
            src="/images/models.webp"
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
