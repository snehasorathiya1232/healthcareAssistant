"use client"

import { FormData } from "@/app/(dashboard)/predict/page"
import { User, Calendar } from "lucide-react"

interface PersonalInfoStepProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  errors?: Record<string, string>
}

export function PersonalInfoStep({ formData, updateFormData, errors }: PersonalInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Age */}
        <div className="space-y-2 p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Calendar className="h-4 w-4" />
            </div>
            <label htmlFor="age" className="text-sm font-semibold text-foreground">
              Age (Years) <span className="text-destructive">*</span>
            </label>
          </div>
          <input
            id="age"
            type="number"
            min="10"
            max="90"
            placeholder="e.g., 28"
            value={formData.age}
            onChange={(e) => updateFormData({ age: e.target.value })}
            className={`w-full h-11 px-4 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
              errors?.age ? "border-destructive focus:ring-destructive" : "border-input"
            }`}
          />
          {errors?.age ? (
            <p className="text-xs text-destructive font-medium">{errors.age}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Standard adult age range (10–90 years)</p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-2 p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-4 w-4" />
            </div>
            <label htmlFor="gender" className="text-sm font-semibold text-foreground">
              Biological Sex <span className="text-destructive">*</span>
            </label>
          </div>
          <select
            id="gender"
            value={formData.gender}
            onChange={(e) => updateFormData({ gender: e.target.value })}
            className={`w-full h-11 px-4 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
              errors?.gender ? "border-destructive focus:ring-destructive" : "border-input"
            }`}
          >
            <option value="">Select biological sex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors?.gender ? (
            <p className="text-xs text-destructive font-medium">{errors.gender}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Used for gender-specific clinical scoring algorithms</p>
          )}
        </div>
      </div>
    </div>
  )
}
