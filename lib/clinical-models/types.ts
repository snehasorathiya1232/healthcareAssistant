export type RiskLevel = "Low" | "Medium" | "High"

export interface DiseaseRiskResult {
  disease: string
  risk: RiskLevel
  percentage: number
  description: string
  factors: string[]
  clinicalMethod?: string
  limitations?: string
  isLabConfirmed?: boolean
  requiresClinicalFollowup?: boolean
}

export interface RecommendationItem {
  title: string
  description: string
}

export interface SafetyWarning {
  severity: "critical" | "warning" | "advisory"
  title: string
  message: string
  category: "blood_pressure" | "blood_sugar" | "heart_rate" | "cholesterol" | "pediatric" | "general"
}

export interface ClinicalEvaluationResult {
  overallScore: number
  summary: string
  gender: "male" | "female"
  isScreeningEstimate: boolean
  isPediatric: boolean
  riskResults: DiseaseRiskResult[]
  dietRecommendations: RecommendationItem[]
  lifestyleRecommendations: RecommendationItem[]
  preventiveCare: RecommendationItem[]
  safetyWarnings: SafetyWarning[]
  disclaimer: string
}

export interface MedicationProfile {
  raw: string
  isTakingAntihypertensive: boolean
  isTakingAntidiabetic: boolean
  isTakingLipidLowering: boolean
  isTakingNsaid: boolean
  isTakingHepatotoxic: boolean
  isTakingAnticoagulant: boolean
  detectedClasses: string[]
}
