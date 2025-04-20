import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { FollowRequests } from "@/components/profile/follow-requests"

export default async function FollowRequestsPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  return (
    <>
      <PageHeader title="Follow Requests" description="Manage who can follow you" backUrl="/settings" />

      <div className="container max-w-4xl py-10">
        <FollowRequests />
      </div>
    </>
  )
}
