import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { userId, featureName, isEnabled } = await request.json()

    // Validate request
    if (!userId || !featureName) {
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

    // Check if feature exists
    const { data: existingFeature } = await supabase
      .from("ai_feature_status")
      .select("*")
      .eq("user_id", userId)
      .eq("feature_name", featureName)
      .single()

    if (existingFeature) {
      // Update existing feature
      await supabase
        .from("ai_feature_status")
        .update({
          is_enabled: isEnabled,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("feature_name", featureName)
    } else {
      // Create new feature status
      await supabase.from("ai_feature_status").insert({
        user_id: userId,
        feature_name: featureName,
        is_enabled: isEnabled,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in toggle-feature API:", error)
    return NextResponse.json({ error: error.message || "Failed to update feature status" }, { status: 500 })
  }
}
