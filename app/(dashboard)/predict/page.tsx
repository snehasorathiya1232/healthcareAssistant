"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import {
  validateStep1,
  validateStep2,
  validateHealthAssessment,
} from "@/lib/validations/health-assessment"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  User,
  Heart,
  Activity,
  Utensils,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react"

import { cn } from "@/lib/utils"

import { PersonalInfoStep } from "@/components/predict/personal-info-step"
import { VitalsStep } from "@/components/predict/vitals-step"
import { MedicalHistoryStep } from "@/components/predict/medical-history-step"
import { LifestyleStep } from "@/components/predict/lifestyle-step"

const steps = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Vitals", icon: Heart },
  { id: 3, title: "Medical History", icon: Activity },
  { id: 4, title: "Lifestyle", icon: Utensils },
]

export interface FormData {
  age: string
  gender: string
  height: string
  weight: string

  bloodPressureSystolic: string
  bloodPressureDiastolic: string
  bloodSugar: string
  cholesterol: string
  heartRate: string

  familyDiabetes: boolean
  familyHeartDisease: boolean
  familyCancer: boolean
  previousConditions: string[]
  currentMedications: string

  smokingStatus: string
  alcoholConsumption: string
  exerciseFrequency: string
  dietType: string
  sleepHours: string
  stressLevel: string
}

const initialFormData: FormData = {
  age: "",
  gender: "",
  height: "",
  weight: "",

  bloodPressureSystolic: "",
  bloodPressureDiastolic: "",
  bloodSugar: "",
  cholesterol: "",
  heartRate: "",

  familyDiabetes: false,
  familyHeartDisease: false,
  familyCancer: false,
  previousConditions: [],
  currentMedications: "",

  smokingStatus: "",
  alcoholConsumption: "",
  exerciseFrequency: "",
  dietType: "",
  sleepHours: "",
  stressLevel: "",
}

