/**
 * avatar.ts — utilitas foto profil & inisial avatar pengguna Kandaga.
 *
 * Sesuai panduan UI/UX:
 * Foto profil bawaan tidak menggunakan ilustrasi 3D (/images/*.webp),
 * melainkan menampilkan inisial dari nama atau username pengguna.
 * Foto hanya ditampilkan apabila pengguna secara eksplisit mengunggah
 * foto kustom milik mereka sendiri.
 */

export function isDefaultAvatar(url: string | null | undefined): boolean {
  if (!url) return true
  const trimmed = url.trim()
  if (!trimmed) return true
  return (
    trimmed === "/images/siswa.webp" ||
    trimmed === "/images/guru.webp" ||
    trimmed === "/images/admin.webp" ||
    trimmed === "/images/bkk.webp" ||
    trimmed === "/images/perusahaan.webp" ||
    trimmed === "/images/company.webp" ||
    trimmed.startsWith("/images/preview-")
  )
}

export function isCustomAvatar(url: string | null | undefined): boolean {
  return !isDefaultAvatar(url)
}

/**
 * Menghasilkan inisial (1-2 huruf kapital) dari nama atau username.
 * Contoh:
 * - "Rafaditya Syahputra" -> "RS"
 * - "iniakuraditt" -> "IN"
 * - "Ahmad" -> "AH"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "U"
  const clean = name.trim()
  if (!clean) return "U"
  const parts = clean.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    const first = parts[0][0] || ""
    const second = parts[1][0] || ""
    return (first + second).toUpperCase()
  }
  if (clean.length >= 2) {
    return clean.slice(0, 2).toUpperCase()
  }
  return clean.toUpperCase()
}
