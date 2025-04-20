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

interface PrivacySettingsFormProps {
  initialSettings: {
    profile_visibility: string
    show_activity_status: boolean
    allow_tagging: boolean
    show_online_status: boolean
    allow_mentions: boolean
  }
  userId: string
}

export function PrivacySettingsForm({ initialSettings, userId }: PrivacySettingsFormProps) {
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
      const settings = {
        user_id: userId,
        profile_visibility: profileVisibility,
        show_activity_status: showActivityStatus,
        allow_tagging: allowTagging,
        show_online_status: showOnlineStatus,
        allow_mentions: allowMentions,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("user_settings").upsert(settings, { onConflict: "user_id" })

      if (error) throw error

      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving privacy settings:", error)
      toast({
        title: "Error",
        description: "Failed to save privacy settings. Please try again.",
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
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
