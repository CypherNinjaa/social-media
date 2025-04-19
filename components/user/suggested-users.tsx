import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
  id: string
  username: string
  avatar_url?: string | null
  full_name?: string | null
}

interface SuggestedUsersProps {
  users: User[]
}

export function SuggestedUsers({ users }: SuggestedUsersProps) {
  if (!users.length) return null

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Suggestions For You</h3>
        <button className="text-xs font-semibold">See All</button>
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <Link href={`/profile/${user.username}`} className="flex items-center">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{user.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.full_name || "Suggested for you"}</p>
              </div>
            </Link>
            <button className="text-xs font-semibold text-blue-500">Follow</button>
          </div>
        ))}
      </div>
    </div>
  )
}
