"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface FollowButtonProps {
  profileId: string
  isFollowing: boolean
  currentUserId: string
}

export function FollowButton({ profileId, isFollowing: initialIsFollowing, currentUserId }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleFollow = async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      if (isFollowing) {
        // Unfollow
        await supabase.from("follows").delete().match({ follower_id: currentUserId, following_id: profileId })
        setIsFollowing(false)
      } else {
        // Follow
        await supabase.from("follows").insert({
          follower_id: currentUserId,
          following_id: profileId,
        })
        setIsFollowing(true)
      }

      // Refresh the page to update counts
      router.refresh()
    } catch (error) {
      console.error("Error toggling follow status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant={isFollowing ? "outline" : "default"} size="sm" onClick={handleFollow} disabled={isLoading}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isFollowing ? "Unfollow" : "Follow"}
    </Button>
  )
}
