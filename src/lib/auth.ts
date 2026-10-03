/**
 * Auth helpers terpusat — dipakai di NextAuth callback, login page,
 * dan middleware. Satu tempat untuk ubah semua redirect logic.
 */

export type AppRole =
  | "Student" | "Teacher" | "Admin" | "BKK" | "Company"
  | "student" | "teacher" | "admin" | "bkk"  | "company"

/**
 * Mapping role → path dashboard utama.
 * Semua route dashboard ada di src/app/{role}/page.tsx
 */
export function getDashboardUrl(role: string): string {
  switch (role.trim().toLowerCase()) {
    case "student":
    case "students":   return "/student"
    case "teacher":
    case "teachers":   return "/teacher"
    case "admin":
    case "administrator": return "/admin"
    case "bkk":        return "/bkk"
    case "company":
    case "perusahaan": return "/company"
    default:           return "/student"
  }
}

/**
 * Normalisasi role string ke lowercase singular.
 * Handle PascalCase dari Prisma enum (Student/Teacher/BKK/Company/Admin).
 */
export function normalizeRole(role: string): string {
  const r = role.trim().toLowerCase()
  if (r === "students" || r === "student") return "student"
  if (r === "teachers" || r === "teacher") return "teacher"
  if (r === "admin"    || r === "administrator") return "admin"
  if (r === "bkk")     return "bkk"
  if (r === "company"  || r === "perusahaan") return "company"
  return "student"
}
