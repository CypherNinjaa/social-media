import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ConversationNotFound() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Conversation not found</h2>
        <p className="text-muted-foreground mb-4">
          The conversation you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button asChild>
          <Link href="/messages">Back to messages</Link>
        </Button>
      </div>
    </div>
  )
}
