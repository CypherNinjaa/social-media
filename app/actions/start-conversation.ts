"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function startConversationWithUser(userId: string) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error("Not authenticated")
  }

  try {
    // Use the get_or_create_conversation database function
    const { data, error } = await supabase.rpc("get_or_create_conversation", {
      user1_id: session.user.id,
      user2_id: userId,
    })

    if (error) {
      console.error("Error creating conversation:", error)
      throw new Error(error.message || "Failed to create conversation")
    }

    // The function returns the conversation ID
    const conversationId = data

    redirect(`/messages/${conversationId}`)
  } catch (error: any) {
    console.error("Error in startConversationWithUser:", error)
    throw error
  }
}
