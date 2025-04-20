"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface InteractionTrackerProps {
  userId: string
  postId: string
  interactionType: "view" | "like" | "comment" | "share" | "save"
  durationSeconds?: number
  isEnabled: boolean
}

export function InteractionTracker({
  userId,
  postId,
  interactionType,
  durationSeconds,
  isEnabled,
}: InteractionTrackerProps) {
  const supabase = createClient()

  useEffect(() => {
    // Only track if AI features are enabled
    if (!isEnabled) return

    const trackInteraction = async () => {
      try {
        await supabase.from("user_interactions").insert({
          user_id: userId,
          post_id: postId,
          interaction_type: interactionType,
          duration_seconds: durationSeconds,
        })
      } catch (error) {
        console.error("Error tracking interaction:", error)
      }
    }

    trackInteraction()
  }, [userId, postId, interactionType, durationSeconds, isEnabled, supabase])

  return null
}
