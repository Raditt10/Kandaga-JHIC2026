/**
 * user-cache.ts — cache profil di localStorage yang TERIKAT pada akun.
 *
 * ── Kenapa modul ini ada ──
 *
 * localStorage bersifat per-peramban (per-origin), BUKAN per-akun. Kunci lama
 * seperti `kandaga_student_profile` tidak memuat identitas siapa pun. Begitu
 * akun A membuka profilnya di sebuah peramban, datanya tersimpan di kunci itu.
 * Saat akun B masuk di peramban yang sama, kode membaca kunci yang sama lebih
 * dulu — jadi nama, NIS, NISN, email, telepon, kelas, bio, alamat, dan foto
 * akun A ikut tampil di akun B.
 *
 * Karena itu setiap cache yang isinya milik pengguna WAJIB lewat modul ini dan
 * wajib menyertakan id akun pada kuncinya.
 */

/** Basis kunci cache; kunci akhirnya selalu `<basis>:<userId>`. */
export const PROFILE_CACHE_BASE = "kandaga_student_profile"
export const AVATAR_CACHE_BASE = "kandaga_user_avatar"

/**
 * Kunci versi lama yang tidak memuat id akun. Datanya sudah terlanjur bocor
 * antar akun, jadi dibersihkan agar tidak tertinggal di peramban pengguna.
 */
const LEGACY_ACCOUNT_KEYS = [PROFILE_CACHE_BASE, AVATAR_CACHE_BASE] as const

/** Bangun kunci cache milik satu akun. */
export function userCacheKey(base: string, userId: string): string {
  return `${base}:${userId}`
}

/**
 * Baca cache milik akun tertentu.
 *
 * Tanpa `userId` fungsi ini mengembalikan null — sengaja. Kalau sesi belum
 * siap, lebih baik tidak ada cache sama sekali daripada membaca data akun
 * yang salah.
 */
export function readUserCache<T>(base: string, userId: string | undefined | null): T | null {
  if (typeof window === "undefined" || !userId) return null
  try {
    const raw = window.localStorage.getItem(userCacheKey(base, userId))
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeUserCache(
  base: string,
  userId: string | undefined | null,
  value: unknown
): void {
  if (typeof window === "undefined" || !userId) return
  try {
    window.localStorage.setItem(userCacheKey(base, userId), JSON.stringify(value))
  } catch {
    /* localStorage bisa diblokir (mode privat). Cache hanya optimisasi. */
  }
}

export function removeUserCache(base: string, userId: string | undefined | null): void {
  if (typeof window === "undefined" || !userId) return
  try {
    window.localStorage.removeItem(userCacheKey(base, userId))
  } catch {}
}

/** Hapus seluruh cache milik satu akun — dipakai saat keluar akun. */
export function clearUserCache(userId: string | undefined | null): void {
  removeUserCache(PROFILE_CACHE_BASE, userId)
  removeUserCache(AVATAR_CACHE_BASE, userId)
}

/**
 * Bersihkan kunci versi lama yang tidak memuat id akun.
 *
 * Aman dipanggil berkali-kali: setelah pembersihan pertama, pemanggilan
 * berikutnya hanya menghapus kunci yang memang sudah tidak ada.
 */
export function purgeLegacyAccountCache(): void {
  if (typeof window === "undefined") return
  for (const key of LEGACY_ACCOUNT_KEYS) {
    try {
      window.localStorage.removeItem(key)
    } catch {}
  }
}
