"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  HeartPulse,
  Activity,
  History,
  LogOut,
  Edit2,
  Check,
  Loader2,
  Lock,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function ProfilePage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [fullName, setFullName] = useState("")
  const [isEditingName, setIsEditingName] = useState(false)
  const [updatingName, setUpdatingName] = useState(false)
  const [nameMessage, setNameMessage] = useState("")

  const [assessmentCount, setAssessmentCount] = useState(0)
  const [latestAssessment, setLatestAssessment] = useState<any>(null)
  const [lastInputData, setLastInputData] = useState<any>(null)

  const [passwordResetSent, setPasswordResetSent] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)

      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        router.push("/login")
        return
      }

      setUser(userData.user)
      setFullName(
        userData.user.user_metadata?.full_name ||
          userData.user.email?.split("@")[0] ||
          ""
      )

      // Fetch assessments
      const { data: assessments, error: assessError } = await supabase
        .from("health_assessments")
        .select("id, overall_score, summary, input_data, created_at")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false })

      if (!assessError && assessments) {
        setAssessmentCount(assessments.length)
        if (assessments.length > 0) {
          setLatestAssessment(assessments[0])
          setLastInputData(assessments[0].input_data || null)
        }
      }
    } catch (err) {
      console.error("Profile load error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateName = async () => {
    if (!fullName.trim()) return
    setUpdatingName(true)
    setNameMessage("")

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() },
      })

      if (error) {
        setNameMessage("Failed to update name: " + error.message)
      } else {
        setNameMessage("Name updated successfully!")
        setIsEditingName(false)
        setTimeout(() => setNameMessage(""), 3000)
      }
    } catch {
      setNameMessage("Error updating name.")
    } finally {
      setUpdatingName(false)
    }
  }

  const handleSendPasswordReset = async () => {
    if (!user?.email) return
    setResettingPassword(true)

    try {
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/login`
          : undefined

      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: redirectUrl,
      })

      if (!error) {
        setPasswordResetSent(true)
        setTimeout(() => setPasswordResetSent(false), 5000)
      } else {
        alert(error.message)
      }
    } catch {
      alert("Failed to send password reset email.")
    } finally {
      setResettingPassword(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "Recently"

  // Calculate BMI if height and weight exist
  const height = Number(lastInputData?.height || 0)
  const weight = Number(lastInputData?.weight || 0)
  const bmi =
    height > 0 && weight > 0
      ? (weight / Math.pow(height / 100, 2)).toFixed(1)
      : null

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Profile Header Banner */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-teal-600 via-teal-700 to-blue-700 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-8 -translate-y-8">
          <HeartPulse size={260} />
        </div>

        <CardContent className="p-6 md:p-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-3xl font-bold shadow-inner">
                {fullName.charAt(0).toUpperCase() || "U"}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {fullName || "User Profile"}
                  </h1>
                  <span className="bg-white/20 text-xs px-2.5 py-0.5 rounded-full font-medium backdrop-blur">
                    Active Member
                  </span>
                </div>

                <p className="text-teal-100 flex items-center gap-1.5 mt-1 text-sm">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </p>

                <p className="text-teal-100/80 flex items-center gap-1.5 mt-0.5 text-xs">
                  <Calendar className="h-3.5 w-3.5" />
                  Member since {memberSince}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Assessments
              </p>
              <p className="text-2xl font-bold text-foreground">
                {assessmentCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Health Score
              </p>
              <p className="text-2xl font-bold text-primary">
                {latestAssessment?.overall_score ?? "—"}
                {latestAssessment?.overall_score !== undefined && (
                  <span className="text-xs font-normal text-muted-foreground">
                    /100
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Health Status
              </p>
              <p className="text-lg font-bold text-foreground">
                {latestAssessment?.overall_score >= 70
                  ? "Good"
                  : latestAssessment?.overall_score >= 40
                  ? "Moderate"
                  : latestAssessment?.overall_score !== undefined
                  ? "Attention"
                  : "Not tested"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <History className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                BMI Index
              </p>
              <p className="text-2xl font-bold text-foreground">
                {bmi ?? "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-teal-600" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Manage your profile name and login details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Full Name
              </label>

              {isEditingName ? (
                <div className="flex gap-2">
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-10"
                    placeholder="Enter your name"
                  />
                  <Button
                    size="sm"
                    onClick={handleUpdateName}
                    disabled={updatingName}
                  >
                    {updatingName ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingName(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <span className="font-medium">{fullName || "Not provided"}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingName(true)}
                  >
                    <Edit2 className="h-4 w-4 mr-1 text-muted-foreground" />
                    Edit
                  </Button>
                </div>
              )}

              {nameMessage && (
                <p className="text-xs text-green-600 mt-1">{nameMessage}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Email Address
              </label>
              <div className="p-3 rounded-lg border bg-muted/30 text-sm font-medium text-muted-foreground">
                {user?.email}
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Password & Security
              </label>
              <div className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  ••••••••••••
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendPasswordReset}
                  disabled={resettingPassword}
                >
                  {resettingPassword ? "Sending..." : "Send Reset Email"}
                </Button>
              </div>
              {passwordResetSent && (
                <p className="text-xs text-green-600 mt-1">
                  Password reset link sent to your email address!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Health Profile / Vitals Snapshot */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-teal-600" />
              Latest Health Metrics
            </CardTitle>
            <CardDescription>
              Recorded during your most recent assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lastInputData ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border bg-card">
                  <p className="text-xs text-muted-foreground">Age</p>
                  <p className="text-lg font-bold">{lastInputData.age || "—"} yrs</p>
                </div>

                <div className="p-3 rounded-lg border bg-card">
                  <p className="text-xs text-muted-foreground">Gender</p>
                  <p className="text-lg font-bold capitalize">
                    {lastInputData.gender || "—"}
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-card">
                  <p className="text-xs text-muted-foreground">Height / Weight</p>
                  <p className="text-lg font-bold">
                    {lastInputData.height || "—"} cm / {lastInputData.weight || "—"} kg
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-card">
                  <p className="text-xs text-muted-foreground">Blood Pressure</p>
                  <p className="text-lg font-bold">
                    {lastInputData.bloodPressureSystolic || "—"}/
                    {lastInputData.bloodPressureDiastolic || "—"} mmHg
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-card">
                  <p className="text-xs text-muted-foreground">Blood Sugar</p>
                  <p className="text-lg font-bold">
                    {lastInputData.bloodSugar || "—"} mg/dL
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-card">
                  <p className="text-xs text-muted-foreground">Cholesterol</p>
                  <p className="text-lg font-bold">
                    {lastInputData.cholesterol || "—"} mg/dL
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground space-y-3">
                <Activity className="h-10 w-10 mx-auto opacity-40" />
                <p className="text-sm">
                  No health metrics recorded yet. Take an assessment to record your vitals.
                </p>
                <Button size="sm" asChild>
                  <Link href="/predict">Start Assessment</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/predict">
              <HeartPulse className="h-4 w-4 mr-2" />
              New Assessment
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/history">
              <History className="h-4 w-4 mr-2" />
              Assessment History
            </Link>
          </Button>
        </div>

        <Button variant="ghost" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
