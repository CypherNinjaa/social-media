"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import type { Database } from "@/lib/database.types"

export type Conversation = {
  id: string
  created_at: string
  updated_at: string
  participants: {
    id: string
    username: string
    avatar_url: string | null
    last_read_at: string
  }[]
  last_message: {
    content: string | null
    created_at: string
    sender_username: string
    is_deleted: boolean
  } | null
  unread_count: number
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string | null
  content: string | null
  is_edited: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
  sender: {
    username: string
    avatar_url: string | null
  } | null
  reactions: {
    reaction: string
    user_id: string
    username: string
  }[]
}

export async function getConversations(): Promise<Conversation[]> {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return []
  }

  const { data: participations, error } = await supabase
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("user_id", session.user.id)

  if (error || !participations.length) {
    return []
  }

  const conversationIds = participations.map((p) => p.conversation_id)

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*")
    .in("id", conversationIds)
    .order("updated_at", { ascending: false })

  if (!conversations) {
    return []
  }

  const result: Conversation[] = []

  for (const conversation of conversations) {
    // Get participants
    const { data: participants } = await supabase
      .from("conversation_participants")
      .select("user_id, last_read_at, profiles(id, username, avatar_url)")
      .eq("conversation_id", conversation.id)

    if (!participants) continue

    // Get last message
    const { data: lastMessages } = await supabase
      .from("messages")
      .select("content, created_at, is_deleted, sender_id, profiles(username)")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: false })
      .limit(1)

    const lastMessage = lastMessages && lastMessages.length > 0 ? lastMessages[0] : null

    // Get unread count
    const userLastRead = participations.find((p) => p.conversation_id === conversation.id)?.last_read_at

    const { count: unreadCount } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", conversation.id)
      .neq("sender_id", session.user.id)
      .gt("created_at", userLastRead || "")

    result.push({
      ...conversation,
      participants: participants
        .map((p) => ({
          id: p.profiles?.id || "",
          username: p.profiles?.username || "",
          avatar_url: p.profiles?.avatar_url,
          last_read_at: p.last_read_at,
        }))
        .filter((p) => p.id !== session.user.id),
      last_message: lastMessage
        ? {
            content: lastMessage.content,
            created_at: lastMessage.created_at,
            sender_username: lastMessage.profiles?.username || "",
            is_deleted: lastMessage.is_deleted,
          }
        : null,
      unread_count: unreadCount || 0,
    })
  }

  return result
}

export async function getOrCreateConversation(otherUserId: string): Promise<string> {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  try {
    // First check if a conversation already exists between these users
    const { data: existingConversations } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", session.user.id)

    if (existingConversations && existingConversations.length > 0) {
      const conversationIds = existingConversations.map((c) => c.conversation_id)

      const { data: sharedConversations } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", otherUserId)
        .in("conversation_id", conversationIds)

      if (sharedConversations && sharedConversations.length > 0) {
        // Found an existing conversation
        return sharedConversations[0].conversation_id
      }
    }

    // No existing conversation found, create a new one
    const { data: newConversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({})
      .select()
      .single()

    if (conversationError || !newConversation) {
      throw new Error("Failed to create conversation")
    }

    // Add participants
    const { error: participantsError } = await supabase.from("conversation_participants").insert([
      {
        conversation_id: newConversation.id,
        user_id: session.user.id,
      },
      {
        conversation_id: newConversation.id,
        user_id: otherUserId,
      },
    ])

    if (participantsError) {
      throw new Error("Failed to add participants to conversation")
    }

    return newConversation.id
  } catch (error) {
    console.error("Error in getOrCreateConversation:", error)
    throw new Error("Failed to get or create conversation")
  }
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return []
  }

  // Mark conversation as read
  await supabase.rpc("update_last_read", { conversation_id_param: conversationId, user_id_param: session.user.id })

  const { data: messages, error } = await supabase
    .from("messages")
    .select("*, sender:profiles(username, avatar_url)")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (error || !messages) {
    return []
  }

  // Get reactions for all messages
  const messageIds = messages.map((m) => m.id)
  const { data: reactions } = await supabase
    .from("message_reactions")
    .select("message_id, reaction, user_id, profiles(username)")
    .in("message_id", messageIds)

  return messages.map((message) => ({
    ...message,
    sender: message.sender,
    reactions: reactions
      ? reactions
          .filter((r) => r.message_id === message.id)
          .map((r) => ({
            reaction: r.reaction,
            user_id: r.user_id,
            username: r.profiles?.username || "",
          }))
      : [],
  }))
}

export async function sendMessage(conversationId: string, content: string) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: session.user.id,
    content,
  })

  if (error) {
    throw new Error("Failed to send message")
  }

  // Mark as read for the sender
  await supabase.rpc("update_last_read", { conversation_id_param: conversationId, user_id_param: session.user.id })

  revalidatePath(`/messages/${conversationId}`)
  revalidatePath("/messages")
}

export async function editMessage(messageId: string, content: string) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  const { data, error } = await supabase
    .from("messages")
    .update({
      content,
      is_edited: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", messageId)
    .eq("sender_id", session.user.id)
    .select("conversation_id")
    .single()

  if (error) {
    throw new Error("Failed to edit message")
  }

  revalidatePath(`/messages/${data.conversation_id}`)
}

export async function deleteMessage(messageId: string) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  const { data, error } = await supabase
    .from("messages")
    .update({
      is_deleted: true,
      content: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", messageId)
    .eq("sender_id", session.user.id)
    .select("conversation_id")
    .single()

  if (error) {
    throw new Error("Failed to delete message")
  }

  revalidatePath(`/messages/${data.conversation_id}`)
}

export async function addReaction(messageId: string, reaction: string) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  // First check if the reaction already exists
  const { data: existingReaction } = await supabase
    .from("message_reactions")
    .select("id")
    .eq("message_id", messageId)
    .eq("user_id", session.user.id)
    .eq("reaction", reaction)
    .single()

  if (existingReaction) {
    // Remove the reaction if it already exists
    await supabase.from("message_reactions").delete().eq("id", existingReaction.id)
  } else {
    // Add the reaction
    await supabase.from("message_reactions").insert({
      message_id: messageId,
      user_id: session.user.id,
      reaction,
    })
  }

  // Get the conversation ID for revalidation
  const { data: message } = await supabase.from("messages").select("conversation_id").eq("id", messageId).single()

  if (message) {
    revalidatePath(`/messages/${message.conversation_id}`)
  }
}

export async function clearConversation(conversationId: string) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  // We don't actually delete messages, just mark them as deleted
  const { error } = await supabase
    .from("messages")
    .update({
      is_deleted: true,
      content: null,
    })
    .eq("conversation_id", conversationId)

  if (error) {
    throw new Error("Failed to clear conversation")
  }

  revalidatePath(`/messages/${conversationId}`)
  revalidatePath("/messages")
}

export async function searchMessages(query: string): Promise<any[]> {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return []
  }

  const { data, error } = await supabase.rpc("search_messages", { search_query: query, user_id_param: session.user.id })

  if (error || !data) {
    return []
  }

  return data
}
