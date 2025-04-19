"use client"

import { useEffect, useRef, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Check, Edit, MoreHorizontal, Smile, Trash, X } from "lucide-react"
import { editMessage, deleteMessage, addReaction } from "@/app/actions/messaging"
import type { Message } from "@/app/actions/messaging"

interface MessageListProps {
  messages: Message[]
  currentUserId: string
}

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"]

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleEdit = (message: Message) => {
    setEditingMessageId(message.id)
    setEditContent(message.content || "")
  }

  const handleSaveEdit = async () => {
    if (editingMessageId && editContent.trim()) {
      await editMessage(editingMessageId, editContent)
      setEditingMessageId(null)
      setEditContent("")
    }
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditContent("")
  }

  const handleDelete = async (messageId: string) => {
    await deleteMessage(messageId)
  }

  const handleReaction = async (messageId: string, reaction: string) => {
    await addReaction(messageId, reaction)
  }

  return (
    <div className="flex flex-col space-y-4 p-4 overflow-y-auto">
      {messages.map((message) => {
        const isCurrentUser = message.sender_id === currentUserId
        const isEditing = message.id === editingMessageId

        return (
          <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
            <div className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-start gap-2 max-w-[80%]`}>
              {!isCurrentUser && message.sender && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.sender.avatar_url || undefined} alt={message.sender.username} />
                  <AvatarFallback>{message.sender.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              )}

              <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
                {!isCurrentUser && message.sender && (
                  <span className="text-xs text-muted-foreground mb-1">{message.sender.username}</span>
                )}

                <div className="flex items-end gap-2">
                  {isEditing ? (
                    <div className="flex flex-col space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[60px] w-full"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                          <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveEdit}>
                          <Check className="h-4 w-4 mr-1" /> Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`rounded-lg p-3 ${isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                      {message.is_deleted ? (
                        <span className="italic text-muted-foreground">This message was deleted</span>
                      ) : (
                        <>
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                          {message.is_edited && <span className="text-xs opacity-70 mt-1 inline-block">(edited)</span>}
                        </>
                      )}
                    </div>
                  )}

                  {!isEditing && !message.is_deleted && (
                    <div className="flex items-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            <Smile className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2" align={isCurrentUser ? "end" : "start"}>
                          <div className="flex gap-1">
                            {REACTION_EMOJIS.map((emoji) => (
                              <button
                                key={emoji}
                                className="text-lg hover:bg-muted p-1 rounded"
                                onClick={() => handleReaction(message.id, emoji)}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>

                      {isCurrentUser && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(message)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(message.id)}
                            >
                              <Trash className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  )}
                </div>

                {message.reactions.length > 0 && (
                  <div className={`flex gap-1 mt-1 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                    {Object.entries(
                      message.reactions.reduce(
                        (acc, reaction) => {
                          acc[reaction.reaction] = acc[reaction.reaction] || { count: 0, users: [] }
                          acc[reaction.reaction].count += 1
                          acc[reaction.reaction].users.push(reaction.username)
                          return acc
                        },
                        {} as Record<string, { count: number; users: string[] }>,
                      ),
                    ).map(([emoji, { count, users }]) => (
                      <TooltipProvider key={emoji}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="bg-muted rounded-full px-2 py-0.5 text-xs flex items-center gap-1 hover:bg-muted/80"
                              onClick={() => handleReaction(message.id, emoji)}
                            >
                              <span>{emoji}</span>
                              <span>{count}</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>{users.join(", ")}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                )}

                <span className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
