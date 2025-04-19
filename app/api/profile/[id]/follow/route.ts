import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData()
    const isFollowing = formData.get("isFollowing") === "true"

    const supabase = createClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const followerId = session.user.id
    const followingId = params.id

    if (followerId === followingId) {
      return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 })
    }

    if (isFollowing) {
      // Unfollow
      await supabase.from("follows").delete().match({ follower_id: followerId, following_id: followingId })
    } else {
      // Follow
      await supabase.from("follows").insert({ follower_id: followerId, following_id: followingId })

      // Create notification
      await supabase.from("notifications").insert({
        user_id: followingId,
        actor_id: followerId,
        type: "follow",
      })
    }

    return NextResponse.redirect(request.headers.get("referer") || "/")
  } catch (error) {
    console.error("Error following/unfollowing user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
