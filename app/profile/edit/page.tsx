"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MainNav } from "@/components/layout/main-nav"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload } from "lucide-react"

export default function EditProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [username, setUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [bio, setBio] = useState("")
  const [website, setWebsite] = useState("")
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    async function getProfile() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/auth")
          return
        }

        const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        if (error) throw error

        setProfile(data)
        setUsername(data.username || "")
        setFullName(data.full_name || "")
        setBio(data.bio || "")
        setWebsite(data.website || "")
        setAvatarPreview(data.avatar_url || null)
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [supabase, router])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatar(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (!profile) throw new Error("Profile not loaded")

      let avatarUrl = profile.avatar_url

      // Upload avatar if changed
      if (avatar) {
        const fileExt = avatar.name.split(".").pop()
        const fileName = `${profile.id}.${fileExt}`

        const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, avatar, { upsert: true })

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(fileName)

        avatarUrl = publicUrlData.publicUrl
      }

      // Update profile
      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          full_name: fullName,
          bio,
          website,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })

      router.push("/profile")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex-1 container max-w-3xl py-6 px-4 md:py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 container max-w-3xl py-6 px-4 md:py-12">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarPreview || undefined} />
                  <AvatarFallback className="text-2xl">{username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex items-center">
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Upload className="h-4 w-4" />
                      Change Avatar
                    </div>
                    <input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[100px]" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push("/profile")} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
      <SiteFooter />
    </div>
  )
}
