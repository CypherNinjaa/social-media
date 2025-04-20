import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { PrivacySettingsForm } from "@/components/settings/privacy-settings-form"
import { revalidatePath } from "next/cache"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

async function updatePrivacySettings(formData: FormData) {
  "use server"

  const userId = formData.get("userId") as string
  const profileVisibility = formData.get("profileVisibility") as string
  const showActivityStatus = formData.get("showActivityStatus") === "true"
  const allowTagging = formData.get("allowTagging") === "true"
  const showOnlineStatus = formData.get("showOnlineStatus") === "true"
  const allowMentions = formData.get("allowMentions") === "true"

  const supabase = createClient()

  try {
    // Check if a record already exists for this user
    const { data: existingSettings } = await supabase
      .from("user_settings")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle()

    if (existingSettings) {
      // Update existing record
      const { error } = await supabase
        .from("user_settings")
        .update({
          profile_visibility: profileVisibility,
          show_activity_status: showActivityStatus,
          allow_tagging: allowTagging,
          show_online_status: showOnlineStatus,
          allow_mentions: allowMentions,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (error) {
        console.error("Error updating privacy settings:", error)
        throw error
      }
    } else {
      // Insert new record
      const { error } = await supabase.from("user_settings").insert({
        user_id: userId,
        profile_visibility: profileVisibility,
        show_activity_status: showActivityStatus,
        allow_tagging: allowTagging,
        show_online_status: showOnlineStatus,
        allow_mentions: allowMentions,
      })

      if (error) {
        console.error("Error inserting privacy settings:", error)
        throw error
      }
    }

    // Force revalidation to ensure fresh data on next visit
    revalidatePath("/settings/privacy")
    return { success: true }
  } catch (error: any) {
    console.error("Failed to update privacy settings:", error)
    return { success: false, error: "Failed to update settings" }
  }
}

export default async function PrivacySettingsPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  // Get user's settings from the user_settings table
  const { data: userSettings, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle()

  if (error) {
    console.error("Error fetching user settings:", error)
  }

  // Default settings if none exist or there was an error
  const settings = {
    profile_visibility: userSettings?.profile_visibility || "public",
    show_activity_status: userSettings?.show_activity_status !== false,
    allow_tagging: userSettings?.allow_tagging !== false,
    show_online_status: userSettings?.show_online_status !== false,
    allow_mentions: userSettings?.allow_mentions !== false,
  }

  return (
    <>
      <PageHeader
        title="Privacy Settings"
        description="Control who can see your content and how your information is used"
        backUrl="/settings"
      />

      <div className="container max-w-2xl py-10">
        <Alert className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Privacy Settings</AlertTitle>
          <AlertDescription>
            Customize your privacy preferences to control how others interact with you on SocialSphere.
          </AlertDescription>
        </Alert>

        <PrivacySettingsForm
          key={`privacy-settings-${Date.now()}`}
          initialSettings={settings}
          userId={session.user.id}
          updateAction={updatePrivacySettings}
        />
      </div>
    </>
  )
}
