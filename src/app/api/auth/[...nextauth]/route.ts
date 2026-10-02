import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { normalizeRole } from "@/lib/auth"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "kandaga-dev-secret-2026",

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  providers: [
    // ── 1. Credentials (login langsung ke database) ────────────────────
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username / Email", type: "text" },
        password:   { label: "Password",         type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Identifier dan password wajib diisi.")
        }

        const identifier = credentials.identifier.trim()

        // Cari user — support login via email ATAU name (kolom `username` di DB)
        const user = await prisma.users.findFirst({
          where: {
            OR: [
              { email: identifier },
              { name:  identifier },
            ],
          },
          // Sertakan profil company untuk cek verificationStatus
          include: { companyProfile: true },
        })

        if (!user) throw new Error("Akun tidak ditemukan.")
        if (user.status !== "aktif") throw new Error("Akun tidak aktif. Hubungi administrator.")

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) throw new Error("Password salah.")

        const role = normalizeRole(user.role)

        // Untuk role company, sertakan verificationStatus ke token
        // supaya proxy bisa guard tanpa query DB lagi
        const verificationStatus =
          role === "company"
            ? (user.companyProfile?.verificationStatus ?? "pending")
            : null

        return {
          id:                 user.id,
          name:               user.name,
          username:           user.name,   // kolom `name` = username di DB
          email:              user.email,
          role,
          verificationStatus, // null untuk non-company
        }
      },
    }),

    // ── 2. Google OAuth ────────────────────────────────────────────────
    ...(process.env.GOOGLE_CLIENT_ID
      ? [GoogleProvider({
          clientId:     process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })]
      : []),

    // ── 3. GitHub OAuth ────────────────────────────────────────────────
    ...(process.env.GITHUB_ID
      ? [GithubProvider({
          clientId:     process.env.GITHUB_ID,
          clientSecret: process.env.GITHUB_SECRET!,
        })]
      : []),
  ],

  callbacks: {
    // Simpan id, role, username & status verifikasi ke JWT saat login
    async jwt({ token, user }) {
      if (user) {
        token.id                 = user.id
        token.role               = (user as { role?: string }).role ?? "student"
        token.email              = user.email
        token.name               = user.name
        token.username           = ((user as { username?: string }).username ?? user.name) ?? undefined
        token.verificationStatus = (user as { verificationStatus?: string | null }).verificationStatus ?? null
      }
      return token
    },

    // Ekspos role, username & status verifikasi ke session client
    async session({ session, token }) {
      if (session.user) {
        session.user.id                 = token.id                 as string
        session.user.role               = token.role               as string
        session.user.email              = token.email              as string
        session.user.name               = token.name               as string
        session.user.username           = (token.username as string) || (token.name as string)
        session.user.verificationStatus = token.verificationStatus as string | null
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith("/"))     return `${baseUrl}${url}`
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
