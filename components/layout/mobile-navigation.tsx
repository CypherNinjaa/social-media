"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Search, PlusSquare, Heart } from "lucide-react"

interface MobileNavigationProps {
  userId: string
  avatar?: string | null
}

export function MobileNavigation({ userId, avatar }: MobileNavigationProps) {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/feed",
      icon: Home,
      label: "Home",
    },
    {
      href: "/search",
      icon: Search,
      label: "Search",
    },
    {
      href: "/create",
      icon: PlusSquare,
      label: "Create",
    },
    {
      href: "/notifications",
      icon: Heart,
      label: "Notifications",
    },
    {
      href: `/profile/${userId}`,
      icon: () => (
        <Avatar className="h-6 w-6">
          <AvatarImage src={avatar || undefined} alt="Profile" />
          <AvatarFallback className="text-xs">ME</AvatarFallback>
        </Avatar>
      ),
      label: "Profile",
    },
  ]

  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 md:hidden">
      <div className="flex items-center bg-white dark:bg-gray-900 rounded-full px-2 py-1 shadow-lg border border-gray-100 dark:border-gray-800 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href.includes("/profile") && pathname.includes("/profile"))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center justify-center mx-2 p-3 rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {isActive && (
                <span className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-sm" />
              )}
              {item.href === `/profile/${userId}` ? (
                <Icon />
              ) : (
                <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5px]" : ""}`} />
              )}
              <span className="sr-only">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
