import { AuthForm } from "@/components/auth/auth-form"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AuthPage() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/feed")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-social-500 to-social-700 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2">SocialSphere</h1>
        <p className="text-white/80">Connect with friends and the world around you</p>
      </div>
      <AuthForm />
    </div>
  )
}
