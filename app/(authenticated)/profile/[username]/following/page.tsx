import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FollowButton } from "@/components/profile/follow-button"

interface FollowingPageProps {
  params: {
    username: string
  }
}

export default async function FollowingPage({ params }: FollowingPageProps) {
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

  // Get following
  const { data: following } = await supabase
    .from("follows")
    .select("following_id, profiles!follows_following_id_fkey(*)")
    .eq("follower_id", profile.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container max-w-4xl py-6">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-xl">Following</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {following && following.length > 0 ? (
            <ul className="divide-y">
              {following.map((follow) => (
                <li key={follow.following_id} className="p-4 flex items-center justify-between">
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

                  {currentUserId && currentUserId !== follow.following_id && (
                    <FollowButton
                      profileId={follow.following_id}
                      isFollowing={true} // Since this is the following list
                      currentUserId={currentUserId}
                    />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">Not following anyone yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
