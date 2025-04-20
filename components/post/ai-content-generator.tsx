"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Sparkles, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import type { ContentGenerationPrompt, GeneratedContent } from "@/lib/ai/ai-service"

interface AIContentGeneratorProps {
  userId: string
  onContentGenerated: (content: string, hashtags?: string[]) => void
  isEnabled: boolean
}

export function AIContentGenerator({ userId, onContentGenerated, isEnabled }: AIContentGeneratorProps) {
  const [topic, setTopic] = useState("")
  const [tone, setTone] = useState("casual")
  const [length, setLength] = useState<"short" | "medium" | "long">("medium")
  const [includeHashtags, setIncludeHashtags] = useState(true)
  const [contentType, setContentType] = useState<"post" | "comment" | "bio">("post")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)

  const handleGenerate = async () => {
    if (!isEnabled) {
      toast({
        title: "AI Feature Unavailable",
        description: "Content generation is not available on your current plan.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          prompt: {
            topic,
            tone,
            length,
            includeHashtags,
            contentType,
          } as ContentGenerationPrompt,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate content")
      }

      const data = await response.json()
      setGeneratedContent(data)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUseContent = () => {
    if (generatedContent) {
      onContentGenerated(generatedContent.text, generatedContent.hashtags)
      setGeneratedContent(null)
      setTopic("")
    }
  }

  if (!isEnabled) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            AI Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>AI content generation is not available on your current plan.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          AI Content Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {generatedContent ? (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-md">
              <p className="whitespace-pre-wrap">{generatedContent.text}</p>
              {generatedContent.hashtags && generatedContent.hashtags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {generatedContent.hashtags.map((tag, index) => (
                    <span key={index} className="text-primary">
                      {tag.startsWith("#") ? tag : `#${tag}`}{" "}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setGeneratedContent(null)}>
                Regenerate
              </Button>
              <Button onClick={handleUseContent}>Use This Content</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 relative">
            <div>
              <Label htmlFor="topic">Topic or Idea</Label>
              <Input
                id="topic"
                placeholder="What would you like to post about?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="relative z-10"
                aria-label="Topic or idea for post"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tone">Tone</Label>
                <Select value={tone} onValueChange={(value) => setTone(value)}>
                  <SelectTrigger id="tone">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="funny">Funny</SelectItem>
                    <SelectItem value="inspirational">Inspirational</SelectItem>
                    <SelectItem value="informative">Informative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="length">Length</Label>
                <Select value={length} onValueChange={(value: "short" | "medium" | "long") => setLength(value)}>
                  <SelectTrigger id="length">
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="hashtags" checked={includeHashtags} onCheckedChange={setIncludeHashtags} />
              <Label htmlFor="hashtags">Include hashtags</Label>
            </div>
          </div>
        )}
      </CardContent>
      {!generatedContent && (
        <CardFooter>
          <Button onClick={handleGenerate} disabled={loading || !topic.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
