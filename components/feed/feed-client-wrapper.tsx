"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { SuggestedUsers } from "@/components/user/suggested-users"

interface FeedClientWrapperProps {
  profile: any
  suggestedUsers: any[]
}

export function FeedClientWrapper({ profile, suggestedUsers }: FeedClientWrapperProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
    router.refresh()
  }

  return (
    <>
      {/* User profile */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="mr-3">
            <img
              src={profile.avatar_url || "/placeholder.svg?height=48&width=48&query=avatar"}
              alt={profile.username}
              className="h-12 w-12 rounded-full object-cover"
            />
          </div>
          <div>
            <p className="font-semibold">{profile.username}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile.full_name || ""}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs font-semibold text-blue-500 hover:text-blue-700 hover:underline transition-colors"
        >
          Switch
        </button>
      </div>

      {/* Suggested users */}
      <SuggestedUsers users={suggestedUsers} />
    </>
  )
}
