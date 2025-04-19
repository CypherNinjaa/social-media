"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SearchInput } from "@/components/search/search-input"
import { Button } from "@/components/ui/button"
import { Search, MessageSquare } from "lucide-react"

export function Header() {
  const pathname = usePathname()
  const isSearchPage = pathname === "/search"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">SocialSphere</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          {isSearchPage ? (
            <SearchInput />
          ) : (
            <div className="w-full max-w-sm lg:max-w-xs">
              <Link href="/search">
                <Button variant="outline" className="w-full justify-start text-muted-foreground">
                  <Search className="mr-2 h-4 w-4" />
                  <span>Search posts...</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        <nav className="flex items-center space-x-2">
          <Link href="/messages">
            <Button variant="ghost" size="icon">
              <MessageSquare className="h-5 w-5" />
            </Button>
          </Link>
          {/* Your existing navigation items */}
        </nav>
      </div>
    </header>
  )
}
