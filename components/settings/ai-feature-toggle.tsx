"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface AIFeatureToggleProps {
  userId: string
  featureName: string
  title: string
  description: string
  isEnabled: boolean
  usageCount: number
  lastUsed: string | null
}

export function AIFeatureToggle({
  userId,
  featureName,
  title,
  description,
  isEnabled: initialIsEnabled,
  usageCount,
  lastUsed,
}: AIFeatureToggleProps) {
  const [isEnabled, setIsEnabled] = useState(initialIsEnabled)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai/toggle-feature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          featureName,
          isEnabled: !isEnabled,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update feature status")
      }

      setIsEnabled(!isEnabled)

      toast({
        title: `${title} ${!isEnabled ? "enabled" : "disabled"}`,
        description: `This feature is now ${!isEnabled ? "enabled" : "disabled"} on your account.`,
      })
    } catch (error) {
      console.error("Error toggling feature:", error)

      toast({
        title: "Error",
        description: "Failed to update feature status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center">
            <Label htmlFor={`toggle-${featureName}`} className="text-base font-medium">
              {title}
            </Label>
            <Badge variant={isEnabled ? "default" : "outline"} className="ml-2">
              {isEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Switch id={`toggle-${featureName}`} checked={isEnabled} onCheckedChange={handleToggle} />
          )}
        </div>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Used {usageCount} times</span>
        {lastUsed && <span>Last used {formatDistanceToNow(new Date(lastUsed), { addSuffix: true })}</span>}
      </div>
    </div>
  )
}
