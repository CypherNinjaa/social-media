import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the user is authenticated
  const isAuthenticated = !!session

  // Define protected routes that require authentication
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/feed") ||
    request.nextUrl.pathname.startsWith("/profile") ||
    request.nextUrl.pathname.startsWith("/settings") ||
    request.nextUrl.pathname.startsWith("/notifications") ||
    request.nextUrl.pathname.startsWith("/search")

  // If the route is protected and the user is not authenticated, redirect to the home page
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return response
}

// Define which routes this middleware should run on
export const config = {
  matcher: ["/feed/:path*", "/profile/:path*", "/settings/:path*", "/notifications/:path*", "/search/:path*"],
}
