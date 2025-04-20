"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ModeToggle } from "@/components/theme-toggle"

export function MobileHeader() {
  const pathname = usePathname()

  // Define page titles for different routes
  const getPageTitle = () => {
    if (pathname === "/feed") return "Home"
    if (pathname === "/search") return "Search"
    if (pathname === "/create") return "Create"
    if (pathname === "/notifications") return "Notifications"
    if (pathname.startsWith("/profile")) return "Profile"

    // Default title
    return "SocialSphere"
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center">
          <Link href="/feed" className="flex items-center">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-8 h-8 rounded-full flex items-center justify-center mr-2">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h1
              className={cn(
                "font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r",
                pathname === "/feed"
                  ? "from-purple-500 to-blue-500"
                  : "from-gray-700 to-gray-900 dark:from-gray-200 dark:to-white",
              )}
            >
              {getPageTitle()}
            </h1>
          </Link>
        </div>

        <div className="flex items-center">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
