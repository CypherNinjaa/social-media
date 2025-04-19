import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/feed")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
              SocialSphere
            </span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-social-600 transition-colors">
              Features
            </Link>
            <Link href="#about" className="text-sm font-medium hover:text-social-600 transition-colors">
              About
            </Link>
            <Link href="/auth" className="text-sm font-medium hover:text-social-600 transition-colors">
              Sign In
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Connect, Share, Engage with <span className="gradient-text">SocialSphere</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Join our vibrant community where you can connect with friends, share your moments, and engage with
                    content that matters to you.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/auth?tab=register">
                    <Button size="lg" className="bg-social-600 hover:bg-social-700">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button size="lg" variant="outline">
                      Log In
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last">
                <div className="h-full w-full bg-gradient-to-br from-social-400 to-social-600 animate-gradient rounded-xl flex items-center justify-center">
                  <div className="text-white text-4xl font-bold">SocialSphere</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="bg-muted py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-social-100 px-3 py-1 text-sm text-social-800">Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  SocialSphere provides all the tools you need to connect with friends and share your world.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-social-100 mx-auto">
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
                    className="h-10 w-10 text-social-600"
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
              <div className="grid gap-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-social-100 mx-auto">
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
                    className="h-10 w-10 text-social-600"
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
              <div className="grid gap-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-social-100 mx-auto">
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
                    className="h-10 w-10 text-social-600"
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
        </section>
      </main>
      <footer className="border-t bg-white">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12">
          <div className="flex flex-col gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="text-xl font-bold">SocialSphere</span>
            </div>
            <p className="text-sm text-muted-foreground">Connect with friends and share your world.</p>
          </div>
          <div className="ml-auto grid gap-8 sm:grid-cols-3">
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Product</h3>
              <nav className="grid gap-2">
                <Link href="#" className="text-sm hover:underline">
                  Features
                </Link>
                <Link href="#" className="text-sm hover:underline">
                  Pricing
                </Link>
                <Link href="#" className="text-sm hover:underline">
                  FAQ
                </Link>
              </nav>
            </div>
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Company</h3>
              <nav className="grid gap-2">
                <Link href="#" className="text-sm hover:underline">
                  About
                </Link>
                <Link href="#" className="text-sm hover:underline">
                  Blog
                </Link>
                <Link href="#" className="text-sm hover:underline">
                  Careers
                </Link>
              </nav>
            </div>
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Legal</h3>
              <nav className="grid gap-2">
                <Link href="#" className="text-sm hover:underline">
                  Privacy
                </Link>
                <Link href="#" className="text-sm hover:underline">
                  Terms
                </Link>
                <Link href="#" className="text-sm hover:underline">
                  Contact
                </Link>
              </nav>
            </div>
          </div>
        </div>
        <div className="border-t py-6">
          <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">© 2025 SocialSphere. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
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
                  className="h-5 w-5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
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
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
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
                  className="h-5 w-5"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
