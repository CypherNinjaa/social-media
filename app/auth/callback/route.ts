import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"
import type { Database } from "@/lib/database.types"

// Update the GET function to properly handle username creation for OAuth logins
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
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) throw error

      // Check if this is a new user from OAuth (no username in user metadata)
      if (data?.user) {
        // For OAuth logins, we need to ensure a username exists
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", data.user.id)
          .single()

        // If no profile exists or username is null, create a username
        if (!existingProfile?.username) {
          // Generate a username from email or name
          let username = ""

          if (data.user.user_metadata?.name) {
            // Use name from OAuth provider and make it URL-friendly
            username = data.user.user_metadata.name
              .toLowerCase()
              .replace(/\s+/g, "_") // Replace spaces with underscores
              .replace(/[^a-z0-9_]/g, "") // Remove special characters
          } else if (data.user.email) {
            // Use email prefix as username
            username = data.user.email.split("@")[0]
          }

          // Add random digits to ensure uniqueness
          username = `${username}_${Math.floor(Math.random() * 10000)}`

          // Update the user profile with the generated username
          await supabase.from("profiles").upsert({
            id: data.user.id,
            username: username,
            avatar_url: data.user.user_metadata?.avatar_url || null,
            full_name: data.user.user_metadata?.name || null,
            updated_at: new Date().toISOString(),
          })
        }
      }

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
