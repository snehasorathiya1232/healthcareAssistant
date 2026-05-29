"use client"

import { FormData } from "@/app/(dashboard)/predict/page"
import { Cigarette, Wine, Dumbbell, Utensils, Moon, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

interface LifestyleStepProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
}

export function LifestyleStep({ formData, updateFormData }: LifestyleStepProps) {
  return (
    <div className="space-y-6">
      {/* Smoking Status */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Cigarette className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium text-foreground">Smoking Status</label>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["Never", "Former", "Occasional", "Regular"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => updateFormData({ smokingStatus: option.toLowerCase() })}
              className={cn(
                "p-3 rounded-lg border text-sm font-medium transition-all",
                formData.smokingStatus === option.toLowerCase()
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/50"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Alcohol Consumption */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Wine className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium text-foreground">Alcohol Consumption</label>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["None", "Occasional", "Moderate", "Heavy"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => updateFormData({ alcoholConsumption: option.toLowerCase() })}
              className={cn(
                "p-3 rounded-lg border text-sm font-medium transition-all",
                formData.alcoholConsumption === option.toLowerCase()
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/50"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Frequency */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium text-foreground">Exercise Frequency</label>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Sedentary", desc: "Little to no exercise" },
            { label: "Light", desc: "1-2 times/week" },
            { label: "Moderate", desc: "3-4 times/week" },
            { label: "Active", desc: "5+ times/week" }
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => updateFormData({ exerciseFrequency: option.label.toLowerCase() })}
              className={cn(
                "p-3 rounded-lg border text-left transition-all",
                formData.exerciseFrequency === option.label.toLowerCase()
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <p className={cn(
                "text-sm font-medium",
                formData.exerciseFrequency === option.label.toLowerCase()
                  ? "text-primary"
                  : "text-foreground"
              )}>
                {option.label}
              </p>
              <p className="text-xs text-muted-foreground">{option.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Diet Type */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Utensils className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium text-foreground">Diet Type</label>
        </div>
        <select
          value={formData.dietType}
          onChange={(e) => updateFormData({ dietType: e.target.value })}
          className="w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select your diet type</option>
          <option value="omnivore">Omnivore (Mixed diet)</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="pescatarian">Pescatarian</option>
          <option value="keto">Keto/Low-carb</option>
          <option value="mediterranean">Mediterranean</option>
        </select>
      </div>

      {/* Sleep and Stress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sleep Hours */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Moon className="h-4 w-4 text-muted-foreground" />
            <label htmlFor="sleep" className="text-sm font-medium text-foreground">
              Average Sleep (hours/night)
            </label>
          </div>
          <input
            id="sleep"
            type="number"
            min="1"
            max="16"
            step="0.5"
            placeholder="e.g., 7"
            value={formData.sleepHours}
            onChange={(e) => updateFormData({ sleepHours: e.target.value })}
            className="w-full h-11 px-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground mt-1">Recommended: 7-9 hours</p>
        </div>

        {/* Stress Level */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-4 w-4 text-muted-foreground" />
            <label className="text-sm font-medium text-foreground">Stress Level</label>
          </div>
          <div className="flex gap-2">
            {["Low", "Medium", "High"].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => updateFormData({ stressLevel: level.toLowerCase() })}
                className={cn(
                  "flex-1 p-3 rounded-lg border text-sm font-medium transition-all",
                  formData.stressLevel === level.toLowerCase()
                    ? level === "Low"
                      ? "border-risk-low bg-risk-low/10 text-risk-low"
                      : level === "Medium"
                      ? "border-risk-medium bg-risk-medium/10 text-risk-medium"
                      : "border-risk-high bg-risk-high/10 text-risk-high"
                    : "border-border bg-card text-foreground hover:border-primary/50"
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
