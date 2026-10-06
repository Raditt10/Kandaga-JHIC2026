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
  AlertCircle,
  BellOff,
  BellRing,
  Check,
  CheckCircle2,
  KeyRound,
  Link2,
  Loader2,
  Monitor,
  Moon,
  Palette,
  Sparkles,
  Sun,
  Trash2,
} from "lucide-react"
import { THEME_OPTIONS, getStoredTheme, setThemeMode, type ThemeMode } from "@/lib/theme"

/** Kunci localStorage untuk preferensi notifikasi perangkat. */
const NOTIF_STORAGE_KEY = "kandaga_notif_device"

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

export default function AccountSettings() {
  const [akun, setAkun] = useState<Akun | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

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

  // Tema tampilan (terang / gelap / ikut sistem)
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light")

  // Notifikasi perangkat
  const [notifSupported, setNotifSupported] = useState(true)
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">(
    "default"
  )
  const [notifOn, setNotifOn] = useState(false)
  const [notifBusy, setNotifBusy] = useState(false)
  const [pesanNotif, setPesanNotif] = useState<{ ok: boolean; text: string } | null>(null)

  // Sinkronkan kontrol dengan keadaan sebenarnya di perangkat.
  useEffect(() => {
    setThemeModeState(getStoredTheme())

    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotifSupported(false)
      setNotifPermission("unsupported")
      return
    }

    const izin = Notification.permission
    setNotifPermission(izin)

    let tersimpan = false
    try {
      tersimpan = window.localStorage.getItem(NOTIF_STORAGE_KEY) === "1"
    } catch {
      tersimpan = false
    }
    // Saklar hanya menyala bila preferensi tersimpan DAN izin browser masih ada.
    setNotifOn(tersimpan && izin === "granted")
  }, [])

  const ubahTema = (mode: ThemeMode) => {
    setThemeMode(mode)
    setThemeModeState(mode)
  }

  const statusIzin: Record<string, string> = {
    granted: "Izin diberikan",
    denied: "Diblokir browser",
    default: "Izin belum diminta",
    unsupported: "Tidak didukung browser ini",
  }

  const alihkanNotif = async () => {
    if (notifBusy) return
    setPesanNotif(null)

    // ── Mematikan notifikasi ──
    if (notifOn) {
      setNotifOn(false)
      try {
        window.localStorage.setItem(NOTIF_STORAGE_KEY, "0")
      } catch {}
      setPesanNotif({
        ok: true,
        text: "Notifikasi perangkat dimatikan. Anda tidak akan menerima pemberitahuan di perangkat ini.",
      })
      return
    }

    // ── Menyalakan notifikasi ──
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPesanNotif({
        ok: false,
        text: "Browser ini tidak mendukung notifikasi perangkat.",
      })
      return
    }

    setNotifBusy(true)
    try {
      let izin = Notification.permission
      if (izin === "default") {
        izin = await Notification.requestPermission()
      }
      setNotifPermission(izin)

      if (izin !== "granted") {
        setNotifOn(false)
        try {
          window.localStorage.setItem(NOTIF_STORAGE_KEY, "0")
        } catch {}
        setPesanNotif({
          ok: false,
          text:
            izin === "denied"
              ? "Izin notifikasi diblokir. Buka pengaturan situs di browser Anda, izinkan notifikasi untuk Kandaga, lalu coba lagi."
              : "Izin notifikasi belum diberikan, jadi notifikasi perangkat masih nonaktif.",
        })
        return
      }

      setNotifOn(true)
      try {
        window.localStorage.setItem(NOTIF_STORAGE_KEY, "1")
      } catch {}

      /*
       * Kirim satu notifikasi uji sebagai bukti nyata bahwa izin bekerja.
       * Di sebagian browser (umumnya Android), konstruktor Notification
       * dilarang dan wajib lewat service worker. Kalau itu terjadi, jangan
       * mengaku sudah terkirim — beri tahu apa adanya.
       */
      let ujiTerkirim = false
      try {
        new Notification("Kandaga — notifikasi aktif", {
          body: "Mulai sekarang pemberitahuan penting akan muncul di perangkat ini.",
          icon: "/logo.png",
          tag: "kandaga-notif-uji",
        })
        ujiTerkirim = true
      } catch {
        ujiTerkirim = false
      }

      setPesanNotif({
        ok: true,
        text: ujiTerkirim
          ? "Notifikasi perangkat diaktifkan. Satu notifikasi uji baru saja dikirim — cek pojok layar Anda."
          : "Notifikasi perangkat diaktifkan. Browser ini tidak mengizinkan notifikasi uji langsung, tetapi izin sudah tersimpan.",
      })
    } finally {
      setNotifBusy(false)
    }
  }

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

  const sectionClass = "p-6 sm:p-8 space-y-4"
  const label = "block text-xs font-semibold text-ink-700 mb-1.5"
  const input =
    "w-full rounded-xl border border-ink-150 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-600 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition"

  if (loading) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-ink-150 text-xs font-semibold text-ink-600 flex items-center gap-2 w-full">
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        Memuat data akun…
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="p-8 rounded-3xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 w-full">
        {loadError}
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header — Bersih tanpa kotak card terpisah */}
      <div className="pb-1">
        <h1 className="font-heading text-xl font-bold text-ink">
          Pengaturan
        </h1>
        <p className="text-xs text-ink-600 mt-1">
          Tema tampilan, notifikasi perangkat, tautan Google, dan kata sandi Anda.
        </p>
      </div>

      {/* Satu Kontainer Penuh Terpadu (Unified Full Panel Layout) */}
      <div className="bg-white rounded-3xl border border-ink-150 shadow-xs divide-y divide-ink-150 overflow-hidden w-full">
        {/* Tampilan — tema terang / gelap / ikut sistem */}
        <div className={sectionClass}>
          <h2 className="text-sm font-bold text-ink flex items-center gap-2">
            <Palette className="w-4 h-4 text-ink-600" aria-hidden="true" />
            Tampilan
          </h2>

          <p className="text-xs text-ink-600 leading-relaxed">
            Secara bawaan antarmuka menggunakan tema <strong>Terang</strong>. Anda dapat beralih ke mode <strong>Gelap</strong> atau memilih <strong>Sistem</strong> untuk mengikuti pengaturan perangkat Anda.
          </p>

          <div
            className="grid gap-3 sm:grid-cols-3 pt-1"
            role="radiogroup"
            aria-label="Pilihan tema tampilan"
          >
            {THEME_OPTIONS.map((opt) => {
              const aktif = themeMode === opt.value
              const Ikon = opt.value === "system" ? Monitor : opt.value === "dark" ? Moon : Sun
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={aktif}
                  onClick={() => ubahTema(opt.value)}
                  className={`relative flex items-start gap-3 p-3.5 rounded-xl border text-left transition cursor-pointer ${
                    aktif
                      ? "border-primary bg-primary/5 ring-2 ring-primary/15"
                      : "border-ink-150 bg-white hover:border-ink-300 hover:bg-ink-100/60"
                  }`}
                >
                  <Ikon
                    className={`w-4 h-4 mt-0.5 shrink-0 ${aktif ? "text-primary" : "text-ink-600"}`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span
                      className={`block text-xs font-bold ${aktif ? "text-primary" : "text-ink"}`}
                    >
                      {opt.label}
                    </span>
                    <span className="block text-[11px] text-ink-600 mt-0.5">{opt.hint}</span>
                  </span>
                  {aktif && (
                    <Check
                      className="w-3.5 h-3.5 text-primary absolute top-3 right-3"
                      aria-hidden="true"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Notifikasi perangkat */}
        <div className={sectionClass}>
          <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
            <h2 className="text-sm font-bold text-ink flex items-center gap-2">
              <BellRing className="w-4 h-4 text-ink-600" aria-hidden="true" />
              Notifikasi Perangkat
            </h2>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                notifPermission === "granted"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : notifPermission === "denied"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {notifPermission === "granted" ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />
              ) : (
                <AlertCircle className="w-3 h-3" aria-hidden="true" />
              )}
              {statusIzin[notifPermission] ?? notifPermission}
            </span>
          </div>

          <p className="text-xs text-ink-600 leading-relaxed">
            Saat dinyalakan, Kandaga boleh mengirim pemberitahuan ke perangkat ini — misalnya
            ketika karya Anda selesai diverifikasi atau ada pengumuman baru. Izin ini diberikan
            oleh browser dan hanya berlaku di perangkat ini, bukan di perangkat lain.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-ink-100/60 border border-ink-150">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white border border-ink-150 flex items-center justify-center shrink-0">
                {notifOn ? (
                  <BellRing className="w-5 h-5 text-primary" aria-hidden="true" />
                ) : (
                  <BellOff className="w-5 h-5 text-ink-600" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-ink">
                  {notifOn ? "Notifikasi aktif" : "Notifikasi nonaktif"}
                </p>
                <p className="text-[11px] text-ink-600 mt-0.5">
                  {!notifSupported
                    ? "Browser ini tidak mendukung notifikasi perangkat."
                    : notifPermission === "denied"
                      ? "Diblokir oleh browser. Izinkan lewat pengaturan situs di browser Anda."
                      : notifPermission === "granted"
                        ? "Izin sudah diberikan untuk Kandaga di perangkat ini."
                        : "Browser akan meminta izin saat Anda menyalakannya."}
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={notifOn}
              aria-label="Notifikasi perangkat"
              disabled={notifBusy || !notifSupported || notifPermission === "denied"}
              onClick={alihkanNotif}
              className={`relative w-12 h-7 rounded-full shrink-0 transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                notifOn ? "bg-primary" : "bg-ink-300"
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
                  notifOn ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          {pesanNotif && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold border ${
                pesanNotif.ok
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-rose-50 border-rose-200 text-rose-700"
              }`}
            >
              {pesanNotif.text}
            </div>
          )}
        </div>

      {/* Tautan Akun Google */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between pb-1">
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

      {/* Ubah kata sandi */}
      <form onSubmit={ubahPassword} className={sectionClass}>
        <h2 className="text-sm font-bold text-ink flex items-center gap-2 pb-1">
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
  </div>
)
}
