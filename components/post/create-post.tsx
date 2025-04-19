"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageIcon, Loader2, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Profile {
  id: string
  username: string
  avatar_url: string | null
  full_name: string | null
}

export function CreatePost({ profile }: { profile: Profile }) {
  const [content, setContent] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

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

      // Create post
      const { error: postError } = await supabase.from("posts").insert({
        user_id: profile.id,
        content: content.trim(),
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
    } catch (error: any) {
      setError(error.message || "Failed to create post")
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
              <Textarea
                placeholder="What's on your mind?"
                className="min-h-[100px] resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
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
  )
}
