"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface FollowRequest {
  id: string
  requester_id: string
  created_at: string
  profiles: {
    username: string
    avatar_url: string | null
    full_name: string | null
  }
}

export function FollowRequests() {
  const [requests, setRequests] = useState<FollowRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const { data: requests, error } = await supabase
        .from("follow_requests")
        .select(`
          id,
          requester_id,
          created_at,
          profiles:requester_id(username, avatar_url, full_name)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      if (error) throw error

      setRequests(requests || [])
    } catch (error) {
      console.error("Error fetching follow requests:", error)
      toast({
        title: "Error",
        description: "Failed to load follow requests",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (requestId: string, action: "accept" | "reject") => {
    setProcessingIds((prev) => new Set(prev).add(requestId))

    try {
      if (action === "accept") {
        // Get the request details
        const { data: request } = await supabase
          .from("follow_requests")
          .select("requester_id, recipient_id")
          .eq("id", requestId)
          .single()

        if (!request) throw new Error("Request not found")

        // Create a follow relationship
        const { error: followError } = await supabase.from("follows").insert({
          follower_id: request.requester_id,
          following_id: request.recipient_id,
        })

        if (followError) throw followError

        // Update request status
        const { error: updateError } = await supabase
          .from("follow_requests")
          .update({ status: "accepted" })
          .eq("id", requestId)

        if (updateError) throw updateError

        toast({
          title: "Follow request accepted",
          description: "This user can now see your posts and profile",
        })
      } else {
        // Update request status to rejected
        const { error } = await supabase.from("follow_requests").update({ status: "rejected" }).eq("id", requestId)

        if (error) throw error

        toast({
          title: "Follow request rejected",
        })
      }

      // Remove the request from the list
      setRequests((prev) => prev.filter((req) => req.id !== requestId))
      router.refresh()
    } catch (error) {
      console.error(`Error ${action}ing follow request:`, error)
      toast({
        title: "Error",
        description: `Failed to ${action} follow request`,
        variant: "destructive",
      })
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No pending follow requests</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Follow Requests</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {requests.map((request) => (
            <li key={request.id} className="p-4 flex items-center justify-between">
              <Link href={`/profile/${request.profiles.username}`} className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={request.profiles.avatar_url || undefined} alt={request.profiles.username} />
                  <AvatarFallback>{request.profiles.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{request.profiles.username}</p>
                  <p className="text-sm text-muted-foreground">{request.profiles.full_name || ""}</p>
                </div>
              </Link>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAction(request.id, "accept")}
                  disabled={processingIds.has(request.id)}
                >
                  {processingIds.has(request.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction(request.id, "reject")}
                  disabled={processingIds.has(request.id)}
                >
                  Reject
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
