"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  HeartPulse,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react"

export default function SignupPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.")
      return
    }

    setLoading(true)
    setMessage("")

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setMessage("Account created successfully!")

    setTimeout(() => {
      router.push("/login")
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 rounded-2xl">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <HeartPulse className="h-8 w-8 text-blue-600" />
          </div>

          <CardTitle className="text-3xl font-bold">
            Create Account
          </CardTitle>

          <CardDescription>
            Join AI Healthcare Assistant
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignup} className="space-y-5">

            <div className="relative">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Full Name"
                className="pl-10 h-11"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Email Address"
                className="pl-10 h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="pl-10 pr-10 h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="pl-10 h-11"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {message && (
              <p className="text-sm text-center text-red-500">
                {message}
              </p>
            )}

            <Button className="w-full h-11" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}