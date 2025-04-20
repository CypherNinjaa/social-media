"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  Heart,
  Share2,
  Bookmark,
  MoreHorizontal,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Pencil,
  Flag,
  Check,
  X,
} from "lucide-react"
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

interface PostCardProps {
  post: any
  currentUserId: string
  likes: number
  isLiked: boolean
  comments: any[]
  isAIRecommended?: boolean
  recommendationReason?: string
  commentsCount: number
  session: any
}

export function PostCard({
  post,
  currentUserId,
  likes,
  isLiked,
  comments,
  isAIRecommended,
  recommendationReason,
  commentsCount,
  session,
}: PostCardProps) {
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
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // New state variables for comment features
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({})
  const [commentLikeCounts, setCommentLikeCounts] = useState<Record<string, number>>({})
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [showDeleteCommentDialog, setShowDeleteCommentDialog] = useState<string | null>(null)

  const replyInputRef = useRef<HTMLTextAreaElement>(null)
  const editInputRef = useRef<HTMLTextAreaElement>(null)

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

      // Load comment likes
      const loadCommentLikes = async () => {
        // Get all comment IDs
        const commentIds = localComments.map((comment) => comment.id)
        if (commentIds.length === 0) return

        // Get likes for all comments
        const { data: likes } = await supabase
          .from("comment_likes")
          .select("comment_id, user_id")
          .in("comment_id", commentIds)

        if (!likes) return

        // Set liked comments
        const userLikes: Record<string, boolean> = {}
        const likeCounts: Record<string, number> = {}

        // Initialize like counts for all comments
        commentIds.forEach((id) => {
          likeCounts[id] = 0
        })

        // Count likes for each comment
        likes.forEach((like) => {
          if (like.user_id === currentUserId) {
            userLikes[like.comment_id] = true
          }
          likeCounts[like.comment_id] = (likeCounts[like.comment_id] || 0) + 1
        })

        setLikedComments(userLikes)
        setCommentLikeCounts(likeCounts)
      }

      loadCommentLikes()
    }
  }, [session, post.id, supabase, currentUserId, localComments])

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
          replies: [],
          like_count: 0,
        }

        setLocalComments([newComment, ...localComments])
        setCommentText("")
        setShowCommentInput(false)
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle comment like
  const handleCommentLike = async (commentId: string) => {
    try {
      const isLiked = likedComments[commentId]

      // Optimistic update
      setLikedComments((prev) => ({
        ...prev,
        [commentId]: !isLiked,
      }))

      setCommentLikeCounts((prev) => ({
        ...prev,
        [commentId]: (prev[commentId] || 0) + (isLiked ? -1 : 1),
      }))

      if (isLiked) {
        // Unlike
        await supabase.from("comment_likes").delete().match({ user_id: currentUserId, comment_id: commentId })
      } else {
        // Like
        await supabase.from("comment_likes").insert({ user_id: currentUserId, comment_id: commentId })
      }
    } catch (error) {
      console.error("Error toggling comment like:", error)

      // Revert optimistic update on error
      setLikedComments((prev) => ({
        ...prev,
        [commentId]: !prev[commentId],
      }))

      setCommentLikeCounts((prev) => ({
        ...prev,
        [commentId]: Math.max(0, (prev[commentId] || 0) + (likedComments[commentId] ? 1 : -1)),
      }))

      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle reply submission
  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault()
    if (!replyText.trim() || isSubmitting || !parentId) return

    setIsSubmitting(true)

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", currentUserId)
        .single()

      const { data: reply } = await supabase
        .from("comments")
        .insert({
          user_id: currentUserId,
          post_id: post.id,
          content: replyText,
          parent_id: parentId,
        })
        .select()
        .single()

      if (reply) {
        const newReply = {
          ...reply,
          user: profile,
        }

        // Find the parent comment and add the reply
        const updatedComments = localComments.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            }
          }
          return comment
        })

        setLocalComments(updatedComments)
        setReplyText("")
        setReplyingTo(null)
      }
    } catch (error) {
      console.error("Error submitting reply:", error)
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle comment edit
  const handleEditComment = async (e: React.FormEvent, commentId: string) => {
    e.preventDefault()
    if (!editText.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      await supabase
        .from("comments")
        .update({
          content: editText,
          is_edited: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", commentId)
        .eq("user_id", currentUserId)

      // Update local state
      const updatedComments = localComments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            content: editText,
            is_edited: true,
          }
        }
        return comment
      })

      setLocalComments(updatedComments)
      setEditingComment(null)
      setEditText("")

      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating comment:", error)
      toast({
        title: "Error",
        description: "Failed to update comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle comment delete
  const handleDeleteComment = async (commentId: string) => {
    try {
      await supabase.from("comments").delete().eq("id", commentId).eq("user_id", currentUserId)

      // Remove from local state
      const updatedComments = localComments.filter((comment) => comment.id !== commentId)
      setLocalComments(updatedComments)

      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting comment:", error)
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setShowDeleteCommentDialog(null)
    }
  }

  // Focus reply input when replyingTo changes
  useEffect(() => {
    if (replyingTo && replyInputRef.current) {
      replyInputRef.current.focus()
    }
  }, [replyingTo])

  // Focus edit input when editingComment changes
  useEffect(() => {
    if (editingComment && editInputRef.current) {
      editInputRef.current.focus()

      // Find the comment being edited and set its content as the edit text
      const comment = localComments.find((c) => c.id === editingComment)
      if (comment) {
        setEditText(comment.content)
      }
    }
  }, [editingComment, localComments])

  // Show only the most recent 2 comments unless expanded
  const displayedComments = showAllComments ? localComments : localComments.slice(0, 2)
  const hasMoreComments = localComments.length > 2

  const handleCommentClick = () => {
    setIsCommenting(true)
  }

  const handleSubmitCommentUpdated = async (e: React.FormEvent) => {
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
      }

      setLocalComments([newComment, ...localComments])
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

      // Track this interaction for AI recommendations
      await supabase.from("user_interactions").insert({
        user_id: currentUserId,
        post_id: post.id,
        interaction_type: "comment",
      })

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
        {/* Action buttons */}
        <div className="flex justify-between mb-3">
          <div className="flex space-x-4">
            <button
              onClick={handleLike}
              className="flex items-center space-x-1 text-sm"
              aria-label={isLiked ? "Unlike post" : "Like post"}
            >
              <Heart className={`h-5 w-5 ${isLikedState ? "fill-rose-500 text-rose-500" : "text-gray-500"}`} />
            </button>

            <button
              onClick={() => setShowCommentInput(!showCommentInput)}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
              aria-label="Comment on post"
            >
              <MessageCircle className="h-5 w-5" />
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
        <div className="font-semibold text-sm mb-2">{likesCount} likes</div>

        {/* Caption */}
        <div className="mb-2">
          <span className="font-semibold text-sm mr-1">{post.user.username}</span>
          <span className="text-sm">{post.content}</span>
        </div>

        {/* Comments section */}
        {localComments.length > 0 && (
          <div className="mt-2">
            {/* See more/less comments button */}
            {localComments.length > 2 && (
              <button
                onClick={() => setShowAllComments(!showAllComments)}
                className="flex items-center text-sm text-gray-500 mb-3 hover:text-gray-700 transition-colors"
              >
                {showAllComments ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    <span>Hide comments</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    <span>View all {localComments.length} comments</span>
                  </>
                )}
              </button>
            )}

            {/* Comments list with animation */}
            <div
              className={`space-y-3 transition-all duration-300 ${showAllComments ? "max-h-96 overflow-y-auto" : "max-h-full"}`}
            >
              {displayedComments.map((comment: any) => (
                <div key={comment.id} className="animate-fadeIn">
                  {/* Comment content */}
                  <div className="flex items-start space-x-2 mb-1">
                    <Link href={`/profile/${comment.user.username}`}>
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={comment.user.avatar_url || undefined} alt={comment.user.username} />
                        <AvatarFallback>{comment.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Link>

                    <div className="flex-1">
                      {editingComment === comment.id ? (
                        // Edit comment form
                        <form onSubmit={(e) => handleEditComment(e, comment.id)} className="w-full">
                          <Textarea
                            ref={editInputRef}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="min-h-0 text-sm p-2 mb-1 resize-none"
                            placeholder="Edit your comment..."
                          />
                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingComment(null)}
                              className="h-7 px-2 text-xs"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              size="sm"
                              variant="default"
                              disabled={!editText.trim() || isSubmitting}
                              className="h-7 px-2 text-xs"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                          </div>
                        </form>
                      ) : (
                        // Comment display
                        <div className="text-sm">
                          <Link
                            href={`/profile/${comment.user.username}`}
                            className="font-semibold hover:underline mr-1"
                          >
                            {comment.user.username}
                          </Link>
                          <span>{comment.content}</span>
                          {comment.is_edited && <span className="text-xs text-gray-500 ml-1">(edited)</span>}
                        </div>
                      )}

                      {/* Comment actions */}
                      {editingComment !== comment.id && (
                        <div className="flex items-center mt-1 space-x-3">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>

                          {/* Like button */}
                          <button
                            onClick={() => handleCommentLike(comment.id)}
                            className={`text-xs flex items-center gap-1 ${
                              likedComments[comment.id]
                                ? "text-rose-500 font-medium"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            <Heart className={`h-3 w-3 ${likedComments[comment.id] ? "fill-rose-500" : ""}`} />
                            <span>
                              {commentLikeCounts[comment.id] || 0}{" "}
                              {commentLikeCounts[comment.id] === 1 ? "like" : "likes"}
                            </span>
                          </button>

                          {/* Reply button */}
                          <button
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Reply
                          </button>

                          {/* Edit/Delete buttons (only for comment owner) */}
                          {comment.user_id === currentUserId && (
                            <>
                              <button
                                onClick={() => setEditingComment(comment.id)}
                                className="text-xs text-gray-500 hover:text-gray-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setShowDeleteCommentDialog(comment.id)}
                                className="text-xs text-red-500 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reply form */}
                  {replyingTo === comment.id && (
                    <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="ml-8 mt-2 mb-3">
                      <div className="flex items-start gap-2">
                        <Avatar className="h-6 w-6 flex-shrink-0">
                          <AvatarImage
                            src={session?.user?.user_metadata?.avatar_url || undefined}
                            alt={session?.user?.user_metadata?.username || "User"}
                          />
                          <AvatarFallback>
                            {(session?.user?.user_metadata?.username || "U").substring(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <Textarea
                            ref={replyInputRef}
                            placeholder={`Reply to ${comment.user.username}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="min-h-[60px] resize-none text-sm w-full p-2"
                          />
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
                              Cancel
                            </Button>
                            <Button type="submit" size="sm" disabled={!replyText.trim() || isSubmitting}>
                              {isSubmitting ? "Posting..." : "Reply"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-8 mt-2 space-y-3">
                      {comment.replies.map((reply: any) => (
                        <div key={reply.id} className="flex items-start space-x-2">
                          <Link href={`/profile/${reply.user.username}`}>
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={reply.user.avatar_url || undefined} alt={reply.user.username} />
                              <AvatarFallback>{reply.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                          </Link>
                          <div className="flex-1">
                            <div className="text-xs">
                              <Link
                                href={`/profile/${reply.user.username}`}
                                className="font-semibold hover:underline mr-1"
                              >
                                {reply.user.username}
                              </Link>
                              <span>{reply.content}</span>
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                              {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Show "See less" button at the bottom if there are many comments */}
            {showAllComments && localComments.length > 5 && (
              <button
                onClick={() => setShowAllComments(false)}
                className="flex items-center justify-center w-full text-sm text-gray-500 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 hover:text-gray-700 transition-colors"
              >
                <ChevronUp className="h-4 w-4 mr-1" />
                <span>Show less</span>
              </button>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase my-2">
          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
        </div>

        {/* Add comment - collapsed by default, expands when comment button is clicked */}
        {showCommentInput && (
          <form onSubmit={handleSubmitComment} className="flex items-center border-t pt-3 mt-2">
            <Avatar className="h-7 w-7 mr-2">
              <AvatarImage
                src={session?.user?.user_metadata?.avatar_url || undefined}
                alt={session?.user?.user_metadata?.username || "User"}
              />
              <AvatarFallback>
                {(session?.user?.user_metadata?.username || "U").substring(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Textarea
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-0 h-8 resize-none border-none focus-visible:ring-0 p-0 text-sm flex-1"
              autoFocus
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
        )}
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

      {/* Delete comment confirmation dialog */}
      <AlertDialog open={!!showDeleteCommentDialog} onOpenChange={() => setShowDeleteCommentDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showDeleteCommentDialog && handleDeleteComment(showDeleteCommentDialog)}
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
