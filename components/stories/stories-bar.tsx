"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { PlusIcon } from "lucide-react"

interface Story {
  id: string
  username: string
  avatar?: string | null
  hasUnseenStory?: boolean
}

interface StoriesBarProps {
  stories: Story[]
  currentUserId: string
  currentUserAvatar?: string | null
}

export function StoriesBar({ stories, currentUserId, currentUserAvatar }: StoriesBarProps) {
  return (
    <div className="bg-white dark:bg-gray-950 border rounded-lg p-4 mb-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4">
          {/* Current user's "Add Story" */}
          <div className="flex flex-col items-center space-y-1">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={currentUserAvatar || undefined} alt="Your Story" />
                <AvatarFallback>ME</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 border-2 border-white dark:border-gray-950">
                <PlusIcon className="h-3 w-3 text-white" />
              </div>
            </div>
            <span className="text-xs text-center w-16 truncate">Your Story</span>
          </div>

          {/* Other users' stories */}
          {stories.map((story) => (
            <div key={story.id} className="flex flex-col items-center space-y-1">
              <div className={`${story.hasUnseenStory ? "instagram-border-gradient" : ""}`}>
                <Avatar className="h-16 w-16">
                  <AvatarImage src={story.avatar || undefined} alt={story.username} />
                  <AvatarFallback>{story.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              <span className="text-xs text-center w-16 truncate">{story.username}</span>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
