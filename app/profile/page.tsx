import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MainNav } from "@/components/layout/main-nav"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PostCard } from "@/components/post/post-card"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { Pencil } from "lucide-react"

export default async function ProfilePage() {
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

  // Get user's posts
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      user:profiles(username, avatar_url)
    `)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

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

  // Get follower and following counts
  const { count: followersCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", session.user.id)

  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", session.user.id)

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 container max-w-3xl py-6 px-4 md:py-12">
        <Card className="mb-8">
          <CardHeader className="relative">
            <div className="absolute right-4 top-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/profile/edit">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            </div>
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">@{profile.username}</CardTitle>
              {profile.full_name && <CardDescription className="text-lg mt-1">{profile.full_name}</CardDescription>}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-8 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{postsWithLikes.length}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{followersCount || 0}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{followingCount || 0}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
            </div>

            {profile.bio && <p className="text-center mt-4 max-w-md mx-auto">{profile.bio}</p>}

            {profile.website && (
              <p className="text-center mt-2">
                <a
                  href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {profile.website}
                </a>
              </p>
            )}

            <p className="text-center text-sm text-muted-foreground mt-4">Joined {formatDate(profile.created_at)}</p>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-bold mb-6">Posts</h2>

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
              />
            ))
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold">No posts yet</h3>
              <p className="text-muted-foreground mt-2">Your posts will appear here</p>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
