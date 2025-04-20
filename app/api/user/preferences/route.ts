import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { userId, preferences } = await request.json()

    // Validate request
    if (!userId || !preferences) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get user session to verify the request
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if preferences exist
    const { data: existingPreferences } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (existingPreferences) {
      // Update existing preferences
      await supabase
        .from("user_preferences")
        .update({
          interests: preferences.interests || [],
          preferred_content_types: preferences.preferred_content_types || [],
          preferred_creators: preferences.preferred_creators || [],
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
    } else {
      // Create new preferences
      await supabase.from("user_preferences").insert({
        user_id: userId,
        interests: preferences.interests || [],
        preferred_content_types: preferences.preferred_content_types || [],
        preferred_creators: preferences.preferred_creators || [],
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in preferences API:", error)
    return NextResponse.json({ error: error.message || "Failed to update preferences" }, { status: 500 })
  }
}
