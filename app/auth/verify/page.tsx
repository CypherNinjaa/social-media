import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-social-500 to-social-700 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We've sent you a verification link. Please check your email to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Once verified, you'll be able to sign in to your account.</p>
        </CardContent>
      </Card>
    </div>
  )
}
