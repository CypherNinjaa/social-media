"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { NewMessageButton } from "./new-message-button"
import type { Conversation } from "@/app/actions/messaging"

interface ConversationListProps {
  conversations: Conversation[]
}

export function ConversationList({ conversations }: ConversationListProps) {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = conversations.filter((conversation) => {
    const otherUser = conversation.participants[0]
    return otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="p-2">
        <NewMessageButton />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          <div className="divide-y">
            {filteredConversations.map((conversation) => {
              const otherUser = conversation.participants[0]
              const isActive = pathname === `/messages/${conversation.id}`

              return (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.id}`}
                  className={`flex items-center p-3 hover:bg-muted/50 ${isActive ? "bg-muted" : ""}`}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={otherUser.avatar_url || undefined} alt={otherUser.username} />
                      <AvatarFallback>{otherUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {conversation.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>

                  <div className="ml-3 flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium truncate">{otherUser.username}</h3>
                      {conversation.last_message && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.last_message
                        ? conversation.last_message.is_deleted
                          ? "This message was deleted"
                          : `${conversation.last_message.sender_username}: ${conversation.last_message.content}`
                        : "No messages yet"}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-muted-foreground">No conversations found</p>
          </div>
        )}
      </div>
    </div>
  )
}
