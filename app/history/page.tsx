"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Calendar,
  Eye,
  Trash2,
  ArrowLeft,
  Loader2,
  ClipboardList,
  AlertTriangle,
} from "lucide-react"

import { supabase } from "@/lib/supabase"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Assessment = {
  id: string
  overall_score: number
  summary: string | null
  created_at: string
}

export default function HistoryPage() {
  const router = useRouter()

  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setLoading(true)
      setError("")

      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        router.push("/login")
        return
      }

      const {
        data,
        error: historyError,
      } = await supabase
        .from("health_assessments")
        .select(
          "id, overall_score, summary, created_at"
        )
        .eq("user_id", userData.user.id)
        .order("created_at", {
          ascending: false,
        })

      if (historyError) {
        console.error(
          "History loading error:",
          historyError
        )
      }

      if (data && data.length > 0) {
        setAssessments(data)
      } else if (typeof window !== "undefined") {
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
                },
              ])
            }
          } catch {}
        }
      }
    } catch (error) {
      console.error(
        "History error:",
        error
      )

      setError(
        "Something went wrong while loading history."
      )
    } finally {
      setLoading(false)
    }
  }

  const deleteAssessment = async (
    id: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assessment?"
    )

    if (!confirmed) {
      return
    }

    try {
      if (id.startsWith("local")) {
        localStorage.removeItem("healthAssessmentResult")
        setAssessments((previous) =>
          previous.filter(
            (assessment) =>
              assessment.id !== id
          )
        )
        return
      }

      const {
        error: deleteError,
      } = await supabase
        .from("health_assessments")
        .delete()
        .eq("id", id)

      if (deleteError) {
        console.error(
          "Delete error:",
          deleteError
        )

        alert(
          "Unable to delete assessment."
        )

        return
      }

      setAssessments((previous) =>
        previous.filter(
          (assessment) =>
            assessment.id !== id
        )
      )
    } catch (error) {
      console.error(
        "Delete error:",
        error
      )

      alert(
        "Something went wrong while deleting."
      )
    }
  }

  const viewAssessment = (
    id: string
  ) => {
    router.push(
      `/results?id=${encodeURIComponent(id)}`
    )
  }

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

  const getRiskStyle = (
    score: number
  ) => {
    if (score >= 70) {
      return "bg-red-100 text-red-700"
    }

    if (score >= 40) {
      return "bg-yellow-100 text-yellow-700"
    }

    return "bg-green-100 text-green-700"
  }

  const formatDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />

          <p className="text-muted-foreground">
            Loading assessment history...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Assessment History
          </h1>

          <p className="text-muted-foreground mt-1">
            View your previous health assessments.
          </p>
        </div>

        <Button
          variant="outline"
          asChild
        >
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
        </Button>

      </div>

      {/* Error */}

      {error && (
        <Card>
          <CardContent className="p-6">

            <div className="flex items-start gap-3">

              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />

              <div>

                <h3 className="font-semibold">
                  Unable to load history
                </h3>

                <p className="text-sm text-muted-foreground mt-1">
                  {error}
                </p>

              </div>

            </div>

          </CardContent>
        </Card>
      )}

      {/* Empty */}

      {!error &&
        assessments.length === 0 && (
          <Card>
            <CardContent className="p-10 text-center">

              <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />

              <h2 className="text-xl font-semibold mb-2">
                No Assessments Yet
              </h2>

              <p className="text-muted-foreground mb-5">
                Complete your first health assessment
                to see it here.
              </p>

              <Button asChild>
                <Link href="/predict">
                  Start Assessment
                </Link>
              </Button>

            </CardContent>
          </Card>
        )}

      {/* Assessment List */}

      {assessments.length > 0 && (
        <div className="space-y-4">

          {assessments.map(
            (assessment, index) => {

              const risk =
                getRiskLevel(
                  assessment.overall_score
                )

              return (
                <Card
                  key={assessment.id}
                  className="overflow-hidden"
                >

                  <CardHeader className="pb-3">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                      <div>

                        <CardTitle className="text-base">
                          Assessment #{assessments.length - index}
                        </CardTitle>

                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">

                          <Calendar className="h-4 w-4" />

                          {formatDate(
                            assessment.created_at
                          )}

                        </div>

                      </div>

                      <span
                        className={`w-fit px-3 py-1 rounded-full text-sm font-medium ${getRiskStyle(
                          assessment.overall_score
                        )}`}
                      >
                        {risk} Risk
                      </span>

                    </div>

                  </CardHeader>

                  <CardContent>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                      <div className="flex items-center gap-5">

                        <div className="w-16 h-16 rounded-full border-4 border-primary/30 flex items-center justify-center">

                          <span className="text-xl font-bold text-primary">
                            {assessment.overall_score}
                          </span>

                        </div>

                        <div>

                          <p className="font-medium">
                            Overall Health Score
                          </p>

                          <p className="text-sm text-muted-foreground">
                            {assessment.summary ||
                              "Health assessment completed."}
                          </p>

                        </div>

                      </div>

                      <div className="flex items-center gap-2">

                        <Button
                          size="sm"
                          onClick={() =>
                            viewAssessment(
                              assessment.id
                            )
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Result
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            deleteAssessment(
                              assessment.id
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                          Delete
                        </Button>

                      </div>

                    </div>

                  </CardContent>

                </Card>
              )
            }
          )}

        </div>
      )}

      {/* New Assessment */}

      {assessments.length > 0 && (
        <div className="flex justify-center py-4">

          <Button
            size="lg"
            asChild
          >
            <Link href="/predict">
              <ClipboardList className="h-4 w-4 mr-2" />
              New Assessment
            </Link>
          </Button>

        </div>
      )}

    </div>
  )
}