import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

export default function FAQPage() {
  return (
    <div className="bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-teal-500 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Find answers to the most common questions about SocialSphere.
          </p>
        </div>
      </header>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-6">
              <AccordionItem value="item-1" className="border rounded-lg p-2">
                <AccordionTrigger className="text-lg font-medium px-4">What is SocialSphere?</AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400 px-4 pt-2">
                  SocialSphere is a modern social networking platform designed to help people connect, share
                  experiences, and build communities. Our platform combines familiar social features with innovative
                  tools to create a unique and engaging experience.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border rounded-lg p-2">
                <AccordionTrigger className="text-lg font-medium px-4">How do I create an account?</AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400 px-4 pt-2">
                  Creating an account is simple! Visit our homepage and click the "Sign Up" button. You can register
                  using your email address, or sign up with your Google, Facebook, or Apple account for a quicker
                  process.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border rounded-lg p-2">
                <AccordionTrigger className="text-lg font-medium px-4">Is SocialSphere free to use?</AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400 px-4 pt-2">
                  Yes, SocialSphere offers a free tier that includes all the core features you need to connect with
                  friends and share content. We also offer Premium and Business plans with additional features for users
                  who want an enhanced experience.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border rounded-lg p-2">
                <AccordionTrigger className="text-lg font-medium px-4">
                  How does SocialSphere protect my privacy?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400 px-4 pt-2">
                  We take privacy seriously. SocialSphere gives you complete control over who can see your content with
                  granular privacy settings. We use industry-standard encryption to protect your data, and we never sell
                  your personal information to third parties.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border rounded-lg p-2">
                <AccordionTrigger className="text-lg font-medium px-4">
                  Can I use SocialSphere for my business?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400 px-4 pt-2">
                  Our Business plan is specifically designed for brands, creators, and organizations. It includes
                  features like verified profiles, advanced analytics, scheduled posting, and dedicated support to help
                  you grow your online presence.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border rounded-lg p-2">
                <AccordionTrigger className="text-lg font-medium px-4">
                  How do I report inappropriate content?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400 px-4 pt-2">
                  If you encounter content that violates our community guidelines, you can report it by clicking the
                  three dots menu on the post and selecting "Report." Our moderation team reviews all reports and takes
                  appropriate action to maintain a safe environment.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border rounded-lg p-2">
                <AccordionTrigger className="text-lg font-medium px-4">Can I delete my account?</AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400 px-4 pt-2">
                  Yes, you can delete your account at any time. Go to Settings &gt; Account &gt; Delete Account. Please
                  note that account deletion is permanent and removes all your content from our platform.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="border rounded-lg p-2">
                <AccordionTrigger className="text-lg font-medium px-4">
                  What devices can I use SocialSphere on?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400 px-4 pt-2">
                  SocialSphere is available on web browsers, iOS, and Android devices. Our responsive design ensures a
                  great experience regardless of the device you're using.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9" className="border rounded-lg p-2">
                <AccordionTrigger className="text-lg font-medium px-4">How do I contact support?</AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400 px-4 pt-2">
                  For any questions or issues, you can reach our support team through the Help Center in your account
                  settings, or by emailing support@socialsphere.com. Premium and Business users receive priority
                  support.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10" className="border rounded-lg p-2">
                <AccordionTrigger className="text-lg font-medium px-4">
                  Does SocialSphere have a mobile app?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400 px-4 pt-2">
                  Yes, SocialSphere has native mobile apps for both iOS and Android devices. You can download them from
                  the App Store or Google Play Store to enjoy the full SocialSphere experience on your mobile device.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gray-100 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Still have questions?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Our support team is here to help. Reach out to us and we'll get back to you as soon as possible.
          </p>
          <Link href="/contact">
            <Button size="lg">Contact Support</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} SocialSphere. All rights reserved.
          </p>
          <div className="mt-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              Back to Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
