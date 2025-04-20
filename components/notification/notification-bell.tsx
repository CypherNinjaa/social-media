"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const fetchUnreadCount = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Check if user is authenticated before making the query
      if (!user) {
        setIsLoading(false)
        return
      }

      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false)

      if (error) throw error
      setUnreadCount(count || 0)
    } catch (error) {
      console.error("Error fetching unread notifications:", error)
      // Don't let the error break the UI
      setUnreadCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUnreadCount()

    // Set up real-time subscription for notifications
    try {
      const channel = supabase
        .channel("notification_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${supabase.auth.getUser().then((res) => res.data.user?.id || "")}`,
          },
          () => {
            fetchUnreadCount()
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } catch (error) {
      console.error("Error setting up notification subscription:", error)
      // Return empty cleanup function if subscription fails
      return () => {}
    }
  }, [supabase, router])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => router.push("/notifications")}
            aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white"
                variant="destructive"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Notifications {unreadCount > 0 ? `(${unreadCount} unread)` : ""}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
