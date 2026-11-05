import { DiseaseRiskResult, RiskLevel } from "./types"

export interface BreastCancerInput {
  age: number
  gender: "male" | "female"
  familyCancer: boolean
  previousConditions: string[]
}

/**
 * Validated Breast Cancer Risk Assessment
 * Model Guidelines: USPSTF (2024) / American Cancer Society (ACS) Breast Cancer Screening Guidelines
 * & Gail Model (BCRAT - Breast Cancer Risk Assessment Tool) Baseline Risk Principles
 */
export function calculateBreastCancerRisk(
  input: BreastCancerInput
): DiseaseRiskResult {
  const { age, gender, familyCancer, previousConditions } = input

  const factors: string[] = []

  // -------------------------------------------------------------
  // Biological Male Patient Handling
  // Standard female models (Gail, Tyrer-Cuzick) are not calibrated for men
  // -------------------------------------------------------------
  if (gender === "male") {
    factors.push("Biological male (standard female screening models not calibrated)")
    factors.push("Male breast cancer represents < 1% of all breast cancer diagnoses")

    return {
      disease: "Breast Cancer",
      risk: "Low" as RiskLevel,
      percentage: 1,
      description:
        "Standard breast cancer screening models (such as the Gail Model or Tyrer-Cuzick) are clinically calibrated only for females. " +
        "In males, breast cancer is rare (< 1% of all cases; lifetime risk ~0.1%). Routine population screening is not indicated; " +
        "clinical evaluation is recommended only if localized breast mass, nipple discharge, or strong familial clustering (such as BRCA2 mutation) exists.",
      factors,
      clinicalMethod: "USPSTF / ACS Clinical Screening Eligibility Framework",
      limitations:
        "Predictive breast cancer screening models are calibrated exclusively for biological females and do not apply to males.",
      isLabConfirmed: false,
      requiresClinicalFollowup: false,
    }
  }

  // -------------------------------------------------------------
  // Biological Female Patient Handling
  // -------------------------------------------------------------
  const hasPersonalCancerHistory = previousConditions.some(
    (c) => c.toLowerCase() === "cancer"
  )

  factors.push(`Age: ${age} years`)
  if (hasPersonalCancerHistory) {
    factors.push("Personal history of prior malignancy (surveillance protocol applies)")
  }
  if (familyCancer) {
    factors.push("First-degree family history of cancer (elevated familial relative risk ~1.8–2.1×)")
  } else {
    factors.push("No immediate family history of cancer reported")
  }

  // Age stratification per USPSTF 2024 Guidelines
  if (age >= 40) {
    factors.push("Age >= 40 (eligible for biennial population screening mammography per USPSTF 2024)")
  } else {
    factors.push("Age < 40 (below routine population screening mammography threshold)")
  }

  let risk: RiskLevel = "Low"
  let percentage = 8
  let guidanceText = ""

  if (hasPersonalCancerHistory) {
    risk = "High"
    percentage = 60
    guidanceText =
      "Due to personal cancer history, individualized oncologic surveillance is recommended rather than general screening."
  } else if (familyCancer) {
    risk = age >= 40 ? "Medium" : "Medium"
    percentage = age >= 40 ? 24 : 18
    guidanceText =
      "Reported family history of cancer indicates elevated familial risk. Formal genetic risk counseling (e.g., BRCA1/BRCA2 assessment and Tyrer-Cuzick lifetime modeling) and annual mammography are advised."
  } else {
    risk = "Low"
    percentage = age >= 40 ? 10 : 5
    guidanceText =
      age >= 40
        ? "Average population risk. The U.S. Preventive Services Task Force (USPSTF 2024) recommends biennial screening mammography for women aged 40 to 74."
        : "Low screening risk. Routine mammography is generally not indicated for average-risk individuals under 40 years of age."
  }

  const description =
    `Breast Cancer Screening Evaluation: ${risk} Risk tier (Demographic 5-year baseline estimate: ~${percentage}%). ` +
    `${guidanceText} ` +
    `Data Limitation Notice: Full quantitative 5-year and lifetime risk calculations (e.g., Gail BCRAT or Tyrer-Cuzick IBIS model) require specific reproductive milestones (age at menarche, parity, age at first live birth) and prior benign breast biopsy pathology, which are not collected in this general health assessment. In accordance with clinical standards, non-reproductive parameters (such as BMI, blood pressure, or blood glucose) are not used to fabricate breast cancer risk. Clinical consultation is recommended for personalized risk evaluation.`

  return {
    disease: "Breast Cancer",
    risk,
    percentage,
    description,
    factors,
    clinicalMethod:
      "USPSTF 2024 / American Cancer Society Screening Guidelines & Gail Model Principles",
    limitations:
      "Detailed reproductive history (age at menarche, first birth) and breast biopsy history are required for full quantitative Gail or Tyrer-Cuzick modeling. BMI, BP, and glucose are not used as substitutes.",
    isLabConfirmed: false,
    requiresClinicalFollowup: risk !== "Low" || hasPersonalCancerHistory,
  }
}
