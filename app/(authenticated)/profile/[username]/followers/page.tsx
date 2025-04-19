import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FollowButton } from "@/components/profile/follow-button"

interface FollowersPageProps {
  params: {
    username: string
  }
}

export default async function FollowersPage({ params }: FollowersPageProps) {
  const { username } = params
  const supabase = createServerComponentClient({ cookies })

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const currentUserId = session?.user?.id

  // Get profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).single()

  if (!profile) {
    notFound()
  }

  // Get followers
  const { data: followers } = await supabase
    .from("follows")
    .select("follower_id, profiles!follows_follower_id_fkey(*)")
    .eq("following_id", profile.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container max-w-4xl py-6">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl">Followers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {followers && followers.length > 0 ? (
            <ul className="divide-y">
              {followers.map((follow) => (
                <li key={follow.follower_id} className="p-4 flex items-center justify-between">
                  <Link href={`/profile/${follow.profiles.username}`} className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={follow.profiles.avatar_url || undefined} alt={follow.profiles.username} />
                      <AvatarFallback>{follow.profiles.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{follow.profiles.username}</p>
                      <p className="text-sm text-muted-foreground">{follow.profiles.full_name}</p>
                    </div>
                  </Link>

                  {currentUserId && currentUserId !== follow.follower_id && (
                    <FollowButton
                      profileId={follow.follower_id}
                      isFollowing={false} // You would need to check this dynamically
                      currentUserId={currentUserId}
                    />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">No followers yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
