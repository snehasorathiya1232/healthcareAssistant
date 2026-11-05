import { DiseaseRiskResult, RiskLevel } from "./types"
import { MedicationProfile } from "./medications"

export interface LiverInput {
  age: number
  bmi: number
  alcoholConsumption: string
  fastingGlucose: number
  systolicBP: number
  diastolicBP: number
  cholesterol: number
  previousConditions: string[]
  medications: MedicationProfile
  ast?: number
  alt?: number
  platelets?: number
  symptoms?: string[]
}

/**
 * Validated Liver Disease Assessment
 * Model 1: FIB-4 Index (Sterling et al., Hepatology 2006;43:1317-1325)
 * Model 2: AASLD / EASL 2024 Metabolic Dysfunction-Associated Steatotic Liver Disease (MASLD)
 *          & Alcohol-Associated Liver Disease (ALD) Clinical Framework
 */
export function calculateLiverRisk(input: LiverInput): DiseaseRiskResult {
  const {
    age,
    bmi,
    alcoholConsumption,
    fastingGlucose,
    systolicBP,
    diastolicBP,
    cholesterol,
    previousConditions,
    medications,
    ast,
    alt,
    platelets,
    symptoms = [],
  } = input

  const factors: string[] = []

  // Check personal history of liver disease
  const hasDiagnosedLiverDisease = previousConditions.some(
    (c) => c.toLowerCase() === "liver disease"
  )
  if (hasDiagnosedLiverDisease) {
    factors.push("Established personal history of liver disease")
  }

  // -------------------------------------------------------------
  // Case A: AST, ALT, and Platelets available -> Calculate FIB-4
  // FIB-4 = (Age × AST) / (Platelet Count × √ALT)
  // AST, ALT in U/L, Platelets in 10^9/L
  // -------------------------------------------------------------
  const hasValidLabs =
    ast !== undefined &&
    alt !== undefined &&
    platelets !== undefined &&
    Number.isFinite(ast) &&
    Number.isFinite(alt) &&
    Number.isFinite(platelets) &&
    ast > 0 &&
    alt > 0 &&
    platelets > 0

  if (hasValidLabs) {
    const fib4 = (age * ast) / (platelets * Math.sqrt(alt))
    const fib4Formatted = fib4.toFixed(2)

    factors.push(`Age: ${age} years`)
    factors.push(`AST: ${ast} U/L`)
    factors.push(`ALT: ${alt} U/L`)
    factors.push(`Platelet Count: ${platelets} × 10⁹/L`)
    factors.push(`Calculated FIB-4 Index: ${fib4Formatted}`)

    let risk: RiskLevel = "Low"
    let fib4TierText = ""
    let percentage = 10

    // AASLD / EASL age-adjusted FIB-4 cutoffs
    // In patients >= 65 years, the lower cutoff is 2.0 instead of 1.3 to reduce false positives
    const lowerCutoff = age >= 65 ? 2.0 : 1.3
    const upperCutoff = 2.67

    if (fib4 > upperCutoff) {
      risk = "High"
      fib4TierText = `FIB-4 of ${fib4Formatted} is above the high-risk threshold (> 2.67), indicating high probability of advanced fibrosis (F3–F4). Hepatology evaluation is advised.`
      percentage = 75
    } else if (fib4 >= lowerCutoff) {
      risk = "Medium"
      fib4TierText = `FIB-4 of ${fib4Formatted} falls in the indeterminate range (${lowerCutoff}–2.67). Secondary non-invasive assessment (e.g., transient elastography / FibroScan) is recommended.`
      percentage = 42
    } else {
      risk = "Low"
      fib4TierText = `FIB-4 of ${fib4Formatted} is below the low-risk threshold (< ${lowerCutoff}), ruling out advanced fibrosis with high negative predictive value (> 90%).`
      percentage = 12
    }

    if (hasDiagnosedLiverDisease) {
      risk = "High"
      percentage = Math.max(percentage, 70)
    }

    const description =
      `FIB-4 Fibrosis Index: ${fib4Formatted} (${risk} Fibrosis Risk). ` +
      `${fib4TierText} ` +
      `Diagnostic Rule: FIB-4 is a validated screening estimate for hepatic fibrosis and is NOT a confirmed liver disease diagnosis. Clinical diagnosis requires comprehensive medical evaluation.`

    return {
      disease: "Liver Disorders",
      risk,
      percentage,
      description,
      factors,
      clinicalMethod: "FIB-4 Index (Sterling et al., Hepatology 2006) & AASLD/EASL Guidelines",
      limitations:
        "FIB-4 is a non-invasive screening index, not a confirmed liver disease diagnosis. Imaging (ultrasound/elastography) and clinical evaluation are required for confirmation.",
      isLabConfirmed: true,
      requiresClinicalFollowup: risk !== "Low" || hasDiagnosedLiverDisease,
    }
  }

  // -------------------------------------------------------------
  // Case B: Labs not provided -> AASLD/EASL Metabolic & Alcohol Model
  // -------------------------------------------------------------
  const isHeavyAlcohol = alcoholConsumption.toLowerCase() === "heavy"
  const isModerateAlcohol = alcoholConsumption.toLowerCase() === "moderate"

  if (isHeavyAlcohol) {
    factors.push("Heavy alcohol consumption (primary risk factor for alcoholic liver disease and steatohepatitis)")
  } else if (isModerateAlcohol) {
    factors.push("Moderate alcohol consumption")
  }

  // Metabolic syndrome criteria per AASLD MASLD guidelines
  let metabolicPoints = 0

  if (bmi >= 30) {
    metabolicPoints += 2
    factors.push(`Obesity (BMI ${bmi.toFixed(1)} kg/m² - major MASLD risk factor)`)
  } else if (bmi >= 25) {
    metabolicPoints += 1
    factors.push(`Overweight (BMI ${bmi.toFixed(1)} kg/m²)`)
  }

  if (fastingGlucose >= 126 || previousConditions.some((c) => c.toLowerCase() === "diabetes")) {
    metabolicPoints += 2
    factors.push("Diabetes / fasting glucose >= 126 mg/dL (independent driver of hepatic steatosis)")
  } else if (fastingGlucose >= 100) {
    metabolicPoints += 1
    factors.push("Impaired fasting glucose (100–125 mg/dL)")
  }

  if (systolicBP >= 130 || diastolicBP >= 85 || previousConditions.some((c) => c.toLowerCase() === "hypertension")) {
    metabolicPoints += 1
    factors.push("Hypertension / blood pressure >= 130/85 mmHg")
  }

  if (cholesterol >= 200) {
    metabolicPoints += 1
    factors.push(`Elevated cholesterol (${cholesterol} mg/dL - dyslipidemia marker)`)
  }

  if (medications.isTakingHepatotoxic) {
    factors.push("Potential hepatotoxic medication exposure")
  }

  // Hepatic symptoms
  const lowerSymptoms = symptoms.map((s) => s.toLowerCase())
  if (lowerSymptoms.includes("stomach pain") || lowerSymptoms.includes("jaundice")) {
    factors.push("Abdominal / digestive symptoms reported")
  }

  let risk: RiskLevel = "Low"
  let percentage = 12

  if (hasDiagnosedLiverDisease) {
    risk = "High"
    percentage = 72
  } else if (isHeavyAlcohol && metabolicPoints >= 2) {
    risk = "High"
    percentage = 65
  } else if (isHeavyAlcohol || metabolicPoints >= 4) {
    risk = "Medium"
    percentage = 45
  } else if (metabolicPoints >= 2 || isModerateAlcohol) {
    risk = "Medium"
    percentage = 30
  } else {
    risk = "Low"
    percentage = Math.max(8, metabolicPoints * 6)
  }

  percentage = Math.max(1, Math.min(99, percentage))

  const description =
    `Metabolic & Behavioral Liver Risk: ${risk} Risk tier. ` +
    `Evaluated based on metabolic dysfunction factors (BMI ${bmi.toFixed(1)} kg/m², blood sugar, blood pressure, cholesterol) and alcohol intake per AASLD/EASL clinical guidance. ` +
    `Laboratory Limitation: Liver enzymes (AST, ALT) and platelet counts were not provided in this assessment. Therefore, the validated FIB-4 index cannot be calculated. Comprehensive liver function testing (AST, ALT, Bilirubin, Albumin) and a complete blood count are recommended for objective clinical evaluation.`

  return {
    disease: "Liver Disorders",
    risk,
    percentage,
    description,
    factors,
    clinicalMethod: "AASLD / EASL 2024 Practice Guidelines for MASLD and Alcohol-Related Liver Disease",
    limitations:
      "Liver enzymes (AST, ALT) and platelets were not provided. FIB-4 index cannot be calculated without laboratory measurements. FIB-4 is not a confirmed liver disease diagnosis.",
    isLabConfirmed: false,
    requiresClinicalFollowup: risk !== "Low" || hasDiagnosedLiverDisease,
  }
}