export default function PredictPage() {
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [hasCompletedDemo, setHasCompletedDemo] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await supabase.auth.getSession()
        if (data?.session) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          const demoDone = typeof window !== "undefined" && localStorage.getItem("hasCompletedDemo") === "true"
          setHasCompletedDemo(Boolean(demoDone))
        }
      } catch {
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [])

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }))
    setFieldErrors((prev) => {
      const next = { ...prev }
      Object.keys(updates).forEach((k) => delete next[k])
      return next
    })
    setSubmitError("")
  }

  const handleNext = () => {
    if (currentStep === 1) {
      const errors = validateStep1(formData)
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        setSubmitError("Please fill in all required personal information fields correctly.")
        return
      }
    } else if (currentStep === 2) {
      const errors = validateStep2(formData)
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        setSubmitError("Please enter valid vital measurements before proceeding.")
        return
      }
    }

    setFieldErrors({})
    setSubmitError("")
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    setSubmitError("")
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setSubmitError("")

      // Validate entire assessment client-side before calling API
      const validation = validateHealthAssessment(formData)
      if (!validation.isValid) {
        setFieldErrors(validation.errors)
        // If errors belong to step 1 or step 2, navigate there
        const step1Keys = ["age", "gender", "height", "weight"]
        const hasStep1Err = step1Keys.some((k) => validation.errors[k])
        if (hasStep1Err) {
          setCurrentStep(1)
          setSubmitError("Please correct the invalid personal info fields.")
        } else {
          setCurrentStep(2)
          setSubmitError("Please correct the invalid vital measurements.")
        }
        setIsSubmitting(false)
        return
      }

      // Check logged-in user's session (optional for 1 free demo)
      const {
        data: sessionData,
      } = await supabase.auth.getSession()

      const accessToken = sessionData?.session?.access_token

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`
      }

      // Send assessment
      const res = await fetch("/api/health-assessment", {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.errors) {
          setFieldErrors(data.errors)
        }
        setSubmitError(
          data.error || "Assessment failed. Please check the form and try again."
        )
        return
      }

      // Save result for Results page
      localStorage.setItem("healthAssessmentResult", JSON.stringify(data))

      // If user took the free demo without an account, record that they used their 1 free demo
      if (!accessToken) {
        localStorage.setItem("hasCompletedDemo", "true")
      }

      // Go to results
      if (data.id) {
        router.push(`/results?id=${encodeURIComponent(data.id)}`)
      } else {
        router.push("/results?demo=true")
      }
    } catch (error) {
      console.error("Assessment error:", error)
      setSubmitError("Something went wrong while submitting. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            formData={formData}
            updateFormData={updateFormData}
            errors={fieldErrors}
          />
        )

      case 2:
        return (
          <VitalsStep
            formData={formData}
            updateFormData={updateFormData}
            errors={fieldErrors}
          />
        )

      case 3:
        return (
          <MedicalHistoryStep
            formData={formData}
            updateFormData={updateFormData}
          />
        )

      case 4:
        return (
          <LifestyleStep
            formData={formData}
            updateFormData={updateFormData}
          />
        )

      default:
        return null
    }
  }

  if (isAuthenticated === false && hasCompletedDemo) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <Card className="border-primary/30 shadow-lg text-center p-6 md:p-8">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl font-bold">You Have Used Your 1 Free Demo</CardTitle>
            <CardDescription className="text-base mt-2">
              You have already experienced your 1 free demo assessment! Create a free account to continue daily health assessments, save your health history, and receive ongoing health alerts.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="h-11 px-8 text-base w-full sm:w-auto shadow-sm" asChild>
              <Link href="/signup">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-11 px-6 text-base w-full sm:w-auto" asChild>
              <Link href="/login">
                Sign In
              </Link>
            </Button>
            <Button size="lg" variant="ghost" className="h-11 px-6 text-base w-full sm:w-auto" asChild>
              <Link href="/results">
                View My Result
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Demo Assessment Banner */}
      {isAuthenticated === false && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 flex-shrink-0" />
            <span>
              <strong>Free Demo Assessment:</strong> Try 1 full AI assessment without creating an account!
            </span>
          </div>
          <Link
            href="/signup"
            className="text-xs font-semibold underline underline-offset-4 hover:text-primary/80 whitespace-nowrap"
          >
            Create Account for Daily Assessments &rarr;
          </Link>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Health Risk Assessment
        </h1>

        <p className="text-muted-foreground">
          Complete this form to get your personalized
          health risk predictions
        </p>
      </div>

      {/* Stepper */}
      <div className="relative">

        <div className="flex items-center justify-between">

          {steps.map((step) => (
            <div
              key={step.id}
              className="flex flex-col items-center relative z-10"
            >

              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",

                  currentStep > step.id
                    ? "bg-primary border-primary text-primary-foreground"

                    : currentStep === step.id
                    ? "border-primary text-primary bg-primary/10"

                    : "border-muted bg-background text-muted-foreground"
                )}
              >

                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}

              </div>

              <span
                className={cn(
                  "text-xs mt-2 font-medium hidden sm:block",

                  currentStep >= step.id
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>

              {/* Mobile step number */}
              <span
                className={cn(
                  "text-xs mt-2 font-medium sm:hidden",

                  currentStep >= step.id
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.id}/{steps.length}
              </span>

            </div>
          ))}

        </div>

        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-muted -z-0">

          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: `${
                ((currentStep - 1) /
                  (steps.length - 1)) *
                100
              }%`,
            }}
          />

        </div>

      </div>

      {/* Form Card */}
      <Card>

        <CardHeader>

          <CardTitle>
            {steps[currentStep - 1].title}
          </CardTitle>

          <CardDescription>

            {currentStep === 1 &&
              "Tell us about yourself to personalize your assessment"}

            {currentStep === 2 &&
              "Enter your current health measurements"}

            {currentStep === 3 &&
              "Share your medical background for accurate predictions"}

            {currentStep === 4 &&
              "Your daily habits affect your health risks"}

          </CardDescription>

        </CardHeader>

        <CardContent>

          <div className="min-h-[400px]">
            {renderStep()}
          </div>

          {submitError && (
            <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Attention Needed</p>
                <p className="text-xs mt-0.5 leading-relaxed">{submitError}</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-border mt-6">

            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < steps.length ? (

              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

            ) : (

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
              >

                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Get Predictions
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}

              </Button>

            )}

          </div>

        </CardContent>

      </Card>

    </div>
  )
}