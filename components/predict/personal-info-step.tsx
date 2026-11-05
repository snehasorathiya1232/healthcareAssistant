"use client"

import { FormData } from "@/app/(dashboard)/predict/page"

interface PersonalInfoStepProps {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  errors?: Record<string, string>
}

export function PersonalInfoStep({ formData, updateFormData, errors }: PersonalInfoStepProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Age */}
      <div className="space-y-2">
        <label htmlFor="age" className="text-sm font-medium text-foreground">
          Age <span className="text-destructive">*</span>
        </label>
        <input
          id="age"
          type="number"
          min="10"
          max="90"
          placeholder="Enter your age (10-90)"
          value={formData.age}
          onChange={(e) => updateFormData({ age: e.target.value })}
          className={`w-full h-11 px-4 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
            errors?.age ? "border-destructive focus:ring-destructive" : "border-input"
          }`}
        />
        {errors?.age ? (
          <p className="text-xs text-destructive font-medium">{errors.age}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Your age in years (10–90)</p>
        )}
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <label htmlFor="gender" className="text-sm font-medium text-foreground">
          Gender <span className="text-destructive">*</span>
        </label>
        <select
          id="gender"
          value={formData.gender}
          onChange={(e) => updateFormData({ gender: e.target.value })}
          className={`w-full h-11 px-4 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
            errors?.gender ? "border-destructive focus:ring-destructive" : "border-input"
          }`}
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        {errors?.gender ? (
          <p className="text-xs text-destructive font-medium">{errors.gender}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Biological sex for clinical algorithms</p>
        )}
      </div>

      {/* Height */}
      <div className="space-y-2">
        <label htmlFor="height" className="text-sm font-medium text-foreground">
          Height (cm) <span className="text-destructive">*</span>
        </label>
        <input
          id="height"
          type="number"
          min="50"
          max="250"
          placeholder="Enter height in cm (50-250)"
          value={formData.height}
          onChange={(e) => updateFormData({ height: e.target.value })}
          className={`w-full h-11 px-4 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
            errors?.height ? "border-destructive focus:ring-destructive" : "border-input"
          }`}
        />
        {errors?.height ? (
          <p className="text-xs text-destructive font-medium">{errors.height}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Example: 170 cm</p>
        )}
      </div>

      {/* Weight */}
      <div className="space-y-2">
        <label htmlFor="weight" className="text-sm font-medium text-foreground">
          Weight (kg) <span className="text-destructive">*</span>
        </label>
        <input
          id="weight"
          type="number"
          min="10"
          max="300"
          placeholder="Enter weight in kg (10-300)"
          value={formData.weight}
          onChange={(e) => updateFormData({ weight: e.target.value })}
          className={`w-full h-11 px-4 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
            errors?.weight ? "border-destructive focus:ring-destructive" : "border-input"
          }`}
        />
        {errors?.weight ? (
          <p className="text-xs text-destructive font-medium">{errors.weight}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Example: 70 kg</p>
        )}
      </div>

      {/* BMI Calculator Display */}
      {formData.height && formData.weight && Number(formData.height) > 0 && Number(formData.weight) > 0 && (
        <div className="md:col-span-2 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Your BMI</p>
              <p className="text-xs text-muted-foreground">Body Mass Index</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {(Number(formData.weight) / Math.pow(Number(formData.height) / 100, 2)).toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">
                {(() => {
                  const bmi = Number(formData.weight) / Math.pow(Number(formData.height) / 100, 2)
                  if (bmi < 18.5) return "Underweight"
                  if (bmi < 25) return "Normal weight"
                  if (bmi < 30) return "Overweight"
                  return "Obese"
                })()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
