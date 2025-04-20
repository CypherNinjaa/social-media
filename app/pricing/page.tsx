import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

export default function PricingPage() {
  return (
    <div className="bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-teal-500 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Simple, Transparent Pricing</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Choose the perfect plan for your social networking needs with no hidden fees.
          </p>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Plans</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Whether you're an individual creator or a large organization, we have a plan that's right for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Basic profile customization</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Connect with friends</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Share photos and updates</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Join communities</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Ad-supported experience</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Sign Up Free</Button>
              </CardFooter>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-blue-500 dark:border-blue-600 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Premium</CardTitle>
                <CardDescription>For active social networkers</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$9.99</span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Everything in Free</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Ad-free experience</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Advanced profile customization</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Premium badges and effects</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Analytics for your content</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600">
                  Get Premium
                </Button>
              </CardFooter>
            </Card>

            {/* Business Plan */}
            <Card className="border-2 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-2xl">Business</CardTitle>
                <CardDescription>For brands and businesses</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$29.99</span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Everything in Premium</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Verified business profile</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Advanced analytics dashboard</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Scheduled posting</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Customer engagement tools</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>Dedicated account manager</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Get Business</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-100 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Have questions about our pricing? Find answers to common questions below.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium mb-2">Can I change plans later?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be applied at the start of your
                next billing cycle.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium mb-2">Is there a free trial for paid plans?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, we offer a 14-day free trial for both our Premium and Business plans so you can try before you
                commit.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium mb-2">Do you offer discounts for annual billing?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can save 20% by choosing annual billing on any of our paid plans.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We accept all major credit cards, PayPal, and in select regions, Apple Pay and Google Pay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Join millions of users already connecting and sharing on our platform.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600"
          >
            Sign Up Now
          </Button>
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
