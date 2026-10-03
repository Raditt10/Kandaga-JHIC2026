/**
 * Handler HTTP NextAuth.
 *
 * Seluruh konfigurasi dipindah ke `@/lib/auth-options` supaya bisa dipakai
 * ulang oleh route lain lewat `getServerSession(authOptions)` — misalnya
 * /api/student/projects. File ini sengaja tetap tipis.
 */

import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth-options"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
