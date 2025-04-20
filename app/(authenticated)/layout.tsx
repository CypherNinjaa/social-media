import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { MobileNavigation } from "@/components/layout/mobile-navigation"
import { MobileHeader } from "@/components/layout/mobile-header"
import { DesktopSidebar } from "@/components/layout/desktop-sidebar"

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url, full_name")
    .eq("id", session.user.id)
    .single()

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <DesktopSidebar userId={session.user.id} username={profile?.username} avatar={profile?.avatar_url} />

      {/* Mobile Header */}
      <MobileHeader />

      {/* Main Content */}
      <div className="flex-1 md:ml-[72px] lg:ml-[244px]">
        <main className="min-h-screen pb-16 md:pb-0 mt-14 md:mt-0">
          <Suspense>{children}</Suspense>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation userId={profile?.username || session.user.id} avatar={profile?.avatar_url} />
    </div>
  )
}
