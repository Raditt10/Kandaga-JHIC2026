import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { getDashboardUrl, normalizeRole } from "@/lib/auth"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "kandaga-dev-secret-2026",

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },

  providers: [
    // ── 1. Credentials (email atau username + password) ──────────────
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username / Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Identifier dan password wajib diisi.")
        }

        const identifier = credentials.identifier.trim()

        // Cari user di database — support login via email ATAU name
        const user = await prisma.users.findFirst({
          where: {
            OR: [
              { email: identifier },
              { name: identifier },
            ],
          },
        })

        if (!user) {
          throw new Error("Akun tidak ditemukan.")
        }

        if (user.status !== "aktif") {
          throw new Error("Akun tidak aktif. Hubungi administrator.")
        }

        // Verifikasi password dengan bcrypt
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isValid) {
          throw new Error("Password salah.")
        }

        return {
          id:    user.id,
          name:  user.name,
          email: user.email,
          role:  normalizeRole(user.role),
        }
      },
    }),

    // ── 2. Google OAuth ───────────────────────────────────────────────
    // Hanya aktif kalau GOOGLE_CLIENT_ID tersedia
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
    // Simpan role ke JWT saat login
    async jwt({ token, user }) {
      if (user) {
        token.id    = user.id
        token.role  = (user as { role?: string }).role ?? "student"
        token.email = user.email
        token.name  = user.name
      }
      return token
    },

    // Ekspos role ke session supaya bisa dibaca di client
    async session({ session, token }) {
      if (session.user) {
        session.user.id    = token.id    as string
        session.user.role  = token.role  as string
        session.user.email = token.email as string
        session.user.name  = token.name  as string
      }
      return session
    },

    // Redirect otomatis setelah login berdasarkan role
    async redirect({ url, baseUrl }) {
      // Kalau ada callbackUrl eksplisit dari query string, pakai itu
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
