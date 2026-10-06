/**
 * Konfigurasi NextAuth.
 *
 * SENGAJA dipisah dari `@/lib/auth`, bukan digabung ke sana seperti di branch
 * den_gallery. Alasannya: `@/lib/auth` diimpor oleh `login/page.tsx` dan
 * `register/page.tsx` yang keduanya komponen client (untuk `getDashboardUrl`).
 * Kalau konfigurasi ini ikut masuk ke file itu, Prisma + bcryptjs akan ikut
 * ter-bundle ke sisi client.
 *
 * Dipakai oleh:
 *   - src/app/api/auth/[...nextauth]/route.ts  (handler HTTP)
 *   - src/app/api/student/projects/route.ts    (getServerSession)
 *   - src/app/api/student/projects/[id]/route.ts
 */

import { NextAuthOptions } from "next-auth"
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
    async jwt({ token, user, account }) {
      const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/

      if (user) {
        const userEmail = (user.email || "").toLowerCase().trim()

        if ((account?.provider === "google" || account?.provider === "github") && userEmail) {
          try {
            let dbUser: { id: string; role: string; email: string; name: string; status: string } | null = null

            // Coba query dengan google_email jika provider Google
            if (account.provider === "google") {
              try {
                const existingUsers = await prisma.$queryRaw<Array<{
                  id: string
                  role: string
                  email: string
                  name: string
                  status: string
                  google_email: string | null
                }>>`
                  SELECT id, role, email, username as name, status, google_email
                  FROM users
                  WHERE email = ${userEmail}::citext OR google_email = ${userEmail}
                  LIMIT 1
                `
                if (existingUsers && existingUsers.length > 0) {
                  dbUser = existingUsers[0]
                }
              } catch {
                // Abaikan jika kolom google_email belum ada di database
              }
            }

            // Fallback cari via Prisma standar berdasarkan email
            if (!dbUser) {
              const found = await prisma.users.findFirst({
                where: { email: userEmail },
                select: { id: true, role: true, email: true, name: true, status: true },
              })
              if (found) dbUser = found
            }

            // Jika belum ada akun, buat akun baru
            if (!dbUser) {
              const created = await prisma.users.create({
                data: {
                  name: user.name || userEmail.split("@")[0],
                  email: userEmail,
                  passwordHash: "",
                  role: "Student",
                  status: "aktif",
                },
                select: { id: true, role: true, email: true, name: true, status: true },
              })
              dbUser = created
            }

            // Update google_email jika kolom tersedia
            if (account.provider === "google") {
              try {
                await prisma.$executeRaw`
                  UPDATE users SET google_email = ${userEmail} WHERE id = ${dbUser.id}::uuid
                `
              } catch {
                // Abaikan jika kolom google_email belum ada di database
              }
            }

            token.id = dbUser.id
            token.role = normalizeRole(dbUser.role)
            token.email = dbUser.email
            token.name = dbUser.name
            token.username = dbUser.name

            if (token.role === "company") {
              const comp = await prisma.company.findUnique({
                where: { userId: dbUser.id },
                select: { verificationStatus: true },
              })
              token.verificationStatus = comp?.verificationStatus ?? null
            } else {
              token.verificationStatus = null
            }
            return token
          } catch (err) {
            console.error("OAuth DB sync error:", err)
          }
        }

        token.id                 = user.id
        token.role               = (user as { role?: string }).role ?? "student"
        token.email              = user.email
        token.name               = user.name
        token.username           = ((user as { username?: string }).username ?? user.name) ?? undefined
        token.verificationStatus = (user as { verificationStatus?: string | null }).verificationStatus ?? null
      }

      // Self-healing: jika token.id bukan UUID (misal session Google 21 digit yang sudah aktif), perbaiki ke UUID DB
      if (token && token.email && (!token.id || !UUID_REGEX.test(String(token.id)))) {
        try {
          const dbUser = await prisma.users.findFirst({
            where: { email: String(token.email).toLowerCase().trim() },
            select: { id: true, role: true, name: true },
          })
          if (dbUser) {
            token.id = dbUser.id
            token.role = normalizeRole(dbUser.role)
            if (!token.name) token.name = dbUser.name
          }
        } catch (healErr) {
          console.error("JWT token UUID repair error:", healErr)
        }
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
