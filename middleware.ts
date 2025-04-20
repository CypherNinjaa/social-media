import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"
import type { Database } from "@/lib/database.types"
import { canViewProfile } from "@/lib/privacy-utils"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req: request, res: response })

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
    request.nextUrl.pathname.startsWith("/search") ||
    request.nextUrl.pathname.startsWith("/create")

  // Define auth routes that should redirect to feed if already authenticated
  const isAuthRoute = request.nextUrl.pathname === "/auth" || request.nextUrl.pathname === "/auth/reset-password"

  // Allow access to update-password route even without authentication
  // This is needed for password reset flow
  const isPasswordResetRoute = request.nextUrl.pathname === "/auth/update-password"

  // If the route is protected and the user is not authenticated, redirect to the home page
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If the user is authenticated and trying to access auth routes, redirect to feed
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/feed", request.url))
  }

  // Check if the user is trying to access a profile page
  if (request.nextUrl.pathname.startsWith("/profile/") && request.nextUrl.pathname.length > 9) {
    const profileUsername = request.nextUrl.pathname.split("/")[2] // Extract username from path
    if (profileUsername) {
      // Fetch profile data to get the user ID
      const { data: profile } = await supabase.from("profiles").select("id").eq("username", profileUsername).single()

      if (profile) {
        // Check if the current user can view this profile
        const canView = await canViewProfile(session?.user?.id || null, profile.id)

        if (!canView && session?.user?.id !== profile.id) {
          // If the user doesn't have permission to view the profile, redirect to the profile page
          return NextResponse.rewrite(new URL(`/profile/${profileUsername}`, request.url))
        }
      }
    }
  }

  return response
}

// Define which routes this middleware should run on
export const config = {
  matcher: [
    "/feed/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/notifications/:path*",
    "/search/:path*",
    "/create",
    "/auth",
    "/auth/reset-password",
    "/auth/update-password",
  ],
}
