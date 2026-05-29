"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  User, Heart, Activity, Utensils, 
  ArrowRight, ArrowLeft, Check, Loader2 
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
  // Personal Info
  age: string
  gender: string
  height: string
  weight: string
  
  // Vitals
  bloodPressureSystolic: string
  bloodPressureDiastolic: string
  bloodSugar: string
  cholesterol: string
  heartRate: string
  
  // Medical History
  familyDiabetes: boolean
  familyHeartDisease: boolean
  familyCancer: boolean
  previousConditions: string[]
  currentMedications: string
  
  // Lifestyle
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
  stressLevel: ""
}

export default function PredictPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
          setIsSubmitting(true)

    const res = await fetch("/api/health-assessment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Assessment failed")
        return
      }

      localStorage.setItem("healthAssessmentResult", JSON.stringify(data))
      router.push("/results")
    } catch (error) {
      alert("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
   }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep formData={formData} updateFormData={updateFormData} />
      case 2:
        return <VitalsStep formData={formData} updateFormData={updateFormData} />
      case 3:
        return <MedicalHistoryStep formData={formData} updateFormData={updateFormData} />
      case 4:
        return <LifestyleStep formData={formData} updateFormData={updateFormData} />
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Health Risk Assessment</h1>
        <p className="text-muted-foreground">
          Complete this form to get your personalized health risk predictions
        </p>
      </div>

      {/* Stepper */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center relative z-10">
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
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
              {/* Mobile step number */}
              <span
                className={cn(
                  "text-xs mt-2 font-medium sm:hidden",
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
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
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>
            {currentStep === 1 && "Tell us about yourself to personalize your assessment"}
            {currentStep === 2 && "Enter your current health measurements"}
            {currentStep === 3 && "Share your medical background for accurate predictions"}
            {currentStep === 4 && "Your daily habits affect your health risks"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px]">
            {renderStep()}
          </div>

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
              <Button onClick={handleSubmit} disabled={isSubmitting}>
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
