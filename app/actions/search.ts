"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export type SearchResult = {
  id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  image_url: string | null
  rank: number
  headline: string
  profile?: {
    username: string
    avatar_url: string | null
  }
}

export async function searchPosts(query: string): Promise<SearchResult[]> {
  if (!query || query.trim() === "") {
    return []
  }

  const supabase = createServerComponentClient<Database>({ cookies })

  // Call the search_posts function we created in the database
  const { data, error } = await supabase
    .rpc("search_posts", { search_query: query })
    .order("rank", { ascending: false })
    .limit(20)

  if (error) {
    console.error("Error searching posts:", error)
    throw new Error("Failed to search posts")
  }

  // Fetch user profiles for the posts
  const userIds = [...new Set(data.map((post) => post.user_id))]

  const { data: profiles } = await supabase.from("profiles").select("id, username, avatar_url").in("id", userIds)

  // Merge profiles with posts
  const resultsWithProfiles = data.map((post) => {
    const profile = profiles?.find((p) => p.id === post.user_id)
    return {
      ...post,
      profile: profile
        ? {
            username: profile.username,
            avatar_url: profile.avatar_url,
          }
        : undefined,
    }
  })

  return resultsWithProfiles
}
