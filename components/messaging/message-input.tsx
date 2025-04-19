"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendHorizontal } from "lucide-react"
import { sendMessage } from "@/app/actions/messaging"

interface MessageInputProps {
  conversationId: string
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && document.activeElement === textareaRef.current) {
        e.preventDefault()
        handleSend()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [content])

  const handleSend = async () => {
    if (!content.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      await sendMessage(conversationId, content)
      setContent("")
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsSubmitting(false)
      textareaRef.current?.focus()
    }
  }

  return (
    <div className="border-t p-3">
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          placeholder="Type a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[60px] resize-none"
          disabled={isSubmitting}
        />
        <Button onClick={handleSend} disabled={!content.trim() || isSubmitting} className="h-10 w-10 rounded-full p-0">
          <SendHorizontal className="h-5 w-5" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">Press Enter to send, Shift+Enter for new line</p>
    </div>
  )
}
