"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Heart, Bookmark, Share2, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface PostActionsProps {
  post: any
  currentUserId: string
  showCommentButton?: boolean
  onCommentClick?: () => void
}

export function PostActions({ post, currentUserId, showCommentButton = true, onCommentClick }: PostActionsProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [isSaved, setIsSaved] = useState(post.isSaved)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLike = async () => {
    const newIsLiked = !isLiked
    setIsLiked(newIsLiked)
    setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1))

    try {
      if (newIsLiked) {
        // Add like
        await supabase.from("likes").insert({
          user_id: currentUserId,
          post_id: post.id,
        })

        // Create notification if not the user's own post
        if (post.user_id !== currentUserId) {
          await supabase.from("notifications").insert({
            user_id: post.user_id,
            actor_id: currentUserId,
            type: "like",
            post_id: post.id,
            is_read: false,
          })
        }
      } else {
        // Remove like
        await supabase.from("likes").delete().match({
          user_id: currentUserId,
          post_id: post.id,
        })
      }
    } catch (error) {
      // Revert UI state on error
      setIsLiked(!newIsLiked)
      setLikesCount((prev) => (!newIsLiked ? prev + 1 : prev - 1))
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    const newIsSaved = !isSaved
    setIsSaved(newIsSaved)

    try {
      if (newIsSaved) {
        // Save post
        await supabase.from("saved_posts").insert({
          user_id: currentUserId,
          post_id: post.id,
        })

        toast({
          title: "Post saved",
          description: "This post has been added to your saved items",
        })
      } else {
        // Unsave post
        await supabase.from("saved_posts").delete().match({
          user_id: currentUserId,
          post_id: post.id,
        })

        toast({
          title: "Post removed",
          description: "This post has been removed from your saved items",
        })
      }
    } catch (error) {
      // Revert UI state on error
      setIsSaved(!newIsSaved)
      toast({
        title: "Error",
        description: "Failed to update save status",
        variant: "destructive",
      })
    }
  }

  const handleShare = () => {
    setIsShareDialogOpen(true)
  }

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`
    navigator.clipboard.writeText(shareUrl)
    toast({
      title: "Link copied",
      description: "Post link has been copied to clipboard",
    })
    setIsShareDialogOpen(false)
  }

  return (
    <div className="border-t border-b">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 px-3" onClick={handleLike}>
              <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""} transition-colors`} />
              <span>
                {likesCount} {likesCount === 1 ? "like" : "likes"}
              </span>
            </Button>

            {showCommentButton && (
              <Button variant="ghost" size="sm" className="flex items-center gap-2 px-3" onClick={onCommentClick}>
                <MessageCircle className="h-5 w-5" />
                <span>{post.comments?.length || 0} comments</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleSave}>
              <Bookmark className={`h-5 w-5 ${isSaved ? "fill-current" : ""} transition-colors`} />
              <span className="sr-only">{isSaved ? "Unsave" : "Save"}</span>
            </Button>

            <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                  <span className="sr-only">Share</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share this post</DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-2 mt-4">
                  <Input
                    readOnly
                    value={
                      typeof window !== "undefined"
                        ? `${window.location.origin}/post/${post.id}`
                        : `https://yourdomain.com/post/${post.id}`
                    }
                  />
                  <Button onClick={copyShareLink}>Copy</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  )
}
