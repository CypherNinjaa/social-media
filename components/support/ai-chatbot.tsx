"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Bot, User, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

interface AIChatbotProps {
  userId: string
  isEnabled: boolean
}

export function AIChatbot({ userId, isEnabled }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hi there! I'm your SocialSphere assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || loading) return

    if (!isEnabled) {
      toast({
        title: "AI Feature Unavailable",
        description: "The AI chatbot is not available on your current plan.",
        variant: "destructive",
      })
      return
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input.trim(),
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      // Convert messages to format expected by API
      const chatHistory = messages
        .filter((msg) => msg.id !== "welcome")
        .map((msg) => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.content,
        }))

      const response = await fetch("/api/ai/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          userQuery: userMessage.content,
          chatHistory,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: data.response,
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error sending message:", error)

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])

      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isEnabled) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            AI Support Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>The AI support assistant is not available on your current plan.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="h-5 w-5 mr-2" />
          AI Support Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                <div className="flex items-start gap-2 max-w-[80%]">
                  {!message.isUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/friendly-robot-assistant.png" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg p-3 ${message.isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {message.isUser && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/vibrant-street-market.png" />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
