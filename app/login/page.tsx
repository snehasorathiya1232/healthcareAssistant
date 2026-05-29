"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  // ADD these imports at the top

// REPLACE the handleSubmit function with this:
const [error, setError] = useState("")

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  setError("")

  const result = await signIn("credentials", {
    email: formData.email,
    password: formData.password,
    redirect: false, // don't auto-redirect so we can handle errors
  })

  if (result?.error) {
    // Show a generic error (don't say "wrong password" specifically — security)
    setError("Invalid email or password. Please try again.")
    setIsLoading(false)
    return
  }

  // Login successful — go to dashboard
  router.push("/dashboard")
}
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">HealthPredict</span>
          </Link>

          <Card className="border-0 shadow-none md:border md:shadow-sm">
            <CardHeader className="px-0 md:px-6">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to continue your health journey
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 md:px-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      suppressHydrationWarning
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">
                      Password
                    </label>
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full h-11 pl-10 pr-12 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  <label htmlFor="remember" className="text-sm text-muted-foreground">
                    Remember me for 30 days
                  </label>
                </div>
                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                      {error}
                    </div>
                  )}

                {/* Submit Button */}
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

            

                {/* Sign Up Link */}
                <p className="text-center text-sm text-muted-foreground">
                  {"Don't have an account? "}
                  <Link href="/signup" className="font-medium text-primary hover:underline">
                    Sign up
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-primary/5 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="mb-8 relative">
            <div className="w-64 h-64 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="w-32 h-32 text-primary animate-pulse" />
            </div>
            <div className="absolute top-0 right-8 w-16 h-16 rounded-full bg-risk-low/20 flex items-center justify-center animate-float">
              <span className="text-2xl font-bold text-risk-low">82</span>
            </div>
            <div className="absolute bottom-8 left-8 w-20 h-20 rounded-xl bg-card shadow-lg p-3 animate-float" style={{ animationDelay: "0.5s" }}>
              <div className="text-xs text-muted-foreground mb-1">Heart</div>
              <div className="text-sm font-semibold text-risk-low">Low Risk</div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Your Health Dashboard Awaits
          </h2>
          <p className="text-muted-foreground">
            Track your health metrics, view personalized recommendations, and stay on top of your wellness journey.
          </p>
        </div>
      </div>
    </div>
  )
}
