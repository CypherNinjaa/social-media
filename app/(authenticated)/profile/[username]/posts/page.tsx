import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PostGrid } from "@/components/post/post-grid"

interface PostsPageProps {
  params: {
    username: string
  }
}

export default async function PostsPage({ params }: PostsPageProps) {
  const { username } = params
  const supabase = createServerComponentClient({ cookies })

  // Get profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).single()

  if (!profile) {
    notFound()
  }

  // Get posts
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container max-w-4xl py-6">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl">Posts</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {posts && posts.length > 0 ? (
            <PostGrid posts={posts} />
          ) : (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">No posts yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
