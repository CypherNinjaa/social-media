import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { targetUserId, action } = await request.json()

    if (!targetUserId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUserId = session.user.id

    // Check if the target user exists
    const { data: targetUser, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", targetUserId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if the user is trying to follow themselves
    if (currentUserId === targetUserId) {
      return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 })
    }

    // Check if the target user has a private profile
    const { data: settings } = await supabase
      .from("user_settings")
      .select("profile_visibility")
      .eq("user_id", targetUserId)
      .single()

    const isPrivate = settings?.profile_visibility === "private" || settings?.profile_visibility === "followers"

    if (action === "follow") {
      if (isPrivate) {
        // Check if a request already exists
        const { data: existingRequest } = await supabase
          .from("follow_requests")
          .select("id, status")
          .eq("requester_id", currentUserId)
          .eq("recipient_id", targetUserId)
          .maybeSingle()

        if (existingRequest) {
          if (existingRequest.status === "pending") {
            return NextResponse.json({ message: "Follow request already sent" }, { status: 200 })
          } else if (existingRequest.status === "rejected") {
            // Update the existing request to pending
            await supabase.from("follow_requests").update({ status: "pending" }).eq("id", existingRequest.id)

            return NextResponse.json({ message: "Follow request sent" }, { status: 200 })
          }
        }

        // Create a new follow request
        const { error: requestError } = await supabase.from("follow_requests").insert({
          requester_id: currentUserId,
          recipient_id: targetUserId,
        })

        if (requestError) {
          return NextResponse.json({ error: "Failed to send follow request" }, { status: 500 })
        }

        return NextResponse.json({ message: "Follow request sent" }, { status: 200 })
      } else {
        // For public profiles, create a direct follow relationship
        const { error: followError } = await supabase.from("follows").insert({
          follower_id: currentUserId,
          following_id: targetUserId,
        })

        if (followError) {
          if (followError.code === "23505") {
            // Unique constraint violation - already following
            return NextResponse.json({ message: "Already following" }, { status: 200 })
          }
          return NextResponse.json({ error: "Failed to follow user" }, { status: 500 })
        }

        // Create notification for the followed user
        await supabase.from("notifications").insert({
          user_id: targetUserId,
          actor_id: currentUserId,
          type: "follow",
          is_read: false,
        })

        return NextResponse.json({ message: "Now following" }, { status: 200 })
      }
    } else if (action === "unfollow") {
      // Delete any pending follow requests
      await supabase.from("follow_requests").delete().eq("requester_id", currentUserId).eq("recipient_id", targetUserId)

      // Delete the follow relationship
      const { error: unfollowError } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", targetUserId)

      if (unfollowError) {
        return NextResponse.json({ error: "Failed to unfollow user" }, { status: 500 })
      }

      return NextResponse.json({ message: "Unfollowed successfully" }, { status: 200 })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in follow request API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
