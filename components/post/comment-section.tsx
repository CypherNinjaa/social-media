"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatRelativeTime } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface CommentSectionProps {
  post: any
  currentUserId: string
}

export function CommentSection({ post, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>(post.comments || [])
  const [newComment, setNewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [submittingReply, setSubmittingReply] = useState(false)
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      const { data } = await supabase.from("profiles").select("username, avatar_url").eq("id", currentUserId).single()

      setCurrentUserProfile(data)
    }

    fetchCurrentUserProfile()
  }, [currentUserId, supabase])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim() || submitting) return

    setSubmitting(true)

    try {
      const { data: comment, error } = await supabase
        .from("comments")
        .insert({
          user_id: currentUserId,
          post_id: post.id,
          content: newComment.trim(),
        })
        .select(`
          *,
          profiles:user_id (id, username, avatar_url, full_name)
        `)
        .single()

      if (error) throw error

      // Add empty replies array to the new comment
      const commentWithReplies = {
        ...comment,
        replies: [],
      }

      setComments([...comments, commentWithReplies])
      setNewComment("")

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

  const handleSubmitReply = async (commentId: string) => {
    if (!replyContent.trim() || submittingReply) return

    setSubmittingReply(true)

    try {
      const { data: reply, error } = await supabase
        .from("comment_replies")
        .insert({
          user_id: currentUserId,
          comment_id: commentId,
          content: replyContent.trim(),
        })
        .select(`
          *,
          profiles:user_id (id, username, avatar_url, full_name)
        `)
        .single()

      if (error) throw error

      // Update the comments state with the new reply
      const updatedComments = comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), reply],
          }
        }
        return comment
      })

      setComments(updatedComments)
      setReplyContent("")
      setReplyingTo(null)

      // Get the comment author's ID
      const commentAuthorId = comments.find((c) => c.id === commentId)?.user_id

      // Create notification for the comment author if it's not the current user
      if (commentAuthorId && commentAuthorId !== currentUserId) {
        await supabase.from("notifications").insert({
          user_id: commentAuthorId,
          actor_id: currentUserId,
          type: "reply",
          post_id: post.id,
          comment_id: commentId,
          is_read: false,
        })
      }

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post reply",
        variant: "destructive",
      })
    } finally {
      setSubmittingReply(false)
    }
  }

  const handleReplyClick = (commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId)
    setReplyContent("")
  }

  return (
    <div className="p-4">
      <h3 className="font-medium mb-4">Comments</h3>

      {/* New comment form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUserProfile?.avatar_url || undefined} />
            <AvatarFallback>{currentUserProfile?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              ref={commentInputRef}
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <div className="flex justify-end mt-2">
              <Button type="submit" disabled={!newComment.trim() || submitting} size="sm">
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
          </div>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              <div className="flex gap-3">
                <Link href={`/profile/${comment.profiles.username}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profiles.avatar_url || undefined} />
                    <AvatarFallback>{comment.profiles.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <Link href={`/profile/${comment.profiles.username}`} className="font-medium">
                        {comment.profiles.username}
                      </Link>
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.created_at)}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  </div>
                  <div className="flex items-center mt-1 ml-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => handleReplyClick(comment.id)}
                    >
                      Reply
                    </Button>
                  </div>

                  {/* Reply form */}
                  {replyingTo === comment.id && (
                    <div className="mt-3 ml-6 flex gap-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={currentUserProfile?.avatar_url || undefined} />
                        <AvatarFallback>{currentUserProfile?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder={`Reply to ${comment.profiles.username}...`}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[60px] resize-none text-sm"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => setReplyingTo(null)}>
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            disabled={!replyContent.trim() || submittingReply}
                            onClick={() => handleSubmitReply(comment.id)}
                          >
                            {submittingReply ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Posting...
                              </>
                            ) : (
                              "Reply"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 ml-6 space-y-3">
                      {comment.replies.map((reply: any) => (
                        <div key={reply.id} className="flex gap-3">
                          <Link href={`/profile/${reply.profiles.username}`}>
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={reply.profiles.avatar_url || undefined} />
                              <AvatarFallback>{reply.profiles.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                          </Link>
                          <div className="flex-1">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                              <div className="flex items-center justify-between mb-1">
                                <Link href={`/profile/${reply.profiles.username}`} className="font-medium text-sm">
                                  {reply.profiles.username}
                                </Link>
                                <span className="text-xs text-muted-foreground">
                                  {formatRelativeTime(reply.created_at)}
                                </span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  )
}
