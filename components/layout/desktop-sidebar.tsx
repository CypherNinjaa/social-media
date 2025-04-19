"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Search, PlusSquare, Heart, MessageCircle, User, Settings, LogOut, Instagram } from "lucide-react"

interface DesktopSidebarProps {
  userId: string
  username?: string | null
  avatar?: string | null
}

export function DesktopSidebar({ userId, username, avatar }: DesktopSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
    router.refresh()
  }

  const navItems = [
    {
      name: "Home",
      href: "/feed",
      icon: Home,
    },
    {
      name: "Search",
      href: "/search",
      icon: Search,
    },
    {
      name: "Create",
      href: "/create",
      icon: PlusSquare,
    },
    {
      name: "Messages",
      href: "/messages",
      icon: MessageCircle,
    },
    {
      name: "Notifications",
      href: "/notifications",
      icon: Heart,
    },
    {
      name: "Profile",
      href: `/profile/${username}`,
      icon: User,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <aside className="fixed left-0 top-0 bottom-0 hidden md:flex flex-col border-r bg-white dark:bg-gray-950 w-[72px] lg:w-[244px] z-50">
      <div className="p-4 lg:p-6 flex items-center justify-center lg:justify-start">
        <Link href="/feed" className="flex items-center">
          <span className="hidden lg:inline-block text-xl font-semibold">SocialSphere</span>
          <span className="lg:hidden">
            <Instagram className="h-6 w-6" />
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === "/feed" ? pathname === "/feed" : pathname.startsWith(item.href)

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-3 rounded-md transition-colors ${
                  isActive
                    ? "bg-gray-100 dark:bg-gray-800 text-black dark:text-white font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="ml-3 hidden lg:inline-block">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 lg:mr-2" />
          <span className="hidden lg:inline-block">Log out</span>
        </Button>
      </div>
    </aside>
  )
}
