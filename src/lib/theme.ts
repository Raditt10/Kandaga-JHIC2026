/**
 * theme.ts — pengelola tema terang/gelap.
 *
 * Pilihan pengguna disimpan di localStorage dan diterapkan sebagai kelas
 * `.dark` pada <html>. Seluruh gaya gelapnya ada di src/app/globals.css.
 *
 * Kenapa tidak memakai next-themes: aplikasi ini hanya butuh satu kelas pada
 * <html> tanpa React context, dan menambah dependensi baru untuk itu tidak
 * sepadan. Logikanya di sini sengaja kecil dan tanpa efek samping saat impor,
 * supaya aman dipanggil dari komponen klien mana pun.
 */

export type ThemeMode = "system" | "light" | "dark"

export const THEME_STORAGE_KEY = "kandaga_theme"

/** Nama event internal saat tema diubah dari dalam aplikasi. */
export const THEME_CHANGE_EVENT = "kandaga:theme-change"

export const THEME_OPTIONS: { value: ThemeMode; label: string; hint: string }[] = [
  { value: "light", label: "Terang", hint: "Mode terang bawaan" },
  { value: "dark", label: "Gelap", hint: "Mode gelap" },
  { value: "system", label: "Sistem", hint: "Ikut pengaturan perangkat" },
]

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark"
}

/** Baca pilihan tersimpan; jatuh ke "light" bila belum ada atau rusak. */
export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light"
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeMode(raw) ? raw : "light"
  } catch {
    return "light"
  }
}

/** Apakah perangkat saat ini meminta tema gelap? */
export function prefersDark(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

/** Tema yang benar-benar dipakai setelah "system" diselesaikan. */
export function resolveIsDark(mode: ThemeMode): boolean {
  return mode === "dark" || (mode === "system" && prefersDark())
}

/**
 * Area yang boleh bertema gelap — hanya dashboard setelah login.
 *
 * Halaman publik (landing, jurusan, galeri, profil siswa & mitra) sengaja
 * selalu terang: tampilannya adalah muka sekolah untuk pengunjung luar, dan
 * tema gelap di sana membuat identitasnya berubah-ubah tergantung perangkat
 * pengunjung. Halaman di luar daftar ini otomatis dipaksa terang.
 *
 * Kelima route di bawah adalah route yang memang dialihkan ke halaman login
 * bila belum masuk, jadi "ada di route ini" setara dengan "sudah login".
 */
export const DASHBOARD_PREFIXES = ["/student", "/teacher", "/admin", "/bkk", "/company"]

export function isDashboardPath(pathname: string): boolean {
  return DASHBOARD_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

/**
 * Terapkan kelas `.dark` dan `color-scheme` pada <html>.
 * `color-scheme` penting supaya kontrol bawaan browser (scrollbar, pemilih
 * tanggal, autofill) juga ikut gelap.
 *
 * `pathname` boleh diberikan saat pemanggil sudah punya nilainya (mis. dari
 * usePathname) supaya tidak membaca window.location yang bisa telat satu
 * langkah saat berpindah halaman.
 */
export function applyThemeMode(mode: ThemeMode, pathname?: string): void {
  if (typeof document === "undefined") return

  const root = document.documentElement
  const path = pathname ?? window.location.pathname

  // Di luar area login: selalu terang, apa pun pilihan pengguna.
  if (!isDashboardPath(path)) {
    root.classList.remove("dark")
    root.style.colorScheme = "light"
    return
  }

  const dark = resolveIsDark(mode)
  root.classList.toggle("dark", dark)
  root.style.colorScheme = dark ? "dark" : "light"
}

/** Simpan pilihan lalu terapkan, dan beri tahu komponen lain. */
export function setThemeMode(mode: ThemeMode): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode)
  } catch {
    /* localStorage bisa diblokir (mode privat) — tema tetap diterapkan. */
  }
  applyThemeMode(mode)
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
}
