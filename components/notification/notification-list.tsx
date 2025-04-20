"use client"

import { useState, useEffect } from "react"
import { NotificationItem } from "@/components/notification/notification-item"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Check, Bell, UserPlus, Heart, MessageCircle, MessageSquare, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { EmptyState } from "@/components/ui/empty-state"

interface NotificationListProps {
  initialNotifications: any[]
  userId: string
}

type FilterType = "all" | "follow" | "like" | "comment" | "message"

export function NotificationList({ initialNotifications, userId }: NotificationListProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [filter, setFilter] = useState<FilterType>("all")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Set up real-time subscription for notifications
    const channel = supabase
      .channel("notification_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchNotifications()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  const fetchNotifications = async () => {
    try {
      const { data } = await supabase
        .from("notifications")
        .select(`
          *,
          actor:actor_id(id, username, avatar_url, full_name),
          posts:post_id(id, content, image_url),
          comments:comment_id(id, content)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50)

      if (data) {
        setNotifications(data)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", userId)

      if (error) throw error

      setNotifications(
        notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification,
        ),
      )

      router.refresh()
    } catch (error) {
      console.error("Error marking notification as read:", error)
      throw error
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      const { error } = await supabase.from("notifications").delete().eq("id", notificationId).eq("user_id", userId)

      if (error) throw error

      setNotifications(notifications.filter((notification) => notification.id !== notificationId))
      router.refresh()
    } catch (error) {
      console.error("Error deleting notification:", error)
      throw error
    }
  }

  const handleMarkAllAsRead = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false)

      if (error) throw error

      setNotifications(notifications.map((notification) => ({ ...notification, is_read: true })))
      toast({
        title: "All notifications marked as read",
        duration: 2000,
      })
      router.refresh()
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true
    if (filter === "follow") return notification.type === "follow"
    if (filter === "like") return notification.type === "like"
    if (filter === "comment") return notification.type === "comment" || notification.type === "reply"
    if (filter === "message") return notification.type === "message"
    return true
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setFilter(value as FilterType)}>
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="all" className="flex items-center gap-1">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">All</span>
            </TabsTrigger>
            <TabsTrigger value="follow" className="flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Follows</span>
            </TabsTrigger>
            <TabsTrigger value="like" className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Likes</span>
            </TabsTrigger>
            <TabsTrigger value="comment" className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Comments</span>
            </TabsTrigger>
            <TabsTrigger value="message" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="ml-2 whitespace-nowrap"
            onClick={handleMarkAllAsRead}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
            Mark all read
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-950 border rounded-lg overflow-hidden">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Bell className="h-10 w-10" />}
            title="No notifications"
            description={`You don't have any ${filter !== "all" ? filter : ""} notifications yet.`}
          />
        )}
      </div>
    </div>
  )
}
