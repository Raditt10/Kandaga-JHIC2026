"use client"

/**
 * AccountSettings — pengaturan akun yang dipakai bersama oleh dashboard
 * Siswa, Guru, Perusahaan, dan BKK.
 *
 * Gaya visualnya sengaja mengikuti halaman admin (palet slate, kartu
 * rounded-2xl, aksen #891337) supaya kelima dashboard terlihat satu aplikasi.
 *
 * Backend: GET/PATCH /api/akun (src/app/api/akun/route.ts)
 */

import React, { useEffect, useState } from "react"
import {
  BadgeCheck,
  Check,
  KeyRound,
  Loader2,
  Settings,
  UserCog,
} from "lucide-react"

type Akun = {
  id: string
  nama: string
  email: string
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
    "w-full rounded-xl border border-ink-150 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-600 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-[#891337] transition"

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
