"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { SearchIcon, X } from "lucide-react"

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Profile[]>([])
  const [recentSearches, setRecentSearches] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [explorePosts, setExplorePosts] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem("recentSearches")
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches))
    }

    // Load explore posts
    fetchExplorePosts()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        searchProfiles()
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const fetchExplorePosts = async () => {
    const { data: posts } = await supabase
      .from("posts")
      .select("id, image_url")
      .order("created_at", { ascending: false })
      .limit(30)

    setExplorePosts(posts || [])
  }

  const searchProfiles = async () => {
    setLoading(true)

    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(10)

      setResults(data || [])
    } catch (error) {
      console.error("Error searching profiles:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToRecentSearches = (profile: Profile) => {
    const updated = [profile, ...recentSearches.filter((item) => item.id !== profile.id).slice(0, 4)]
    setRecentSearches(updated)
    localStorage.setItem("recentSearches", JSON.stringify(updated))
  }

  const removeFromRecentSearches = (id: string) => {
    const updated = recentSearches.filter((item) => item.id !== id)
    setRecentSearches(updated)
    localStorage.setItem("recentSearches", JSON.stringify(updated))
  }

  const clearSearch = () => {
    setQuery("")
    setResults([])
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="sticky top-0 bg-white dark:bg-gray-950 z-10 py-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {query && (
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2" onClick={clearSearch}>
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {query ? (
        // Search results
        <div className="mt-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y">
              {results.map((profile) => (
                <Link
                  key={profile.id}
                  href={`/profile/${profile.username}`}
                  className="flex items-center py-3"
                  onClick={() => addToRecentSearches(profile)}
                >
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
                    <AvatarFallback>{profile.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{profile.username}</p>
                    {profile.full_name && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{profile.full_name}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No results found.</p>
            </div>
          )}
        </div>
      ) : (
        // Recent searches
        <div>
          {recentSearches.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Recent</h2>
                <button className="text-blue-500 text-sm font-semibold">Clear all</button>
              </div>
              <div className="divide-y">
                {recentSearches.map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between py-3">
                    <Link href={`/profile/${profile.username}`} className="flex items-center flex-1">
                      <Avatar className="h-12 w-12 mr-3">
                        <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
                        <AvatarFallback>{profile.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{profile.username}</p>
                        {profile.full_name && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{profile.full_name}</p>
                        )}
                      </div>
                    </Link>
                    <button className="p-2" onClick={() => removeFromRecentSearches(profile.id)}>
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
