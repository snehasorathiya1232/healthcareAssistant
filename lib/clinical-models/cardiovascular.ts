import { DiseaseRiskResult, RiskLevel } from "./types"
import { MedicationProfile } from "./medications"

export interface CardiovascularInput {
  age: number
  gender: "male" | "female"
  systolicBP: number
  diastolicBP: number
  cholesterol: number
  bmi: number
  smokingStatus: string
  fastingGlucose: number
  previousConditions: string[]
  medications: MedicationProfile
  heartRate: number
  familyHeartDisease: boolean
}

/**
 * Validated 10-Year Cardiovascular Disease Risk Model
 * Reference: Framingham General Cardiovascular Risk Profile (D'Agostino et al., Circulation 2008;117:743-753)
 * & ACC/AHA Prevention Guidelines
 */
export function calculateCardiovascularRisk(
  input: CardiovascularInput
): DiseaseRiskResult {
  const {
    age,
    gender,
    systolicBP,
    cholesterol,
    smokingStatus,
    fastingGlucose,
    previousConditions,
    medications,
    heartRate,
    familyHeartDisease,
  } = input

  const factors: string[] = []

  // 1. Check for established ASCVD
  const hasEstablishedASCVD = previousConditions.some((c) => {
    const clean = c.toLowerCase()
    return clean === "heart disease" || clean === "stroke"
  })

  // 2. Determine hypertension treatment status
  const isTreatedBP =
    medications.isTakingAntihypertensive ||
    previousConditions.some((c) => c.toLowerCase() === "hypertension")

  // 3. Determine smoking status
  const isSmoker =
    smokingStatus.toLowerCase() === "regular" ||
    smokingStatus.toLowerCase() === "current" ||
    smokingStatus.toLowerCase() === "occasional"

  // 4. Determine diabetes status
  const hasDiabetes =
    fastingGlucose >= 126 ||
    previousConditions.some((c) => c.toLowerCase() === "diabetes") ||
    medications.isTakingAntidiabetic

  // Document key clinical factors
  factors.push(`Age: ${age} years`)
  factors.push(`Sex: ${gender === "male" ? "Male" : "Female"}`)
  factors.push(
    `Systolic BP: ${systolicBP} mmHg (${isTreatedBP ? "Treated/Diagnosed" : "Untreated"})`
  )
  factors.push(`Total Cholesterol: ${cholesterol} mg/dL`)

  if (isSmoker) {
    factors.push(`Current tobacco smoking status (${smokingStatus})`)
  }
  if (hasDiabetes) {
    factors.push("Diabetes / fasting glucose >= 126 mg/dL (Major ASCVD Risk Equivalent)")
  }
  if (hasEstablishedASCVD) {
    factors.push("Personal history of established coronary / cerebrovascular disease")
  }
  if (familyHeartDisease) {
    factors.push("Premature first-degree family history of cardiovascular disease")
  }

  // -------------------------------------------------------------
  // Framingham 2008 Cox Proportional Hazards Regression
  // -------------------------------------------------------------
  let calculated10YearRisk = 0

  if (gender === "male") {
    // Coefficients for Men (D'Agostino et al. 2008, Table 3)
    const betaAge = 3.06117 * Math.log(Math.max(20, Math.min(79, age)))
    const betaChol = 1.1237 * Math.log(Math.max(100, Math.min(400, cholesterol)))
    // Median population reference HDL (45 mg/dL) when lipid subfractions are unmeasured
    const betaHDL = -0.93263 * Math.log(45)
    const betaSBP = isTreatedBP
      ? 1.99881 * Math.log(Math.max(90, Math.min(200, systolicBP)))
      : 1.93303 * Math.log(Math.max(90, Math.min(200, systolicBP)))
    const betaSmoker = isSmoker ? 0.65451 : 0
    const betaDiabetes = hasDiabetes ? 0.57367 : 0

    const linearPredictor =
      betaAge + betaChol + betaHDL + betaSBP + betaSmoker + betaDiabetes
    const meanLinear = 23.9802
    const baselineSurvival = 0.88936

    calculated10YearRisk =
      1 - Math.pow(baselineSurvival, Math.exp(linearPredictor - meanLinear))
  } else {
    // Coefficients for Women (D'Agostino et al. 2008, Table 3)
    const betaAge = 2.32888 * Math.log(Math.max(20, Math.min(79, age)))
    const betaChol = 1.20904 * Math.log(Math.max(100, Math.min(400, cholesterol)))
    // Median population reference HDL (55 mg/dL) when lipid subfractions are unmeasured
    const betaHDL = -0.70833 * Math.log(55)
    const betaSBP = isTreatedBP
      ? 2.82263 * Math.log(Math.max(90, Math.min(200, systolicBP)))
      : 2.76157 * Math.log(Math.max(90, Math.min(200, systolicBP)))
    const betaSmoker = isSmoker ? 0.52873 : 0
    const betaDiabetes = hasDiabetes ? 0.69154 : 0

    const linearPredictor =
      betaAge + betaChol + betaHDL + betaSBP + betaSmoker + betaDiabetes
    const meanLinear = 26.1931
    const baselineSurvival = 0.95012

    calculated10YearRisk =
      1 - Math.pow(baselineSurvival, Math.exp(linearPredictor - meanLinear))
  }

  // Adjust for family history of premature CVD (+1.5x relative risk hazard if present)
  if (familyHeartDisease) {
    calculated10YearRisk = 1 - Math.pow(1 - calculated10YearRisk, 1.3)
  }

  // Percentage value
  let percentage = Math.round(calculated10YearRisk * 100)

  // Established ASCVD override (ACC/AHA guidelines classify known ASCVD as High Risk)
  if (hasEstablishedASCVD) {
    percentage = Math.max(percentage, 45)
  }

  // Heart rate note (Do NOT treat heart rate as a standalone predictor of heart disease)
  if (heartRate > 100) {
    factors.push(`Resting tachycardia observed (${heartRate} bpm - autonomic indicator, not standalone predictor)`)
  } else if (heartRate < 50) {
    factors.push(`Resting bradycardia observed (${heartRate} bpm - hemodynamic advisory)`)
  }

  // Clamp percentage between 1 and 99
  percentage = Math.max(1, Math.min(99, percentage))

  // Risk Classification per Framingham & ACC/AHA cutoffs:
  // Low: < 10% 10-year risk
  // Medium (Borderline/Intermediate): 10% - 20% 10-year risk
  // High: > 20% 10-year risk or established ASCVD
  let risk: RiskLevel = "Low"
  if (hasEstablishedASCVD || percentage >= 20) {
    risk = "High"
  } else if (percentage >= 10) {
    risk = "Medium"
  } else {
    risk = "Low"
  }

  const description =
    `Estimated 10-Year Cardiovascular Disease Risk: ${percentage}% (${risk} Risk tier per Framingham General CVD Profile). ` +
    `Calculated from validated inputs: age, biological sex, systolic BP (${systolicBP} mmHg), total cholesterol (${cholesterol} mg/dL), smoking status, and diabetes status. ` +
    `Heart rate is evaluated as a clinical hemodynamic sign, not an arbitrary risk multiplier. Consult a physician for a complete lipid panel (LDL, HDL, triglycerides) and formal cardiovascular risk discussion.`

  return {
    disease: "Heart Disease",
    risk,
    percentage,
    description,
    factors,
    clinicalMethod:
      "Framingham 10-Year General Cardiovascular Risk Profile (D'Agostino et al. Circulation 2008; Wilson et al. ATP III)",
    limitations:
      "HDL-C and high-sensitivity C-reactive protein (hs-CRP) were not provided. Model applies standard population baseline survival curves.",
    isLabConfirmed: false,
    requiresClinicalFollowup: risk !== "Low" || hasEstablishedASCVD,
  }
}
