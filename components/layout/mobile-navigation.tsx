"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Search, PlusSquare, Heart, MessageCircle } from "lucide-react"

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
      href: "/messages",
      icon: MessageCircle,
      label: "Messages",
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-t md:hidden">
      <div className="flex justify-around items-center h-14">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <Icon className={`h-6 w-6 ${item.href === `/profile/${userId}` ? "" : ""}`} />
              <span className="sr-only">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
