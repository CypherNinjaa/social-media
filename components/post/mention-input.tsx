"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

interface User {
  id: string
  username: string
  avatar_url: string | null
  full_name: string | null
}

export function MentionInput({ value, onChange, placeholder, className, disabled }: MentionInputProps) {
  const [mentionSearch, setMentionSearch] = useState("")
  const [mentionResults, setMentionResults] = useState<User[]>([])
  const [showMentionPopover, setShowMentionPopover] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  // Track cursor position
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
    setCursorPosition(e.target.selectionStart)
  }

  // Track cursor position on click or keyup
  const handleCursorChange = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart)
    }
  }

  // Check for @ symbol and show mention popover
  useEffect(() => {
    if (disabled) return

    // Find the last @ symbol before the cursor
    const textBeforeCursor = value.substring(0, cursorPosition)
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")

    if (lastAtIndex !== -1) {
      // Check if there's a space between the @ and the cursor
      const textBetweenAtAndCursor = textBeforeCursor.substring(lastAtIndex + 1)
      const hasSpace = /\s/.test(textBetweenAtAndCursor)

      if (!hasSpace) {
        // Extract the search term (text after @)
        const searchTerm = textBetweenAtAndCursor.trim()
        setMentionSearch(searchTerm)
        setShowMentionPopover(true)

        // Search for users
        const searchUsers = async () => {
          if (searchTerm.length > 0) {
            const { data } = await supabase
              .from("profiles")
              .select("id, username, avatar_url, full_name")
              .ilike("username", `${searchTerm}%`)
              .limit(5)

            setMentionResults(data || [])
          } else {
            setMentionResults([])
          }
        }

        searchUsers()
        return
      }
    }

    setShowMentionPopover(false)
  }, [value, cursorPosition, disabled, supabase])

  // Handle selecting a mention
  const handleSelectMention = (username: string) => {
    if (textareaRef.current) {
      const textBeforeCursor = value.substring(0, cursorPosition)
      const lastAtIndex = textBeforeCursor.lastIndexOf("@")
      const textAfterCursor = value.substring(cursorPosition)

      // Replace the @searchTerm with @username
      const newValue = textBeforeCursor.substring(0, lastAtIndex) + `@${username} ` + textAfterCursor
      onChange(newValue)

      // Close the popover
      setShowMentionPopover(false)

      // Focus back on textarea and set cursor position after the inserted mention
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          const newCursorPosition = lastAtIndex + username.length + 2 // +2 for @ and space
          textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition)
          setCursorPosition(newCursorPosition)
        }
      }, 0)
    }
  }

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextareaChange}
        onClick={handleCursorChange}
        onKeyUp={handleCursorChange}
        placeholder={placeholder || "What's on your mind?"}
        className={className}
        disabled={disabled}
      />

      <Popover open={showMentionPopover && mentionResults.length > 0} onOpenChange={setShowMentionPopover}>
        <PopoverTrigger asChild>
          <div className="hidden" />
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search users..." value={mentionSearch} onValueChange={setMentionSearch} />
            <CommandList>
              <CommandEmpty>No users found</CommandEmpty>
              <CommandGroup>
                {mentionResults.map((user) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => handleSelectMention(user.username)}
                    className="flex items-center gap-2 p-2"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                      <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.username}</span>
                      {user.full_name && <span className="text-xs text-muted-foreground">{user.full_name}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
