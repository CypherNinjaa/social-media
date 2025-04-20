import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { PrivacySettingsForm } from "@/components/settings/privacy-settings-form"

export default async function PrivacySettingsPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  // Get user's current privacy settings
  const { data: privacySettings, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", session.user.id)
    .single()

  // Default settings if none exist or there was an error
  const settings = privacySettings || {
    profile_visibility: "public",
    show_activity_status: true,
    allow_tagging: true,
    show_online_status: true,
    allow_mentions: true,
  }

  return (
    <>
      <PageHeader
        title="Privacy Settings"
        description="Control who can see your content and how your information is used"
        backUrl="/settings"
      />

      <div className="container max-w-2xl py-10">
        <PrivacySettingsForm initialSettings={settings} userId={session.user.id} />
      </div>
    </>
  )
}
