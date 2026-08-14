"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

import {
  ClipboardPlus,
  TrendingUp,
  HeartPulse,
  LogOut,
  History,
  Loader2,
  AlertTriangle,
  CalendarDays,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
} from "@/components/ui/card"

type Assessment = {
  id: string
  overall_score: number
  summary: string | null
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()

  const [email, setEmail] = useState<string | null>(null)
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

      setEmail(userData.user.email ?? null)

      // Get user's assessments
      const {
        data,
        error,
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

      if (error) {
        console.error(
          "Dashboard assessment error:",
          error
        )
        return
      }

      setAssessments(data || [])
    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      )
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  // Latest assessment
  const latestAssessment =
    assessments.length > 0
      ? assessments[0]
      : null

  // Risk level
  const getRiskLevel = (
    score: number
  ) => {
    if (score >= 70) {
      return "High"
    }

    if (score >= 40) {
      return "Medium"
    }

    return "Low"
  }

  // Health status
  const getHealthStatus = (
    score: number
  ) => {
    if (score >= 75) {
      return "Good"
    }

    if (score >= 50) {
      return "Needs Attention"
    }

    return "Needs Care"
  }

  // Format assessment date
  const formatDate = (
    date: string
  ) => {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    )
  }

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />

          <p className="text-muted-foreground">
            Loading dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="flex-1 p-4 md:p-8">

      {/* ============================= */}
      {/* HEADER */}
      {/* ============================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

        <div>
          <h1 className="text-3xl md:text-4xl font-bold">
            Welcome back 👋
          </h1>

          <p className="text-lg text-muted-foreground mt-2">
            {email?.split("@")[0]}
          </p>
        </div>

        <Button
          variant="destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>

      </div>

      {/* ============================= */}
      {/* ACTION CARDS */}
      {/* ============================= */}

      <div className="grid md:grid-cols-3 gap-6">

        <ActionCard
          icon={
            <ClipboardPlus className="h-8 w-8 text-teal-600" />
          }
          title="Health Prediction"
          description="Start a new health assessment."
          button="Start"
          href="/predict"
        />

        <ActionCard
          icon={
            <TrendingUp className="h-8 w-8 text-purple-600" />
          }
          title="Results"
          description={
            latestAssessment
              ? "View your latest prediction."
              : "Complete an assessment first."
          }
          button="View"
          href="/results"
        />

        <ActionCard
          icon={
            <HeartPulse className="h-8 w-8 text-red-500" />
          }
          title="Health Tips"
          description="Get personalized health advice."
          button="Open"
          href="/alerts"
        />

      </div>

      {/* ============================= */}
      {/* OVERVIEW */}
      {/* ============================= */}

      <div className="flex items-center justify-between mt-10 mb-5">

        <h2 className="text-2xl font-bold">
          Overview
        </h2>

        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <Link href="/history">
            <History className="h-4 w-4 mr-2" />
            View History
          </Link>
        </Button>

      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">

        <StatCard
          title="Assessments"
          value={String(
            assessments.length
          )}
          subtitle="Completed"
        />

        <StatCard
          title="Risk"
          value={
            latestAssessment
              ? getRiskLevel(
                  latestAssessment.overall_score
                )
              : "—"
          }
          subtitle="Latest Result"
        />

        <StatCard
          title="Health"
          value={
            latestAssessment
              ? getHealthStatus(
                  latestAssessment.overall_score
                )
              : "—"
          }
          subtitle="Current Status"
        />

        <StatCard
          title="History"
          value={String(
            assessments.length
          )}
          subtitle="Saved"
        />

      </div>

      {/* ============================= */}
      {/* LATEST ASSESSMENT */}
      {/* ============================= */}

      {latestAssessment ? (

        <Card className="mt-8">

          <CardContent className="p-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

              <div>

                <p className="text-sm text-muted-foreground">
                  Latest Assessment
                </p>

                <h3 className="text-xl font-bold mt-1">
                  Health Risk Score
                </h3>

                {/* Assessment Date */}

                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">

                  <CalendarDays className="h-4 w-4" />

                  <span>
                    Assessed on{" "}
                    {formatDate(
                      latestAssessment.created_at
                    )}
                  </span>

                </div>

                {/* Summary */}

                <p className="text-sm text-muted-foreground mt-3 max-w-xl">
                  {latestAssessment.summary ||
                    "Your latest health assessment has been completed."}
                </p>

              </div>

              <div className="flex items-center gap-4">

                {/* Score */}

                <div className="w-20 h-20 rounded-full border-4 border-primary/30 flex items-center justify-center">

                  <span className="text-2xl font-bold text-primary">
                    {latestAssessment.overall_score}
                  </span>

                </div>

                {/* View Result */}

                <Button asChild>

                  <Link
                    href={`/results?id=${encodeURIComponent(
                      latestAssessment.id
                    )}`}
                  >
                    View Result
                  </Link>

                </Button>

              </div>

            </div>

          </CardContent>

        </Card>

      ) : (

        <Card className="mt-8">

          <CardContent className="p-8 text-center">

            <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />

            <h3 className="text-xl font-bold mb-2">
              No Assessment Yet
            </h3>

            <p className="text-muted-foreground mb-5">
              Complete your first health assessment
              to see your health information here.
            </p>

            <Button asChild>

              <Link href="/predict">
                Start Assessment
              </Link>

            </Button>

          </CardContent>

        </Card>

      )}

    </main>
  )
}


/* ================================= */
/* ACTION CARD */
/* ================================= */

function ActionCard({
  icon,
  title,
  description,
  button,
  href,
}: {
  icon: React.ReactNode
  title: string
  description: string
  button: string
  href: string
}) {
  return (
    <Card>

      <CardContent className="p-6">

        <div className="mb-4">
          {icon}
        </div>

        <h3 className="font-bold text-lg">
          {title}
        </h3>

        <p className="text-muted-foreground mt-2 mb-5">
          {description}
        </p>

        <Button asChild>
          <Link href={href}>
            {button}
          </Link>
        </Button>

      </CardContent>

    </Card>
  )
}


/* ================================= */
/* STAT CARD */
/* ================================= */

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string
  subtitle: string
}) {
  return (
    <Card>

      <CardContent className="p-5">

        <p className="text-muted-foreground text-sm">
          {title}
        </p>

        <h2 className="text-2xl md:text-3xl font-bold my-2">
          {value}
        </h2>

        <p className="text-xs text-muted-foreground">
          {subtitle}
        </p>

      </CardContent>

    </Card>
  )
}