import { createClient } from "@/lib/supabase/server"

/**
 * Check if a user can view another user's profile based on privacy settings
 */
export async function canViewProfile(viewerId: string | null, profileId: string): Promise<boolean> {
  // If no viewer ID (not logged in), only public profiles are visible
  if (!viewerId) {
    return await isProfilePublic(profileId)
  }

  // Users can always view their own profiles
  if (viewerId === profileId) {
    return true
  }

  const supabase = createClient()

  // Get profile visibility setting
  const { data: settings } = await supabase
    .from("user_settings")
    .select("profile_visibility")
    .eq("user_id", profileId)
    .single()

  // If no settings found, default to public
  if (!settings) {
    return true
  }

  // If profile is public, anyone can view
  if (settings.profile_visibility === "public") {
    return true
  }

  // If profile is private, only the user can view
  if (settings.profile_visibility === "private") {
    return false
  }

  // If profile is followers-only, check if viewer follows the profile
  if (settings.profile_visibility === "followers") {
    const { data: followData } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", viewerId)
      .eq("following_id", profileId)
      .single()

    return !!followData
  }

  // Default to false for any other cases
  return false
}

/**
 * Check if a profile is set to public visibility
 */
export async function isProfilePublic(profileId: string): Promise<boolean> {
  const supabase = createClient()

  const { data: settings } = await supabase
    .from("user_settings")
    .select("profile_visibility")
    .eq("user_id", profileId)
    .single()

  // If no settings found or visibility is public, return true
  return !settings || settings.profile_visibility === "public"
}

/**
 * Check if a user allows mentions
 */
export async function allowsMentions(userId: string): Promise<boolean> {
  const supabase = createClient()

  const { data: settings } = await supabase
    .from("user_settings")
    .select("allow_mentions")
    .eq("user_id", userId)
    .single()

  // If no settings found or allow_mentions is true, return true
  return !settings || settings.allow_mentions !== false
}

/**
 * Check if a user allows tagging
 */
export async function allowsTagging(userId: string): Promise<boolean> {
  const supabase = createClient()

  const { data: settings } = await supabase.from("user_settings").select("allow_tagging").eq("user_id", userId).single()

  // If no settings found or allow_tagging is true, return true
  return !settings || settings.allow_tagging !== false
}

/**
 * Check if a user's activity status should be shown
 */
export async function showsActivityStatus(userId: string): Promise<boolean> {
  const supabase = createClient()

  const { data: settings } = await supabase
    .from("user_settings")
    .select("show_activity_status")
    .eq("user_id", userId)
    .single()

  // If no settings found or show_activity_status is true, return true
  return !settings || settings.show_activity_status !== false
}

/**
 * Check if a user's online status should be shown
 */
export async function showsOnlineStatus(userId: string): Promise<boolean> {
  const supabase = createClient()

  const { data: settings } = await supabase
    .from("user_settings")
    .select("show_online_status")
    .eq("user_id", userId)
    .single()

  // If no settings found or show_online_status is true, return true
  return !settings || settings.show_online_status !== false
}

/**
 * Check if a user can mention another user
 */
export async function canMention(mentionerId: string, mentionedId: string): Promise<boolean> {
  // Users can always mention themselves
  if (mentionerId === mentionedId) {
    return true
  }

  const supabase = createClient()

  // Get mention settings for the mentioned user
  const { data: settings } = await supabase
    .from("user_settings")
    .select("allow_mentions")
    .eq("user_id", mentionedId)
    .single()

  // If no settings found or allow_mentions is true, check if there are additional restrictions
  if (!settings || settings.allow_mentions) {
    return true
  }

  return false
}

/**
 * Check if a user can tag another user
 */
export async function canTag(taggerId: string, taggedId: string): Promise<boolean> {
  // Users can always tag themselves
  if (taggerId === taggedId) {
    return true
  }

  const supabase = createClient()

  // Get tag settings for the tagged user
  const { data: settings } = await supabase
    .from("user_settings")
    .select("allow_tagging")
    .eq("user_id", taggedId)
    .single()

  // If no settings found or allow_tagging is true, check if there are additional restrictions
  if (!settings || settings.allow_tagging) {
    return true
  }

  return false
}
