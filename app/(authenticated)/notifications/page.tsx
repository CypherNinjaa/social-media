import { createClient } from "@/lib/supabase/server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default async function NotificationsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select(`
      *,
      actor:actor_id (id, username, avatar_url, full_name),
      posts:post_id (id, image_url),
      comments:comment_id (content)
    `)
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(50)

  // Mark all as read
  await supabase.from("notifications").update({ is_read: true }).eq("user_id", user?.id).eq("is_read", false)

  // Group notifications by time
  const today: any[] = []
  const thisWeek: any[] = []
  const earlier: any[] = []

  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  notifications?.forEach((notification) => {
    const notifDate = new Date(notification.created_at)

    if (notifDate >= oneDayAgo) {
      today.push(notification)
    } else if (notifDate >= oneWeekAgo) {
      thisWeek.push(notification)
    } else {
      earlier.push(notification)
    }
  })

  const getNotificationText = (notification: any) => {
    switch (notification.type) {
      case "like":
        return "liked your post"
      case "comment":
        return "commented on your post"
      case "follow":
        return "started following you"
      default:
        return "interacted with you"
    }
  }

  const getNotificationLink = (notification: any) => {
    if (notification.type === "follow") {
      return `/profile/${notification.actor.username}`
    }

    return `/post/${notification.post_id}`
  }

  const renderNotificationGroup = (groupNotifications: any[], title: string) => {
    if (groupNotifications.length === 0) return null

    return (
      <div className="mb-8">
        <h2 className="font-semibold mb-4">{title}</h2>
        <div className="space-y-4">
          {groupNotifications.map((notification) => (
            <div key={notification.id} className="flex items-start">
              <Link href={`/profile/${notification.actor.username}`} className="mr-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={notification.actor?.avatar_url || undefined} alt={notification.actor?.username} />
                  <AvatarFallback>{notification.actor?.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/profile/${notification.actor.username}`} className="font-semibold">
                      {notification.actor.username}
                    </Link>{" "}
                    <span>{getNotificationText(notification)}</span>
                    {notification.type === "comment" && notification.comments && (
                      <p className="text-gray-500 dark:text-gray-400 truncate">{notification.comments.content}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  {notification.posts?.image_url && (
                    <Link href={`/post/${notification.posts.id}`} className="ml-4 flex-shrink-0">
                      <img
                        src={notification.posts.image_url || "/placeholder.svg?height=40&width=40&query=post"}
                        alt="Post"
                        className="h-10 w-10 object-cover"
                      />
                    </Link>
                  )}
                </div>

                {notification.type === "follow" && (
                  <Button variant="outline" size="sm" className="mt-2 h-8 text-xs font-semibold">
                    Follow
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h1 className="text-2xl font-semibold mb-6">Notifications</h1>

      {notifications && notifications.length > 0 ? (
        <div>
          {renderNotificationGroup(today, "Today")}
          {renderNotificationGroup(thisWeek, "This Week")}
          {renderNotificationGroup(earlier, "Earlier")}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-black dark:border-white mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Activity On Your Posts</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            When someone likes or comments on your posts, you'll see it here.
          </p>
        </div>
      )}
    </div>
  )
}
