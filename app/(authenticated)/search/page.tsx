import { searchPosts } from "@/app/actions/search"
import { SearchInput } from "@/components/search/search-input"
import { SearchResults } from "@/components/search/search-results"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

interface SearchPageProps {
  searchParams: { q?: string }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const supabase = createServerComponentClient({ cookies })

  // Get current user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const query = searchParams.q || ""
  const results = query ? await searchPosts(query) : []

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-2xl font-bold">Search Posts</h1>
        <SearchInput initialQuery={query} />
      </div>

      {query && <SearchResults results={results} query={query} />}

      {!query && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Enter a search term to find posts</p>
        </div>
      )}
    </div>
  )
}
