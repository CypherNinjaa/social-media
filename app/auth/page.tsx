import { AuthForm } from "@/components/auth/auth-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AuthPage() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/feed")
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 z-0"></div>

      {/* Animated circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-12 w-full max-w-md">
        {/* Logo and title */}
        <Link href="/" className="flex items-center gap-3 mb-8 group">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
              SocialSphere
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">Connect with the world</span>
          </div>
        </Link>

        {/* Auth form with enhanced styling */}
        <div className="w-full backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <AuthForm />
        </div>

        {/* Back to home link */}
        <Link
          href="/"
          className="mt-8 text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="m12 19-7-7 7-7"></path>
            <path d="M19 12H5"></path>
          </svg>
          Back to home
        </Link>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
    </div>
  )
}
