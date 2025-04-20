import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NotificationList } from "@/components/notification/notification-list"
import { PageHeader } from "@/components/layout/page-header"

export default async function NotificationsPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  // Get notifications with related data
  const { data: notifications } = await supabase
    .from("notifications")
    .select(`
      *,
      actor:actor_id(id, username, avatar_url, full_name),
      posts:post_id(id, content, image_url),
      comments:comment_id(id, content)
    `)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  // Mark all as read when the page loads
  await supabase.from("notifications").update({ is_read: true }).eq("user_id", session.user.id).eq("is_read", false)

  return (
    <>
      <PageHeader title="Notifications" description="Stay updated with your latest activities" />

      <div className="container max-w-4xl py-6">
        <NotificationList initialNotifications={notifications || []} userId={session.user.id} />
      </div>
    </>
  )
}
