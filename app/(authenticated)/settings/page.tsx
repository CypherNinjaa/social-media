"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useTheme } from "next-themes"
import { Loader2, LogOut, Moon, Sun, User, Bell, Shield, HelpCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      router.push("/auth")
      toast({
        title: "Signed out successfully",
      })
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="container max-w-2xl py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Account</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Edit Profile</p>
                <p className="text-sm text-gray-500">Update your profile information</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/profile/edit")}>
              Edit
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Bell className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-gray-500">Manage notification preferences</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              Manage
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Privacy</p>
                <p className="text-sm text-gray-500">Control your privacy settings</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              Manage
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Appearance</CardTitle>
          <CardDescription>Customize how SocialSphere looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-gray-500" />
              ) : (
                <Sun className="h-5 w-5 text-gray-500" />
              )}
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-gray-500">Toggle between light and dark themes</p>
              </div>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Help & Support</CardTitle>
          <CardDescription>Get help with SocialSphere</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <HelpCircle className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Help Center</p>
                <p className="text-sm text-gray-500">Get help with using SocialSphere</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              Visit
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Info className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">About</p>
                <p className="text-sm text-gray-500">Learn more about SocialSphere</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              View
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-red-500">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleSignOut} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
