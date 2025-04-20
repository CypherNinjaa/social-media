import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PostCard } from "@/components/post/post-card"
import { SuggestedUsers } from "@/components/user/suggested-users"
import { checkAIFeatureAvailability } from "@/lib/ai/ai-service"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles } from "lucide-react"

export default async function PersonalizedFeedPage() {
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

  // Check if AI recommendations are enabled
  const aiStatus = await checkAIFeatureAvailability(session.user.id, "recommendations")

  // Get posts with user info - fallback to regular feed if AI is not available
  let posts = []

  if (aiStatus.isEnabled) {
    // Get personalized recommendations
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/ai/recommendations?userId=${session.user.id}`,
      {
        cache: "no-store",
      },
    )

    if (response.ok) {
      const data = await response.json()
      posts = data.posts || []
    }
  }

  // If no AI recommendations or AI is disabled, fall back to regular feed
  if (posts.length === 0) {
    const { data: regularPosts } = await supabase
      .from("posts")
      .select(`
        *,
        profiles:user_id(username, avatar_url, full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(20)

    posts = regularPosts || []
  }

  // Get likes for each post
  const postsWithLikes = await Promise.all(
    posts.map(async (post) => {
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
        profiles:user_id(username, avatar_url, full_name)
      `)
        .eq("post_id", post.id)
        .order("created_at", { ascending: false })
        .limit(5)

      return {
        ...post,
        likes: likesCount || 0,
        isLiked: !!userLike,
        comments: comments || [],
        isAIRecommended: !!post.recommendationScore,
      }
    }),
  )

  // Get suggested users
  const { data: suggestedUsers } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, full_name")
    .neq("id", session.user.id)
    .limit(5)

  // Track this view for future recommendations
  if (aiStatus.isEnabled) {
    await Promise.all(
      postsWithLikes.map(async (post) => {
        await supabase.from("user_interactions").insert({
          user_id: session.user.id,
          post_id: post.id,
          interaction_type: "view",
        })
      }),
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          {aiStatus.isEnabled && <Sparkles className="h-5 w-5 mr-2 text-primary" />}
          {aiStatus.isEnabled ? "Personalized Feed" : "Your Feed"}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/feed">Standard Feed</Link>
          </Button>
          {!aiStatus.isEnabled && (
            <Button variant="outline" asChild>
              <Link href="/settings">Upgrade for AI Features</Link>
            </Button>
          )}
        </div>
      </div>

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
                  isAIRecommended={post.isAIRecommended}
                  recommendationReason={post.recommendationReason}
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
            {/* User profile */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="mr-3">
                  <img
                    src={profile.avatar_url || "/placeholder.svg?height=48&width=48&query=avatar"}
                    alt={profile.username}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold">{profile.username}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{profile.full_name || ""}</p>
                </div>
              </div>
              <button className="text-xs font-semibold text-blue-500">Switch</button>
            </div>

            {/* Suggested users */}
            <SuggestedUsers users={suggestedUsers || []} />

            {/* AI Features Status */}
            <div className="mt-6 bg-white dark:bg-gray-950 border rounded-lg p-4">
              <h3 className="font-medium mb-2 flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                AI Features
              </h3>
              <div className="text-sm text-muted-foreground">
                {aiStatus.isEnabled ? (
                  <p>AI recommendations are active. Your feed is personalized based on your interests and activity.</p>
                ) : (
                  <p>Upgrade your account to access AI-powered personalized recommendations.</p>
                )}
              </div>
              {!aiStatus.isEnabled && (
                <Button size="sm" className="mt-2 w-full" asChild>
                  <Link href="/settings">Upgrade Now</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
