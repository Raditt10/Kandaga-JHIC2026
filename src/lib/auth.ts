/**
 * Auth helpers terpusat — dipakai di NextAuth callback, login page,
 * dan middleware. Satu tempat untuk ubah semua redirect logic.
 */

export type AppRole =
  | "Student"
  | "Teacher"
  | "Admin"
  | "BKK"
  | "Company"
  | "student"
  | "teacher"
  | "admin"
  | "bkk"
  | "company"

/**
 * Mapping role → path dashboard.
 * Semua route dashboard sudah ada di src/app/ (student, teacher, admin, bkk, company).
 */
export function getDashboardUrl(role: string): string {
  const normalized = role.toLowerCase()
  switch (normalized) {
    case "student":
    case "students":
      return "/student"
    case "teacher":
    case "teachers":
      return "/teacher"
    case "admin":
    case "administrator":
      return "/admin/dashboard"
    case "bkk":
      return "/bkk"
    case "company":
    case "perusahaan":
      return "/company"
    default:
      return "/student"
  }
}

/**
 * Normalisasi role string ke bentuk yang konsisten (lowercase singular).
 * Dipakai untuk menyamakan nilai dari DB dan dari token JWT.
 */
export function normalizeRole(role: string): string {
  const r = role.trim().toLowerCase()
  if (r === "students" || r === "student") return "student"
  if (r === "teachers" || r === "teacher") return "teacher"
  if (r === "admin" || r === "administrator") return "admin"
  if (r === "bkk") return "bkk"
  if (r === "company" || r === "perusahaan") return "company"
  return "student"
}