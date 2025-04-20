"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Check, Trash2, MessageSquare, Heart, UserPlus, MessageCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface NotificationItemProps {
  notification: any
  onMarkAsRead: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (notification.is_read) return

    setIsLoading(true)
    try {
      await onMarkAsRead(notification.id)
      toast({
        title: "Notification marked as read",
        duration: 2000,
      })
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    setIsLoading(true)
    try {
      await onDelete(notification.id)
      toast({
        title: "Notification deleted",
        duration: 2000,
      })
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getNotificationIcon = () => {
    switch (notification.type) {
      case "follow":
        return <UserPlus className="h-5 w-5 text-blue-500" />
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />
      case "comment":
      case "reply":
        return <MessageCircle className="h-5 w-5 text-green-500" />
      case "message":
        return <MessageSquare className="h-5 w-5 text-purple-500" />
      default:
        return <MessageSquare className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationLink = () => {
    switch (notification.type) {
      case "follow":
        return `/profile/${notification.actor?.username}`
      case "like":
      case "comment":
      case "reply":
        return `/post/${notification.post_id}`
      case "message":
        return `/messages/${notification.conversation_id}`
      default:
        return "#"
    }
  }

  const getNotificationText = () => {
    switch (notification.type) {
      case "follow":
        return "started following you"
      case "like":
        return "liked your post"
      case "comment":
        return "commented on your post"
      case "reply":
        return "replied to your comment"
      case "message":
        return "sent you a message"
      default:
        return "interacted with you"
    }
  }

  return (
    <Link
      href={getNotificationLink()}
      className={`flex items-start p-4 gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
        !notification.is_read ? "bg-blue-50 dark:bg-blue-900/20" : ""
      }`}
    >
      <div className="flex-shrink-0 mt-1">{getNotificationIcon()}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start">
          <Link href={`/profile/${notification.actor?.username}`} className="flex-shrink-0 mr-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={notification.actor?.avatar_url || undefined} alt={notification.actor?.username} />
              <AvatarFallback>{notification.actor?.username?.substring(0, 2).toUpperCase() || "?"}</AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-semibold">{notification.actor?.username}</span> <span>{getNotificationText()}</span>
              {notification.content && (
                <span className="block text-gray-500 dark:text-gray-400 truncate">{notification.content}</span>
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {!notification.is_read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleMarkAsRead}
            disabled={isLoading}
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Mark as read</span>
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={handleDelete}
          disabled={isLoading}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </Link>
  )
}
