"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

import {
  ClipboardPlus,
  TrendingUp,
  HeartPulse,
  History,
  Loader2,
  CalendarDays,
  ArrowRight,
  Shield,
  Droplets,
  Heart,
  Stethoscope,
  Activity,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { HealthScoreGauge } from "@/components/dashboard/health-score-gauge"
import { RiskCard } from "@/components/dashboard/risk-card"
import { ActivityChart } from "@/components/dashboard/activity-chart"
import { HealthTipCard } from "@/components/dashboard/health-tip-card"

type Assessment = {
  id: string
  overall_score: number
  summary: string | null
  created_at: string
  result_data?: any
}

export default function DashboardPage() {
  const router = useRouter()

  const [userName, setUserName] = useState<string>("User")
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)

      // Check logged-in user
      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        router.push("/login")
        return
      }

      const name =
        userData.user.user_metadata?.full_name ||
        userData.user.email?.split("@")[0] ||
        "there"
      setUserName(name)

      // Get user's assessments
      const { data, error } = await supabase
        .from("health_assessments")
        .select("id, overall_score, summary, created_at, result_data")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false })

      if (!error && data && data.length > 0) {
        setAssessments(data)
      } else {
        // Fallback to local storage if available
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem("healthAssessmentResult")
          if (cached) {
            try {
              const parsed = JSON.parse(cached)
              if (parsed && parsed.overallScore !== undefined) {
                setAssessments([
                  {
                    id: parsed.id || "local-latest",
                    overall_score: parsed.overallScore,
                    summary: parsed.summary,
                    created_at: new Date().toISOString(),
                    result_data: parsed,
                  },
                ])
              }
            } catch {}
          }
        }
      }
    } catch (error) {
      console.error("Dashboard error:", error)
    } finally {
      setLoading(false)
    }
  }

  const latestAssessment = assessments.length > 0 ? assessments[0] : null

  // Extract parsed result data
  let parsedResultData = latestAssessment?.result_data
  if (typeof parsedResultData === "string") {
    try {
      parsedResultData = JSON.parse(parsedResultData)
    } catch {
      parsedResultData = null
    }
  }

  const riskResults = parsedResultData?.riskResults || []

  // Helper to find specific disease risk
  const getDiseaseRisk = (diseaseName: string) => {
    const item = riskResults.find((r: any) =>
      r.disease?.toLowerCase().includes(diseaseName.toLowerCase())
    )
    return {
      risk: (item?.risk || "Low") as "Low" | "Medium" | "High",
      percentage: Number(item?.percentage || 15),
    }
  }

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your health risks, trends, and personalized recommendations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/predict">
              <ClipboardPlus className="h-4 w-4 mr-2" />
              New Assessment
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/history">
              <History className="h-4 w-4 mr-2" />
              History
            </Link>
          </Button>
        </div>
      </div>

      {/* Top Assessment Overview */}
      {latestAssessment ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Score Gauge Card */}
          <Card className="lg:col-span-1 flex flex-col justify-between border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Overall Health Score</CardTitle>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(latestAssessment.created_at)}
                </span>
              </div>
              <CardDescription>
                Calculated by AI from your health indicators
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 flex flex-col items-center justify-center">
              <HealthScoreGauge score={latestAssessment.overall_score} />

              <p className="text-xs text-muted-foreground text-center mt-4 max-w-xs leading-relaxed">
                {latestAssessment.summary ||
                  "Your latest assessment has been processed."}
              </p>

              <Button
                variant="outline"
                size="sm"
                className="mt-5 w-full"
                asChild
              >
                <Link
                  href={
                    latestAssessment.id && !latestAssessment.id.startsWith("local")
                      ? `/results?id=${encodeURIComponent(latestAssessment.id)}`
                      : "/results"
                  }
                >
                  View Full Health Report
                  <ArrowRight className="h-3.5 w-3.5 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Disease Risk Cards Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Disease Risk Breakdown
              </h2>
              <Link
                href="/results"
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
              >
                Detailed breakdown <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <RiskCard
                label="Diabetes"
                risk={getDiseaseRisk("Diabetes").risk}
                percentage={getDiseaseRisk("Diabetes").percentage}
                icon={Droplets}
                trend="down"
              />

              <RiskCard
                label="Heart Disease"
                risk={getDiseaseRisk("Heart").risk}
                percentage={getDiseaseRisk("Heart").percentage}
                icon={Heart}
                trend="down"
              />

              <RiskCard
                label="Kidney Disease"
                risk={getDiseaseRisk("Kidney").risk}
                percentage={getDiseaseRisk("Kidney").percentage}
                icon={Shield}
                trend="down"
              />

              <RiskCard
                label="Liver Disorders"
                risk={getDiseaseRisk("Liver").risk}
                percentage={getDiseaseRisk("Liver").percentage}
                icon={Stethoscope}
                trend="down"
              />

              <RiskCard
                label="Breast Cancer"
                risk={getDiseaseRisk("Cancer").risk}
                percentage={getDiseaseRisk("Cancer").percentage}
                icon={Activity}
                trend="down"
              />

              <Card className="hover:shadow-md transition-shadow border-dashed flex flex-col justify-center items-center p-4 text-center">
                <Sparkles className="h-8 w-8 text-primary mb-2 opacity-80" />
                <p className="text-xs font-semibold text-foreground">
                  AI Continuous Scan
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Re-evaluate anytime with updated vitals
                </p>
                <Button size="sm" variant="ghost" className="mt-2 text-xs h-7" asChild>
                  <Link href="/predict">Retake Test</Link>
                </Button>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State Onboarding Card */
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-teal-500/5 to-blue-500/5">
          <CardContent className="p-8 md:p-12 text-center max-w-2xl mx-auto space-y-5">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
              <HeartPulse className="h-8 w-8" />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold">
              Start Your First Health Risk Assessment
            </h2>

            <p className="text-muted-foreground leading-relaxed">
              Take 3 minutes to enter your basic health markers (age, BMI, blood
              pressure, lifestyle habits) and receive an instant, AI-powered disease
              risk evaluation with doctor-crafted diet and lifestyle guidance.
            </p>

            <div className="pt-2">
              <Button size="lg" className="h-11 px-8 text-base shadow-md" asChild>
                <Link href="/predict">
                  Start Free Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Middle Section: Chart & Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityChart />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Health Recommendations
            </h2>
            <Link
              href="/alerts"
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              All tips <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <HealthTipCard
            category="Hydration"
            title="Daily Hydration Goal"
            description="Aim for 2.5–3 liters of water daily to maintain kidney filtration and stabilize blood pressure."
          />

          <HealthTipCard
            category="Cardiovascular"
            title="30-Minute Brisk Walk"
            description="Regular aerobic exercise lowers resting heart rate and reduces diabetes and heart risk by up to 25%."
          />

          <HealthTipCard
            category="Nutrition"
            title="Fiber & Whole Grains"
            description="Incorporate soluble fiber from oats, flaxseeds, and leafy greens to naturally balance blood sugar."
          />
        </div>
      </div>

      {/* Recent Activity & Assessment History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg">Recent Assessments</CardTitle>
            <CardDescription>
              Your assessment history and health evolution
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/history">
              <History className="h-4 w-4 mr-2" />
              View All ({assessments.length})
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {assessments.length > 0 ? (
            <div className="divide-y divide-border">
              {assessments.slice(0, 4).map((a, idx) => (
                <div
                  key={a.id}
                  className="py-3.5 flex items-center justify-between flex-wrap gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                      {a.overall_score}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Health Score: {a.overall_score}/100
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Assessed on {formatDate(a.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        a.overall_score >= 70
                          ? "bg-green-100 text-green-700"
                          : a.overall_score >= 40
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {a.overall_score >= 70
                        ? "Low Risk"
                        : a.overall_score >= 40
                        ? "Moderate Risk"
                        : "High Risk"}
                    </span>

                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        href={
                          a.id && !a.id.startsWith("local")
                            ? `/results?id=${encodeURIComponent(a.id)}`
                            : "/results"
                        }
                      >
                        View Result
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              No previous assessments recorded yet. Complete your first assessment to start tracking your history.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}