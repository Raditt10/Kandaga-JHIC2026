"use client"

/**
 * AccountSettings — pengaturan akun yang dipakai bersama oleh dashboard
 * Siswa, Guru, Perusahaan, dan BKK.
 *
 * Gaya visualnya sengaja mengikuti halaman admin (token `ink`/`primary`, kartu
 * rounded-2xl) supaya kelima dashboard terlihat satu aplikasi.
 *
 * Backend: GET/PATCH /api/akun (src/app/api/akun/route.ts)
 */

import React, { useEffect, useState } from "react"
import {
  BadgeCheck,
  Check,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Link2,
  Loader2,
  Settings,
  Sparkles,
  Trash2,
  UserCog,
} from "lucide-react"

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
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

type Akun = {
  id: string
  nama: string
  email: string
  googleEmail: string | null
  role: string
  status: string
  bergabung: string | null
}

type DetailItem = { label: string; value: string }

const ROLE_LABEL: Record<string, string> = {
  student: "Siswa",
  teacher: "Guru / Kurator Jurusan",
  company: "Mitra Perusahaan",
  bkk: "Koordinator BKK",
  admin: "Administrator Sekolah",
}

export default function AccountSettings() {
  const [akun, setAkun] = useState<Akun | null>(null)
  const [detail, setDetail] = useState<DetailItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Form nama
  const [nama, setNama] = useState("")
  const [simpanNama, setSimpanNama] = useState(false)
  const [pesanNama, setPesanNama] = useState<{ ok: boolean; text: string } | null>(null)

  // Form Tautan Akun Google
  const [googleEmailInput, setGoogleEmailInput] = useState("")
  const [isEditingGoogle, setIsEditingGoogle] = useState(false)
  const [simpanGoogle, setSimpanGoogle] = useState(false)
  const [pesanGoogle, setPesanGoogle] = useState<{ ok: boolean; text: string } | null>(null)

  // Form kata sandi
  const [passwordLama, setPasswordLama] = useState("")
  const [passwordBaru, setPasswordBaru] = useState("")
  const [konfirmasi, setKonfirmasi] = useState("")
  const [simpanPassword, setSimpanPassword] = useState(false)
  const [pesanPassword, setPesanPassword] = useState<{ ok: boolean; text: string } | null>(null)

  const muat = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await fetch("/api/akun", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) {
        setLoadError(data.error || "Gagal memuat data akun.")
      } else {
        setAkun(data.akun)
        setDetail(data.detail ?? [])
        setNama(data.akun?.nama ?? "")
        if (data.akun?.googleEmail) {
          setGoogleEmailInput(data.akun.googleEmail)
        } else if (data.akun?.email?.toLowerCase().endsWith("@gmail.com")) {
          setGoogleEmailInput(data.akun.email)
        }
      }
    } catch {
      setLoadError("Terjadi kesalahan koneksi saat memuat data akun.")
    }
    setLoading(false)
  }

  useEffect(() => {
    muat()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const kirim = async (body: Record<string, unknown>) => {
    const res = await fetch("/api/akun", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    return { ok: res.ok, data }
  }

  const tautkanGoogle = async (e: React.FormEvent) => {
    e.preventDefault()
    setPesanGoogle(null)
    const trimmed = googleEmailInput.trim().toLowerCase()
    if (!trimmed) {
      setPesanGoogle({ ok: false, text: "Silakan masukkan alamat email Google Anda." })
      return
    }
    setSimpanGoogle(true)
    const { ok, data } = await kirim({ googleEmail: trimmed })
    setSimpanGoogle(false)
    setPesanGoogle({ ok, text: ok ? data.pesan : data.error || "Gagal menautkan akun Google." })
    if (ok) {
      setIsEditingGoogle(false)
      muat()
    }
  }

  const putuskanGoogle = async () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Apakah Anda yakin ingin memutuskan tautan akun Google ini? Anda tidak akan bisa masuk menggunakan tombol Google dengan akun ini sampai ditautkan kembali."
      )
    ) {
      return
    }
    setPesanGoogle(null)
    setSimpanGoogle(true)
    const { ok, data } = await kirim({ unlinkGoogle: true })
    setSimpanGoogle(false)
    setPesanGoogle({ ok, text: ok ? data.pesan : data.error || "Gagal memutuskan tautan akun Google." })
    if (ok) {
      setIsEditingGoogle(false)
      setGoogleEmailInput("")
      muat()
    }
  }

  const ubahNama = async (e: React.FormEvent) => {
    e.preventDefault()
    setPesanNama(null)
    if (nama.trim() === akun?.nama) {
      setPesanNama({ ok: false, text: "Nama belum berubah." })
      return
    }
    setSimpanNama(true)
    const { ok, data } = await kirim({ nama })
    setSimpanNama(false)
    setPesanNama({ ok, text: ok ? data.pesan : data.error || "Gagal menyimpan nama." })
    if (ok) muat()
  }

  const ubahPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPesanPassword(null)
    if (passwordBaru !== konfirmasi) {
      setPesanPassword({ ok: false, text: "Konfirmasi kata sandi tidak sama." })
      return
    }
    setSimpanPassword(true)
    const { ok, data } = await kirim({ passwordLama, passwordBaru })
    setSimpanPassword(false)
    setPesanPassword({
      ok,
      text: ok ? data.pesan : data.error || "Gagal mengubah kata sandi.",
    })
    if (ok) {
      setPasswordLama("")
      setPasswordBaru("")
      setKonfirmasi("")
    }
  }

  const kartu = "p-6 rounded-2xl bg-white border border-ink-150 shadow-xs space-y-4"
  const label = "block text-xs font-semibold text-ink-700 mb-1.5"
  const input =
    "w-full rounded-xl border border-ink-150 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-600 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition"

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-white border border-ink-150 text-xs font-semibold text-ink-600 flex items-center gap-2 max-w-4xl">
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        Memuat data akun…
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 max-w-4xl">
        {loadError}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-ink-150 shadow-xs">
        <h1 className="font-heading text-lg font-bold text-ink flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" aria-hidden="true" />
          Pengaturan Akun
        </h1>
        <p className="text-xs text-ink-600 mt-0.5">
          Data akun, nama tampilan, dan kata sandi Anda.
        </p>
      </div>

      {/* Ringkasan akun */}
      <div className={kartu}>
        <h2 className="text-sm font-bold text-ink flex items-center gap-2 border-b border-ink-150 pb-3">
          <UserCog className="w-4 h-4 text-ink-600" aria-hidden="true" />
          Informasi Akun
        </h2>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-bold text-ink-600 uppercase tracking-wider">
              Nama Akun
            </dt>
            <dd className="text-sm font-semibold text-ink mt-1">{akun?.nama}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold text-ink-600 uppercase tracking-wider">
              Email
            </dt>
            <dd className="text-sm font-semibold text-ink mt-1">{akun?.email}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold text-ink-600 uppercase tracking-wider">
              Peran
            </dt>
            <dd className="text-sm font-semibold text-ink mt-1">
              {ROLE_LABEL[akun?.role ?? ""] ?? akun?.role}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold text-ink-600 uppercase tracking-wider">
              Status
            </dt>
            <dd className="text-sm font-semibold text-ink mt-1 flex items-center gap-1.5">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              {akun?.status === "aktif" ? "Aktif" : akun?.status}
            </dd>
          </div>

          <div>
            <dt className="text-[11px] font-bold text-ink-600 uppercase tracking-wider">
              Status Google
            </dt>
            <dd className="text-sm font-semibold text-ink mt-1 flex items-center gap-1.5">
              {akun?.googleEmail ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span className="truncate text-emerald-700 font-medium">{akun.googleEmail}</span>
                </>
              ) : (
                <span className="text-ink-600 italic font-normal">Belum ditautkan</span>
              )}
            </dd>
          </div>

          {detail.map((d) => (
            <div key={d.label}>
              <dt className="text-[11px] font-bold text-ink-600 uppercase tracking-wider">
                {d.label}
              </dt>
              <dd className="text-sm font-semibold text-ink mt-1">{d.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Tautan Akun Google */}
      <div className={kartu}>
        <div className="flex items-center justify-between border-b border-ink-150 pb-3">
          <div className="flex items-center gap-2">
            <GoogleIcon className="w-4 h-4" />
            <h2 className="text-sm font-bold text-ink">Tautan Akun Google</h2>
          </div>
          {akun?.googleEmail ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Tertaut
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              Belum Tertaut
            </span>
          )}
        </div>

        <p className="text-xs text-ink-600 leading-relaxed">
          Tautkan akun ini dengan akun Google (Gmail) yang Anda pakai. Setelah ditautkan, Anda bisa langsung masuk melalui tombol <strong>&ldquo;Lanjutkan dengan Google&rdquo;</strong> di halaman login tanpa perlu memasukkan password manual.
        </p>

        {akun?.googleEmail && !isEditingGoogle ? (
          <div className="p-4 rounded-xl bg-ink-100/60 border border-ink-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white border border-ink-150 flex items-center justify-center shadow-2xs shrink-0">
                <GoogleIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-ink-600 uppercase tracking-wider">
                  Akun Google Terhubung
                </p>
                <p className="text-sm font-bold text-ink truncate mt-0.5">
                  {akun.googleEmail}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsEditingGoogle(true)
                  setGoogleEmailInput(akun.googleEmail || "")
                  setPesanGoogle(null)
                }}
                className="px-3.5 py-2 rounded-xl border border-ink-150 bg-white hover:bg-ink-100 text-ink text-xs font-semibold transition cursor-pointer"
              >
                Ganti Akun
              </button>
              <button
                type="button"
                onClick={putuskanGoogle}
                disabled={simpanGoogle}
                className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition cursor-pointer disabled:opacity-60 inline-flex items-center gap-1.5"
              >
                {simpanGoogle ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Putuskan Tautan
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={tautkanGoogle} className="space-y-3.5">
            <div>
              <label htmlFor="google-email-input" className={label}>
                Akun Google yang Dipakai (Gmail)
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <GoogleIcon className="w-4 h-4" />
                </div>
                <input
                  id="google-email-input"
                  type="email"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  className={`${input} pl-10`}
                  placeholder="masukkan.email@gmail.com"
                  required
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5">
                <p className="text-[11px] text-ink-600">
                  Masukkan email akun Google yang Anda pakai agar akun ini terhubung langsung.
                </p>
                {akun?.email && akun.email !== googleEmailInput && (
                  <button
                    type="button"
                    onClick={() => setGoogleEmailInput(akun.email)}
                    className="text-[11px] text-primary hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Gunakan email akun ({akun.email})
                  </button>
                )}
              </div>
            </div>

            {pesanGoogle && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold border ${
                  pesanGoogle.ok
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-rose-50 border-rose-200 text-rose-700"
                }`}
              >
                {pesanGoogle.text}
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              {isEditingGoogle ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingGoogle(false)
                    setPesanGoogle(null)
                  }}
                  className="text-xs text-ink-600 hover:text-ink font-semibold cursor-pointer"
                >
                  Batal
                </button>
              ) : (
                <div />
              )}
              <button
                type="submit"
                disabled={simpanGoogle || !googleEmailInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition cursor-pointer disabled:opacity-60 inline-flex items-center gap-2"
              >
                {simpanGoogle ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                {akun?.googleEmail ? "Perbarui Tautan Google" : "Tautkan Akun Google"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Ubah nama */}
      <form onSubmit={ubahNama} className={kartu}>
        <h2 className="text-sm font-bold text-ink border-b border-ink-150 pb-3">
          Ubah Nama Akun
        </h2>

        <div>
          <label htmlFor="nama-akun" className={label}>
            Nama akun
          </label>
          <input
            id="nama-akun"
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className={input}
            placeholder="mis. siswa13"
          />
          <p className="text-[11px] text-ink-600 mt-1.5">
            Nama ini juga dipakai untuk login, jadi gunakan nama baru saat masuk berikutnya.
          </p>
        </div>

        {pesanNama && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold border ${
              pesanNama.ok
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-rose-50 border-rose-200 text-rose-700"
            }`}
          >
            {pesanNama.text}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={simpanNama}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition cursor-pointer disabled:opacity-60 inline-flex items-center gap-2"
          >
            {simpanNama ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            Simpan Nama
          </button>
        </div>
      </form>

      {/* Ubah kata sandi */}
      <form onSubmit={ubahPassword} className={kartu}>
        <h2 className="text-sm font-bold text-ink flex items-center gap-2 border-b border-ink-150 pb-3">
          <KeyRound className="w-4 h-4 text-ink-600" aria-hidden="true" />
          Ubah Kata Sandi
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="pw-lama" className={label}>
              Kata sandi lama
            </label>
            <input
              id="pw-lama"
              type="password"
              value={passwordLama}
              onChange={(e) => setPasswordLama(e.target.value)}
              className={input}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label htmlFor="pw-baru" className={label}>
              Kata sandi baru
            </label>
            <input
              id="pw-baru"
              type="password"
              value={passwordBaru}
              onChange={(e) => setPasswordBaru(e.target.value)}
              className={input}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="pw-konfirmasi" className={label}>
              Ulangi kata sandi baru
            </label>
            <input
              id="pw-konfirmasi"
              type="password"
              value={konfirmasi}
              onChange={(e) => setKonfirmasi(e.target.value)}
              className={input}
              autoComplete="new-password"
            />
          </div>
        </div>

        <p className="text-[11px] text-ink-600">
          Minimal 8 karakter. Kata sandi lama diperlukan sebagai konfirmasi.
        </p>

        {pesanPassword && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold border ${
              pesanPassword.ok
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-rose-50 border-rose-200 text-rose-700"
            }`}
          >
            {pesanPassword.text}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={simpanPassword}
            className="px-5 py-2.5 rounded-xl bg-ink hover:bg-ink text-white text-xs font-bold transition cursor-pointer disabled:opacity-60 inline-flex items-center gap-2"
          >
            {simpanPassword ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            Simpan Kata Sandi
          </button>
        </div>
      </form>
    </div>
  )
}
