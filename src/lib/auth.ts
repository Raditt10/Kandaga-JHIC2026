import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export const authOptions:NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "kandaga-dev-secret-2026",

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  providers: [
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

        // Cari user — support login via email ATAU name
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
        // supaya middleware bisa guard tanpa query DB lagi
        const verificationStatus =
          role === "company"
            ? (user.companyProfile?.verificationStatus ?? "pending")
            : null

        return {
          id:                 user.id,
          name:               user.name,
          email:              user.email,
          role,
          verificationStatus, // null untuk non-company
        }
      },
    }),

    ...(process.env.GOOGLE_CLIENT_ID
      ? [GoogleProvider({
          clientId:     process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })]
      : []),

    ...(process.env.GITHUB_ID
      ? [GithubProvider({
          clientId:     process.env.GITHUB_ID,
          clientSecret: process.env.GITHUB_SECRET!,
        })]
      : []),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id                 = user.id
        token.role               = (user as { role?: string }).role ?? "student"
        token.email              = user.email
        token.name               = user.name
        token.verificationStatus = (user as { verificationStatus?: string | null }).verificationStatus ?? null
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id                 = token.id                 as string
        session.user.role               = token.role               as string
        session.user.email              = token.email              as string
        session.user.name               = token.name               as string
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
};


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

export function getDashboardUrl(role?: string): string {
  if (!role) return "/student"
  const r = normalizeRole(role)
  return `/${r}`
}
