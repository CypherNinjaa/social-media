import { getConversations } from "@/app/actions/messaging"
import { ConversationList } from "@/components/messaging/conversation-list"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MessageSquare } from "lucide-react"
import { createConversationAction } from "@/app/actions/create-conversation"
import { NewMessageButton } from "@/components/messaging/new-message-button"

export default async function MessagesPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  // Check if we need to create a conversation with a specific user
  const userId = searchParams?.user as string | undefined

  if (userId) {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      try {
        const result = await createConversationAction(userId)
        if (result.conversationId) {
          redirect(`/messages/${result.conversationId}`)
        }
      } catch (error) {
        console.error("Error creating conversation:", error)
        // Continue to show the messages page
      }
    }
  }

  const conversations = await getConversations()

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <h1 className="text-xl font-semibold">Messages</h1>
      </div>

      {conversations.length > 0 ? (
        <ConversationList conversations={conversations} />
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
          <div className="bg-muted rounded-full p-6 mb-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your Messages</h2>
          <p className="text-muted-foreground mb-6 max-w-md">Send private messages to your friends and connections.</p>
          <NewMessageButton />
        </div>
      )}
    </div>
  )
}
