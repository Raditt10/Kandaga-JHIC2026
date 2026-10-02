import "next-auth"
import "next-auth/jwt"

/**
 * Augmentasi type NextAuth untuk field custom yang kita tambahkan:
 * - role: role user (student/teacher/admin/bkk/company)
 * - username: nama user (field `name` di DB)
 * - verificationStatus: status verifikasi khusus untuk role company
 *   null untuk role selain company
 */

declare module "next-auth" {
  interface User {
    id?:                 string
    role?:               string
    username?:           string
    verificationStatus?: string | null
  }

  interface Session {
    user: {
      id:                  string
      name?:               string | null
      email?:              string | null
      image?:              string | null
      role:                string
      username?:           string
      verificationStatus?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?:                 string
    role?:               string
    username?:           string
    verificationStatus?: string | null
  }
}
