import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Grid3X3, Bookmark, Settings } from "lucide-react"
import Link from "next/link"

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient()
  const username = params.username

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Fetch profile data with counts
  const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).single()

  if (!profile) {
    notFound()
  }

  // Get followers count
  const { count: followersCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", profile.id)

  // Get following count
  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", profile.id)

  // Check if current user is following this profile
  let isFollowing = false
  if (session) {
    const { data: followData } = await supabase
      .from("follows")
      .select("*")
      .eq("follower_id", session.user.id)
      .eq("following_id", profile.id)
      .maybeSingle()

    isFollowing = !!followData
  }

  // Get user's posts
  const { data: posts } = await supabase
    .from("posts")
    .select("id, image_url, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })

  const isOwnProfile = session?.user.id === profile.id

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Profile header */}
      <div className="py-8 flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Profile picture */}
        <div className="flex-shrink-0">
          <Avatar className="h-20 w-20 md:h-36 md:w-36">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
            <AvatarFallback className="text-2xl">{profile.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>

        {/* Profile info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <h1 className="text-xl font-light">{profile.username}</h1>

            {isOwnProfile ? (
              <div className="flex gap-2">
                <Link href="/settings">
                  <Button variant="outline" size="sm" className="font-semibold">
                    Edit profile
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="ghost" size="sm" className="font-semibold">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex gap-2">
                <form action={`/api/profile/${profile.id}/follow`} method="POST">
                  <Button variant={isFollowing ? "outline" : "default"} size="sm" className="font-semibold">
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                </form>
                <Button variant="outline" size="sm" className="font-semibold">
                  Message
                </Button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-center md:justify-start space-x-8 mb-4">
            <Link
              href={`/profile/${username}/posts`}
              className="flex flex-col items-center md:items-start cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span className="font-semibold">{posts?.length || 0}</span>{" "}
              <span className="text-gray-500 dark:text-gray-400">posts</span>
            </Link>

            <Link
              href={`/profile/${username}/followers`}
              className="flex flex-col items-center md:items-start cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span className="font-semibold">{followersCount || 0}</span>{" "}
              <span className="text-gray-500 dark:text-gray-400">followers</span>
            </Link>

            <Link
              href={`/profile/${username}/following`}
              className="flex flex-col items-center md:items-start cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span className="font-semibold">{followingCount || 0}</span>{" "}
              <span className="text-gray-500 dark:text-gray-400">following</span>
            </Link>
          </div>

          {/* Bio */}
          <div>
            {profile.full_name && <p className="font-semibold">{profile.full_name}</p>}
            {profile.bio && <p className="whitespace-pre-wrap">{profile.bio}</p>}
            {profile.website && (
              <a
                href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-900 dark:text-blue-400 font-semibold"
              >
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content tabs */}
      <Tabs defaultValue="posts" className="mt-8">
        <TabsList className="w-full grid grid-cols-2 h-auto border-t">
          <TabsTrigger
            value="posts"
            className="py-3 data-[state=active]:border-t-2 data-[state=active]:border-black dark:data-[state=active]:border-white rounded-none"
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            <span className="uppercase text-xs font-semibold">Posts</span>
          </TabsTrigger>
          <TabsTrigger
            value="saved"
            className="py-3 data-[state=active]:border-t-2 data-[state=active]:border-black dark:data-[state=active]:border-white rounded-none"
          >
            <Bookmark className="h-4 w-4 mr-2" />
            <span className="uppercase text-xs font-semibold">Saved</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          {posts && posts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 md:gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/post/${post.id}`} className="relative aspect-square group">
                  <img
                    src={post.image_url || "/placeholder.svg?height=300&width=300&query=post"}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                    {/* Overlay content like likes and comments count could go here */}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-black dark:border-white mb-4">
                <Grid3X3 className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Posts Yet</h2>
              {isOwnProfile ? (
                <p className="text-gray-500 dark:text-gray-400">Start capturing and sharing your moments.</p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  When {profile.username} posts, you'll see their photos and videos here.
                </p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-black dark:border-white mb-4">
              <Bookmark className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Save</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Save photos and videos that you want to see again. No one is notified, and only you can see what you've
              saved.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
