"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { formatRelativeTime } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PostActions } from "@/components/post/post-actions"
import { PostOptions } from "@/components/post/post-options"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface EnhancedPostCardProps {
  post: any
  currentUserId: string
  showComments?: boolean
  maxComments?: number
}

export function EnhancedPostCard({ post, currentUserId, showComments = true, maxComments = 2 }: EnhancedPostCardProps) {
  const [isCommenting, setIsCommenting] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [localComments, setLocalComments] = useState(post.comments || [])
  const router = useRouter()
  const supabase = createClient()

  const handleCommentClick = () => {
    setIsCommenting(true)
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!commentText.trim() || submitting) return

    setSubmitting(true)

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", currentUserId)
        .single()

      const { data: comment, error } = await supabase
        .from("comments")
        .insert({
          user_id: currentUserId,
          post_id: post.id,
          content: commentText.trim(),
        })
        .select()
        .single()

      if (error) throw error

      // Add the new comment to the local state
      const newComment = {
        ...comment,
        profiles: profile,
        replies: [],
      }

      setLocalComments([...localComments, newComment])
      setCommentText("")

      // Create notification if not the user's own post
      if (post.user_id !== currentUserId) {
        await supabase.from("notifications").insert({
          user_id: post.user_id,
          actor_id: currentUserId,
          type: "comment",
          post_id: post.id,
          comment_id: comment.id,
          is_read: false,
        })
      }

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Display only a limited number of comments
  const displayedComments = showComments ? localComments.slice(0, maxComments) : []

  const hasMoreComments = localComments.length > maxComments

  return (
    <div className="bg-white dark:bg-gray-950 border rounded-lg overflow-hidden shadow-sm">
      {/* Post header */}
      <div className="p-4 flex items-center justify-between">
        <Link href={`/profile/${post.profiles.username}`} className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.profiles.avatar_url || undefined} alt={post.profiles.username} />
            <AvatarFallback>{post.profiles.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{post.profiles.username}</p>
            {post.profiles.full_name && <p className="text-sm text-muted-foreground">{post.profiles.full_name}</p>}
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{formatRelativeTime(post.created_at)}</span>
          <PostOptions post={post} currentUserId={currentUserId} />
        </div>
      </div>

      {/* Post content */}
      <div className="px-4 pb-4">
        <p className="whitespace-pre-wrap mb-4">{post.content}</p>

        {post.image_url && (
          <Link href={`/post/${post.id}`} className="block">
            <div className="rounded-md overflow-hidden">
              <img
                src={post.image_url || "/placeholder.svg"}
                alt="Post image"
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </div>
          </Link>
        )}
      </div>

      {/* Post actions */}
      <PostActions post={post} currentUserId={currentUserId} onCommentClick={handleCommentClick} />

      {/* Comments section */}
      {showComments && (
        <div className="p-4 pt-0">
          {/* Comment form */}
          {isCommenting && (
            <form onSubmit={handleSubmitComment} className="mt-4 mb-4">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-end mt-2">
                <Button type="submit" disabled={!commentText.trim() || submitting} size="sm">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post"
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Comments list */}
          {displayedComments.length > 0 && (
            <div className="space-y-4 mt-4">
              {displayedComments.map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <Link href={`/profile/${comment.profiles.username}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.profiles.avatar_url || undefined} />
                      <AvatarFallback>{comment.profiles.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <Link href={`/profile/${comment.profiles.username}`} className="font-medium">
                          {comment.profiles.username}
                        </Link>
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.created_at)}</span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>

                    {/* Show reply count if any */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-1 ml-1">
                        <Link href={`/post/${post.id}`} className="text-xs text-muted-foreground hover:text-foreground">
                          {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Show more comments link */}
              {hasMoreComments && (
                <div className="text-center mt-2">
                  <Link href={`/post/${post.id}`} className="text-sm text-muted-foreground hover:text-foreground">
                    View all {localComments.length} comments
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
