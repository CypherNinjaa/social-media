import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MessageSquare, BookOpen, FileQuestion, LifeBuoy, Mail } from "lucide-react"
import Link from "next/link"

export default function HelpCenterPage() {
  return (
    <div className="container max-w-4xl py-10">
      <PageHeader title="Help Center" description="Find answers to common questions and get support" />

      {/* Search section */}
      <div className="mb-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search for help articles..." className="pl-10 pr-4" />
        </div>
      </div>

      {/* Popular topics */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6">Popular Topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Messaging</h3>
              <p className="text-sm text-muted-foreground">Learn how to use our messaging features</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Getting Started</h3>
              <p className="text-sm text-muted-foreground">New to SocialSphere? Start here</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <FileQuestion className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Account Settings</h3>
              <p className="text-sm text-muted-foreground">Manage your account and privacy</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <Card>
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I create a post?</AccordionTrigger>
                <AccordionContent>
                  To create a post, click on the "Create" button in the navigation bar or go to the "Create" page. You
                  can add text, images, and hashtags to your post. Once you're satisfied with your post, click "Post" to
                  publish it.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>How do I follow other users?</AccordionTrigger>
                <AccordionContent>
                  To follow another user, visit their profile page and click the "Follow" button. You'll start seeing
                  their posts in your feed, and they'll be notified that you followed them.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>How do I change my password?</AccordionTrigger>
                <AccordionContent>
                  To change your password, go to Settings, then select "Account". Click on "Change Password" and follow
                  the instructions to set a new password. You'll need to enter your current password for security
                  verification.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>How do I delete my account?</AccordionTrigger>
                <AccordionContent>
                  To delete your account, go to Settings, then scroll down to the "Danger Zone" section. Click on
                  "Delete Account" and follow the confirmation steps. Please note that account deletion is permanent and
                  cannot be undone.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>How do I report inappropriate content?</AccordionTrigger>
                <AccordionContent>
                  To report inappropriate content, click on the three dots menu on the post or comment, then select
                  "Report". Choose the reason for reporting and submit your report. Our moderation team will review it
                  as soon as possible.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Contact support section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Still Need Help?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LifeBuoy className="h-5 w-5 mr-2" />
                Contact Support
              </CardTitle>
              <CardDescription>Get help from our support team</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                Our support team is available 24/7 to help you with any issues or questions you may have.
              </p>
              <Button asChild>
                <Link href="/support">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email Us
              </CardTitle>
              <CardDescription>Send us an email directly</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                For specific inquiries, you can reach out to us via email. We typically respond within 24 hours.
              </p>
              <Button variant="outline" asChild>
                <a href="mailto:vikashkelly@gmail.com">vikashkelly@gmail.com</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
