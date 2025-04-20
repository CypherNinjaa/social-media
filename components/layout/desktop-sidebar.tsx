"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Search, PlusSquare, Heart, User, Settings, LogOut } from "lucide-react"

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
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <span className="hidden lg:inline-block text-xl font-semibold ml-2">SocialSphere</span>
        </Link>
      </div>

      <nav className="flex-1 px-2 py-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = item.href === "/feed" ? pathname === "/feed" : pathname.startsWith(item.href)

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-600 dark:text-purple-400 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                }`}
              >
                <div
                  className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-lg ${
                    isActive
                      ? "bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-md"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform duration-200"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${isActive ? "animate-pulse-subtle" : "group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors"}`}
                  />
                </div>
                <span
                  className={`ml-3 hidden lg:inline-block relative ${
                    isActive
                      ? "font-medium"
                      : "group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></span>
                  )}
                </span>
                {isActive && (
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-xl"></span>
                )}
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
