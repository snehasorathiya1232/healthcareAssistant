import { DiseaseRiskResult, RiskLevel } from "./types"
import { MedicationProfile } from "./medications"

export interface DiabetesInput {
  age: number
  gender: "male" | "female"
  bmi: number
  fastingGlucose: number
  familyDiabetes: boolean
  previousConditions: string[]
  exerciseFrequency: string
  systolicBP: number
  diastolicBP: number
  medications: MedicationProfile
  symptoms?: string[]
}

/**
 * Validated Diabetes Risk Assessment
 * Model 1: American Diabetes Association (ADA) Diabetes Risk Test (Bang et al. Ann Intern Med 2009 / ADA 2024)
 * Model 2: ADA 2024 Laboratory Glycemic Diagnostic Thresholds (Fasting Blood Glucose)
 */
export function calculateDiabetesRisk(input: DiabetesInput): DiseaseRiskResult {
  const {
    age,
    gender,
    bmi,
    fastingGlucose,
    familyDiabetes,
    previousConditions,
    exerciseFrequency,
    systolicBP,
    diastolicBP,
    medications,
    symptoms = [],
  } = input

  const factors: string[] = []

  // Check known diabetes history or antidiabetic medication
  const hasDiagnosedDiabetes =
    previousConditions.some((c) => c.toLowerCase() === "diabetes") ||
    medications.isTakingAntidiabetic

  if (hasDiagnosedDiabetes) {
    factors.push("Established personal history of diabetes")
  }

  // -------------------------------------------------------------
  // 1. ADA Non-Invasive Diabetes Risk Test Scoring (0 - 10 points)
  // -------------------------------------------------------------
  let adaPoints = 0

  // Age points
  if (age >= 60) {
    adaPoints += 3
    factors.push(`Age ${age} (ADA Risk: +3 pts)`)
  } else if (age >= 50) {
    adaPoints += 2
    factors.push(`Age ${age} (ADA Risk: +2 pts)`)
  } else if (age >= 40) {
    adaPoints += 1
    factors.push(`Age ${age} (ADA Risk: +1 pt)`)
  }

  // Sex points (Men have higher prevalence of undiagnosed diabetes in screening trials)
  if (gender === "male") {
    adaPoints += 1
    factors.push("Biological male (ADA Risk: +1 pt)")
  }

  // Family history points
  if (familyDiabetes) {
    adaPoints += 1
    factors.push("First-degree family history of diabetes (ADA Risk: +1 pt)")
  }

  // High blood pressure points (Diagnosed, on BP meds, or SBP>=130 / DBP>=80)
  const hasHypertension =
    previousConditions.some((c) => c.toLowerCase() === "hypertension") ||
    medications.isTakingAntihypertensive ||
    systolicBP >= 130 ||
    diastolicBP >= 80

  if (hasHypertension) {
    adaPoints += 1
    factors.push("Hypertension / blood pressure >= 130/80 mmHg (ADA Risk: +1 pt)")
  }

  // Physical inactivity points
  const isPhysicallyInactive =
    exerciseFrequency === "sedentary" || exerciseFrequency === "rarely"
  if (isPhysicallyInactive) {
    adaPoints += 1
    factors.push("Physical inactivity / sedentary routine (ADA Risk: +1 pt)")
  }

  // BMI points
  if (bmi >= 40) {
    adaPoints += 3
    factors.push(`Class III Obesity: BMI ${bmi.toFixed(1)} kg/m² (ADA Risk: +3 pts)`)
  } else if (bmi >= 30) {
    adaPoints += 2
    factors.push(`Obesity: BMI ${bmi.toFixed(1)} kg/m² (ADA Risk: +2 pts)`)
  } else if (bmi >= 25) {
    adaPoints += 1
    factors.push(`Overweight: BMI ${bmi.toFixed(1)} kg/m² (ADA Risk: +1 pt)`)
  } else {
    factors.push(`Normal BMI: ${bmi.toFixed(1)} kg/m²`)
  }

  // -------------------------------------------------------------
  // 2. ADA 2024 Laboratory Glycemic Assessment (Fasting Glucose)
  // -------------------------------------------------------------
  let glycemicStatus: "hypoglycemia" | "normal" | "prediabetes" | "diabetes_range" = "normal"
  let glycemicText = ""

  if (fastingGlucose < 70) {
    glycemicStatus = "hypoglycemia"
    glycemicText = `Low fasting glucose (${fastingGlucose} mg/dL) indicates hypoglycemia.`
    factors.push(`Hypoglycemia: ${fastingGlucose} mg/dL (< 70 mg/dL)`)
  } else if (fastingGlucose < 100) {
    glycemicStatus = "normal"
    glycemicText = `Fasting glucose (${fastingGlucose} mg/dL) is within normal clinical limits (70–99 mg/dL).`
    factors.push(`Normal fasting blood sugar: ${fastingGlucose} mg/dL`)
  } else if (fastingGlucose <= 125) {
    glycemicStatus = "prediabetes"
    glycemicText = `Fasting glucose (${fastingGlucose} mg/dL) is in the Impaired Fasting Glucose (Prediabetes) range (100–125 mg/dL).`
    factors.push(`Impaired fasting glucose: ${fastingGlucose} mg/dL (100–125 mg/dL)`)
  } else {
    glycemicStatus = "diabetes_range"
    glycemicText = `Fasting glucose (${fastingGlucose} mg/dL) meets laboratory threshold for diabetes (>= 126 mg/dL); confirmatory retesting required.`
    factors.push(`Elevated fasting glucose: ${fastingGlucose} mg/dL (>= 126 mg/dL)`)
  }

  // Osmotic symptoms check
  const lowerSymptoms = symptoms.map((s) => s.toLowerCase())
  if (lowerSymptoms.includes("frequent urination") || lowerSymptoms.includes("excessive thirst")) {
    factors.push("Classic osmotic symptoms reported (polyuria / polydipsia)")
  }

  // -------------------------------------------------------------
  // 3. Risk Stratification & Clinical Synthesis
  // -------------------------------------------------------------
  let risk: RiskLevel = "Low"
  let percentage = 10

  if (hasDiagnosedDiabetes || glycemicStatus === "diabetes_range") {
    risk = "High"
    percentage = Math.min(88, 75 + Math.round((fastingGlucose - 126) / 10))
  } else if (glycemicStatus === "prediabetes") {
    if (adaPoints >= 5) {
      risk = "High"
      percentage = 60
    } else {
      risk = "Medium"
      percentage = 45
    }
  } else {
    // Fasting glucose normal, screening risk driven by ADA risk score
    if (adaPoints >= 5) {
      risk = "Medium"
      percentage = 30 + (adaPoints - 5) * 6
    } else if (adaPoints >= 4) {
      risk = "Medium"
      percentage = 22
    } else {
      risk = "Low"
      percentage = Math.max(5, adaPoints * 4)
    }
  }

  // Ensure percentage stays strictly 0-100
  percentage = Math.max(1, Math.min(99, Math.round(percentage)))

  const description =
    `ADA Risk Score: ${adaPoints}/10 (${adaPoints >= 5 ? "High Screening Risk" : adaPoints >= 4 ? "Increased Screening Risk" : "Low Screening Risk"}). ` +
    `${glycemicText} ` +
    `Screening risk is evaluated separately from laboratory testing. Fasting glucose thresholds must never be applied to random postprandial measurements. Confirmatory repeat fasting glucose or venous HbA1c is required for clinical diagnosis.`

  return {
    disease: "Diabetes",
    risk,
    percentage,
    description,
    factors,
    clinicalMethod: "ADA Diabetes Risk Test (Bang et al. 2009) & ADA 2024 Fasting Glycemic Criteria",
    limitations:
      "Self-reported fasting status requires clinical laboratory confirmation (fasting plasma glucose or HbA1c). Fasting thresholds do not apply to random specimens.",
    isLabConfirmed: hasDiagnosedDiabetes || glycemicStatus === "diabetes_range",
    requiresClinicalFollowup: risk !== "Low" || glycemicStatus !== "normal",
  }
}
