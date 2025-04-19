"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Music } from "lucide-react"

// Mock data for reels
const mockReels = [
  {
    id: "1",
    videoUrl: "https://example.com/video1.mp4", // This would be a real video URL in production
    user: {
      id: "user1",
      username: "janedoe",
      avatar: "/placeholder.svg?key=3ag2a",
    },
    caption: "Enjoying the sunset at the beach! #sunset #beach #summer",
    likes: 1243,
    comments: 89,
    music: "Original Sound - janedoe",
  },
  {
    id: "2",
    videoUrl: "https://example.com/video2.mp4",
    user: {
      id: "user2",
      username: "johndoe",
      avatar: "/placeholder.svg?key=tw8mb",
    },
    caption: "Morning coffee and coding session ☕️ #developer #coding",
    likes: 876,
    comments: 42,
    music: "Lo-Fi Beats - chillmusic",
  },
  {
    id: "3",
    videoUrl: "https://example.com/video3.mp4",
    user: {
      id: "user3",
      username: "travelguru",
      avatar: "/placeholder.svg?key=ge7po",
    },
    caption: "Exploring the mountains today! The view is breathtaking 🏔️ #travel #adventure #mountains",
    likes: 2541,
    comments: 132,
    music: "Adventure Sounds - naturelover",
  },
]

export default function ReelsPage() {
  const [currentReelIndex, setCurrentReelIndex] = useState(0)
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({})
  const [savedReels, setSavedReels] = useState<Record<string, boolean>>({})

  const currentReel = mockReels[currentReelIndex]

  const handleLike = (reelId: string) => {
    setLikedReels((prev) => ({
      ...prev,
      [reelId]: !prev[reelId],
    }))
  }

  const handleSave = (reelId: string) => {
    setSavedReels((prev) => ({
      ...prev,
      [reelId]: !prev[reelId],
    }))
  }

  const handleNext = () => {
    setCurrentReelIndex((prev) => (prev + 1) % mockReels.length)
  }

  const handlePrevious = () => {
    setCurrentReelIndex((prev) => (prev - 1 + mockReels.length) % mockReels.length)
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] md:h-screen flex items-center justify-center bg-black">
      <div className="relative h-full w-full max-w-md mx-auto">
        {/* Video */}
        <div className="h-full w-full bg-gray-900 flex items-center justify-center">
          {/* In a real app, this would be a video player */}
          <div className="text-white text-center p-4">
            <p className="text-lg mb-2">Reel {currentReelIndex + 1}</p>
            <p className="text-sm text-gray-400">
              This is a placeholder for a video player.
              <br />
              In a real app, videos would play here.
            </p>
          </div>
        </div>

        {/* Navigation buttons (invisible but clickable areas) */}
        <button
          className="absolute top-0 left-0 w-1/2 h-full opacity-0"
          onClick={handlePrevious}
          aria-label="Previous reel"
        />
        <button className="absolute top-0 right-0 w-1/2 h-full opacity-0" onClick={handleNext} aria-label="Next reel" />

        {/* Reel info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          {/* User info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={currentReel.user.avatar || "/placeholder.svg"} alt={currentReel.user.username} />
                <AvatarFallback>{currentReel.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-semibold">{currentReel.user.username}</span>
              <Button variant="outline" size="sm" className="ml-2 h-7 text-xs border-white text-white">
                Follow
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="text-white">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>

          {/* Caption */}
          <p className="mb-4">{currentReel.caption}</p>

          {/* Music */}
          <div className="flex items-center mb-6">
            <Music className="h-4 w-4 mr-2" />
            <p className="text-sm">{currentReel.music}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="absolute right-4 bottom-32 flex flex-col items-center space-y-6">
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-white h-12 w-12"
              onClick={() => handleLike(currentReel.id)}
            >
              <Heart className={`h-7 w-7 ${likedReels[currentReel.id] ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <span className="text-white text-xs">{currentReel.likes}</span>
          </div>

          <div className="flex flex-col items-center">
            <Button variant="ghost" size="icon" className="text-white h-12 w-12">
              <MessageCircle className="h-7 w-7" />
            </Button>
            <span className="text-white text-xs">{currentReel.comments}</span>
          </div>

          <div className="flex flex-col items-center">
            <Button variant="ghost" size="icon" className="text-white h-12 w-12">
              <Send className="h-7 w-7" />
            </Button>
          </div>

          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-white h-12 w-12"
              onClick={() => handleSave(currentReel.id)}
            >
              <Bookmark className={`h-7 w-7 ${savedReels[currentReel.id] ? "fill-white" : ""}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
