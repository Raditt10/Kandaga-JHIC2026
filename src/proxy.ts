import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  const sessionToken = request.cookies.get("authjs.session-token")?.value || 
                       request.cookies.get("__Secure-authjs.session-token")?.value;
  
  const isLoggedIn = !!sessionToken;
  const isAuthPage = path.startsWith("/auth");
  const isApiRoute = path.startsWith("/api");
    
  if (isApiRoute){
    return NextResponse.next()
  }
  
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  
  const rawRole = token?.role as string || "";
  const userRole = rawRole.toLowerCase()
  const normalRole = userRole === "student" ?
    "student" : userRole === "bkk" ? 
    "bkk" : userRole

  // Define target role for each route
  let allowedRole = ""
  if (path.startsWith("/student")) allowedRole = "student"
  else if (path.startsWith("/admin")) allowedRole = "admin"
  else if (path.startsWith("/company")) allowedRole = "company"
  else if (path.startsWith("/teacher")) allowedRole = "teacher"
  else if (path.startsWith("/bkk")) allowedRole = "bkk"

  // If route has specific role requirement and user role doesn't match, block access
  if (allowedRole && normalRole !== allowedRole) {
    // Redirect user to their own role's specific dashboard
    const targetPath = `/${normalRole}`
    return NextResponse.redirect(new URL(targetPath, request.url))
  }
}


export const config = {
  matcher: [
        /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}
