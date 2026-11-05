import { DiseaseRiskResult, RiskLevel } from "./types"
import { MedicationProfile } from "./medications"

export interface KidneyInput {
  age: number
  gender: "male" | "female"
  systolicBP: number
  diastolicBP: number
  fastingGlucose: number
  previousConditions: string[]
  medications: MedicationProfile
  serumCreatinine?: number
  uacr?: number
  symptoms?: string[]
}

/**
 * Validated Kidney Disease Assessment
 * Model 1: SCORED Clinical Screening Tool (Bang et al., Arch Intern Med 2007;167(4):374-382)
 * Model 2: CKD-EPI 2021 Creatinine Equation (Inker et al., NEJM 2021) & KDIGO 2024 Guidelines
 */
export function calculateKidneyRisk(input: KidneyInput): DiseaseRiskResult {
  const {
    age,
    gender,
    systolicBP,
    diastolicBP,
    fastingGlucose,
    previousConditions,
    medications,
    serumCreatinine,
    uacr,
    symptoms = [],
  } = input

  const factors: string[] = []

  // Check personal history of kidney disease
  const hasDiagnosedKidneyDisease = previousConditions.some(
    (c) => c.toLowerCase() === "kidney disease"
  )
  if (hasDiagnosedKidneyDisease) {
    factors.push("Established personal history of kidney disease")
  }

  // Check major renal risk factors
  const hasHypertension =
    systolicBP >= 140 ||
    diastolicBP >= 90 ||
    previousConditions.some((c) => c.toLowerCase() === "hypertension") ||
    medications.isTakingAntihypertensive

  const hasDiabetes =
    fastingGlucose >= 126 ||
    previousConditions.some((c) => c.toLowerCase() === "diabetes") ||
    medications.isTakingAntidiabetic

  const hasCardiovascularHistory = previousConditions.some((c) => {
    const clean = c.toLowerCase()
    return clean === "heart disease" || clean === "stroke"
  })

  // Nephrotoxic medication exposure (e.g., chronic NSAIDs)
  if (medications.isTakingNsaid) {
    factors.push("Regular NSAID exposure (potential nephrotoxicity risk)")
  }

  // -------------------------------------------------------------
  // Case A: Serum Creatinine is available -> CKD-EPI 2021 Equation
  // -------------------------------------------------------------
  if (
    serumCreatinine !== undefined &&
    serumCreatinine !== null &&
    typeof serumCreatinine === "number" &&
    Number.isFinite(serumCreatinine) &&
    serumCreatinine >= 0.1 &&
    serumCreatinine <= 25.0
  ) {
    const isFemale = gender === "female"
    const kappa = isFemale ? 0.7 : 0.9
    const alpha = isFemale ? -0.241 : -0.302
    const minRatio = Math.min(serumCreatinine / kappa, 1)
    const maxRatio = Math.max(serumCreatinine / kappa, 1)

    // CKD-EPI 2021 formula without race
    const egfr = Math.round(
      142 *
        Math.pow(minRatio, alpha) *
        Math.pow(maxRatio, -1.2) *
        Math.pow(0.9938, age) *
        (isFemale ? 1.012 : 1.0)
    )

    factors.push(`Serum Creatinine: ${serumCreatinine} mg/dL`)
    factors.push(`Calculated eGFR (CKD-EPI 2021): ${egfr} mL/min/1.73m²`)

    let risk: RiskLevel = "Low"
    let stageText = ""
    let percentage = 10

    if (egfr >= 90) {
      risk = hasDiagnosedKidneyDisease || hasDiabetes || hasHypertension ? "Medium" : "Low"
      stageText = "Stage G1 (Normal or high kidney filtration)"
      percentage = risk === "Medium" ? 25 : 8
    } else if (egfr >= 60) {
      risk = "Medium"
      stageText = "Stage G2 (Mildly decreased kidney filtration)"
      percentage = 35
    } else if (egfr >= 45) {
      risk = "High"
      stageText = "Stage G3a (Mild-to-moderately decreased kidney filtration)"
      percentage = 60
    } else if (egfr >= 30) {
      risk = "High"
      stageText = "Stage G3b (Moderately-to-severely decreased kidney filtration)"
      percentage = 75
    } else if (egfr >= 15) {
      risk = "High"
      stageText = "Stage G4 (Severely decreased kidney filtration)"
      percentage = 88
    } else {
      risk = "High"
      stageText = "Stage G5 (Kidney failure)"
      percentage = 95
    }

    if (uacr !== undefined && Number.isFinite(uacr)) {
      factors.push(`Urine Albumin-to-Creatinine Ratio (UACR): ${uacr} mg/g`)
      if (uacr >= 300) {
        factors.push("Severe albuminuria / macroalbuminuria (UACR >= 300 mg/g)")
        risk = "High"
        percentage = Math.max(percentage, 70)
      } else if (uacr >= 30) {
        factors.push("Microalbuminuria (UACR 30–299 mg/g)")
        if (risk === "Low") risk = "Medium"
        percentage = Math.max(percentage, 40)
      }
    }

    const description =
      `eGFR: ${egfr} mL/min/1.73m² (${stageText}). ` +
      `Estimated kidney filtration evaluated using the 2021 CKD-EPI creatinine equation. ` +
      `Clinical Note: Per KDIGO clinical practice guidelines, chronic kidney disease cannot be diagnosed from a single measurement; persistence of eGFR < 60 mL/min/1.73m² or markers of kidney damage for >= 3 months is required for diagnosis.`

    return {
      disease: "Kidney Disease",
      risk,
      percentage,
      description,
      factors,
      clinicalMethod: "CKD-EPI 2021 Creatinine Equation (Inker et al. NEJM 2021) & KDIGO 2024 Guidelines",
      limitations:
        "Single-measurement calculation. KDIGO guidelines require persistent abnormality (>3 months) and urine albumin testing to establish chronic kidney disease diagnosis.",
      isLabConfirmed: true,
      requiresClinicalFollowup: risk !== "Low",
    }
  }

  // -------------------------------------------------------------
  // Case B: Serum Creatinine not provided -> SCORED Screening Tool
  // -------------------------------------------------------------
  let scoredPoints = 0

  if (age >= 70) {
    scoredPoints += 4
    factors.push(`Age ${age} (SCORED: +4 pts)`)
  } else if (age >= 60) {
    scoredPoints += 3
    factors.push(`Age ${age} (SCORED: +3 pts)`)
  } else if (age >= 50) {
    scoredPoints += 2
    factors.push(`Age ${age} (SCORED: +2 pts)`)
  }

  if (gender === "female") {
    scoredPoints += 1
    factors.push("Biological female (SCORED: +1 pt)")
  }

  if (hasHypertension) {
    scoredPoints += 4
    factors.push("Hypertension (SCORED: +4 pts)")
  }

  if (hasDiabetes) {
    scoredPoints += 3
    factors.push("Diabetes mellitus (SCORED: +3 pts)")
  }

  if (hasCardiovascularHistory) {
    scoredPoints += 2
    factors.push("History of cardiovascular disease / stroke (SCORED: +2 pts)")
  }

  // Check renal symptoms
  const lowerSymptoms = symptoms.map((s) => s.toLowerCase())
  if (lowerSymptoms.includes("vomiting") || lowerSymptoms.includes("swelling") || lowerSymptoms.includes("edema")) {
    factors.push("Renal-associated symptoms reported (fluid retention / nausea)")
  }

  let risk: RiskLevel = "Low"
  let percentage = 10

  if (hasDiagnosedKidneyDisease) {
    risk = "High"
    percentage = 70
  } else if (scoredPoints >= 6) {
    risk = "High"
    percentage = 55 + Math.min(25, (scoredPoints - 6) * 5)
  } else if (scoredPoints >= 4) {
    risk = "Medium"
    percentage = 30 + (scoredPoints - 4) * 10
  } else {
    risk = "Low"
    percentage = Math.max(5, scoredPoints * 5)
  }

  percentage = Math.max(1, Math.min(99, percentage))

  const description =
    `SCORED Non-Invasive Screening Score: ${scoredPoints} points (${risk} Screening Risk). ` +
    `Evaluated using validated clinical risk factors: blood pressure (${systolicBP}/${diastolicBP} mmHg), diabetes status, age (${age}), and cardiovascular history. ` +
    `Laboratory Limitation: Serum creatinine and urine albumin-to-creatinine ratio (UACR) were not provided in this assessment. In accordance with KDIGO guidelines, eGFR cannot be calculated without serum creatinine, and chronic kidney disease cannot be diagnosed from screening alone. Confirmatory laboratory testing is recommended.`

  return {
    disease: "Kidney Disease",
    risk,
    percentage,
    description,
    factors,
    clinicalMethod: "SCORED Clinical Screening Tool (Bang et al., Arch Intern Med 2007)",
    limitations:
      "Serum creatinine was not provided. eGFR cannot be calculated without laboratory creatinine. Chronic kidney disease cannot be diagnosed from a single screening assessment without persistent testing (>3 months).",
    isLabConfirmed: false,
    requiresClinicalFollowup: risk !== "Low" || hasDiagnosedKidneyDisease,
  }
}
