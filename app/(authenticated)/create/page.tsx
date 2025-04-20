"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Loader2, ImageIcon, X, AlertCircle, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AIContentGenerator } from "@/components/post/ai-content-generator"
// import { checkAIFeatureAvailability } from "@/lib/ai/ai-service"

export default function CreatePostPage() {
  const [content, setContent] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [isCheckingAI, setIsCheckingAI] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth")
          return
        }

        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        setProfile(data)
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setLoadingProfile(false)
      }
    }

    getProfile()
  }, [supabase, router])

  useEffect(() => {
    async function checkAIStatus() {
      try {
        if (!profile?.id) return

        // Check AI feature status directly from the database
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

    if (profile?.id) {
      checkAIStatus()
    }
  }, [profile?.id, supabase])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB")
        return
      }

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
    setShowAIGenerator(false)

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
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth")
        return
      }

      let imageUrl = null

      // Upload image if exists
      if (image) {
        const fileExt = image.name.split(".").pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage.from("post-images").upload(filePath, image)

        if (uploadError) {
          throw uploadError
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("post-images").getPublicUrl(filePath)

        imageUrl = publicUrl
      }

      // Create post
      const { error: postError } = await supabase.from("posts").insert({
        user_id: user.id,
        content: content.trim(),
        image_url: imageUrl,
      })

      if (postError) {
        throw postError
      }

      toast({
        title: "Success",
        description: "Your post has been created",
      })

      // Redirect to feed
      router.push("/feed")
      router.refresh()
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

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container max-w-3xl py-12 px-4 sm:px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create Post</h1>
        {!isCheckingAI && aiEnabled && (
          <Button
            variant="outline"
            onClick={() => setShowAIGenerator(!showAIGenerator)}
            className={
              showAIGenerator ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" : ""
            }
          >
            <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
            {showAIGenerator ? "Hide AI Generator" : "Use AI Generator"}
          </Button>
        )}
      </div>

      <div className="relative">
        {/* Decorative elements */}
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

        {showAIGenerator && !isCheckingAI && (
          <AIContentGenerator
            userId={profile?.id || ""}
            onContentGenerated={handleAIContentGenerated}
            isEnabled={aiEnabled}
          />
        )}

        <Card className="border-none shadow-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />

          <CardHeader className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
              <div className="h-1 w-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 opacity-60" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Create Post
            </CardTitle>
            <p className="text-muted-foreground mt-1">Share your thoughts with the world</p>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.username} />
                  <AvatarFallback>{profile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-4">
                  <Textarea
                    placeholder="What's on your mind?"
                    className="min-h-[150px] resize-none text-lg"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />

                  {imagePreview && (
                    <div className="relative mt-2 rounded-md overflow-hidden">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="max-h-[300px] w-full object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <Label htmlFor="image-upload" className="block mb-2">
                  Add to your post
                </Label>
                <div className="flex items-center gap-4">
                  <div>
                    <Label
                      htmlFor="image-upload"
                      className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <ImageIcon className="h-5 w-5 text-primary" />
                      <span>Image</span>
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end border-t pt-4">
              <Button type="submit" disabled={loading || (!content.trim() && !image)} className="px-8">
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
      </div>
    </div>
  )
}
