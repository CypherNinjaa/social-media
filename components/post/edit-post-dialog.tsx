"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2, ImageIcon, X, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

interface EditPostDialogProps {
  post: any
  trigger: React.ReactNode
}

export function EditPostDialog({ post, trigger }: EditPostDialogProps) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState(post.content)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(post.image_url)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      setContent(post.content)
      setImagePreview(post.image_url)
      setImage(null)
      setRemoveCurrentImage(false)
      setError(null)
    }
  }, [open, post])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB")
        return
      }

      setImage(file)
      setRemoveCurrentImage(false)

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
    setRemoveCurrentImage(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() && !imagePreview) {
      setError("Post cannot be empty")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const updates: any = {
        content: content.trim(),
        updated_at: new Date().toISOString(),
      }

      // Handle image updates
      if (image) {
        // Upload new image
        const fileExt = image.name.split(".").pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${post.user_id}/${fileName}`

        const { error: uploadError } = await supabase.storage.from("post-images").upload(filePath, image)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("post-images").getPublicUrl(filePath)

        updates.image_url = publicUrl

        // Delete old image if exists
        if (post.image_url) {
          // Extract path from URL
          const oldPath = post.image_url.split("/").slice(-2).join("/")
          if (oldPath) {
            await supabase.storage.from("post-images").remove([oldPath])
          }
        }
      } else if (removeCurrentImage) {
        // Remove image without adding a new one
        updates.image_url = null

        // Delete old image if exists
        if (post.image_url) {
          // Extract path from URL
          const oldPath = post.image_url.split("/").slice(-2).join("/")
          if (oldPath) {
            await supabase.storage.from("post-images").remove([oldPath])
          }
        }
      }

      // Update post
      const { error: updateError } = await supabase.from("posts").update(updates).eq("id", post.id)

      if (updateError) throw updateError

      toast({
        title: "Success",
        description: "Your post has been updated",
      })

      setOpen(false)
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Failed to update post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="What's on your mind?"
              className="min-h-[150px] resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {imagePreview && (
            <div className="relative mt-2 rounded-md overflow-hidden">
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Preview"
                className="max-h-[200px] w-full object-cover rounded-md"
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

          <div>
            <Label htmlFor="image-upload" className="block mb-2">
              Image
            </Label>
            <div className="flex items-center gap-4">
              <div>
                <Label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <ImageIcon className="h-5 w-5 text-primary" />
                  <span>{imagePreview ? "Change Image" : "Add Image"}</span>
                </Label>
                <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || (!content.trim() && !imagePreview)}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Post"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
