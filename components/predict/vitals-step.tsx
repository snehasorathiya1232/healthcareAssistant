"use client"

import { FormData } from "@/app/(dashboard)/predict/page"
import { Heart, Droplets, Activity, Scale, Sparkles } from "lucide-react"

interface VitalsStepProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  errors?: Record<string, string>
}

export function VitalsStep({ formData, updateFormData, errors }: VitalsStepProps) {
  const heightNum = Number(formData.height)
  const weightNum = Number(formData.weight)
  const hasBmi = heightNum > 0 && weightNum > 0
  const bmiValue = hasBmi ? (weightNum / Math.pow(heightNum / 100, 2)).toFixed(1) : null

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-500 bg-blue-500/10 border-blue-200" }
    if (bmi < 25) return { label: "Normal weight", color: "text-emerald-500 bg-emerald-500/10 border-emerald-200" }
    if (bmi < 30) return { label: "Overweight", color: "text-amber-500 bg-amber-500/10 border-amber-200" }
    return { label: "Obesity range", color: "text-rose-500 bg-rose-500/10 border-rose-200" }
  }

  const bmiCat = bmiValue ? getBmiCategory(Number(bmiValue)) : null

  return (
    <div className="space-y-5">
      {/* 1. Body Measurements & Dynamic BMI */}
      <div className="p-4 rounded-xl border border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">Body Measurements & BMI</h3>
              <p className="text-xs text-muted-foreground">Height & weight are used to compute Body Mass Index</p>
            </div>
          </div>

          {bmiValue && bmiCat && (
            <div className={`px-2.5 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${bmiCat.color}`}>
              <Sparkles className="h-3 w-3" />
              BMI: {bmiValue} ({bmiCat.label})
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Height */}
          <div className="space-y-1.5">
            <label htmlFor="height" className="text-xs font-semibold text-foreground">
              Height (cm) <span className="text-destructive">*</span>
            </label>
            <input
              id="height"
              type="number"
              min="50"
              max="250"
              placeholder="e.g., 170"
              value={formData.height}
              onChange={(e) => updateFormData({ height: e.target.value })}
              className={`w-full h-10 px-3 rounded-lg border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                errors?.height ? "border-destructive focus:ring-destructive" : "border-input"
              }`}
            />
            {errors?.height ? (
              <p className="text-[11px] text-destructive font-medium">{errors.height}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">Range: 50–250 cm</p>
            )}
          </div>

          {/* Weight */}
          <div className="space-y-1.5">
            <label htmlFor="weight" className="text-xs font-semibold text-foreground">
              Weight (kg) <span className="text-destructive">*</span>
            </label>
            <input
              id="weight"
              type="number"
              min="10"
              max="300"
              placeholder="e.g., 70"
              value={formData.weight}
              onChange={(e) => updateFormData({ weight: e.target.value })}
              className={`w-full h-10 px-3 rounded-lg border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                errors?.weight ? "border-destructive focus:ring-destructive" : "border-input"
              }`}
            />
            {errors?.weight ? (
              <p className="text-[11px] text-destructive font-medium">{errors.weight}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">Range: 10–300 kg</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Blood Pressure */}
      <div className={`p-4 rounded-xl border bg-card ${
        errors?.bloodPressureSystolic || errors?.bloodPressureDiastolic
          ? "border-destructive/50"
          : "border-border"
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
            <Heart className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">Blood Pressure</h3>
            <p className="text-xs text-muted-foreground">Resting systolic & diastolic reading</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="systolic" className="text-xs font-semibold text-foreground">
              Systolic (mmHg) <span className="text-destructive">*</span>
            </label>
            <input
              id="systolic"
              type="number"
              min="50"
              max="250"
              placeholder="e.g., 120"
              value={formData.bloodPressureSystolic}
              onChange={(e) => updateFormData({ bloodPressureSystolic: e.target.value })}
              className={`w-full h-10 px-3 rounded-lg border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                errors?.bloodPressureSystolic ? "border-destructive focus:ring-destructive" : "border-input"
              }`}
            />
            {errors?.bloodPressureSystolic ? (
              <p className="text-[11px] text-destructive font-medium">{errors.bloodPressureSystolic}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">Top number (Normal: 90–120)</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="diastolic" className="text-xs font-semibold text-foreground">
              Diastolic (mmHg) <span className="text-destructive">*</span>
            </label>
            <input
              id="diastolic"
              type="number"
              min="20"
              max="150"
              placeholder="e.g., 80"
              value={formData.bloodPressureDiastolic}
              onChange={(e) => updateFormData({ bloodPressureDiastolic: e.target.value })}
              className={`w-full h-10 px-3 rounded-lg border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                errors?.bloodPressureDiastolic ? "border-destructive focus:ring-destructive" : "border-input"
              }`}
            />
            {errors?.bloodPressureDiastolic ? (
              <p className="text-[11px] text-destructive font-medium">{errors.bloodPressureDiastolic}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">Bottom number (Normal: 60–80)</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Blood Glucose & Laboratory Markers */}
      <div className="p-4 rounded-xl border border-border bg-card space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600">
            <Droplets className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">Glucose & Metabolic Vitals</h3>
            <p className="text-xs text-muted-foreground">Fasting blood sugar, cholesterol, and heart rate</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Blood Sugar */}
          <div className="space-y-1.5">
            <label htmlFor="bloodSugar" className="text-xs font-semibold text-foreground">
              Fasting Blood Sugar (mg/dL) <span className="text-destructive">*</span>
            </label>
            <input
              id="bloodSugar"
              type="number"
              min="20"
              max="600"
              placeholder="e.g., 95"
              value={formData.bloodSugar}
              onChange={(e) => updateFormData({ bloodSugar: e.target.value })}
              className={`w-full h-10 px-3 rounded-lg border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                errors?.bloodSugar ? "border-destructive focus:ring-destructive" : "border-input"
              }`}
            />
            {errors?.bloodSugar ? (
              <p className="text-[11px] text-destructive font-medium">{errors.bloodSugar}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">Normal fasting: 70–99 mg/dL</p>
            )}
          </div>

          {/* Total Cholesterol */}
          <div className="space-y-1.5">
            <label htmlFor="cholesterol" className="text-xs font-semibold text-foreground">
              Total Cholesterol (mg/dL) <span className="text-destructive">*</span>
            </label>
            <input
              id="cholesterol"
              type="number"
              min="50"
              max="600"
              placeholder="e.g., 180"
              value={formData.cholesterol}
              onChange={(e) => updateFormData({ cholesterol: e.target.value })}
              className={`w-full h-10 px-3 rounded-lg border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                errors?.cholesterol ? "border-destructive focus:ring-destructive" : "border-input"
              }`}
            />
            {errors?.cholesterol ? (
              <p className="text-[11px] text-destructive font-medium">{errors.cholesterol}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">Desirable: &lt; 200 mg/dL</p>
            )}
          </div>

          {/* Resting Heart Rate */}
          <div className="space-y-1.5">
            <label htmlFor="heartRate" className="text-xs font-semibold text-foreground">
              Resting Heart Rate (bpm) <span className="text-destructive">*</span>
            </label>
            <input
              id="heartRate"
              type="number"
              min="20"
              max="250"
              placeholder="e.g., 72"
              value={formData.heartRate}
              onChange={(e) => updateFormData({ heartRate: e.target.value })}
              className={`w-full h-10 px-3 rounded-lg border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                errors?.heartRate ? "border-destructive focus:ring-destructive" : "border-input"
              }`}
            />
            {errors?.heartRate ? (
              <p className="text-[11px] text-destructive font-medium">{errors.heartRate}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">Normal resting: 60–100 bpm</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
