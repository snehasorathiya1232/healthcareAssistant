"use client"

import { FormData } from "@/app/(dashboard)/predict/page"
import { Heart, Droplets, Activity } from "lucide-react"

interface VitalsStepProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

export function VitalsStep({ formData, updateFormData }: VitalsStepProps) {
  return (
    <div className="space-y-6">
      {/* Blood Pressure */}
      <div className="p-4 rounded-lg border border-border bg-card">
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
              min="70"
              max="200"
              placeholder="e.g., 120"
              value={formData.bloodPressureSystolic}
              onChange={(e) => updateFormData({ bloodPressureSystolic: e.target.value })}
              className="w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">Top number</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="diastolic" className="text-sm font-medium text-foreground">
              Diastolic (mmHg) <span className="text-destructive">*</span>
            </label>
            <input
              id="diastolic"
              type="number"
              min="40"
              max="130"
              placeholder="e.g., 80"
              value={formData.bloodPressureDiastolic}
              onChange={(e) => updateFormData({ bloodPressureDiastolic: e.target.value })}
              className="w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">Bottom number</p>
          </div>
        </div>
      </div>

      {/* Blood Sugar */}
      <div className="p-4 rounded-lg border border-border bg-card">
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
              min="50"
              max="400"
              placeholder="e.g., 100"
              value={formData.bloodSugar}
              onChange={(e) => updateFormData({ bloodSugar: e.target.value })}
              className="w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">Normal: 70-100 mg/dL</p>
          </div>
        </div>
      </div>

      {/* Cholesterol and Heart Rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-border bg-card space-y-2">
          <label htmlFor="cholesterol" className="text-sm font-medium text-foreground">
            Total Cholesterol (mg/dL)
          </label>
          <input
            id="cholesterol"
            type="number"
            min="100"
            max="400"
            placeholder="e.g., 180"
            value={formData.cholesterol}
            onChange={(e) => updateFormData({ cholesterol: e.target.value })}
            className="w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">Desirable: Below 200 mg/dL</p>
        </div>

        <div className="p-4 rounded-lg border border-border bg-card space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <label htmlFor="heartRate" className="text-sm font-medium text-foreground">
              Resting Heart Rate (bpm)
            </label>
          </div>
          <input
            id="heartRate"
            type="number"
            min="40"
            max="200"
            placeholder="e.g., 72"
            value={formData.heartRate}
            onChange={(e) => updateFormData({ heartRate: e.target.value })}
            className="w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">Normal: 60-100 bpm</p>
        </div>
      </div>
    </div>
  )
}
