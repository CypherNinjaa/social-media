"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface PrivateProfileMessageProps {
  profile: {
    id: string
    username: string
    avatar_url: string | null
    full_name: string | null
  }
  isFollowing: boolean
  currentUserId: string | undefined
}

export function PrivateProfileMessage({ profile, isFollowing, currentUserId }: PrivateProfileMessageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleFollowRequest = async () => {
    if (!currentUserId) {
      router.push("/auth")
      return
    }

    setIsSubmitting(true)

    try {
      // Check if a request already exists
      const { data: existingRequest } = await supabase
        .from("follow_requests")
        .select("id")
        .eq("requester_id", currentUserId)
        .eq("recipient_id", profile.id)
        .maybeSingle()

      if (existingRequest) {
        toast({
          title: "Request already sent",
          description: "You have already sent a follow request to this user.",
        })
        setRequestSent(true)
        return
      }

      // Create a new follow request
      const { error } = await supabase.from("follow_requests").insert({
        requester_id: currentUserId,
        recipient_id: profile.id,
      })

      if (error) throw error

      setRequestSent(true)
      toast({
        title: "Follow request sent",
        description: `Your follow request has been sent to ${profile.username}.`,
      })
    } catch (error) {
      console.error("Error sending follow request:", error)
      toast({
        title: "Error",
        description: "Failed to send follow request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
              <AvatarFallback className="text-2xl">{profile.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-xl">@{profile.username}</CardTitle>
          {profile.full_name && <p className="text-muted-foreground">{profile.full_name}</p>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-muted rounded-full p-3">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">This Account is Private</h3>
          <p className="text-muted-foreground">
            Follow this account to see their photos and videos. Only approved followers can see content from private
            accounts.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          {!currentUserId ? (
            <Button onClick={() => router.push("/auth")}>Sign in to follow</Button>
          ) : isFollowing ? (
            <Button variant="outline" disabled>
              Following
            </Button>
          ) : requestSent ? (
            <Button variant="outline" disabled>
              Request Sent
            </Button>
          ) : (
            <Button onClick={handleFollowRequest} disabled={isSubmitting}>
              {isSubmitting ? "Sending Request..." : "Request to Follow"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
