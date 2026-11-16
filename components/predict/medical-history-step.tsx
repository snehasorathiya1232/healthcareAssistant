"use client"

import { useState } from "react"
import { FormData } from "@/app/(dashboard)/predict/page"
import { cn } from "@/lib/utils"
import { Activity, Stethoscope, ChevronDown, ChevronUp } from "lucide-react"

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
  "Arthritis",
]

const symptomsList = [
  "Excessive Thirst",
  "Frequent Urination",
  "Shortness of Breath",
  "Chest Discomfort",
  "Fatigue",
  "Swollen Ankles / Feet",
  "Dizziness",
  "Unexplained Weight Loss",
  "Persistent Cough",
  "Yellowing of Eyes / Skin",
]

export function MedicalHistoryStep({ formData, updateFormData }: MedicalHistoryStepProps) {
  const [showLabFields, setShowLabFields] = useState(
    Boolean(formData.serumCreatinine || formData.alt || formData.ast)
  )

  const toggleCondition = (condition: string) => {
    const current = formData.previousConditions || []
    if (current.includes(condition)) {
      updateFormData({ previousConditions: current.filter((c) => c !== condition) })
    } else {
      updateFormData({ previousConditions: [...current, condition] })
    }
  }

  const toggleSymptom = (symptom: string) => {
    const current = formData.symptoms || []
    if (current.includes(symptom)) {
      updateFormData({ symptoms: current.filter((s) => s !== symptom) })
    } else {
      updateFormData({ symptoms: [...current, symptom] })
    }
  }

  return (
    <div className="space-y-5">
      {/* 1. Existing Medical Conditions */}
      <div className="p-4 rounded-xl border border-border bg-card space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Existing Medical Conditions</h3>
          <p className="text-xs text-muted-foreground">Select any conditions you have been diagnosed with</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {conditions.map((condition) => {
            const isSelected = (formData.previousConditions || []).includes(condition)
            return (
              <button
                key={condition}
                type="button"
                onClick={() => toggleCondition(condition)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                )}
              >
                {condition}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Family Medical History */}
      <div className="p-4 rounded-xl border border-border bg-card space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Family Medical History</h3>
          <p className="text-xs text-muted-foreground">Conditions in parents or siblings</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label
            className={cn(
              "flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all text-xs",
              formData.familyDiabetes
                ? "border-primary bg-primary/5 text-foreground font-semibold"
                : "border-border bg-card hover:border-primary/40 text-muted-foreground"
            )}
          >
            <input
              type="checkbox"
              checked={formData.familyDiabetes}
              onChange={(e) => updateFormData({ familyDiabetes: e.target.checked })}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <span>Diabetes (Type 1 or 2)</span>
          </label>

          <label
            className={cn(
              "flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all text-xs",
              formData.familyHeartDisease
                ? "border-primary bg-primary/5 text-foreground font-semibold"
                : "border-border bg-card hover:border-primary/40 text-muted-foreground"
            )}
          >
            <input
              type="checkbox"
              checked={formData.familyHeartDisease}
              onChange={(e) => updateFormData({ familyHeartDisease: e.target.checked })}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <span>Heart Disease</span>
          </label>

          <label
            className={cn(
              "flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all text-xs",
              formData.familyCancer
                ? "border-primary bg-primary/5 text-foreground font-semibold"
                : "border-border bg-card hover:border-primary/40 text-muted-foreground"
            )}
          >
            <input
              type="checkbox"
              checked={formData.familyCancer}
              onChange={(e) => updateFormData({ familyCancer: e.target.checked })}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <span>Cancer History</span>
          </label>
        </div>
      </div>

      {/* 3. Symptoms Checklist */}
      <div className="p-4 rounded-xl border border-border bg-card space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Current Symptoms (Optional)</h3>
            <p className="text-xs text-muted-foreground">Select any recent or recurring physical symptoms</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {symptomsList.map((symptom) => {
            const isSelected = (formData.symptoms || []).includes(symptom)
            return (
              <button
                key={symptom}
                type="button"
                onClick={() => toggleSymptom(symptom)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                  isSelected
                    ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-semibold shadow-xs"
                    : "bg-muted/30 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                )}
              >
                {symptom}
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. Available Laboratory Results (Optional Accordion) */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <button
          type="button"
          onClick={() => setShowLabFields(!showLabFields)}
          className="w-full flex items-center justify-between text-left text-xs font-semibold text-foreground"
        >
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-sm">Available Laboratory Results (Optional)</span>
              <p className="text-[11px] text-muted-foreground font-normal">Add kidney creatinine or liver enzymes if you have recent lab reports</p>
            </div>
          </div>
          {showLabFields ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {showLabFields && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/50 mt-3">
            <div className="space-y-1">
              <label htmlFor="serumCreatinine" className="text-xs font-medium text-foreground">
                Serum Creatinine (mg/dL)
              </label>
              <input
                id="serumCreatinine"
                type="number"
                step="0.1"
                min="0.1"
                max="15"
                placeholder="e.g., 0.9"
                value={formData.serumCreatinine || ""}
                onChange={(e) => updateFormData({ serumCreatinine: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-[10px] text-muted-foreground">Normal: 0.6–1.2 mg/dL</p>
            </div>

            <div className="space-y-1">
              <label htmlFor="alt" className="text-xs font-medium text-foreground">
                ALT (SGPT) (U/L)
              </label>
              <input
                id="alt"
                type="number"
                min="5"
                max="500"
                placeholder="e.g., 28"
                value={formData.alt || ""}
                onChange={(e) => updateFormData({ alt: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-[10px] text-muted-foreground">Normal: 7–56 U/L</p>
            </div>

            <div className="space-y-1">
              <label htmlFor="ast" className="text-xs font-medium text-foreground">
                AST (SGOT) (U/L)
              </label>
              <input
                id="ast"
                type="number"
                min="5"
                max="500"
                placeholder="e.g., 25"
                value={formData.ast || ""}
                onChange={(e) => updateFormData({ ast: e.target.value })}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-[10px] text-muted-foreground">Normal: 10–40 U/L</p>
            </div>
          </div>
        )}
      </div>

      {/* 5. Current Medications */}
      <div className="p-4 rounded-xl border border-border bg-card space-y-2">
        <label htmlFor="medications" className="text-sm font-semibold text-foreground">
          Current Prescriptions / Medications
        </label>
        <textarea
          id="medications"
          placeholder="e.g., Metformin 500mg, Amlodipine 5mg (or leave blank if none)"
          value={formData.currentMedications}
          onChange={(e) => updateFormData({ currentMedications: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
        <p className="text-[11px] text-muted-foreground">Medications are parsed to detect antihypertensive or antidiabetic treatments</p>
      </div>
    </div>
  )
}
