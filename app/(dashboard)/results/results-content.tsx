"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"

import {
  Heart,
  Droplets,
  Shield,
  Activity,
  Stethoscope,
  Download,
  Share2,
  RefreshCw,
  ChevronRight,
  Apple,
  Dumbbell,
  Pill,
  AlertTriangle,
  Loader2,
  Sparkles,
} from "lucide-react"

import { RiskMeter } from "@/components/results/risk-meter"
import { RecommendationCard } from "@/components/results/recommendation-card"
import { RiskFactorChart } from "@/components/results/risk-factor-chart"

import { supabase } from "@/lib/supabase"

const iconMap: Record<string, any> = {
  Diabetes: Droplets,
  "Heart Disease": Heart,
  "Kidney Disease": Shield,
  "Liver Disorders": Stethoscope,
  "Breast Cancer": Activity,
  "Emergency Health Risk": AlertTriangle,
}

export default function ResultsContent() {
  const router = useRouter()

  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDemoUser, setIsDemoUser] = useState(false)

  useEffect(() => {
    loadResult()
  }, [])

  const loadResult = async () => {
    try {
      setLoading(true)
      setError("")

      // Check logged-in user
      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !userData?.user) {
        // If not logged in, check if a demo assessment result exists in localStorage
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem("healthAssessmentResult")
          if (cached) {
            try {
              const parsed = JSON.parse(cached)
              if (parsed && (parsed.overallScore !== undefined || parsed.riskResults)) {
                setResult(parsed)
                setIsDemoUser(true)
                setLoading(false)
                return
              }
            } catch (err) {
              console.error("Error parsing demo result:", err)
            }
          }
        }

        router.push("/login")
        return
      }

      setIsDemoUser(false)

      // Get assessment ID from browser URL
      const params = new URLSearchParams(
        window.location.search
      )

      const assessmentId = params.get("id")

      // Build query
      let query = supabase
        .from("health_assessments")
        .select("*")
        .eq(
          "user_id",
          userData.user.id
        )

      // Specific assessment
      if (assessmentId) {
        query = query.eq(
          "id",
          assessmentId
        )
      } else {
        // Latest assessment
        query = query
          .order("created_at", {
            ascending: false,
          })
          .limit(1)
      }

      const {
        data,
        error: assessmentError,
      } = await query.maybeSingle()

      if (assessmentError || !data) {
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem("healthAssessmentResult")
          if (cached) {
            try {
              const parsed = JSON.parse(cached)
              if (parsed && (parsed.overallScore !== undefined || parsed.riskResults)) {
                setResult(parsed)
                return
              }
            } catch {}
          }
        }

        if (assessmentError) {
          console.error(
            "Assessment loading error:",
            assessmentError
          )
        }

        setError(
          "No assessment found. Please complete an assessment first."
        )

        return
      }

      // Get result_data
      let savedResult =
        data.result_data

      // If result_data is JSON string
      if (
        typeof savedResult ===
        "string"
      ) {
        try {
          savedResult =
            JSON.parse(savedResult)
        } catch {
          savedResult = null
        }
      }

      if (!savedResult) {
        setError(
          "Assessment result data is missing."
        )

        return
      }

      setResult(savedResult)
    } catch (err) {
      console.error(
        "Results error:",
        err
      )

      setError(
        "Something went wrong while loading the result."
      )
    } finally {
      setLoading(false)
    }
  }

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">

        <div className="flex flex-col items-center gap-3">

          <Loader2 className="h-8 w-8 animate-spin text-primary" />

          <p className="text-muted-foreground">
            Loading your results...
          </p>

        </div>

      </div>
    )
  }

  // Error
  if (error || !result) {
    return (
      <div className="space-y-6">

        <Card>

          <CardContent className="p-8 text-center">

            <AlertTriangle className="h-10 w-10 mx-auto mb-4 text-risk-medium" />

            <h1 className="text-2xl font-bold mb-3">
              Unable to Load Results
            </h1>

            <p className="text-muted-foreground mb-5">
              {error ||
                "No assessment result was found."}
            </p>

            <Button asChild>
              <Link href="/predict">
                Take Assessment
              </Link>
            </Button>

          </CardContent>

        </Card>

      </div>
    )
  }

  // Disease risks
  const riskResults =
    Array.isArray(
      result.riskResults
    )
      ? result.riskResults.map(
          (item: any) => ({
            ...item,
            icon:
              iconMap[
                item.disease
              ] || Activity,
          })
        )
      : []

  const customRiskFactors = riskResults.map((r: any) => ({
    name: r.disease,
    value: Math.max(0, 100 - Number(r.percentage ?? 0)),
    status: (r.risk === "Low" ? "good" : r.risk === "Medium" ? "warning" : "danger") as "good" | "warning" | "danger",
  }))

  // Recommendations
  const dietRecommendations =
    Array.isArray(
      result.dietRecommendations
    )
      ? result.dietRecommendations
      : []

  const lifestyleRecommendations =
    Array.isArray(
      result.lifestyleRecommendations
    )
      ? result.lifestyleRecommendations
      : []

  const preventiveCare =
    Array.isArray(
      result.preventiveCare
    )
      ? result.preventiveCare
      : []

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Health Risk Analysis
          </h1>

          <p className="text-muted-foreground">
            Based on your latest assessment
          </p>

        </div>

        <div className="flex items-center gap-3 flex-wrap">

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.print()
            }
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                if (
                  navigator.share
                ) {
                  await navigator.share({
                    title:
                      "My Health Risk Analysis",
                    text:
                      "View my health risk assessment.",
                    url:
                      window.location.href,
                  })
                } else {
                  await navigator.clipboard.writeText(
                    window.location.href
                  )

                  alert(
                    "Result link copied."
                  )
                }
              } catch {
                // User cancelled share
              }
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>

          <Button
            size="sm"
            asChild
          >
            <Link href="/predict">
              <RefreshCw className="h-4 w-4 mr-2" />
              New Assessment
            </Link>
          </Button>

        </div>

      </div>

      {/* OVERALL SCORE */}

      <Card className="border-primary/20 bg-primary/5">

        <CardContent className="p-6">

          <div className="flex flex-col md:flex-row md:items-center gap-6">

            <div className="flex-shrink-0">

              <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary flex items-center justify-center">

                <span className="text-3xl font-bold text-primary">
                  {result.overallScore ??
                    0}
                </span>

              </div>

            </div>

            <div className="flex-1">

              <h2 className="text-xl font-bold text-foreground mb-2">
                Overall Health Score
              </h2>

              <p className="text-muted-foreground mb-3">
                {result.summary ||
                  "Your health assessment has been completed."}
              </p>

            </div>

          </div>

        </CardContent>

      </Card>

      {/* SAFETY WARNINGS */}
      {Array.isArray(result.safetyWarnings) && result.safetyWarnings.length > 0 && (
        <div className="space-y-3">
          {result.safetyWarnings.map((warning: any, idx: number) => {
            const isCritical = warning.severity === "critical"
            const isWarning = warning.severity === "warning"
            return (
              <Card
                key={idx}
                className={
                  isCritical
                    ? "border-red-500/30 bg-red-500/10"
                    : isWarning
                    ? "border-amber-500/30 bg-amber-500/10"
                    : "border-blue-500/30 bg-blue-500/10"
                }
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertTriangle
                    className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                      isCritical
                        ? "text-red-600 dark:text-red-400"
                        : isWarning
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-blue-600 dark:text-blue-400"
                    }`}
                  />
                  <div>
                    <h3
                      className={`text-sm font-semibold ${
                        isCritical
                          ? "text-red-700 dark:text-red-300"
                          : isWarning
                          ? "text-amber-700 dark:text-amber-300"
                          : "text-blue-700 dark:text-blue-300"
                      }`}
                    >
                      {warning.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {warning.message}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* DISEASE RISK */}

      <div>

        <h2 className="text-lg font-semibold text-foreground mb-4">
          Disease Risk Analysis
        </h2>

        {riskResults.length > 0 ? (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {riskResults.map(
              (
                item: any,
                index: number
              ) => (
                <RiskMeter
                  key={index}
                  {...item}
                />
              )
            )}

          </div>

        ) : (

          <Card>

            <CardContent className="p-6 text-center text-muted-foreground">
              No disease risk information available.
            </CardContent>

          </Card>

        )}

      </div>

      {/* RISK CHART */}
      <RiskFactorChart customData={customRiskFactors} />

      {/* RECOMMENDATIONS */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* DIET */}

        <Card>

          <CardHeader className="pb-3">

            <div className="flex items-center gap-2">

              <div className="h-8 w-8 rounded-lg bg-risk-low/10 flex items-center justify-center">

                <Apple className="h-4 w-4 text-risk-low" />

              </div>

              <CardTitle className="text-base">
                Diet Recommendations
              </CardTitle>

            </div>

            <CardDescription>
              Nutritional changes for better health
            </CardDescription>

          </CardHeader>

          <CardContent className="space-y-3">

            {dietRecommendations.length >
            0 ? (

              dietRecommendations.map(
                (
                  rec: any,
                  index: number
                ) => (
                  <RecommendationCard
                    key={index}
                    {...rec}
                  />
                )
              )

            ) : (

              <p className="text-sm text-muted-foreground">
                No diet recommendations available.
              </p>

            )}

          </CardContent>

        </Card>

        {/* LIFESTYLE */}

        <Card>

          <CardHeader className="pb-3">

            <div className="flex items-center gap-2">

              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">

                <Dumbbell className="h-4 w-4 text-primary" />

              </div>

              <CardTitle className="text-base">
                Lifestyle Changes
              </CardTitle>

            </div>

            <CardDescription>
              Daily habits to improve health
            </CardDescription>

          </CardHeader>

          <CardContent className="space-y-3">

            {lifestyleRecommendations.length >
            0 ? (

              lifestyleRecommendations.map(
                (
                  rec: any,
                  index: number
                ) => (
                  <RecommendationCard
                    key={index}
                    {...rec}
                  />
                )
              )

            ) : (

              <p className="text-sm text-muted-foreground">
                No lifestyle recommendations available.
              </p>

            )}

          </CardContent>

        </Card>

        {/* PREVENTIVE CARE */}

        <Card>

          <CardHeader className="pb-3">

            <div className="flex items-center gap-2">

              <div className="h-8 w-8 rounded-lg bg-chart-4/10 flex items-center justify-center">

                <Pill className="h-4 w-4 text-chart-4" />

              </div>

              <CardTitle className="text-base">
                Preventive Care
              </CardTitle>

            </div>

            <CardDescription>
              Recommended screenings and tests
            </CardDescription>

          </CardHeader>

          <CardContent className="space-y-3">

            {preventiveCare.length >
            0 ? (

              preventiveCare.map(
                (
                  rec: any,
                  index: number
                ) => (
                  <RecommendationCard
                    key={index}
                    {...rec}
                  />
                )
              )

            ) : (

              <p className="text-sm text-muted-foreground">
                No preventive care recommendations available.
              </p>

            )}

          </CardContent>

        </Card>

      </div>

      {/* DISCLAIMER */}

      <Card className="border-risk-medium/30 bg-risk-medium/5">

        <CardContent className="p-4">

          <div className="flex items-start gap-3">

            <AlertTriangle className="h-5 w-5 text-risk-medium flex-shrink-0 mt-0.5" />

            <div>

              <h3 className="font-medium text-foreground mb-1">
                Important Disclaimer
              </h3>

              <p className="text-sm text-muted-foreground">
                {result.disclaimer ||
                  "This application does not provide medical diagnosis and should not replace professional medical advice. Please consult a qualified healthcare professional."}
              </p>

            </div>

          </div>

        </CardContent>

      </Card>

      {/* DEMO USER ACCOUNT CREATION CALLOUT */}
      {(isDemoUser || result?.isDemo) && (
        <Card className="border-primary/40 bg-gradient-to-r from-primary/10 via-primary/5 to-background shadow-md">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Want to Continue Daily Health Assessments?
            </CardTitle>
            <CardDescription className="text-base max-w-xl mx-auto">
              You just completed your 1 free demo assessment! Create a free account to continue daily health assessments, save your health history, track vitals over time, and receive personalized recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 pb-6">
            <Button size="lg" className="h-11 px-8 text-base shadow-sm" asChild>
              <Link href="/signup">
                Create Free Account
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-11 px-6 text-base" asChild>
              <Link href="/login">
                Already have an account? Sign In
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* BOTTOM BUTTONS */}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6">

        <Button
          size="lg"
          asChild
        >
          <Link href="/predict">

            Take Another Assessment

            <ChevronRight className="h-4 w-4 ml-2" />

          </Link>
        </Button>

        <Button
          size="lg"
          variant="outline"
          asChild
        >
          <Link href="/dashboard">
            Back to Dashboard
          </Link>
        </Button>

      </div>

    </div>
  )
}