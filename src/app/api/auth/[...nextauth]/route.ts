import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import FacebookProvider from "next-auth/providers/facebook"
import LinkedInProvider from "next-auth/providers/linkedin"
import CredentialsProvider from "next-auth/providers/credentials"
import { findUserByEmailOrUsername } from "@/lib/users"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "kandaga-super-secret-auth-key-2026",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days session persistence
    updateAge: 24 * 60 * 60, // 24 hours session update frequency
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.callback-url"
          : "next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Host-next-auth.csrf-token"
          : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    // 1. Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "google-demo-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "google-demo-secret",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          username:
            profile.email?.split("@")[0] ||
            profile.name?.replace(/\s+/g, "").toLowerCase() ||
            profile.sub,
          role: profile.role || "student",
        }
      },
    }),

    // 2. GitHub Provider
    GithubProvider({
      clientId: process.env.GITHUB_ID || "github-demo-id",
      clientSecret: process.env.GITHUB_SECRET || "github-demo-secret",
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
          role: profile.role || "student",
        }
      },
    }),

    // 3. Facebook Provider
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "facebook-demo-id",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "facebook-demo-secret",
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture?.data?.url,
          username:
            profile.email?.split("@")[0] ||
            profile.name?.replace(/\s+/g, "").toLowerCase() ||
            profile.id,
          role: profile.role || "student",
        }
      },
    }),

    // 4. LinkedIn Provider
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || "linkedin-demo-id",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "linkedin-demo-secret",
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          username:
            profile.email?.split("@")[0] ||
            profile.name?.replace(/\s+/g, "").toLowerCase() ||
            profile.sub,
          role: profile.role || "student",
        }
      },
    }),

    // 5. Credentials Provider
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: {
          label: "Username or Email",
          type: "text",
          placeholder: "siswa13 or siswa@smkn13bdg.sch.id",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null
        }

        const foundUser = findUserByEmailOrUsername(credentials.identifier)

        if (foundUser && foundUser.password === credentials.password) {
          return {
            id: foundUser.id,
            name: foundUser.username,
            email: foundUser.email,
            username: foundUser.username,
            role: foundUser.role,
          }
        }

        // Fallback demo matching if arbitrary username provided
        const isEmail = credentials.identifier.includes("@")
        const username = isEmail
          ? credentials.identifier.split("@")[0]
          : credentials.identifier
        const email = isEmail
          ? credentials.identifier
          : `${credentials.identifier}@example.com`

        return {
          id: `demo-${Date.now()}`,
          name: username,
          email: email,
          username: username,
          role: "student",
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.username = user.username
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.username = token.username as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }