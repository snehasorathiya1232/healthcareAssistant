export interface HealthAssessmentLimits {
  min: number
  max: number
  unit: string
  integerOnly: boolean
  label: string
}

export const HEALTH_LIMITS = {
  age: { min: 10, max: 90, unit: "Years", integerOnly: true, label: "Age" },
  height: { min: 50, max: 250, unit: "cm", integerOnly: false, label: "Height" },
  weight: { min: 10, max: 300, unit: "kg", integerOnly: false, label: "Weight" },
  bloodPressureSystolic: {
    min: 50,
    max: 250,
    unit: "mmHg",
    integerOnly: true,
    label: "Systolic Blood Pressure",
  },
  bloodPressureDiastolic: {
    min: 20,
    max: 150,
    unit: "mmHg",
    integerOnly: true,
    label: "Diastolic Blood Pressure",
  },
  bloodSugar: {
    min: 20,
    max: 600,
    unit: "mg/dL",
    integerOnly: false,
    label: "Fasting Blood Sugar",
  },
  cholesterol: {
    min: 50,
    max: 600,
    unit: "mg/dL",
    integerOnly: false,
    label: "Total Cholesterol",
  },
  heartRate: {
    min: 20,
    max: 250,
    unit: "bpm",
    integerOnly: true,
    label: "Resting Heart Rate",
  },
  sleepHours: {
    min: 1,
    max: 18,
    unit: "Hours",
    integerOnly: false,
    label: "Sleep Hours",
  },
} as const

export type NumericField = keyof typeof HEALTH_LIMITS

export interface ValidatedHealthData {
  age: number
  gender: "male" | "female"
  height: number
  weight: number
  bloodPressureSystolic: number
  bloodPressureDiastolic: number
  bloodSugar: number
  cholesterol: number
  heartRate: number
  isPediatric: boolean
  // Optional health history & lifestyle
  familyDiabetes?: boolean
  familyHeartDisease?: boolean
  familyCancer?: boolean
  previousConditions?: string[]
  currentMedications?: string
  smokingStatus?: string
  alcoholConsumption?: string
  exerciseFrequency?: string
  dietType?: string
  sleepHours?: string
  stressLevel?: string
  symptoms?: string[]
  // Optional laboratory parameters
  serumCreatinine?: number
  uacr?: number
  ast?: number
  alt?: number
  platelets?: number
}

export interface FieldValidationResult {
  valid: boolean
  error?: string
  value?: number
}

/**
 * Validates a single numeric field against software boundaries and integer rules.
 * Does NOT clamp, mutate, or substitute values.
 */
export function validateNumericField(
  value: unknown,
  field: NumericField
): FieldValidationResult {
  const config = HEALTH_LIMITS[field]

  if (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return { valid: false, error: `${config.label} is required.` }
  }

  const str = String(value).trim()

  if (config.integerOnly) {
    if (str.includes(".")) {
      return {
        valid: false,
        error: `${config.label} must be a whole integer without decimals.`,
      }
    }
    if (!/^\d+$/.test(str)) {
      return {
        valid: false,
        error: `${config.label} must be a positive whole number.`,
      }
    }
  } else {
    if (!/^\d+(\.\d+)?$/.test(str)) {
      return {
        valid: false,
        error: `${config.label} must be a valid positive number.`,
      }
    }
  }

  const num = Number(str)

  if (!Number.isFinite(num) || Number.isNaN(num)) {
    return { valid: false, error: `${config.label} must be a valid finite number.` }
  }

  if (num < config.min || num > config.max) {
    return {
      valid: false,
      error: `${config.label} must be between ${config.min} and ${config.max} ${config.unit}.`,
    }
  }

  return { valid: true, value: num }
}

/**
 * Validates gender input strictly to male or female.
 */
export function validateGender(
  value: unknown
): { valid: boolean; error?: string; value?: "male" | "female" } {
  if (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return { valid: false, error: "Gender is required." }
  }

  const clean = String(value).trim().toLowerCase()
  if (clean !== "male" && clean !== "female") {
    return {
      valid: false,
      error: "Please select a valid gender (Male or Female).",
    }
  }

  return { valid: true, value: clean as "male" | "female" }
}

/**
 * Validates blood pressure relationship (Systolic must be strictly greater than Diastolic).
 */
export function validateBloodPressurePair(
  systolicVal: unknown,
  diastolicVal: unknown
): { valid: boolean; systolicError?: string; diastolicError?: string } {
  const sysRes = validateNumericField(systolicVal, "bloodPressureSystolic")
  const diaRes = validateNumericField(diastolicVal, "bloodPressureDiastolic")

  if (!sysRes.valid || !diaRes.valid) {
    return {
      valid: false,
      systolicError: sysRes.error,
      diastolicError: diaRes.error,
    }
  }

  if (sysRes.value! <= diaRes.value!) {
    return {
      valid: false,
      systolicError: `Systolic (${sysRes.value} mmHg) must be higher than Diastolic (${diaRes.value} mmHg).`,
      diastolicError: `Diastolic (${diaRes.value} mmHg) cannot be equal to or higher than Systolic (${sysRes.value} mmHg).`,
    }
  }

  return { valid: true }
}

/**
 * Validates Step 1 fields (Personal Info: Age, Gender, Height, Weight).
 */
export function validateStep1(data: {
  age?: unknown
  gender?: unknown
  height?: unknown
  weight?: unknown
}): Record<string, string> {
  const errors: Record<string, string> = {}

  const ageRes = validateNumericField(data.age, "age")
  if (!ageRes.valid) errors.age = ageRes.error!

  const genderRes = validateGender(data.gender)
  if (!genderRes.valid) errors.gender = genderRes.error!

  const heightRes = validateNumericField(data.height, "height")
  if (!heightRes.valid) errors.height = heightRes.error!

  const weightRes = validateNumericField(data.weight, "weight")
  if (!weightRes.valid) errors.weight = weightRes.error!

  return errors
}

/**
 * Validates Step 2 fields (Vitals: Systolic BP, Diastolic BP, Blood Sugar, Cholesterol, Heart Rate).
 */
export function validateStep2(data: {
  bloodPressureSystolic?: unknown
  bloodPressureDiastolic?: unknown
  bloodSugar?: unknown
  cholesterol?: unknown
  heartRate?: unknown
}): Record<string, string> {
  const errors: Record<string, string> = {}

  const bpPair = validateBloodPressurePair(
    data.bloodPressureSystolic,
    data.bloodPressureDiastolic
  )
  if (!bpPair.valid) {
    if (bpPair.systolicError) errors.bloodPressureSystolic = bpPair.systolicError
    if (bpPair.diastolicError) errors.bloodPressureDiastolic = bpPair.diastolicError
  }

  const sugarRes = validateNumericField(data.bloodSugar, "bloodSugar")
  if (!sugarRes.valid) errors.bloodSugar = sugarRes.error!

  const cholRes = validateNumericField(data.cholesterol, "cholesterol")
  if (!cholRes.valid) errors.cholesterol = cholRes.error!

  const hrRes = validateNumericField(data.heartRate, "heartRate")
  if (!hrRes.valid) errors.heartRate = hrRes.error!

  return errors
}

/**
 * Full server-side and client-side validation for all mandatory fields.
 */
export function validateHealthAssessment(data: any): {
  isValid: boolean
  errors: Record<string, string>
  validatedData?: ValidatedHealthData
} {
  const step1Errors = validateStep1(data)
  const step2Errors = validateStep2(data)
  const allErrors = { ...step1Errors, ...step2Errors }

  if (Object.keys(allErrors).length > 0) {
    return { isValid: false, errors: allErrors }
  }

  const age = Number(data.age)
  const gender = String(data.gender).trim().toLowerCase() as "male" | "female"
  const height = Number(data.height)
  const weight = Number(data.weight)
  const systolic = Number(data.bloodPressureSystolic)
  const diastolic = Number(data.bloodPressureDiastolic)
  const bloodSugar = Number(data.bloodSugar)
  const cholesterol = Number(data.cholesterol)
  const heartRate = Number(data.heartRate)

  const validatedData: ValidatedHealthData = {
    age,
    gender,
    height,
    weight,
    bloodPressureSystolic: systolic,
    bloodPressureDiastolic: diastolic,
    bloodSugar,
    cholesterol,
    heartRate,
    isPediatric: age < 18,
    familyDiabetes: Boolean(data.familyDiabetes),
    familyHeartDisease: Boolean(data.familyHeartDisease),
    familyCancer: Boolean(data.familyCancer),
    previousConditions: Array.isArray(data.previousConditions)
      ? data.previousConditions
      : [],
    currentMedications: typeof data.currentMedications === "string" ? data.currentMedications : "",
    smokingStatus: typeof data.smokingStatus === "string" ? data.smokingStatus : "",
    alcoholConsumption: typeof data.alcoholConsumption === "string" ? data.alcoholConsumption : "",
    exerciseFrequency: typeof data.exerciseFrequency === "string" ? data.exerciseFrequency : "",
    dietType: typeof data.dietType === "string" ? data.dietType : "",
    sleepHours: typeof data.sleepHours === "string" ? data.sleepHours : "",
    stressLevel: typeof data.stressLevel === "string" ? data.stressLevel : "",
    symptoms: Array.isArray(data.symptoms) ? data.symptoms : [],
    serumCreatinine:
      data.serumCreatinine !== undefined && data.serumCreatinine !== null && data.serumCreatinine !== "" && Number.isFinite(Number(data.serumCreatinine))
        ? Number(data.serumCreatinine)
        : undefined,
    uacr:
      data.uacr !== undefined && data.uacr !== null && data.uacr !== "" && Number.isFinite(Number(data.uacr))
        ? Number(data.uacr)
        : undefined,
    ast:
      data.ast !== undefined && data.ast !== null && data.ast !== "" && Number.isFinite(Number(data.ast))
        ? Number(data.ast)
        : undefined,
    alt:
      data.alt !== undefined && data.alt !== null && data.alt !== "" && Number.isFinite(Number(data.alt))
        ? Number(data.alt)
        : undefined,
    platelets:
      data.platelets !== undefined && data.platelets !== null && data.platelets !== "" && Number.isFinite(Number(data.platelets))
        ? Number(data.platelets)
        : undefined,
  }

  return { isValid: true, errors: {}, validatedData }
}

