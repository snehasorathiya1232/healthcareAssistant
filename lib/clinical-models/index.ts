import { ValidatedHealthData, generateSafetyWarnings } from "../validations/health-assessment"
import { ClinicalEvaluationResult, DiseaseRiskResult } from "./types"
import { parseMedicationProfile } from "./medications"
import { calculateDiabetesRisk } from "./diabetes"
import { calculateCardiovascularRisk } from "./cardiovascular"
import { calculateKidneyRisk } from "./kidney"
import { calculateLiverRisk } from "./liver"
import { calculateBreastCancerRisk } from "./breast-cancer"
import { generateClinicalRecommendations } from "./recommendations"

export * from "./types"
export * from "./medications"
export * from "./diabetes"
export * from "./cardiovascular"
export * from "./kidney"
export * from "./liver"
export * from "./breast-cancer"
export * from "./recommendations"

/**
 * Main Clinical Evaluation Engine
 * Orchestrates validated clinical models for all 5 major health domains
 */
export function evaluateHealthAssessment(
  data: ValidatedHealthData
): ClinicalEvaluationResult {
  const {
    age,
    gender,
    height,
    weight,
    bloodPressureSystolic,
    bloodPressureDiastolic,
    bloodSugar,
    cholesterol,
    heartRate,
    isPediatric,
    familyDiabetes = false,
    familyHeartDisease = false,
    familyCancer = false,
    previousConditions = [],
    currentMedications = "",
    smokingStatus = "",
    alcoholConsumption = "",
    exerciseFrequency = "",
    symptoms = [],
    serumCreatinine,
    ast,
    alt,
    platelets,
  } = data

  // Parse medications clinically
  const medProfile = parseMedicationProfile(currentMedications)

  // Calculate BMI safely from validated height and weight
  const bmi = weight / Math.pow(height / 100, 2)

  // 1. Safety Warnings
  const safetyWarnings = generateSafetyWarnings(data)

  // 2. Pediatric Population (Minors under 18)
  if (isPediatric) {
    const pediatricResult: ClinicalEvaluationResult = {
      overallScore: 85,
      gender,
      isPediatric: true,
      isScreeningEstimate: true,
      summary:
        `Pediatric Population Advisory (Age ${age}): Standard adult predictive risk algorithms (Framingham CVD, ADA adult risk score, and adult BMI cutoffs) are not clinically calibrated for individuals under 18 years of age. Pediatric clinical evaluation using age- and sex-specific growth charts (CDC/WHO percentiles) by a pediatrician is recommended.`,
      riskResults: [
        {
          disease: "Pediatric Screening Notice",
          risk: "Low",
          percentage: 10,
          description:
            "Adult chronic disease risk models are clinically restricted for minors. Pediatric vitals and growth percentiles must be assessed by a qualified pediatrician.",
          factors: [`Age ${age} (Pediatric bracket)`, "Pediatric CDC/WHO percentiles required"],
          clinicalMethod: "CDC/WHO Pediatric Clinical Guidelines",
          limitations: "Adult cardiovascular and diabetes risk calculators cannot be applied to individuals under 18.",
        },
      ],
      dietRecommendations: [
        {
          title: "Adolescent Balanced Nutrition",
          description:
            "Consume nutrient-dense meals rich in dietary calcium, iron, whole grains, fruits, and lean protein to support healthy pubertal growth.",
        },
        {
          title: "Limit Sugar-Sweetened Beverages",
          description:
            "Minimize soda, sweet tea, and energy drinks to safeguard metabolic and dental health.",
        },
      ],
      lifestyleRecommendations: [
        {
          title: "Daily Youth Physical Activity",
          description:
            "Aim for at least 60 minutes of daily moderate-to-vigorous physical activity (sports, cycling, brisk play per WHO youth guidelines).",
        },
        {
          title: "Restorative Adolescent Sleep",
          description:
            "Ensure 8 to 10 hours of regular nocturnal sleep for neurocognitive development and metabolic regulation.",
        },
      ],
      preventiveCare: [
        {
          title: "Annual Pediatric Well-Child Checkup",
          description:
            "Visit a pediatrician annually for growth chart tracking (height/weight-for-age percentiles) and developmental monitoring.",
        },
      ],
      safetyWarnings,
      disclaimer:
        "Pediatric Screening Notice: Standard adult predictive risk calculators are not clinically calibrated for minors under 18. This assessment does not provide a diagnosis. Please consult a qualified pediatrician.",
    }

    return pediatricResult
  }

  // 3. Evaluate each disease with its dedicated validated clinical model
  const diabetesResult = calculateDiabetesRisk({
    age,
    gender,
    bmi,
    fastingGlucose: bloodSugar,
    familyDiabetes,
    previousConditions,
    exerciseFrequency,
    systolicBP: bloodPressureSystolic,
    diastolicBP: bloodPressureDiastolic,
    medications: medProfile,
    symptoms,
  })

  const cardiovascularResult = calculateCardiovascularRisk({
    age,
    gender,
    systolicBP: bloodPressureSystolic,
    diastolicBP: bloodPressureDiastolic,
    cholesterol,
    bmi,
    smokingStatus,
    fastingGlucose: bloodSugar,
    previousConditions,
    medications: medProfile,
    heartRate,
    familyHeartDisease,
  })

  const kidneyResult = calculateKidneyRisk({
    age,
    gender,
    systolicBP: bloodPressureSystolic,
    diastolicBP: bloodPressureDiastolic,
    fastingGlucose: bloodSugar,
    previousConditions,
    medications: medProfile,
    serumCreatinine,
    symptoms,
  })

  const liverResult = calculateLiverRisk({
    age,
    bmi,
    alcoholConsumption,
    fastingGlucose: bloodSugar,
    systolicBP: bloodPressureSystolic,
    diastolicBP: bloodPressureDiastolic,
    cholesterol,
    previousConditions,
    medications: medProfile,
    ast,
    alt,
    platelets,
    symptoms,
  })

  // Breast cancer is counted and shown only for female patients
  const breastCancerResult =
    gender === "female"
      ? calculateBreastCancerRisk({
          age,
          gender,
          familyCancer,
          previousConditions,
        })
      : null

  // Assemble disease risk array (if female count breast cancer, if male do not show breast cancer)
  const riskResults: DiseaseRiskResult[] = [
    diabetesResult,
    cardiovascularResult,
    kidneyResult,
    liverResult,
    ...(breastCancerResult ? [breastCancerResult] : []),
  ]

  // 4. Overall Health Score Calculation
  // Starts at 100, deducting proportionally based on each disease's validated risk burden
  let totalDeduction = 0

  const activeDiseases =
    gender === "female" && breastCancerResult
      ? [diabetesResult, cardiovascularResult, kidneyResult, liverResult, breastCancerResult]
      : [diabetesResult, cardiovascularResult, kidneyResult, liverResult]

  activeDiseases.forEach((res) => {
    if (res.risk === "High") {
      totalDeduction += 22 + Math.min(10, Math.round(res.percentage / 10))
    } else if (res.risk === "Medium") {
      totalDeduction += 10 + Math.min(6, Math.round(res.percentage / 15))
    } else {
      totalDeduction += Math.min(4, Math.round(res.percentage / 25))
    }
  })

  // Critical safety penalty if severe vitals
  if (bloodPressureSystolic >= 180 || bloodPressureDiastolic >= 120) {
    totalDeduction += 15
  }
  if (bloodSugar >= 300 || bloodSugar < 54) {
    totalDeduction += 15
  }

  const overallScore = Math.max(15, Math.min(100, Math.round(100 - totalDeduction)))

  // 5. Clinical Summary
  const highRiskCount = activeDiseases.filter((d) => d.risk === "High").length
  const mediumRiskCount = activeDiseases.filter((d) => d.risk === "Medium").length

  let summary = ""
  if (highRiskCount > 0) {
    const highDiseases = activeDiseases.filter((d) => d.risk === "High").map((d) => d.disease).join(", ")
    summary = `High clinical screening risk identified for: ${highDiseases}. Prompt physician consultation and diagnostic laboratory confirmation are recommended.`
  } else if (mediumRiskCount > 0) {
    const mediumDiseases = activeDiseases.filter((d) => d.risk === "Medium").map((d) => d.disease).join(", ")
    summary = `Moderate risk factors identified for: ${mediumDiseases}. Targeted lifestyle modifications and routine preventive follow-ups are advised.`
  } else {
    summary =
      "All evaluated health domains fall within low risk parameters. Continue balanced nutritional habits, regular physical activity, and age-appropriate routine screenings."
  }

  // 6. Generate Clinical Recommendations
  const { dietRecommendations, lifestyleRecommendations, preventiveCare } =
    generateClinicalRecommendations(data, riskResults, medProfile)

  return {
    overallScore,
    summary,
    gender,
    isScreeningEstimate: true,
    isPediatric: false,
    riskResults,
    dietRecommendations,
    lifestyleRecommendations,
    preventiveCare,
    safetyWarnings,
    disclaimer:
      "Clinical Screening Notice: Predictions generated by this application are evidence-based non-invasive screening estimates and do NOT constitute a medical diagnosis. In accordance with clinical standards, screening scores (e.g. ADA Diabetes Risk Test, Framingham 10-Year CVD Risk, SCORED kidney index, FIB-4 liver index) require confirmatory laboratory testing and formal physician evaluation. Always consult a qualified healthcare provider for diagnostic confirmation and clinical management.",
  }
}
