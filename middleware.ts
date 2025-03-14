import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // If the user is authenticated but not authorized, redirect to error page
  const allowedemails = (process.env.ALLOWED_EMAILS ?? "").split(",");
  
    if (
      req.nextauth.token &&
      !allowedemails.includes(req.nextauth.token.email ?? "")
    ) {
      return NextResponse.redirect(new URL("/auth/error", req.url))
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (auth pages)
     * - platform-selection (platform selection page)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|auth|platform-selection).*)",
  ],
}

