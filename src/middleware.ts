import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Match protected dashboard routes
  if (path.startsWith("/dashboard")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || "kandaga-super-secret-auth-key-2026",
    })

    // If not logged in, redirect to login page
    if (!token) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", path)
      return NextResponse.redirect(loginUrl)
    }

    // Determine normalized user role
    const rawRole = (token.role as string) || "student"
    const userRole = rawRole.toLowerCase()
    const normalizedUserRole =
      userRole === "students" || userRole === "student"
        ? "student"
        : userRole === "bkk"
        ? "bkk"
        : userRole

    // Define target role for each route
    let allowedRole = ""
    if (path.startsWith("/dashboard/student")) allowedRole = "student"
    else if (path.startsWith("/dashboard/admin")) allowedRole = "admin"
    else if (path.startsWith("/dashboard/company")) allowedRole = "company"
    else if (path.startsWith("/dashboard/teacher")) allowedRole = "teacher"
    else if (path.startsWith("/dashboard/bkk")) allowedRole = "bkk"

    // If route has specific role requirement and user role doesn't match, block access
    if (allowedRole && normalizedUserRole !== allowedRole) {
      // Redirect user to their own role's specific dashboard
      const targetPath = `/dashboard/${normalizedUserRole}`
      return NextResponse.redirect(new URL(targetPath, req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
