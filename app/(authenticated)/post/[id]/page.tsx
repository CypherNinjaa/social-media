import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { formatRelativeTime } from "@/lib/utils"
import { PostActions } from "@/components/post/post-actions"
import { CommentSection } from "@/components/post/comment-section"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export default async function PostPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    notFound()
  }

  // Get post with user info
  const { data: post } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:user_id (id, username, avatar_url, full_name)
    `)
    .eq("id", params.id)
    .single()

  if (!post) {
    notFound()
  }

  // Get like count
  const { count: likesCount } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", post.id)

  // Check if current user liked the post
  const { data: userLike } = await supabase
    .from("likes")
    .select("*")
    .eq("post_id", post.id)
    .eq("user_id", session.user.id)
    .maybeSingle()

  // Check if current user saved the post
  const { data: userSave } = await supabase
    .from("saved_posts")
    .select("*")
    .eq("post_id", post.id)
    .eq("user_id", session.user.id)
    .maybeSingle()

  // Get comments
  const { data: comments } = await supabase
    .from("comments")
    .select(`
      *,
      profiles:user_id (id, username, avatar_url, full_name),
      replies:comment_replies(
        *,
        profiles:user_id (id, username, avatar_url, full_name)
      )
    `)
    .eq("post_id", post.id)
    .is("parent_id", null)
    .order("created_at", { ascending: true })

  const postWithDetails = {
    ...post,
    likes: likesCount || 0,
    isLiked: !!userLike,
    isSaved: !!userSave,
    comments: comments || [],
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="bg-white dark:bg-gray-950 border rounded-lg overflow-hidden shadow-sm">
        {/* Post header */}
        <div className="p-4 flex items-center justify-between border-b">
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
          <span className="text-sm text-muted-foreground">{formatRelativeTime(post.created_at)}</span>
        </div>

        {/* Post content */}
        <div className="p-4">
          <p className="whitespace-pre-wrap mb-4">{post.content}</p>

          {post.image_url && (
            <div className="mt-4 rounded-md overflow-hidden">
              <img
                src={post.image_url || "/placeholder.svg"}
                alt="Post image"
                className="w-full h-auto max-h-[500px] object-contain bg-gray-100 dark:bg-gray-800"
              />
            </div>
          )}
        </div>

        {/* Post actions */}
        <PostActions post={postWithDetails} currentUserId={session.user.id} />

        {/* Comments section */}
        <CommentSection post={postWithDetails} currentUserId={session.user.id} />
      </div>
    </div>
  )
}
