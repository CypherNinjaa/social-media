"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { searchMessages } from "@/app/actions/messaging"

interface MessageSearchProps {
  conversationId: string
  onClose: () => void
}

export function MessageSearch({ conversationId, onClose }: MessageSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!query.trim() || isSearching) return

    try {
      setIsSearching(true)
      const searchResults = await searchMessages(query)
      setResults(searchResults.filter((result) => result.conversation_id === conversationId))
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="border-b p-3">
      <div className="flex items-center gap-2 mb-3">
        <Input
          placeholder="Search in conversation..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <Button onClick={handleSearch} disabled={!query.trim() || isSearching}>
          Search
        </Button>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {results.length > 0 ? (
        <div className="max-h-60 overflow-y-auto divide-y">
          {results.map((result) => (
            <div
              key={result.message_id}
              className="py-2 cursor-pointer hover:bg-muted/50"
              onClick={() => {
                // Scroll to message (would need to implement this)
                onClose()
              }}
            >
              <div className="flex justify-between">
                <span className="font-medium">{result.sender_username}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm truncate">{result.content}</p>
            </div>
          ))}
        </div>
      ) : query && !isSearching ? (
        <p className="text-sm text-muted-foreground">No messages found</p>
      ) : null}
    </div>
  )
}
