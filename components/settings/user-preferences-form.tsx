"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Loader2, X } from "lucide-react"

interface UserPreferencesFormProps {
  userId: string
  initialPreferences: {
    interests: string[]
    preferred_content_types: string[]
    preferred_creators: string[]
  }
}

export function UserPreferencesForm({ userId, initialPreferences }: UserPreferencesFormProps) {
  const [interests, setInterests] = useState<string[]>(initialPreferences.interests || [])
  const [contentTypes, setContentTypes] = useState<string[]>(initialPreferences.preferred_content_types || [])
  const [creators, setCreators] = useState<string[]>(initialPreferences.preferred_creators || [])

  const [newInterest, setNewInterest] = useState("")
  const [newContentType, setNewContentType] = useState("")
  const [newCreator, setNewCreator] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()])
      setNewInterest("")
    }
  }

  const handleAddContentType = () => {
    if (newContentType.trim() && !contentTypes.includes(newContentType.trim())) {
      setContentTypes([...contentTypes, newContentType.trim()])
      setNewContentType("")
    }
  }

  const handleAddCreator = () => {
    if (newCreator.trim() && !creators.includes(newCreator.trim())) {
      setCreators([...creators, newCreator.trim()])
      setNewCreator("")
    }
  }

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest))
  }

  const handleRemoveContentType = (type: string) => {
    setContentTypes(contentTypes.filter((t) => t !== type))
  }

  const handleRemoveCreator = (creator: string) => {
    setCreators(creators.filter((c) => c !== creator))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/user/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          preferences: {
            interests,
            preferred_content_types: contentTypes,
            preferred_creators: creators,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update preferences")
      }

      toast({
        title: "Preferences updated",
        description: "Your content preferences have been saved.",
      })
    } catch (error) {
      console.error("Error updating preferences:", error)

      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Interests</CardTitle>
            <CardDescription>Add topics you're interested in to improve your recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="px-3 py-1">
                    {interest}
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      className="ml-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {interests.length === 0 && <p className="text-sm text-muted-foreground">No interests added yet</p>}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add an interest..."
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddInterest}>
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Types</CardTitle>
            <CardDescription>What types of content do you prefer to see?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {contentTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="px-3 py-1">
                    {type}
                    <button
                      type="button"
                      onClick={() => handleRemoveContentType(type)}
                      className="ml-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {contentTypes.length === 0 && (
                  <p className="text-sm text-muted-foreground">No content types added yet</p>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add a content type..."
                  value={newContentType}
                  onChange={(e) => setNewContentType(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddContentType}>
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Favorite Creators</CardTitle>
            <CardDescription>Add creators whose content you'd like to see more of</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {creators.map((creator) => (
                  <Badge key={creator} variant="secondary" className="px-3 py-1">
                    {creator}
                    <button
                      type="button"
                      onClick={() => handleRemoveCreator(creator)}
                      className="ml-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {creators.length === 0 && <p className="text-sm text-muted-foreground">No creators added yet</p>}
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Add a creator..."
                  value={newCreator}
                  onChange={(e) => setNewCreator(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddCreator}>
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
