"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, User, Bell, Search, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ModeToggle } from "@/components/theme-toggle"

export function MainNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const routes = [
    {
      href: "/",
      label: "Home",
      icon: <Home className="h-5 w-5" />,
      active: pathname === "/",
    },
    {
      href: "/search",
      label: "Search",
      icon: <Search className="h-5 w-5" />,
      active: pathname === "/search",
    },
    {
      href: "/notifications",
      label: "Notifications",
      icon: <Bell className="h-5 w-5" />,
      active: pathname === "/notifications",
    },
    {
      href: "/profile",
      label: "Profile",
      icon: <User className="h-5 w-5" />,
      active: pathname === "/profile",
    },
  ]

  return (
    <>
      <div className="hidden md:flex h-16 items-center px-4 border-b">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
            SocialSphere
          </span>
        </Link>
        <nav className="ml-auto flex items-center space-x-1">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={route.active ? "default" : "ghost"}
              asChild
              className={cn("h-9 w-9 p-0", route.active && "bg-primary text-primary-foreground")}
            >
              <Link href={route.href}>
                <span className="sr-only">{route.label}</span>
                {route.icon}
              </Link>
            </Button>
          ))}
          <ModeToggle />
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-9 w-9">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Sign out</span>
          </Button>
        </nav>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 border-b">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
            SocialSphere
          </span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="h-9 w-9">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background pt-16">
          <nav className="grid gap-2 p-4">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={route.active ? "default" : "ghost"}
                className={cn("justify-start", route.active && "bg-primary text-primary-foreground")}
                onClick={() => {
                  setIsOpen(false)
                  router.push(route.href)
                }}
              >
                {route.icon}
                <span className="ml-2">{route.label}</span>
              </Button>
            ))}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <ModeToggle />
              <Button variant="ghost" onClick={handleSignOut} className="justify-start">
                <LogOut className="h-5 w-5 mr-2" />
                Sign out
              </Button>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
