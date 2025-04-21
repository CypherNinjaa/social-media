"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isProcessingCode, setIsProcessingCode] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams?.get("code")
  const type = searchParams?.get("type")

  useEffect(() => {
    // Process code parameter if present (for password reset or OAuth)
    const processCode = async () => {
      if (code) {
        setIsProcessingCode(true)
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()

        try {
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)

          if (error) {
            console.error("Error exchanging code for session:", error)
            throw error
          }

          // If this is a recovery (password reset), redirect to update password page
          if (
            type === "recovery" ||
            // Sometimes Supabase doesn't include the type parameter, so we check the session
            (data?.user?.aud === "authenticated" && data?.user?.email_confirmed_at)
          ) {
            router.push("/auth/update-password")
            return
          }

          // Otherwise, redirect to feed for normal sign-ins
          if (data?.session) {
            router.push("/feed")
            return
          }
        } catch (error) {
          console.error("Error processing code:", error)
          // If there's an error, we'll just continue to show the homepage
        } finally {
          setIsProcessingCode(false)
        }
      }

      // Check authentication status on the client side
      const checkAuth = async () => {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        const { data } = await supabase.auth.getSession()

        if (data.session) {
          router.push("/feed")
        } else {
          setIsLoggedIn(false)
        }
      }

      if (!code) {
        checkAuth()
      }
    }

    processCode()
  }, [code, type, router])

  // Show loading state while processing code
  if (isProcessingCode) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Processing your request</h2>
          <p className="text-muted-foreground">Please wait while we set up your account...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white dark:bg-gray-950 sticky top-0 z-50 backdrop-blur-sm bg-white/80 dark:bg-gray-950/80">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between relative">
          <div className="absolute inset-0 left-1/4 w-1/2 h-full bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 blur-xl"></div>
          <div className="flex items-center gap-3 z-10">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center shadow-md transform transition-transform hover:scale-110 hover:shadow-lg">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
              SocialSphere
            </span>
          </div>
          <nav className="hidden md:flex gap-8 z-10">
            <Link href="#features" className="text-sm font-medium relative group">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 group-hover:from-pink-500 group-hover:to-purple-500 transition-all duration-300">
                Features
              </span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="#about" className="text-sm font-medium relative group">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 group-hover:from-purple-500 group-hover:to-blue-500 transition-all duration-300">
                About
              </span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/auth" className="text-sm font-medium relative group">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 group-hover:from-blue-500 group-hover:to-teal-500 transition-all duration-300">
                Sign In
              </span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-teal-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden z-10 p-2 rounded-full bg-white dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-expanded={isMenuOpen}
            aria-label="Toggle mobile menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="4" x2="20" y1="12" y2="12"></line>
                  <line x1="4" x2="20" y1="6" y2="6"></line>
                  <line x1="4" x2="20" y1="18" y2="18"></line>
                </>
              )}
            </svg>
          </button>
        </div>
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-white dark:bg-gray-950 pt-16 px-4">
            <nav className="flex flex-col gap-6 items-center py-8">
              <Link
                href="#features"
                className="text-lg font-medium relative group hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 group-hover:from-pink-500 group-hover:to-purple-500 transition-all duration-300">
                  Features
                </span>
              </Link>
              <Link
                href="#about"
                className="text-lg font-medium relative group hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 group-hover:from-purple-500 group-hover:to-blue-500 transition-all duration-300">
                  About
                </span>
              </Link>
              <Link
                href="/auth"
                className="text-lg font-medium relative group hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 group-hover:from-blue-500 group-hover:to-teal-500 transition-all duration-300">
                  Sign In
                </span>
              </Link>
              <div className="mt-6 flex flex-col gap-4 w-full">
                <Link href="/auth?tab=register" className="w-full" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:opacity-90 transition-all"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link href="/auth" className="w-full" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    Log In
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-16 xl:grid-cols-2 overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
              <div
                className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-500 rounded-full opacity-20 blur-3xl animate-pulse"
                style={{ animationDelay: "2s" }}
              ></div>

              {/* Content column */}
              <div className="relative flex flex-col justify-center space-y-6 z-10">
                <div className="space-y-4">
                  <div className="inline-block rounded-lg border border-gray-200 dark:border-gray-800 mb-4">
                    <span className="block px-3 py-1 text-sm font-medium">Welcome to SocialSphere</span>
                  </div>
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Connect, Share, Engage with{" "}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
                      SocialSphere
                    </span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed">
                    Join our vibrant community where you can connect with friends, share your moments, and engage with
                    content that matters to you.
                  </p>
                </div>
                <div className="flex flex-col gap-4 min-[400px]:flex-row">
                  <Link href="/auth?tab=register">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all transform hover:-translate-y-1"
                    >
                      Log In
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Image column with floating animation */}
              <div className="relative mx-auto aspect-video overflow-hidden rounded-xl sm:w-full lg:order-last z-10">
                <div className="h-full w-full rounded-xl shadow-2xl transform hover:scale-[1.02] transition-all duration-300 animate-float relative overflow-hidden">
                  <img
                    src="/global-connections.png"
                    alt="SocialSphere - Connect with people around the world"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                    <div className="text-white text-5xl font-bold drop-shadow-lg">SocialSphere</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="relative overflow-hidden py-16 md:py-24 lg:py-32">
          {/* Background elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent"></div>

          {/* Decorative circles */}
          <div className="absolute top-24 right-10 w-64 h-64 bg-pink-200 dark:bg-pink-900/20 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-24 left-10 w-64 h-64 bg-blue-200 dark:bg-blue-900/20 rounded-full opacity-20 blur-3xl"></div>

          <div className="container relative z-10 px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-flex items-center justify-center p-1 bg-white dark:bg-gray-800 rounded-full shadow-md mb-4">
                <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Features
                </div>
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl max-w-3xl">
                Everything You Need to{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
                  Connect & Share
                </span>
              </h2>
              <p className="max-w-[800px] text-muted-foreground md:text-xl/relaxed">
                SocialSphere provides all the tools you need to connect with friends and share your world.
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl items-center gap-8 py-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-pink-500 to-orange-500 transform origin-left scale-x-0 transition-transform group-hover:scale-x-100"></div>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-orange-100 dark:from-pink-900/20 dark:to-orange-900/20 mb-2 group-hover:scale-110 transition-transform">
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
                      className="h-10 w-10 text-pink-500"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Connect with Friends</h3>
                  <p className="text-muted-foreground">
                    Find and connect with friends, family, and like-minded individuals from around the world.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-blue-500 transform origin-left scale-x-0 transition-transform group-hover:scale-x-100"></div>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 mb-2 group-hover:scale-110 transition-transform">
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
                      className="h-10 w-10 text-purple-500"
                    >
                      <path d="M21 15V6"></path>
                      <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
                      <path d="M12 12H3"></path>
                      <path d="M16 6H3"></path>
                      <path d="M12 18H3"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Share Your World</h3>
                  <p className="text-muted-foreground">
                    Post updates, photos, and stories to share your experiences with your network.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-green-500 transform origin-left scale-x-0 transition-transform group-hover:scale-x-100"></div>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/20 dark:to-green-900/20 mb-2 group-hover:scale-110 transition-transform">
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
                      className="h-10 w-10 text-blue-500"
                    >
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Engage with Content</h3>
                  <p className="text-muted-foreground">
                    Like, comment, and interact with posts from your friends and communities.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-16 flex justify-center">
              <Link href="/auth?tab=register">
                <Button className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-white px-8 py-2 rounded-full">
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
        {/* Top decorative line */}
        <div className="w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>

        <div className="container mx-auto px-4">
          {/* Main footer content with improved styling */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12 md:py-16">
            {/* Brand section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-full p-2">
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
                    className="text-white"
                  >
                    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">SocialSphere</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Connect, share, and discover with our innovative social platform.
              </p>
              <div className="flex gap-4 mt-2">
                <a href="#" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>

            {/* Product links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/features"
                    className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Company</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright section */}
        <div className="border-t border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">© 2025 SocialSphere. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <Link
                href="#"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="mx-2 text-gray-400">•</span>
              <Link
                href="#"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
