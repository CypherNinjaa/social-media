"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function getPostById(postId: string) {
  const supabase = createServerComponentClient({ cookies })

  const { data: post, error } = await supabase.from("posts").select("*, user:profiles(*)").eq("id", postId).single()

  if (error) {
    console.error("Error fetching post:", error)
    return null
  }

  return post
}

export async function updatePost(postId: string, content: string, imageUrl: string | null, newImageFile: File | null) {
  const supabase = createServerComponentClient({ cookies })

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Not authenticated")
  }

  // Check if the post belongs to the current user
  const { data: post, error: fetchError } = await supabase.from("posts").select("user_id").eq("id", postId).single()

  if (fetchError || !post) {
    throw new Error("Post not found")
  }

  if (post.user_id !== session.user.id) {
    throw new Error("Not authorized to edit this post")
  }

  let updatedImageUrl = imageUrl

  // If there's a new image file, upload it
  if (newImageFile) {
    const fileExt = newImageFile.name.split(".").pop()
    const fileName = `${session.user.id}/${postId}.${fileExt}`

    const { error: uploadError, data } = await supabase.storage
      .from("post-images")
      .upload(fileName, newImageFile, { upsert: true })

    if (uploadError) {
      throw new Error("Error uploading image")
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("post-images").getPublicUrl(fileName)

    updatedImageUrl = publicUrl
  }

  // Update the post
  const { error: updateError } = await supabase
    .from("posts")
    .update({
      content,
      image_url: updatedImageUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)

  if (updateError) {
    throw new Error("Error updating post")
  }

  // Revalidate the post page and feed
  revalidatePath(`/post/${postId}`)
  revalidatePath("/")

  return { success: true }
}
