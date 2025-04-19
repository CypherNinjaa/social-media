"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Heart, MessageCircle, Bookmark, Send, MoreHorizontal } from "lucide-react"

interface PostCardProps {
  post: any
  currentUserId: string
  likes: number
  isLiked: boolean
  comments: any[]
}

export function PostCard({ post, currentUserId, likes, isLiked, comments }: PostCardProps) {
  const [isLikedState, setIsLikedState] = useState(isLiked)
  const [likesCount, setLikesCount] = useState(likes)
  const [isSaved, setIsSaved] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localComments, setLocalComments] = useState(comments)
  const [showAllComments, setShowAllComments] = useState(false)
  const supabase = createClient()

  const handleLike = async () => {
    const newIsLiked = !isLikedState
    setIsLikedState(newIsLiked)
    setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1))

    if (newIsLiked) {
      await supabase.from("likes").insert({
        user_id: currentUserId,
        post_id: post.id,
      })
    } else {
      await supabase.from("likes").delete().match({
        user_id: currentUserId,
        post_id: post.id,
      })
    }
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
    // Implement save functionality
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", currentUserId)
        .single()

      const { data: comment } = await supabase
        .from("comments")
        .insert({
          user_id: currentUserId,
          post_id: post.id,
          content: commentText,
        })
        .select()
        .single()

      if (comment) {
        const newComment = {
          ...comment,
          user: profile,
        }

        setLocalComments([newComment, ...localComments])
        setCommentText("")
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayedComments = showAllComments ? localComments : localComments.slice(0, 2)

  return (
    <div className="bg-white dark:bg-gray-950 border rounded-md overflow-hidden">
      {/* Post header */}
      <div className="flex items-center justify-between p-3">
        <Link href={`/profile/${post.user.username}`} className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={post.user.avatar_url || undefined} alt={post.user.username} />
            <AvatarFallback>{post.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm">{post.user.username}</span>
        </Link>
        <button>
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Post image */}
      {post.image_url && (
        <div className="relative aspect-square">
          <img
            src={post.image_url || "/placeholder.svg?height=600&width=600&query=post"}
            alt="Post"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Post actions */}
      <div className="p-3">
        <div className="flex justify-between mb-2">
          <div className="flex space-x-4">
            <button onClick={handleLike}>
              <Heart
                className={`h-6 w-6 ${isLikedState ? "text-red-500 fill-red-500" : "text-gray-700 dark:text-gray-300"}`}
              />
            </button>
            <button>
              <MessageCircle className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
            <button>
              <Send className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
          <button onClick={handleSave}>
            <Bookmark
              className={`h-6 w-6 ${
                isSaved ? "text-black fill-black dark:text-white dark:fill-white" : "text-gray-700 dark:text-gray-300"
              }`}
            />
          </button>
        </div>

        {/* Likes count */}
        <div className="font-semibold text-sm mb-1">{likesCount} likes</div>

        {/* Caption */}
        <div className="mb-2">
          <span className="font-semibold text-sm mr-1">{post.user.username}</span>
          <span className="text-sm">{post.content}</span>
        </div>

        {/* Comments */}
        {localComments.length > 0 && (
          <div className="mb-2">
            {localComments.length > 2 && !showAllComments && (
              <button
                className="text-sm text-gray-500 dark:text-gray-400 mb-1"
                onClick={() => setShowAllComments(true)}
              >
                View all {localComments.length} comments
              </button>
            )}
            {displayedComments.map((comment: any) => (
              <div key={comment.id} className="text-sm mb-1">
                <span className="font-semibold mr-1">{comment.user.username}</span>
                <span>{comment.content}</span>
              </div>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-2">
          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
        </div>

        {/* Add comment */}
        <form onSubmit={handleSubmitComment} className="flex items-center border-t pt-3">
          <Textarea
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="min-h-0 h-8 resize-none border-none focus-visible:ring-0 p-0 text-sm"
          />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={!commentText.trim() || isSubmitting}
            className={`font-semibold ${
              commentText.trim() ? "text-blue-500" : "text-blue-300"
            } hover:bg-transparent hover:text-blue-600`}
          >
            Post
          </Button>
        </form>
      </div>
    </div>
  )
}
