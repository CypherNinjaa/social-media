"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Home, LogOut, Menu, MessageSquare, Search, User } from "lucide-react"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

interface Profile {
  id: string
  username: string
  avatar_url: string | null
  full_name: string | null
}

export function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notificationCount, setNotificationCount] = useState(0)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("id, username, avatar_url, full_name")
            .eq("id", user.id)
            .single()

          setProfile(data)

          // Get unread notification count
          const { count } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("is_read", false)

          setNotificationCount(count || 0)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    }

    return profile?.username?.substring(0, 2).toUpperCase() || "U"
  }

  const navItems = [
    { href: "/feed", label: "Feed", icon: <Home className="h-5 w-5" /> },
    { href: "/search", label: "Search", icon: <Search className="h-5 w-5" /> },
    { href: "/messages", label: "Messages", icon: <MessageSquare className="h-5 w-5" /> },
    {
      href: "/notifications",
      label: "Notifications",
      icon: <Bell className="h-5 w-5" />,
      badge: notificationCount > 0,
    },
    {
      href: `/profile/${profile?.username || ""}`,
      label: "Profile",
      icon: <User className="h-5 w-5" />,
    },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 mr-4">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-social-600 to-social-400 flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <Link href="/feed" className="text-xl font-bold">
            SocialSphere
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
              {item.badge && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex items-center gap-2 mb-8">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-social-600 to-social-400 flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="text-xl font-bold">SocialSphere</span>
            </div>
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                  {item.badge && (
                    <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </Badge>
                  )}
                </Link>
              ))}
              <Button variant="ghost" className="justify-start px-2" onClick={handleSignOut}>
                <LogOut className="mr-2 h-5 w-5" />
                <span>Log out</span>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>

        <div className="ml-auto flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || ""} alt={profile?.username || ""} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">{profile?.full_name || profile?.username}</p>
                <p className="text-xs leading-none text-muted-foreground">@{profile?.username}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/profile/${profile?.username || ""}`}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
