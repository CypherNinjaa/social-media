import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { AIChatbot } from "@/components/support/ai-chatbot"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, MessageSquare } from "lucide-react"
import Link from "next/link"
import { checkAIFeatureAvailability } from "@/lib/ai/ai-service"

export default async function SupportPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  // Check if AI chatbot is enabled
  const aiStatus = await checkAIFeatureAvailability(session.user.id, "chatbot")

  return (
    <>
      <PageHeader title="Support" description="Get help with SocialSphere" />

      <div className="container max-w-4xl py-10">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="md:col-span-2">
            <AIChatbot userId={session.user.id} isEnabled={aiStatus.isEnabled} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email Support
              </CardTitle>
              <CardDescription>Contact our support team via email</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">Our support team typically responds within 24 hours during business days.</p>
              <Button asChild>
                <Link href="mailto:support@socialsphere.example">Email Support</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Help Center
              </CardTitle>
              <CardDescription>Browse our knowledge base</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">Find answers to common questions in our comprehensive help center.</p>
              <Button variant="outline" asChild>
                <Link href="/help">Visit Help Center</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
