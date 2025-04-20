import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"
import type { Database } from "@/lib/database.types"

// Update the GET function to handle password reset links
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type")

  // Get the site URL from environment variable or use the request origin as fallback
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    try {
      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code)

      // If this is a password reset, redirect to the update password page
      if (type === "recovery") {
        return NextResponse.redirect(new URL("/auth/update-password", siteUrl))
      }

      // Otherwise redirect to feed page after successful authentication
      return NextResponse.redirect(new URL("/feed", siteUrl))
    } catch (error) {
      console.error("Error exchanging code for session:", error)
      // Redirect to auth page with error parameter if exchange fails
      return NextResponse.redirect(new URL("/auth?error=auth_callback_error", siteUrl))
    }
  }

  // If no code is provided, redirect to home page
  return NextResponse.redirect(new URL("/", siteUrl))
}
