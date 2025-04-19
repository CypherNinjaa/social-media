"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Heart, Share2, Bookmark, MoreHorizontal } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Flag, Pencil, Trash2 } from "lucide-react"

interface PostCardProps {
  post: any
  currentUserId: string
  likes: number
  isLiked: boolean
  comments: any[]
  commentsCount: number
  session: any
}

export function PostCard({ post, currentUserId, likes, isLiked, comments, commentsCount, session }: PostCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [saved, setSaved] = useState(false)
  const [isLikedState, setIsLikedState] = useState(isLiked)
  const [likesCount, setLikesCount] = useState(likes)
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localComments, setLocalComments] = useState(comments)
  const [showAllComments, setShowAllComments] = useState(false)
  const supabase = createClient()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Check if post is saved when component mounts
  useEffect(() => {
    if (session?.user.id) {
      const checkSavedStatus = async () => {
        const { data } = await supabase
          .from("saved_posts")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("post_id", post.id)
          .single()

        setSaved(!!data)
      }

      checkSavedStatus()
    }
  }, [session, post.id, supabase])

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

  const displayedComments = showAllComments ? localComments : localComments.slice(0, 1)

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button aria-label="More options">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {post.user_id === currentUserId ? (
              <>
                <DropdownMenuItem onClick={() => router.push(`/edit-post/${post.id}`)} className="cursor-pointer">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Post
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                onClick={() => {
                  toast({
                    title: "Post reported",
                    description: "Thank you for reporting this post. We'll review it shortly.",
                  })
                }}
                className="cursor-pointer"
              >
                <Flag className="h-4 w-4 mr-2" />
                Report Post
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
            <button
              onClick={handleLike}
              className="flex items-center space-x-1 text-sm"
              aria-label={isLiked ? "Unlike post" : "Like post"}
            >
              <Heart className={`h-5 w-5 ${isLikedState ? "fill-rose-500 text-rose-500" : "text-gray-500"}`} />
              <span>{likesCount}</span>
            </button>

            <button
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
              aria-label="Comment on post"
            >
              <span>{commentsCount}</span>
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator
                    .share({
                      title: `Post by ${post.profile?.username || "User"}`,
                      text: post.content.substring(0, 100) + (post.content.length > 100 ? "..." : ""),
                      url: `${window.location.origin}/post/${post.id}`,
                    })
                    .catch((err) => {
                      console.error("Error sharing:", err)
                      // Fallback for desktop
                      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
                      toast({
                        title: "Link copied to clipboard",
                        description: "You can now share it with others",
                      })
                    })
                } else {
                  // Fallback for browsers that don't support sharing
                  navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
                  toast({
                    title: "Link copied to clipboard",
                    description: "You can now share it with others",
                  })
                }
              }}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
              aria-label="Share post"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          <button
            onClick={async () => {
              try {
                const { data, error } = await supabase
                  .from("saved_posts")
                  .select("*")
                  .eq("user_id", session?.user.id)
                  .eq("post_id", post.id)
                  .single()

                if (data) {
                  // Post is already saved, so unsave it
                  await supabase.from("saved_posts").delete().eq("user_id", session?.user.id).eq("post_id", post.id)
                  toast({
                    title: "Post removed from saved",
                    description: "The post has been removed from your saved collection",
                  })
                  setSaved(false)
                } else {
                  // Post is not saved, so save it
                  await supabase.from("saved_posts").insert({
                    user_id: session?.user.id,
                    post_id: post.id,
                  })
                  toast({
                    title: "Post saved",
                    description: "The post has been added to your saved collection",
                  })
                  setSaved(true)
                }
              } catch (error) {
                console.error("Error toggling save status:", error)
                toast({
                  title: "Error",
                  description: "Failed to save post. Please try again.",
                  variant: "destructive",
                })
              }
            }}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            aria-label={saved ? "Unsave post" : "Save post"}
          >
            {saved ? <Bookmark className="h-5 w-5 fill-current" /> : <Bookmark className="h-5 w-5" />}
          </button>
        </div>

        {/* Likes count */}
        {/* <div className="font-semibold text-sm mb-1">{likesCount} likes</div> */}

        {/* Caption */}
        <div className="mb-2">
          <span className="font-semibold text-sm mr-1">{post.user.username}</span>
          <span className="text-sm">{post.content}</span>
        </div>

        {/* Add a dedicated comment button */}
        {localComments.length > 0 && (
          <button
            onClick={() => setShowAllComments(!showAllComments)}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
            aria-label={showAllComments ? "Hide comments" : "Show comments"}
          >
            <span className="font-medium">
              {showAllComments ? "Hide" : "View"} {localComments.length > 1 ? "all " : ""}
              {localComments.length} {localComments.length === 1 ? "comment" : "comments"}
            </span>
          </button>
        )}

        {/* Comments */}
        {localComments.length > 0 && (
          <div className="mb-2">
            {localComments.length > 1 && !showAllComments ? (
              <button
                className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => setShowAllComments(true)}
              >
                View all {localComments.length} comments
              </button>
            ) : showAllComments && localComments.length > 3 ? (
              <button
                className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => setShowAllComments(false)}
              >
                Show less
              </button>
            ) : null}

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
      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  // Delete the post
                  const { error } = await supabase.from("posts").delete().eq("id", post.id).eq("user_id", currentUserId)

                  if (error) throw error

                  toast({
                    title: "Post deleted",
                    description: "Your post has been successfully deleted.",
                  })

                  // Refresh the page or update the UI
                  router.refresh()
                } catch (error) {
                  console.error("Error deleting post:", error)
                  toast({
                    title: "Error",
                    description: "Failed to delete post. Please try again.",
                    variant: "destructive",
                  })
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
