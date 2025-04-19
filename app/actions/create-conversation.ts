"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function createConversationAction(otherUserId: string) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: "Not authenticated", conversationId: null }
  }

  try {
    // Use the get_or_create_conversation database function
    const { data, error } = await supabase.rpc("get_or_create_conversation", {
      user1_id: session.user.id,
      user2_id: otherUserId,
    })

    if (error) {
      console.error("Error creating conversation:", error)
      return { error: error.message || "Failed to create conversation", conversationId: null }
    }

    // The function returns the conversation ID
    const conversationId = data

    revalidatePath("/messages")
    return { conversationId, error: null }
  } catch (error: any) {
    console.error("Unexpected error in createConversationAction:", error)
    return { error: error.message || "An unexpected error occurred", conversationId: null }
  }
}
