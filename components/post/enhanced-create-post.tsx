"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageIcon, Loader2, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { AIContentGenerator } from "@/components/post/ai-content-generator"
import { MentionInput } from "@/components/post/mention-input"

interface Profile {
  id: string
  username: string
  avatar_url: string | null
  full_name: string | null
}

export function EnhancedCreatePost({ profile }: { profile: Profile }) {
  const [content, setContent] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [isCheckingAI, setIsCheckingAI] = useState(true)
  const [mentionsEnabled, setMentionsEnabled] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Check if AI features are enabled for this user
  useEffect(() => {
    async function checkAIStatus() {
      try {
        const { data, error } = await supabase
          .from("ai_feature_status")
          .select("is_enabled")
          .eq("user_id", profile.id)
          .eq("feature_name", "content_generation")
          .single()

        // If no record exists or there's an error, default to enabled
        setAiEnabled(data?.is_enabled !== false)
      } catch (error) {
        console.error("Error checking AI status:", error)
        setAiEnabled(false)
      } finally {
        setIsCheckingAI(false)
      }
    }

    checkAIStatus()
  }, [profile.id, supabase])

  // Check if mentions are allowed for this user
  useEffect(() => {
    async function checkMentionsStatus() {
      try {
        const { data: settings } = await supabase
          .from("user_settings")
          .select("allow_mentions")
          .eq("user_id", profile.id)
          .single()

        setMentionsEnabled(settings?.allow_mentions !== false)
      } catch (error) {
        console.error("Error checking mentions permission:", error)
        setMentionsEnabled(true) // Default to allowing mentions if there's an error
      }
    }

    checkMentionsStatus()
  }, [profile.id, supabase])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
  }

  const handleAIContentGenerated = (generatedContent: string, hashtags?: string[]) => {
    let newContent = generatedContent

    if (hashtags && hashtags.length > 0) {
      newContent += "\n\n" + hashtags.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)).join(" ")
    }

    setContent(newContent)

    toast({
      title: "Content Generated",
      description: "AI-generated content has been added to your post",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() && !image) {
      setError("Post cannot be empty")
      return
    }

    setLoading(true)
    setError(null)

    try {
      let imageUrl = null

      // Upload image if exists
      if (image) {
        const fileExt = image.name.split(".").pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${profile.id}/${fileName}`

        const { error: uploadError, data } = await supabase.storage.from("post-images").upload(filePath, image)

        if (uploadError) {
          throw uploadError
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("post-images").getPublicUrl(filePath)

        imageUrl = publicUrl
      }

      // Process mentions in content
      let updatedContent = content
      const mentionRegex = /@(\w+)/g
      const mentions = content.match(mentionRegex) || []

      // Extract usernames from mentions
      const usernames = mentions.map((mention) => mention.substring(1))

      // Check if mentioned users allow mentions
      if (usernames.length > 0) {
        const { data: mentionedUsers } = await supabase
          .from("profiles")
          .select("id, username")
          .in("username", usernames)

        if (mentionedUsers) {
          // Get mention settings for these users
          const mentionSettings = await Promise.all(
            mentionedUsers.map(async (user) => {
              const { data } = await supabase
                .from("user_settings")
                .select("allow_mentions")
                .eq("user_id", user.id)
                .single()

              return {
                userId: user.id,
                username: user.username,
                allowsMentions: data?.allow_mentions !== false,
              }
            }),
          )

          // Filter out users who don't allow mentions
          const disallowedMentions = mentionSettings.filter((setting) => !setting.allowsMentions)

          if (disallowedMentions.length > 0) {
            // Warn about disallowed mentions
            toast({
              title: "Some mentions were removed",
              description: `${disallowedMentions.map((m) => `@${m.username}`).join(", ")} ${
                disallowedMentions.length === 1 ? "doesn't" : "don't"
              } allow mentions.`,
              variant: "warning",
            })

            // Remove disallowed mentions from content
            disallowedMentions.forEach((mention) => {
              const regex = new RegExp(`@${mention.username}\\b`, "g")
              updatedContent = updatedContent.replace(regex, mention.username)
            })
          }
        }
      }

      // Create post
      const { error: postError } = await supabase.from("posts").insert({
        user_id: profile.id,
        content: updatedContent.trim(),
        image_url: imageUrl,
      })

      if (postError) {
        throw postError
      }

      // Reset form
      setContent("")
      setImage(null)
      setImagePreview(null)

      // Refresh feed
      router.refresh()

      toast({
        title: "Success",
        description: "Your post has been created",
      })
    } catch (error: any) {
      setError(error.message || "Failed to create post")
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    }

    return profile?.username?.substring(0, 2).toUpperCase() || "U"
  }

  return (
    <>
      {!isCheckingAI && aiEnabled && (
        <AIContentGenerator userId={profile.id} onContentGenerated={handleAIContentGenerated} isEnabled={aiEnabled} />
      )}

      <Card className="mb-6">
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || ""} alt={profile?.username || ""} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <MentionInput
                  value={content}
                  onChange={setContent}
                  placeholder="What's on your mind?"
                  className="min-h-[100px] resize-none"
                  disabled={!mentionsEnabled}
                />
                {imagePreview && (
                  <div className="relative mt-2">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="max-h-[300px] rounded-md object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <ImageIcon className="h-5 w-5" />
                  <span>Add Image</span>
                </div>
              </Label>
              <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </>
  )
}
