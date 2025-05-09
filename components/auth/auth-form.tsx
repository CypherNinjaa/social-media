"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
})

export function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(searchParams?.get("tab") === "register" ? "register" : "login")

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({})

  // Register form state
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerUsername, setRegisterUsername] = useState("")
  const [registerName, setRegisterName] = useState("")
  const [registerErrors, setRegisterErrors] = useState<{
    email?: string
    password?: string
    username?: string
    name?: string
  }>({})

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginErrors({})

    // Validate form
    const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword })
    if (!result.success) {
      const formattedErrors: { email?: string; password?: string } = {}
      result.error.errors.forEach((error) => {
        if (error.path[0] === "email") formattedErrors.email = error.message
        if (error.path[0] === "password") formattedErrors.password = error.message
      })
      setLoginErrors(formattedErrors)
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      router.refresh()
      router.push("/feed")
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Find the handleRegisterSubmit function and update it to ensure username is always provided
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setRegisterErrors({})

    // Validate form
    const result = registerSchema.safeParse({
      email: registerEmail,
      password: registerPassword,
      username: registerUsername,
      name: registerName,
    })

    if (!result.success) {
      const formattedErrors: { email?: string; password?: string; username?: string; name?: string } = {}
      result.error.errors.forEach((error) => {
        const field = error.path[0]
        if (field === "email") formattedErrors.email = error.message
        if (field === "password") formattedErrors.password = error.message
        if (field === "username") formattedErrors.username = error.message
        if (field === "name") formattedErrors.name = error.message
      })
      setRegisterErrors(formattedErrors)
      setIsLoading(false)
      return
    }

    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

      // Ensure username is never empty by using email prefix as fallback
      const usernameToUse =
        registerUsername.trim() || registerEmail.split("@")[0] + "_" + Math.floor(Math.random() * 10000)

      const { error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
          data: {
            username: usernameToUse, // Use the validated username or fallback
            name: registerName,
          },
        },
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Check your email",
        description: "We've sent you a verification link. Please check your email to verify your account.",
      })
      router.push("/auth/verify")
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-t-lg rounded-b-none bg-gray-100/50 dark:bg-gray-800/50 p-1">
          <TabsTrigger
            value="login"
            className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm transition-all"
          >
            Login
          </TabsTrigger>
          <TabsTrigger
            value="register"
            className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm transition-all"
          >
            Register
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="mt-0 border-none">
          <div className="p-6">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Enter your credentials to access your account
              </p>
            </div>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="bg-white dark:bg-gray-950"
                />
                {loginErrors.email && <p className="text-sm text-red-500">{loginErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="bg-white dark:bg-gray-950"
                />
                {loginErrors.password && <p className="text-sm text-red-500">{loginErrors.password}</p>}
              </div>

              <div className="text-right">
                <Link href="/auth/reset-password" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white dark:bg-gray-950 text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="bg-white dark:bg-gray-950"
                  onClick={async () => {
                    setIsLoading(true)
                    try {
                      const { error } = await supabase.auth.signInWithOAuth({
                        provider: "google",
                        options: {
                          redirectTo: `${window.location.origin}/auth/callback`,
                        },
                      })
                      if (error) throw error
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to sign in with Google. Please try again.",
                        variant: "destructive",
                      })
                      setIsLoading(false)
                    }
                  }}
                  disabled={isLoading}
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path
                        fill="#4285F4"
                        d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                      />
                      <path
                        fill="#34A853"
                        d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                      />
                    </g>
                  </svg>
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="bg-white dark:bg-gray-950"
                  onClick={async () => {
                    setIsLoading(true)
                    try {
                      const { error } = await supabase.auth.signInWithOAuth({
                        provider: "facebook",
                        options: {
                          redirectTo: `${window.location.origin}/auth/callback`,
                        },
                      })
                      if (error) throw error
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to sign in with Facebook. Please try again.",
                        variant: "destructive",
                      })
                      setIsLoading(false)
                    }
                  }}
                  disabled={isLoading}
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      fill="currentColor"
                    />
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="register" className="mt-0 border-none">
          <div className="p-6">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold">Create an account</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Join our community and start sharing</p>
            </div>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="register-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="email@example.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="bg-white dark:bg-gray-950"
                />
                {registerErrors.email && <p className="text-sm text-red-500">{registerErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="register-username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="register-username"
                  placeholder="johndoe"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  className="bg-white dark:bg-gray-950"
                />
                {registerErrors.username && <p className="text-sm text-red-500">{registerErrors.username}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="register-name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="register-name"
                  placeholder="John Doe"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="bg-white dark:bg-gray-950"
                />
                {registerErrors.name && <p className="text-sm text-red-500">{registerErrors.name}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="register-password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="bg-white dark:bg-gray-950"
                />
                {registerErrors.password && <p className="text-sm text-red-500">{registerErrors.password}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs>

      <div className="p-6 pt-0 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          By continuing, you agree to our{" "}
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  )
}
