"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

      // Get logged-in user's session
      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !sessionData.session) {
        router.push("/login")
        return
      }

      const accessToken = sessionData.session.access_token

      // Send assessment + authentication token
      const res = await fetch("/api/health-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
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

      // Go to results
      if (data.id) {
        router.push(`/results?id=${encodeURIComponent(data.id)}`)
      } else {
        router.push("/results")
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">

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