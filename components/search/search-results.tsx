import type { SearchResult } from "@/app/actions/search"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import Image from "next/image"

interface SearchResultsProps {
  results: SearchResult[]
  query: string
}

export function SearchResults({ results, query }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No results found for &quot;{query}&quot;</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Search results for &quot;{query}&quot;</h2>
      <div className="grid gap-4">
        {results.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.profile?.avatar_url || ""} alt={post.profile?.username || "User"} />
                  <AvatarFallback>{post.profile?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/profile/${post.user_id}`} className="font-medium hover:underline">
                    {post.profile?.username || "Unknown user"}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: post.headline }} />

              {post.image_url && (
                <div className="mt-3 relative aspect-video rounded-md overflow-hidden">
                  <Image src={post.image_url || "/placeholder.svg"} alt="Post image" fill className="object-cover" />
                </div>
              )}
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between">
              <Link href={`/post/${post.id}`} className="text-sm text-muted-foreground hover:underline">
                View full post
              </Link>
              <div className="text-xs bg-muted px-2 py-1 rounded-full">Relevance: {Math.round(post.rank * 100)}%</div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
