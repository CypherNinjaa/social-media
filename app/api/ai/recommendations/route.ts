import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { aiService } from "@/lib/ai/ai-service"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
    }

    // Get user session to verify the request
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user preferences
    const { data: preferences } = await supabase
      .from("user_preferences")
      .select("interests")
      .eq("user_id", userId)
      .single()

    // Get recent interactions
    const { data: interactions } = await supabase
      .from("user_interactions")
      .select("post_id, interaction_type")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20)

    const userInterests = preferences?.interests || []
    const recentInteractions =
      interactions?.map((i) => ({
        postId: i.post_id,
        action: i.interaction_type,
      })) || []

    // Get recommendations
    const recommendations = await aiService.getRecommendations(userId, userInterests, recentInteractions)

    // Get the actual posts
    if (recommendations.length > 0) {
      const postIds = recommendations.map((r) => r.postId)

      const { data: posts } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id(username, avatar_url, full_name)
        `)
        .in("id", postIds)

      // Merge recommendations with posts
      const recommendedPosts = recommendations
        .map((rec) => {
          const post = posts?.find((p) => p.id === rec.postId)
          return {
            ...post,
            recommendationScore: rec.score,
            recommendationReason: rec.reason,
          }
        })
        .filter((p) => p.id) // Filter out any posts that weren't found

      return NextResponse.json({ posts: recommendedPosts })
    }

    return NextResponse.json({ posts: [] })
  } catch (error: any) {
    console.error("Error in recommendations API:", error)
    return NextResponse.json({ error: error.message || "Failed to get recommendations" }, { status: 500 })
  }
}
