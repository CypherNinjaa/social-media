import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EnhancedPostCard } from "@/components/post/enhanced-post-card"
import { Bookmark } from "lucide-react"

export default async function SavedPostsPage() {
  const supabase = createClient()

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  // Get saved posts
  const { data: savedPosts } = await supabase
    .from("saved_posts")
    .select("post_id")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  // Get post details for each saved post
  const posts = await Promise.all(
    (savedPosts || []).map(async ({ post_id }) => {
      const { data: post } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id (id, username, avatar_url, full_name)
        `)
        .eq("id", post_id)
        .single()

      if (!post) return null

      // Get like count
      const { count: likesCount } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", post_id)

      // Check if current user liked the post
      const { data: userLike } = await supabase
        .from("likes")
        .select("*")
        .eq("post_id", post_id)
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
        .eq("post_id", post_id)
        .order("created_at", { ascending: false })
        .limit(3)

      return {
        ...post,
        likes: likesCount || 0,
        isLiked: !!userLike,
        isSaved: true,
        comments: comments || [],
      }
    }),
  )

  // Filter out null posts (in case any were deleted)
  const validPosts = posts.filter(Boolean)

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-2xl font-bold mb-6">Saved Posts</h1>

      {validPosts.length > 0 ? (
        <div className="space-y-6">
          {validPosts.map((post) => (
            <EnhancedPostCard key={post.id} post={post} currentUserId={session.user.id} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-950 border rounded-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-700 mb-4">
            <Bookmark className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No saved posts yet</h2>
          <p className="text-muted-foreground">When you save posts, they'll appear here for easy access later.</p>
        </div>
      )}
    </div>
  )
}
