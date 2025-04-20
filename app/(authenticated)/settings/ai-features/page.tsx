import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AIFeatureToggle } from "@/components/settings/ai-feature-toggle"
import { Sparkles } from "lucide-react"

export default async function AIFeaturesPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (!profile) {
    redirect("/auth")
  }

  // Check AI feature status
  const { data: aiFeatures } = await supabase.from("ai_feature_status").select("*").eq("user_id", session.user.id)

  // Create a map of feature status
  const featureStatus: Record<string, { isEnabled: boolean; usageCount: number; lastUsed: string | null }> = {}

  if (aiFeatures) {
    aiFeatures.forEach((feature) => {
      featureStatus[feature.feature_name] = {
        isEnabled: feature.is_enabled,
        usageCount: feature.usage_count,
        lastUsed: feature.last_used,
      }
    })
  }

  // Default values if no record exists
  const getFeatureStatus = (featureName: string) => {
    return featureStatus[featureName] || { isEnabled: true, usageCount: 0, lastUsed: null }
  }

  return (
    <>
      <PageHeader
        title="AI Features"
        description="Manage your AI-powered features and preferences"
        backUrl="/settings"
      />

      <div className="container max-w-4xl py-10">
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                AI Features Overview
              </CardTitle>
              <CardDescription>Control which AI-powered features are active on your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AIFeatureToggle
                userId={session.user.id}
                featureName="recommendations"
                title="Personalized Recommendations"
                description="Get content recommendations tailored to your interests and activity"
                isEnabled={getFeatureStatus("recommendations").isEnabled}
                usageCount={getFeatureStatus("recommendations").usageCount}
                lastUsed={getFeatureStatus("recommendations").lastUsed}
              />

              <AIFeatureToggle
                userId={session.user.id}
                featureName="content_generation"
                title="AI Content Generation"
                description="Generate post ideas, captions, and comments with AI assistance"
                isEnabled={getFeatureStatus("content_generation").isEnabled}
                usageCount={getFeatureStatus("content_generation").usageCount}
                lastUsed={getFeatureStatus("content_generation").lastUsed}
              />

              <AIFeatureToggle
                userId={session.user.id}
                featureName="moderation"
                title="Content Moderation"
                description="Automatically analyze content for sentiment and appropriateness"
                isEnabled={getFeatureStatus("moderation").isEnabled}
                usageCount={getFeatureStatus("moderation").usageCount}
                lastUsed={getFeatureStatus("moderation").lastUsed}
              />

              <AIFeatureToggle
                userId={session.user.id}
                featureName="chatbot"
                title="AI Support Assistant"
                description="Get help from our AI-powered support assistant"
                isEnabled={getFeatureStatus("chatbot").isEnabled}
                usageCount={getFeatureStatus("chatbot").usageCount}
                lastUsed={getFeatureStatus("chatbot").lastUsed}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Preferences</CardTitle>
              <CardDescription>Customize how AI features work for you</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                AI preferences will be available in a future update. Stay tuned for more personalization options!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
