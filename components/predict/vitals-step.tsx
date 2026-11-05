"use client"

import { FormData } from "@/app/(dashboard)/predict/page"
import { Heart, Droplets, Activity } from "lucide-react"

interface VitalsStepProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  errors?: Record<string, string>
}

export function VitalsStep({ formData, updateFormData, errors }: VitalsStepProps) {
  return (
    <div className="space-y-6">
      {/* Blood Pressure */}
      <div className={`p-4 rounded-lg border bg-card ${
        errors?.bloodPressureSystolic || errors?.bloodPressureDiastolic
          ? "border-destructive/50"
          : "border-border"
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-risk-high/10 flex items-center justify-center">
            <Heart className="h-4 w-4 text-risk-high" />
          </div>
          <h3 className="font-medium text-foreground">Blood Pressure</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="systolic" className="text-sm font-medium text-foreground">
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
              className={`w-full h-11 px-4 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                errors?.bloodPressureSystolic ? "border-destructive focus:ring-destructive" : "border-input"
              }`}
            />
            {errors?.bloodPressureSystolic ? (
              <p className="text-xs text-destructive font-medium">{errors.bloodPressureSystolic}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Top number (50–250 mmHg)</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="diastolic" className="text-sm font-medium text-foreground">
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
              className={`w-full h-11 px-4 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                errors?.bloodPressureDiastolic ? "border-destructive focus:ring-destructive" : "border-input"
              }`}
            />
            {errors?.bloodPressureDiastolic ? (
              <p className="text-xs text-destructive font-medium">{errors.bloodPressureDiastolic}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Bottom number (20–150 mmHg)</p>
            )}
          </div>
        </div>
      </div>

      {/* Blood Sugar */}
      <div className={`p-4 rounded-lg border bg-card ${
        errors?.bloodSugar ? "border-destructive/50" : "border-border"
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-chart-1/10 flex items-center justify-center">
            <Droplets className="h-4 w-4 text-chart-1" />
          </div>
          <h3 className="font-medium text-foreground">Blood Sugar</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="bloodSugar" className="text-sm font-medium text-foreground">
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
              className={`w-full h-11 px-4 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                errors?.bloodSugar ? "border-destructive focus:ring-destructive" : "border-input"
              }`}
            />
            {errors?.bloodSugar ? (
              <p className="text-xs text-destructive font-medium">{errors.bloodSugar}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Normal fasting: 70–99 mg/dL</p>
            )}
          </div>
        </div>
      </div>

      {/* Cholesterol and Heart Rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg border bg-card space-y-2 ${
          errors?.cholesterol ? "border-destructive/50" : "border-border"
        }`}>
          <label htmlFor="cholesterol" className="text-sm font-medium text-foreground">
            Total Cholesterol (mg/dL) <span className="text-destructive">*</span>
          </label>
          <input
            id="cholesterol"
            type="number"
            min="50"
            max="600"
            placeholder="e.g., 180 (enter 180 if unmeasured)"
            value={formData.cholesterol}
            onChange={(e) => updateFormData({ cholesterol: e.target.value })}
            className={`w-full h-11 px-4 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
              errors?.cholesterol ? "border-destructive focus:ring-destructive" : "border-input"
            }`}
          />
          {errors?.cholesterol ? (
            <p className="text-xs text-destructive font-medium">{errors.cholesterol}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Desirable: Below 200 mg/dL (use 180 if unmeasured)</p>
          )}
        </div>

        <div className={`p-4 rounded-lg border bg-card space-y-2 ${
          errors?.heartRate ? "border-destructive/50" : "border-border"
        }`}>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <label htmlFor="heartRate" className="text-sm font-medium text-foreground">
              Resting Heart Rate (bpm) <span className="text-destructive">*</span>
            </label>
          </div>
          <input
            id="heartRate"
            type="number"
            min="20"
            max="250"
            placeholder="e.g., 72 (enter 72 if unmeasured)"
            value={formData.heartRate}
            onChange={(e) => updateFormData({ heartRate: e.target.value })}
            className={`w-full h-11 px-4 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
              errors?.heartRate ? "border-destructive focus:ring-destructive" : "border-input"
            }`}
          />
          {errors?.heartRate ? (
            <p className="text-xs text-destructive font-medium">{errors.heartRate}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Normal adult: 60–100 bpm (use 72 if unmeasured)</p>
          )}
        </div>
      </div>
    </div>
  )
}