export interface SafetyWarning {
  severity: "critical" | "warning" | "advisory"
  title: string
  message: string
  category: "blood_pressure" | "blood_sugar" | "heart_rate" | "cholesterol" | "pediatric" | "general"
}

/**
 * Generates clinical safety warnings based on established medical guidelines.
 * Input validation and health interpretation remain separate.
 */
export function generateSafetyWarnings(data: ValidatedHealthData): SafetyWarning[] {
  const warnings: SafetyWarning[] = []

  // 1. PEDIATRIC ADVISORY (Ages 10–17)
  if (data.isPediatric) {
    warnings.push({
      severity: "warning",
      category: "pediatric",
      title: `Pediatric Population Advisory (Age ${data.age})`,
      message:
        `Adolescent screening notice: Standard adult cardiovascular, diabetes, and BMI predictive risk calculators are not clinically calibrated for individuals under 18 years of age. Pediatric growth percentiles (CDC/WHO) and specialized pediatric clinical evaluation are required. Adult risk projections must not be applied to minors without pediatric consultation.`,
    })
  }

  // 2. BLOOD PRESSURE SAFETY WARNINGS (AHA/ACC Clinical Classifications)
  const sys = data.bloodPressureSystolic
  const dia = data.bloodPressureDiastolic

  if (sys > 180 || dia > 120) {
    warnings.push({
      severity: "critical",
      category: "blood_pressure",
      title: "Hypertensive Crisis Alert (BP > 180/120 mmHg)",
      message:
        `Your blood pressure reading of ${sys}/${dia} mmHg is in the hypertensive crisis range. Please recheck immediately. If accompanied by chest pain, shortness of breath, numbness/weakness, vision changes, or difficulty speaking, seek emergency medical care immediately. Prompt medical guidance is required.`,
    })
  } else if (sys >= 140 || dia >= 90) {
    warnings.push({
      severity: "warning",
      category: "blood_pressure",
      title: "Stage 2 Hypertension Range",
      message:
        `Your reading of ${sys}/${dia} mmHg meets the clinical threshold for Stage 2 Hypertension. Recheck after resting and consult a physician for diagnostic evaluation and cardiovascular risk management.`,
    })
  } else if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) {
    warnings.push({
      severity: "advisory",
      category: "blood_pressure",
      title: "Stage 1 Hypertension Range",
      message:
        `Your reading of ${sys}/${dia} mmHg falls within the Stage 1 Hypertension category. Lifestyle modifications (reduced sodium, aerobic exercise) and clinical follow-up are recommended.`,
    })
  } else if (sys >= 120 && sys <= 129 && dia < 80) {
    warnings.push({
      severity: "advisory",
      category: "blood_pressure",
      title: "Elevated Blood Pressure",
      message:
        `Systolic pressure of ${sys} mmHg is elevated (120–129 mmHg with normal diastolic < 80 mmHg). Proactive dietary and lifestyle habits can prevent progression to hypertension.`,
    })
  } else if (sys < 90 || dia < 60) {
    warnings.push({
      severity: "warning",
      category: "blood_pressure",
      title: "Low Blood Pressure Alert (Hypotension)",
      message:
        `Your reading of ${sys}/${dia} mmHg is below normal thresholds. If experiencing lightheadedness, fatigue, dizziness, or blurred vision, discuss this with a healthcare professional.`,
    })
  }

  // 3. FASTING BLOOD SUGAR SAFETY WARNINGS (ADA Clinical Criteria)
  const sugar = data.bloodSugar

  if (sugar < 54) {
    warnings.push({
      severity: "critical",
      category: "blood_sugar",
      title: "Critical Hypoglycemia Alert (< 54 mg/dL)",
      message:
        `Critically low fasting blood glucose (${sugar} mg/dL) detected. Consume 15–20g of fast-acting carbohydrates (juice, glucose tablets) immediately. Seek urgent emergency medical evaluation if confusion or loss of consciousness occurs.`,
    })
  } else if (sugar < 70) {
    warnings.push({
      severity: "warning",
      category: "blood_sugar",
      title: "Hypoglycemia Warning (Below 70 mg/dL)",
      message:
        `Fasting glucose of ${sugar} mg/dL is below the normal physiological threshold (< 70 mg/dL). Recheck glucose, take fast-acting carbohydrates if symptomatic (shakiness, sweating, palpitations), and consult a doctor.`,
    })
  } else if (sugar >= 300) {
    warnings.push({
      severity: "critical",
      category: "blood_sugar",
      title: "Critical Hyperglycemia Alert (>= 300 mg/dL)",
      message:
        `Markedly elevated fasting blood glucose (${sugar} mg/dL). This carries risks of acute metabolic complications such as diabetic ketoacidosis (DKA) or hyperosmolar hyperglycemic state (HHS). Seek urgent medical care immediately.`,
    })
  } else if (sugar >= 200) {
    warnings.push({
      severity: "warning",
      category: "blood_sugar",
      title: "Severe Hyperglycemia Warning (>= 200 mg/dL)",
      message:
        `Fasting glucose of ${sugar} mg/dL is significantly elevated. Prompt medical consultation for diabetes evaluation and management is strongly advised.`,
    })
  } else if (sugar >= 126) {
    warnings.push({
      severity: "advisory",
      category: "blood_sugar",
      title: "Elevated Fasting Glucose (Diabetes Range)",
      message:
        `Fasting blood sugar of ${sugar} mg/dL meets screening thresholds for diabetes (>= 126 mg/dL). A repeat fasting test or HbA1c test with a healthcare professional is needed for confirmation.`,
    })
  } else if (sugar >= 100 && sugar <= 125) {
    warnings.push({
      severity: "advisory",
      category: "blood_sugar",
      title: "Impaired Fasting Glucose (Pre-Diabetes Range)",
      message:
        `Fasting glucose of ${sugar} mg/dL is in the pre-diabetes range (100–125 mg/dL). Dietary changes, weight management, and physical activity can help prevent diabetes.`,
    })
  }

  // 4. RESTING HEART RATE WARNINGS
  const hr = data.heartRate

  if (hr > 120) {
    warnings.push({
      severity: "warning",
      category: "heart_rate",
      title: "Significant Resting Tachycardia (> 120 bpm)",
      message:
        `Resting heart rate of ${hr} bpm is significantly elevated. If persistent, or accompanied by palpitations, dizziness, or shortness of breath, consult a healthcare provider promptly.`,
    })
  } else if (hr > 100) {
    warnings.push({
      severity: "advisory",
      category: "heart_rate",
      title: "Elevated Resting Heart Rate (101–120 bpm)",
      message:
        `Resting heart rate of ${hr} bpm is above normal resting adult parameters (60–100 bpm). Consider rechecking at rest without caffeine or stress.`,
    })
  } else if (hr < 50) {
    warnings.push({
      severity: "warning",
      category: "heart_rate",
      title: "Resting Bradycardia Alert (< 50 bpm)",
      message:
        `Resting heart rate of ${hr} bpm is unusually low. While common in endurance athletes, if accompanied by fatigue, weakness, or lightheadedness, medical evaluation is advised.`,
    })
  }

  // 5. TOTAL CHOLESTEROL WARNINGS
  const chol = data.cholesterol

  if (chol >= 300) {
    warnings.push({
      severity: "warning",
      category: "cholesterol",
      title: "Severely Elevated Cholesterol (>= 300 mg/dL)",
      message:
        `Total cholesterol of ${chol} mg/dL is severely elevated. Consult a physician for a full lipid panel (LDL, HDL, triglycerides) and lipid management plan.`,
    })
  } else if (chol >= 240) {
    warnings.push({
      severity: "advisory",
      category: "cholesterol",
      title: "High Total Cholesterol (>= 240 mg/dL)",
      message:
        `Total cholesterol of ${chol} mg/dL is in the clinically high range (desirable < 200 mg/dL). Cardiovascular lifestyle precautions are recommended.`,
    })
  }

  return warnings
}
