import { getMessages, getConversations } from "@/app/actions/messaging"
import { ConversationList } from "@/components/messaging/conversation-list"
import { ConversationHeader } from "@/components/messaging/conversation-header"
import { MessageList } from "@/components/messaging/message-list"
import { MessageInput } from "@/components/messaging/message-input"
import { RealtimeMessages } from "@/components/messaging/realtime-messages"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"

interface ConversationPageProps {
  params: {
    id: string
  }
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id } = params
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/auth/login")
  }

  const conversations = await getConversations()
  const currentConversation = conversations.find((c) => c.id === id)

  if (!currentConversation) {
    notFound()
  }

  const messages = await getMessages(id)
  const participant = currentConversation.participants[0]

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="hidden md:block w-80 border-r">
        <ConversationList conversations={conversations} />
      </div>

      <div className="flex-1 flex flex-col">
        <ConversationHeader participant={participant} conversationId={id} />

        <div className="flex-1 overflow-hidden">
          <MessageList messages={messages} currentUserId={session.user.id} />
        </div>

        <MessageInput conversationId={id} />

        {/* Real-time subscription */}
        <RealtimeMessages conversationId={id} />
      </div>
    </div>
  )
}
