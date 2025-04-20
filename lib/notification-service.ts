import { createClient } from "@/lib/supabase/server"

export type NotificationType = "follow" | "like" | "comment" | "reply" | "mention" | "message"

export interface NotificationData {
  user_id: string
  actor_id?: string | null
  type: NotificationType
  post_id?: string | null
  comment_id?: string | null
  message_id?: string | null
  content?: string | null
  is_read: boolean
}

export const notificationService = {
  /**
   * Create a new notification
   */
  async createNotification(data: NotificationData) {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("notifications").insert(data)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error("Error creating notification:", error)
      return { success: false, error }
    }
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", userId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error("Error marking notification as read:", error)
      return { success: false, error }
    }
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      return { success: false, error }
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string) {
    const supabase = createClient()

    try {
      const { error } = await supabase.from("notifications").delete().eq("id", notificationId).eq("user_id", userId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error("Error deleting notification:", error)
      return { success: false, error }
    }
  },
}
