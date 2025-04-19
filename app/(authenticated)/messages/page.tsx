import { getConversations } from "@/app/actions/messaging"
import { ConversationList } from "@/components/messaging/conversation-list"
import { NewMessageButton } from "@/components/messaging/new-message-button"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { MessageCircle } from "lucide-react"

export default async function MessagesPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/login")
  }

  const conversations = await getConversations()

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="w-full md:w-80 border-r">
        <ConversationList conversations={conversations} />
      </div>

      <div className="hidden md:flex flex-1 items-center justify-center bg-muted/50">
        <div className="text-center max-w-md px-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">Your messages</h3>
          <p className="text-muted-foreground mb-6">
            Send private messages to your friends and connections. Start a conversation by clicking the button below.
          </p>
          <div className="flex justify-center">
            <NewMessageButton />
          </div>
        </div>
      </div>
    </div>
  )
}
