"use client"

import { FormData } from "@/app/(dashboard)/predict/page"
import { cn } from "@/lib/utils"

interface MedicalHistoryStepProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

const conditions = [
  "Hypertension",
  "Diabetes",
  "Heart Disease",
  "Stroke",
  "Asthma",
  "Thyroid Disorder",
  "Kidney Disease",
  "Liver Disease",
  "Cancer",
  "Arthritis"
]

export function MedicalHistoryStep({ formData, updateFormData }: MedicalHistoryStepProps) {
  const toggleCondition = (condition: string) => {
    const current = formData.previousConditions
    if (current.includes(condition)) {
      updateFormData({ previousConditions: current.filter(c => c !== condition) })
    } else {
      updateFormData({ previousConditions: [...current, condition] })
    }
  }

  return (
    <div className="space-y-6">
      {/* Family History */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-4">Family Medical History</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Select conditions that run in your immediate family (parents, siblings)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label
            className={cn(
              "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all",
              formData.familyDiabetes
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <input
              type="checkbox"
              checked={formData.familyDiabetes}
              onChange={(e) => updateFormData({ familyDiabetes: e.target.checked })}
              className="h-5 w-5 rounded border-input accent-primary"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Diabetes</p>
              <p className="text-xs text-muted-foreground">Type 1 or Type 2</p>
            </div>
          </label>

          <label
            className={cn(
              "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all",
              formData.familyHeartDisease
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <input
              type="checkbox"
              checked={formData.familyHeartDisease}
              onChange={(e) => updateFormData({ familyHeartDisease: e.target.checked })}
              className="h-5 w-5 rounded border-input accent-primary"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Heart Disease</p>
              <p className="text-xs text-muted-foreground">Cardiovascular issues</p>
            </div>
          </label>

          <label
            className={cn(
              "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all",
              formData.familyCancer
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <input
              type="checkbox"
              checked={formData.familyCancer}
              onChange={(e) => updateFormData({ familyCancer: e.target.checked })}
              className="h-5 w-5 rounded border-input accent-primary"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Cancer</p>
              <p className="text-xs text-muted-foreground">Any type of cancer</p>
            </div>
          </label>
        </div>
      </div>

      {/* Previous Conditions */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-4">Your Medical Conditions</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Select any conditions you have been diagnosed with
        </p>
        <div className="flex flex-wrap gap-2">
          {conditions.map((condition) => (
            <button
              key={condition}
              type="button"
              onClick={() => toggleCondition(condition)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                formData.previousConditions.includes(condition)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {condition}
            </button>
          ))}
        </div>
      </div>

      {/* Current Medications */}
      <div className="space-y-2">
        <label htmlFor="medications" className="text-sm font-medium text-foreground">
          Current Medications
        </label>
        <textarea
          id="medications"
          placeholder="List any medications you are currently taking (one per line)"
          value={formData.currentMedications}
          onChange={(e) => updateFormData({ currentMedications: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
        <p className="text-xs text-muted-foreground">Include dosage if known</p>
      </div>
    </div>
  )
}
