"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Search } from "lucide-react"
import { getOrCreateConversation } from "@/app/actions/messaging"

interface NewMessageDialogProps {
  onClose: () => void
}

export function NewMessageDialog({ onClose }: NewMessageDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const { data: currentUser } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, avatar_url, full_name")
          .or(`username.ilike.%${searchQuery}%, full_name.ilike.%${searchQuery}%`)
          .neq("id", currentUser.user?.id)
          .limit(10)

        if (error) throw error
        setSearchResults(data || [])
      } catch (error) {
        console.error("Error searching users:", error)
      } finally {
        setIsSearching(false)
      }
    }

    const debounce = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery, supabase])

  const handleStartConversation = async (userId: string) => {
    try {
      setIsCreating(true)
      const conversationId = await getOrCreateConversation(userId)
      router.push(`/messages/${conversationId}`)
      onClose()
    } catch (error) {
      console.error("Error creating conversation:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-4 mt-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for a user..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="max-h-72 overflow-y-auto">
        {isSearching ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-2">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className={`flex items-center p-2 rounded-md hover:bg-muted cursor-pointer ${
                  selectedUser?.id === user.id ? "bg-muted" : ""
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                  <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{user.username}</p>
                  {user.full_name && <p className="text-sm text-muted-foreground">{user.full_name}</p>}
                </div>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStartConversation(user.id)
                  }}
                  disabled={isCreating}
                >
                  {isCreating && selectedUser?.id === user.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : null}
                  Message
                </Button>
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <p className="text-center py-4 text-muted-foreground">No users found</p>
        ) : (
          <p className="text-center py-4 text-muted-foreground">Search for users to start a conversation</p>
        )}
      </div>

      {selectedUser && (
        <div className="flex justify-end">
          <Button onClick={() => handleStartConversation(selectedUser.id)} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              "Start Conversation"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
