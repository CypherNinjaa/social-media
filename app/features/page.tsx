import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FeaturesPage() {
  return (
    <div className="bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-teal-500 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Powerful Features for Modern Social Networking
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Discover all the innovative tools and capabilities that make SocialSphere the perfect platform for
            connecting with friends and sharing your world.
          </p>
        </div>
      </header>

      {/* Main Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Core Features</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              SocialSphere combines the best social networking features with innovative new tools to create a unique
              experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-600 dark:text-blue-400"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <CardTitle>Advanced Profiles</CardTitle>
                <CardDescription>Create rich, customizable profiles that showcase your personality</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Express yourself with customizable profiles featuring dynamic content sections, themes, and privacy
                  controls that put you in charge of your online presence.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-teal-600 dark:text-teal-400"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <CardTitle>Real-time Messaging</CardTitle>
                <CardDescription>Connect instantly with friends through our powerful messaging system</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Enjoy seamless conversations with real-time messaging, read receipts, rich media sharing, and
                  end-to-end encryption for secure communications.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-purple-600 dark:text-purple-400"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </div>
                <CardTitle>Rich Media Sharing</CardTitle>
                <CardDescription>Share photos, videos, and more with enhanced creative tools</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Express yourself through high-quality photo and video sharing with built-in editing tools, filters,
                  and creative options to make your content stand out.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-amber-600 dark:text-amber-400"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <CardTitle>Stories & Reels</CardTitle>
                <CardDescription>Share moments and create engaging short-form video content</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Capture attention with ephemeral stories that disappear after 24 hours and create trending short-form
                  videos with our intuitive reels feature.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-pink-600 dark:text-pink-400"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </div>
                <CardTitle>Smart Feed</CardTitle>
                <CardDescription>Discover content you'll love with our intelligent algorithm</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Our advanced algorithm learns your preferences to deliver a personalized feed of content you'll enjoy,
                  while still keeping you connected to friends and family.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-600 dark:text-green-400"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <CardTitle>Privacy Controls</CardTitle>
                <CardDescription>Take control of your data with advanced privacy settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Comprehensive privacy controls let you decide exactly who sees your content, with granular settings
                  for posts, stories, and profile information.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to experience SocialSphere?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Join millions of users already connecting and sharing on our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600"
            >
              Sign Up Now
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
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
