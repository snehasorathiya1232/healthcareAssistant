"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import {
  Bell,
  Droplets,
  Moon,
  Footprints,
  Apple,
  HeartPulse,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  ClipboardPlus,
  History,
  Sparkles,
} from "lucide-react"

import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { ReminderEditor } from "@/components/alerts/reminder-editor"
import { WeatherHealthWarnings } from "@/components/alerts/weather-health-warnings"

type Assessment = {
  id: string
  overall_score: number
  summary: string | null
  created_at: string
}

export default function AlertsPage() {
  const router = useRouter()

  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadLatestAssessment()
  }, [])

  const loadLatestAssessment = async () => {
    try {
      setLoading(true)
      setError("")

      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        router.push("/login")
        return
      }

      const { data, error: assessmentError } = await supabase
        .from("health_assessments")
        .select("id, overall_score, summary, created_at")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (assessmentError) {
        console.error("Assessment error:", assessmentError)
      }

      if (data) {
        setAssessment(data)
      } else if (typeof window !== "undefined") {
        const cached = localStorage.getItem("healthAssessmentResult")
        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            if (parsed && parsed.overallScore !== undefined) {
              setAssessment({
                id: parsed.id || "local-latest",
                overall_score: parsed.overallScore,
                summary: parsed.summary,
                created_at: new Date().toISOString(),
              })
            }
          } catch {}
        }
      }
    } catch (err) {
      console.error("Alerts error:", err)
      setError("Something went wrong while loading health tips.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading health alerts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-destructive" />
            <h2 className="text-xl font-bold mb-1">Unable to Load Health Tips</h2>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadLatestAssessment}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Determine score health category
  const score = assessment?.overall_score ?? null
  const isGood = score !== null && score >= 70
  const isModerate = score !== null && score >= 40 && score < 70
  const isHighRisk = score !== null && score < 40

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* -------------------------------- */}
      {/* Top Header Row with Quick Actions */}
      {/* -------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Health Alerts & Reminders
            </h1>
            <p className="text-xs text-muted-foreground">
              Daily hydration, medicine alarms & weather-based preventive care
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="h-8 text-xs">
            <Link href="/history">
              <History className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              History
            </Link>
          </Button>
          <Button size="sm" asChild className="h-8 text-xs gap-1">
            <Link href="/predict">
              <ClipboardPlus className="h-3.5 w-3.5" />
              New Assessment
            </Link>
          </Button>
        </div>
      </div>

      {/* -------------------------------- */}
      {/* 1-View 2-Column Responsive Grid */}
      {/* -------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Reminders (7 cols) */}
        <div className="lg:col-span-7">
          <ReminderEditor />
        </div>

        {/* Right Column: Weather & Clinical Guidance (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Weather Alert Widget */}
          <WeatherHealthWarnings
            assessmentScore={assessment?.overall_score}
            userRiskSummary={assessment?.summary}
          />

          {/* Clinical Guidance & Core Habits Card */}
          {assessment ? (
            <Card className="border-border shadow-xs overflow-hidden">
              <CardHeader className="p-4 pb-2.5 border-b border-border/40 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                        isGood
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : isModerate
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isGood ? (
                        <ShieldCheck className="h-4 w-4" />
                      ) : isModerate ? (
                        <HeartPulse className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">Personalized Clinical Guidance</CardTitle>
                      <p className="text-[11px] text-muted-foreground">Based on your latest assessment</p>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-xs font-semibold px-2 py-0.5 ${
                      isGood
                        ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200"
                        : isModerate
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200"
                    }`}
                  >
                    Score: {assessment.overall_score} / 100
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                {/* Summary note */}
                <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/40">
                  {assessment.summary ||
                    (isGood
                      ? "Healthy vital range detected. Maintain regular daily exercise, hydration, and low-sodium nutrition."
                      : isModerate
                      ? "Moderate risk factors noted. Keep track of morning blood pressure and schedule routine checkups."
                      : "Elevated risk indicators observed. Please consult a qualified doctor for comprehensive clinical evaluation.")}
                </p>

                {/* 4 Core Daily Habits */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Core Preventive Habits
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg border border-border/60 bg-card flex items-center gap-2">
                      <Droplets className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <div>
                        <div className="font-semibold text-[11px]">Hydration</div>
                        <div className="text-[10px] text-muted-foreground">2.5L+ fluids daily</div>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg border border-border/60 bg-card flex items-center gap-2">
                      <Footprints className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <div>
                        <div className="font-semibold text-[11px]">Physical Activity</div>
                        <div className="text-[10px] text-muted-foreground">30 min brisk walk</div>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg border border-border/60 bg-card flex items-center gap-2">
                      <Moon className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                      <div>
                        <div className="font-semibold text-[11px]">Restful Sleep</div>
                        <div className="text-[10px] text-muted-foreground">7-8 hrs regular rest</div>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg border border-border/60 bg-card flex items-center gap-2">
                      <Apple className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <div>
                        <div className="font-semibold text-[11px]">Balanced Diet</div>
                        <div className="text-[10px] text-muted-foreground">Low salt & high fiber</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border shadow-xs bg-muted/20">
              <CardContent className="p-5 text-center">
                <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Get Personalized Health Insights</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-3">
                  Take a 2-minute assessment to unlock custom clinical guidance alongside your reminders.
                </p>
                <Button size="sm" asChild className="h-7 text-xs">
                  <Link href="/predict">Start Assessment</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Minimal Clinical Disclaimer */}
          <div className="p-2.5 rounded-lg border border-border/50 bg-muted/20 text-[11px] text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span>Reminders & tips provide preventive guidance and do not replace professional medical advice.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
