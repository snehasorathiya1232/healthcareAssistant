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
} from "lucide-react"

import { supabase } from "@/lib/supabase"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Assessment = {
  id: string
  overall_score: number
  summary: string | null
  created_at: string
}

type HealthTip = {
  title: string
  description: string
  icon: any
  type: "info" | "warning" | "success"
}

export default function AlertsPage() {
  const router = useRouter()

  const [assessment, setAssessment] =
    useState<Assessment | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  useEffect(() => {
    loadLatestAssessment()
  }, [])

  const loadLatestAssessment = async () => {
    try {
      setLoading(true)
      setError("")

      // -----------------------------
      // Check logged-in user
      // -----------------------------

      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        router.push("/login")
        return
      }

      // -----------------------------
      // Get latest assessment
      // -----------------------------

      const {
        data,
        error: assessmentError,
      } = await supabase
        .from("health_assessments")
        .select(
          "id, overall_score, summary, created_at"
        )
        .eq(
          "user_id",
          userData.user.id
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle()

      if (assessmentError) {
        console.error(
          "Assessment error:",
          assessmentError
        )

        setError(
          "Unable to load your health information."
        )

        return
      }

      setAssessment(data)
    } catch (error) {
      console.error(
        "Alerts error:",
        error
      )

      setError(
        "Something went wrong while loading health tips."
      )
    } finally {
      setLoading(false)
    }
  }

  // --------------------------------
  // Generate tips
  // --------------------------------

  const getHealthTips = (
    score: number
  ): HealthTip[] => {
    const tips: HealthTip[] = []

    // Water
    tips.push({
      title: "Stay Hydrated",
      description:
        "Drink enough water throughout the day. Proper hydration supports overall health.",
      icon: Droplets,
      type: "info",
    })

    // Walking
    tips.push({
      title: "Daily Physical Activity",
      description:
        "Try to include regular walking or other suitable physical activity in your daily routine.",
      icon: Footprints,
      type: "info",
    })

    // Sleep
    tips.push({
      title: "Maintain Healthy Sleep",
      description:
        "Aim for a consistent sleep schedule and adequate rest each night.",
      icon: Moon,
      type: "info",
    })

    // Diet
    tips.push({
      title: "Balanced Diet",
      description:
        "Prefer vegetables, fruits, whole grains, and appropriate sources of protein.",
      icon: Apple,
      type: "success",
    })

    // Score-based tip
    if (score >= 70) {
      tips.unshift({
        title: "High Risk Alert",
        description:
          "Your latest assessment indicates a high level of health risk. Please consult a qualified healthcare professional for proper evaluation.",
        icon: AlertTriangle,
        type: "warning",
      })
    } else if (score >= 40) {
      tips.unshift({
        title: "Health Risk Needs Attention",
        description:
          "Some risk factors may need attention. Continue healthy habits and consider discussing your results with a healthcare professional.",
        icon: HeartPulse,
        type: "warning",
      })
    } else {
      tips.unshift({
        title: "Keep Up Your Healthy Habits",
        description:
          "Your latest assessment shows a relatively lower risk. Continue maintaining healthy lifestyle habits.",
        icon: ShieldCheck,
        type: "success",
      })
    }

    return tips
  }

  // --------------------------------
  // Loading
  // --------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">

        <div className="flex flex-col items-center gap-3">

          <Loader2 className="h-8 w-8 animate-spin text-primary" />

          <p className="text-muted-foreground">
            Loading health tips...
          </p>

        </div>

      </div>
    )
  }

  // --------------------------------
  // Error
  // --------------------------------

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">

        <Card>

          <CardContent className="p-8 text-center">

            <AlertTriangle className="h-10 w-10 mx-auto mb-4 text-red-500" />

            <h1 className="text-2xl font-bold mb-2">
              Unable to Load Health Tips
            </h1>

            <p className="text-muted-foreground mb-5">
              {error}
            </p>

            <Button
              onClick={loadLatestAssessment}
            >
              Try Again
            </Button>

          </CardContent>

        </Card>

      </div>
    )
  }

  // --------------------------------
  // No assessment
  // --------------------------------

  if (!assessment) {
    return (
      <div className="max-w-4xl mx-auto">

        <Card>

          <CardContent className="p-10 text-center">

            <Bell className="h-12 w-12 mx-auto mb-4 text-primary" />

            <h1 className="text-2xl font-bold mb-2">
              Health Alerts & Tips
            </h1>

            <p className="text-muted-foreground mb-5">
              Complete a health assessment first to
              receive personalized health guidance.
            </p>

            <Button asChild>

              <Link href="/predict">

                <ClipboardPlus className="h-4 w-4 mr-2" />

                Start Assessment

              </Link>

            </Button>

          </CardContent>

        </Card>

      </div>
    )
  }

  const tips = getHealthTips(
    assessment.overall_score
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* -------------------------------- */}
      {/* Header */}
      {/* -------------------------------- */}

      <div>

        <div className="flex items-center gap-3">

          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">

            <Bell className="h-6 w-6 text-primary" />

          </div>

          <div>

            <h1 className="text-2xl md:text-3xl font-bold">
              Health Alerts & Tips
            </h1>

            <p className="text-muted-foreground">
              Helpful guidance based on your latest assessment
            </p>

          </div>

        </div>

      </div>

      {/* -------------------------------- */}
      {/* Latest Score */}
      {/* -------------------------------- */}

      <Card className="border-primary/20 bg-primary/5">

        <CardContent className="p-6">

          <div className="flex flex-col sm:flex-row sm:items-center gap-5">

            <div className="w-20 h-20 rounded-full border-4 border-primary/30 flex items-center justify-center flex-shrink-0">

              <span className="text-2xl font-bold text-primary">
                {assessment.overall_score}
              </span>

            </div>

            <div>

              <p className="text-sm text-muted-foreground">
                Latest Health Score
              </p>

              <h2 className="text-xl font-bold mt-1">
                Your Personalized Guidance
              </h2>

              <p className="text-sm text-muted-foreground mt-2">
                {assessment.summary ||
                  "Guidance based on your latest health assessment."}
              </p>

            </div>

          </div>

        </CardContent>

      </Card>

      {/* -------------------------------- */}
      {/* Tips */}
      {/* -------------------------------- */}

      <div>

        <h2 className="text-xl font-bold mb-4">
          Your Health Tips
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {tips.map(
            (tip, index) => {

              const Icon =
                tip.icon

              const isWarning =
                tip.type ===
                "warning"

              return (
                <Card
                  key={index}
                  className={
                    isWarning
                      ? "border-yellow-300 bg-yellow-50/50"
                      : ""
                  }
                >

                  <CardContent className="p-6">

                    <div className="flex items-start gap-4">

                      <div
                        className={
                          isWarning
                            ? "h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0"
                            : "h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"
                        }
                      >

                        <Icon
                          className={
                            isWarning
                              ? "h-5 w-5 text-yellow-600"
                              : "h-5 w-5 text-primary"
                          }
                        />

                      </div>

                      <div>

                        <h3 className="font-semibold text-lg">
                          {tip.title}
                        </h3>

                        <p className="text-sm text-muted-foreground mt-2 leading-6">
                          {tip.description}
                        </p>

                      </div>

                    </div>

                  </CardContent>

                </Card>
              )
            }
          )}

        </div>

      </div>

      {/* -------------------------------- */}
      {/* Important Reminder */}
      {/* -------------------------------- */}

      <Card className="border-risk-medium/30 bg-risk-medium/5">

        <CardContent className="p-5">

          <div className="flex items-start gap-3">

            <AlertTriangle className="h-5 w-5 text-risk-medium mt-0.5 flex-shrink-0" />

            <div>

              <h3 className="font-semibold mb-1">
                Important Reminder
              </h3>

              <p className="text-sm text-muted-foreground">
                These tips are general health guidance
                and are not a medical diagnosis. Always
                consult a qualified healthcare professional
                for personal medical advice.
              </p>

            </div>

          </div>

        </CardContent>

      </Card>

      {/* -------------------------------- */}
      {/* Actions */}
      {/* -------------------------------- */}

      <div className="flex flex-col sm:flex-row justify-center gap-3 py-4">

        <Button asChild>

          <Link href="/predict">

            <ClipboardPlus className="h-4 w-4 mr-2" />

            New Assessment

          </Link>

        </Button>

        <Button
          variant="outline"
          asChild
        >

          <Link href="/history">
            View Assessment History
          </Link>

        </Button>

      </div>

    </div>
  )
}