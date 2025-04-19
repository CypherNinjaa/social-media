"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDistanceToNow } from "date-fns"
import { Edit, Info, Phone, Send, Smile, Video } from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  content: string
  timestamp: string
  senderId: string
}

interface Conversation {
  id: string
  user: {
    id: string
    username: string
    avatar_url: string | null
    full_name: string | null
  }
  lastMessage: {
    content: string
    timestamp: string
    isRead: boolean
  }
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        fetchConversations(user.id)
      }
    }

    fetchCurrentUser()
  }, [])

  const fetchConversations = async (userId: string) => {
    // This is a mock implementation - in a real app, you'd fetch from a conversations table
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, full_name")
      .neq("id", userId)
      .limit(15)

    // Create mock conversations
    const mockConversations =
      profiles?.map((profile) => ({
        id: profile.id,
        user: profile,
        lastMessage: {
          content: `This is a sample message from ${profile.username}`,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
          isRead: Math.random() > 0.3,
        },
      })) || []

    setConversations(mockConversations)

    // Select first conversation by default
    if (mockConversations.length > 0 && !selectedConversation) {
      setSelectedConversation(mockConversations[0])
      generateMockMessages(mockConversations[0].id)
    }
  }

  const generateMockMessages = (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId)
    if (!conversation) return

    const mockMessages = []
    const messageCount = 5 + Math.floor(Math.random() * 10)

    let timestamp = new Date(Date.now() - messageCount * 5 * 60 * 1000)

    for (let i = 0; i < messageCount; i++) {
      const isFromCurrentUser = Math.random() > 0.5

      mockMessages.push({
        id: `msg-${i}`,
        content: isFromCurrentUser
          ? `This is a message from you to ${conversation.user.username}`
          : `This is a message from ${conversation.user.username} to you`,
        timestamp: timestamp.toISOString(),
        senderId: isFromCurrentUser ? currentUserId : conversation.id,
      })

      timestamp = new Date(timestamp.getTime() + Math.floor(Math.random() * 30 * 60 * 1000))
    }

    setMessages(mockMessages)
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    generateMockMessages(conversation.id)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !selectedConversation || !currentUserId) return

    const newMsg = {
      id: `new-${Date.now()}`,
      content: newMessage,
      timestamp: new Date().toISOString(),
      senderId: currentUserId,
    }

    setMessages([...messages, newMsg])
    setNewMessage("")
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] md:h-screen flex">
      {/* Conversations list */}
      <div className="w-full md:w-80 lg:w-96 border-r flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="font-semibold">{currentUserId}</h1>
          <Button variant="ghost" size="icon">
            <Edit className="h-5 w-5" />
          </Button>
        </div>

        <div className="overflow-y-auto flex-1">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className={`w-full flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                selectedConversation?.id === conversation.id ? "bg-gray-100 dark:bg-gray-800" : ""
              }`}
              onClick={() => handleSelectConversation(conversation)}
            >
              <Avatar className="h-12 w-12 mr-3">
                <AvatarImage src={conversation.user.avatar_url || undefined} alt={conversation.user.username} />
                <AvatarFallback>{conversation.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="font-semibold">{conversation.user.username}</p>
                <div className="flex items-center">
                  <p
                    className={`text-sm truncate ${conversation.lastMessage.isRead ? "text-gray-500 dark:text-gray-400" : "font-semibold"}`}
                  >
                    {conversation.lastMessage.content}
                  </p>
                  <span className="mx-1">·</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(conversation.lastMessage.timestamp), { addSuffix: false })}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      {selectedConversation ? (
        <div className="hidden md:flex flex-col flex-1">
          {/* Conversation header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage
                  src={selectedConversation.user.avatar_url || undefined}
                  alt={selectedConversation.user.username}
                />
                <AvatarFallback>{selectedConversation.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Link href={`/profile/${selectedConversation.user.username}`} className="font-semibold">
                {selectedConversation.user.username}
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Info className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const isFromCurrentUser = message.senderId === currentUserId

              return (
                <div key={message.id} className={`flex ${isFromCurrentUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isFromCurrentUser ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-800"
                    }`}
                  >
                    <p>{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${isFromCurrentUser ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Message input */}
          <form onSubmit={handleSendMessage} className="border-t p-4 flex items-center space-x-2">
            <Button variant="ghost" size="icon" type="button">
              <Smile className="h-6 w-6" />
            </Button>
            <Textarea
              placeholder="Message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 resize-none h-10 py-2 focus-visible:ring-0 focus-visible:ring-offset-0"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
            />
            <Button variant="ghost" size="icon" type="submit" disabled={!newMessage.trim()}>
              <Send className="h-6 w-6" />
            </Button>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-col flex-1 items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-black dark:border-white mb-4">
              <Send className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              Send private photos and messages to a friend or group.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
