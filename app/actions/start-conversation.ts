"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getOrCreateConversation } from "./messaging"

export async function startConversationWithUser(userId: string) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  const conversationId = await getOrCreateConversation(userId)

  redirect(`/messages/${conversationId}`)
}
