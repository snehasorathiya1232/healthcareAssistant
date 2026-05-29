"use client"

import Link from "next/link"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from "lucide-react"

const passwordRequirements = [
  { label: "At least 8 characters", check: (p: string) => p.length >= 8 },
  { label: "Contains a number", check: (p: string) => /\d/.test(p) },
  { label: "Contains uppercase letter", check: (p: string) => /[A-Z]/.test(p) },
]

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    agreeToTerms: false
  })


const [error, setError] = useState("")

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)
  setError("")

  try {
   
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Signup failed")
      setIsLoading(false)
      return
    }

    // Step 2: Auto-login after successful signup
    const loginResult = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false, // handle redirect ourselves
    })

    if (loginResult?.error) {
      setError("Account created but login failed. Please go to login page.")
      setIsLoading(false)
      return
    }

    // Step 3: Redirect to dashboard
    router.push("/dashboard")
  } catch {
    setError("Something went wrong. Please try again.")
    setIsLoading(false)
  }
}

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-primary/5 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="mb-8 relative">
            <div className="w-64 h-64 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4 p-8">
                <div className="h-20 rounded-lg bg-card shadow-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Diabetes</div>
                    <div className="text-lg font-bold text-risk-low">Low</div>
                  </div>
                </div>
                <div className="h-20 rounded-lg bg-card shadow-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Heart</div>
                    <div className="text-lg font-bold text-risk-medium">Med</div>
                  </div>
                </div>
                <div className="h-20 rounded-lg bg-card shadow-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Kidney</div>
                    <div className="text-lg font-bold text-risk-low">Low</div>
                  </div>
                </div>
                <div className="h-20 rounded-lg bg-card shadow-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Liver</div>
                    <div className="text-lg font-bold text-risk-low">Low</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Start Your Health Journey
          </h2>
          <p className="text-muted-foreground">
            Get personalized health predictions and recommendations based on AI analysis of your health data.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
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
              <CardTitle className="text-2xl">Create an account</CardTitle>
              <CardDescription>
                Start your free health assessment in minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 md:px-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>
                </div>

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
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full h-11 pl-10 pr-12 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  <div className="space-y-1 pt-2">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <div className={`h-4 w-4 rounded-full flex items-center justify-center ${req.check(formData.password) ? 'bg-risk-low' : 'bg-muted'}`}>
                          <Check className={`h-3 w-3 ${req.check(formData.password) ? 'text-white' : 'text-muted-foreground'}`} />
                        </div>
                        <span className={req.check(formData.password) ? 'text-foreground' : 'text-muted-foreground'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start gap-2">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                    className="h-4 w-4 mt-0.5 rounded border-input accent-primary"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the{" "}
                    <Link href="#" className="text-primary hover:underline">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
                  </label>
                </div>
                {/* Add this right before the Submit Button */}
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
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                {/* Sign In Link */}
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="font-medium text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
