"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, MoreVertical, Search, Trash } from "lucide-react"
import { clearConversation } from "@/app/actions/messaging"

interface ConversationHeaderProps {
  participant: {
    id: string
    username: string
    avatar_url: string | null
  }
  conversationId: string
}

export function ConversationHeader({ participant, conversationId }: ConversationHeaderProps) {
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleClearConversation = async () => {
    await clearConversation(conversationId)
    setIsDeleteDialogOpen(false)
  }

  return (
    <div className="flex items-center justify-between p-3 border-b">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2 md:hidden">
          <Link href="/messages">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>

        <Link href={`/profile/${participant.username}`} className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={participant.avatar_url || undefined} alt={participant.username} />
            <AvatarFallback>{participant.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{participant.username}</span>
        </Link>
      </div>

      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(!isSearchOpen)}>
          <Search className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash className="h-4 w-4 mr-2" />
              Clear conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear conversation</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all messages in this conversation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearConversation} className="bg-destructive text-destructive-foreground">
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
