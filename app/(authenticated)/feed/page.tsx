import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PostCard } from "@/components/post/post-card"
import { FeedClientWrapper } from "@/components/feed/feed-client-wrapper"

export default async function FeedPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (!profile) {
    redirect("/auth")
  }

  // Get posts with user info
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      user:profiles(username, avatar_url)
    `)
    .order("created_at", { ascending: false })
    .limit(20)

  // Get likes for each post
  const postsWithLikes = await Promise.all(
    (posts || []).map(async (post) => {
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

      // Get comments
      const { data: comments } = await supabase
        .from("comments")
        .select(`
        *,
        user:profiles(username, avatar_url)
      `)
        .eq("post_id", post.id)
        .order("created_at", { ascending: false })
        .limit(5)

      return {
        ...post,
        likes: likesCount || 0,
        isLiked: !!userLike,
        comments: comments || [],
      }
    }),
  )

  // Get suggested users
  const { data: suggestedUsers } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, full_name")
    .neq("id", session.user.id)
    .limit(5)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
          {/* Posts */}
          <div className="space-y-6">
            {postsWithLikes.length > 0 ? (
              postsWithLikes.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={session.user.id}
                  likes={post.likes}
                  isLiked={post.isLiked}
                  comments={post.comments}
                  session={session}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-950 border rounded-lg">
                <h2 className="text-xl font-semibold mb-2">No posts yet</h2>
                <p className="text-muted-foreground">Follow some users or be the first to create a post!</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden md:block w-1/3">
          <div className="sticky top-6">
            {/* User profile with client-side logout button */}
            <FeedClientWrapper profile={profile} suggestedUsers={suggestedUsers || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
