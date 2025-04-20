"use client"

import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface PrivacySettingsFormProps {
  initialSettings: {
    profile_visibility: string
    show_activity_status: boolean
    allow_tagging: boolean
    show_online_status: boolean
    allow_mentions: boolean
  }
  userId: string
  updateAction?: (formData: FormData) => Promise<any>
}

export function PrivacySettingsForm({ initialSettings, userId, updateAction }: PrivacySettingsFormProps) {
  const [profileVisibility, setProfileVisibility] = useState(initialSettings.profile_visibility || "public")
  const [showActivityStatus, setShowActivityStatus] = useState(initialSettings.show_activity_status !== false)
  const [allowTagging, setAllowTagging] = useState(initialSettings.allow_tagging !== false)
  const [showOnlineStatus, setShowOnlineStatus] = useState(initialSettings.show_online_status !== false)
  const [allowMentions, setAllowMentions] = useState(initialSettings.allow_mentions !== false)
  const [isSaving, setIsSaving] = useState(false)

  const supabase = createClient()

  const handleSave = async () => {
    setIsSaving(true)

    try {
      if (updateAction) {
        // Use the server action if provided
        const formData = new FormData()
        formData.append("userId", userId)
        formData.append("profileVisibility", profileVisibility)
        formData.append("showActivityStatus", showActivityStatus.toString())
        formData.append("allowTagging", allowTagging.toString())
        formData.append("showOnlineStatus", showOnlineStatus.toString())
        formData.append("allowMentions", allowMentions.toString())

        const result = await updateAction(formData)

        if (result && !result.success) {
          throw new Error(result.error || "Failed to save settings")
        }

        toast({
          title: "Privacy settings updated",
          description: "Your privacy preferences have been saved successfully.",
        })
      } else {
        // Fall back to client-side update
        // Check if a record already exists
        const { data: existingSettings } = await supabase
          .from("user_settings")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle()

        let error

        if (existingSettings) {
          // Update existing record
          const { error: updateError } = await supabase
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

          error = updateError
        } else {
          // Insert new record
          const { error: insertError } = await supabase.from("user_settings").insert({
            user_id: userId,
            profile_visibility: profileVisibility,
            show_activity_status: showActivityStatus,
            allow_tagging: allowTagging,
            show_online_status: showOnlineStatus,
            allow_mentions: allowMentions,
          })

          error = insertError
        }

        if (error) {
          console.error("Supabase error:", error)
          throw new Error(error.message)
        }

        toast({
          title: "Privacy settings updated",
          description: "Your privacy preferences have been saved successfully.",
        })
      }
    } catch (error: any) {
      console.error("Error saving privacy settings:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save privacy settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Visibility</CardTitle>
          <CardDescription>Control who can see your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={profileVisibility} onValueChange={setProfileVisibility}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="public" id="public" />
              <Label htmlFor="public">Public - Anyone can view your profile</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="followers" id="followers" />
              <Label htmlFor="followers">Followers only - Only people who follow you can view your profile</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="private" id="private" />
              <Label htmlFor="private">Private - Only you can view your profile</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity & Status</CardTitle>
          <CardDescription>Control your activity visibility and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Activity Status</p>
              <p className="text-sm text-muted-foreground">Allow others to see when you were last active</p>
            </div>
            <Switch checked={showActivityStatus} onCheckedChange={setShowActivityStatus} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Online Status</p>
              <p className="text-sm text-muted-foreground">Show when you're currently online</p>
            </div>
            <Switch checked={showOnlineStatus} onCheckedChange={setShowOnlineStatus} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interactions</CardTitle>
          <CardDescription>Control how others can interact with you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Allow Tagging</p>
              <p className="text-sm text-muted-foreground">Allow others to tag you in posts and comments</p>
            </div>
            <Switch checked={allowTagging} onCheckedChange={setAllowTagging} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Allow Mentions</p>
              <p className="text-sm text-muted-foreground">Allow others to mention you using @username</p>
            </div>
            <Switch checked={allowMentions} onCheckedChange={setAllowMentions} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  )
}
