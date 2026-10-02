import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { getDashboardUrl, normalizeRole } from "@/lib/auth"
import { usersDatabase } from "@/lib/users"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "kandaga-dev-secret-2026",

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },

  providers: [
    // ── 1. Credentials (Login Langsung / Mock In-Memory tanpa Database) ──
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username / Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier) {
          throw new Error("Username atau email wajib diisi.")
        }

        const identifier = credentials.identifier.trim()
        const lowerId = identifier.toLowerCase()

        // 1. Cek di daftar akun demo (siswa13, admin13, mitra_perusahaan, guru13, bkk13)
        const foundUser = usersDatabase.find(
          (u) =>
            u.username.toLowerCase() === lowerId ||
            u.email.toLowerCase() === lowerId
        )

        if (foundUser) {
          return {
            id: foundUser.id,
            name: foundUser.username,
            username: foundUser.username,
            email: foundUser.email,
            role: normalizeRole(foundUser.role),
          }
        }

        // 2. Jika user memasukkan email / username bebas (contoh: alfijar@gmail.com):
        // Langsung izinkan masuk tanpa database, auto-detect peran
        let detectedRole = "student"
        if (lowerId.includes("admin")) detectedRole = "admin"
        else if (lowerId.includes("guru") || lowerId.includes("teacher")) detectedRole = "teacher"
        else if (lowerId.includes("mitra") || lowerId.includes("company") || lowerId.includes("perusahaan")) detectedRole = "company"
        else if (lowerId.includes("bkk")) detectedRole = "bkk"

        const displayName = identifier.includes("@") ? identifier.split("@")[0] : identifier
        const displayEmail = identifier.includes("@") ? identifier : `${identifier}@smkn13bandung.sch.id`

        return {
          id: `user-${Date.now()}`,
          name: displayName,
          username: displayName,
          email: displayEmail,
          role: normalizeRole(detectedRole),
        }
      },
    }),

    // ── 2. Google OAuth ───────────────────────────────────────────────
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),

    // ── 3. GitHub OAuth ───────────────────────────────────────────────
    ...(process.env.GITHUB_ID
      ? [
          GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET!,
          }),
        ]
      : []),
  ],

  callbacks: {
    // Simpan role & username ke JWT saat login
    async jwt({ token, user }) {
      if (user) {
        token.id       = user.id
        token.role     = (user as { role?: string }).role ?? "student"
        token.email    = user.email ?? undefined
        token.name     = user.name ?? undefined
        token.username = ((user as { username?: string }).username ?? user.name) ?? undefined
      }
      return token
    },

    // Ekspos role & username ke session client
    async session({ session, token }) {
      if (session.user) {
        session.user.id       = token.id       as string
        session.user.role     = token.role     as string
        session.user.email    = token.email    as string
        session.user.name     = token.name     as string
        session.user.username = (token.username as string) || (token.name as string)
      }
      return session
    },

    // Redirect otomatis setelah login berdasarkan role
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith("/")) return `${baseUrl}${url}`
      return baseUrl
    },
  },

  pages: {
    signIn: "/auth/login",
    error:  "/auth/login",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
