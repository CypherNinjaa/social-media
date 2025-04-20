import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { UserPreferencesForm } from "@/components/settings/user-preferences-form"

export default async function PreferencesPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  // Get user preferences
  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", session.user.id)
    .single()

  return (
    <>
      <PageHeader
        title="Content Preferences"
        description="Customize your feed and recommendations"
        backUrl="/settings"
      />

      <div className="container max-w-2xl py-10">
        <UserPreferencesForm
          userId={session.user.id}
          initialPreferences={preferences || { interests: [], preferred_content_types: [], preferred_creators: [] }}
        />
      </div>
    </>
  )
}
