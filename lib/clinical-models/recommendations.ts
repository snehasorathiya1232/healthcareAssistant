import { RecommendationItem, DiseaseRiskResult } from "./types"
import { ValidatedHealthData } from "../validations/health-assessment"
import { MedicationProfile } from "./medications"

export function generateClinicalRecommendations(
  data: ValidatedHealthData,
  diseaseResults: DiseaseRiskResult[],
  medProfile: MedicationProfile
): {
  dietRecommendations: RecommendationItem[]
  lifestyleRecommendations: RecommendationItem[]
  preventiveCare: RecommendationItem[]
} {
  const diet: RecommendationItem[] = []
  const lifestyle: RecommendationItem[] = []
  const preventive: RecommendationItem[] = []

  const diabetesRisk = diseaseResults.find((d) => d.disease === "Diabetes")
  const heartRisk = diseaseResults.find((d) => d.disease === "Heart Disease")
  const kidneyRisk = diseaseResults.find((d) => d.disease === "Kidney Disease")
  const liverRisk = diseaseResults.find((d) => d.disease === "Liver Disorders")
  const breastRisk =
    data.gender === "female"
      ? diseaseResults.find((d) => d.disease === "Breast Cancer")
      : undefined

  const hasHighBP = data.bloodPressureSystolic >= 130 || data.bloodPressureDiastolic >= 80
  const hasElevatedGlucose = data.bloodSugar >= 100
  const hasElevatedCholesterol = data.cholesterol >= 200
  const isOverweight = data.weight / Math.pow(data.height / 100, 2) >= 25
  const isSmoker =
    data.smokingStatus?.toLowerCase() === "regular" ||
    data.smokingStatus?.toLowerCase() === "occasional"
  const isHeavyAlcohol = data.alcoholConsumption?.toLowerCase() === "heavy"

  // -------------------------------------------------------------
  // 1. DIET RECOMMENDATIONS
  // -------------------------------------------------------------
  if (hasHighBP || heartRisk?.risk !== "Low") {
    diet.push({
      title: "DASH Dietary Pattern",
      description:
        "Adopt the Dietary Approaches to Stop Hypertension (DASH) eating plan: prioritize fresh vegetables, whole grains, lean poultry, and potassium-rich foods, while limiting sodium to under 2,000 mg/day.",
    })
  }

  if (hasElevatedGlucose || diabetesRisk?.risk !== "Low") {
    diet.push({
      title: "Low Glycemic Index & Fiber-Rich Diet",
      description:
        "Replace refined sugars and ultra-processed carbohydrates with high-fiber legumes, non-starchy vegetables, and whole intact grains to moderate postprandial glycemic excursions.",
    })
  }

  if (hasElevatedCholesterol) {
    diet.push({
      title: "Saturated Fat & Trans Fat Restriction",
      description:
        "Limit saturated fatty acids (< 7% of daily calories) and replace with heart-healthy monounsaturated and polyunsaturated fats (extra virgin olive oil, nuts, seeds, fatty fish).",
    })
  }

  if (isHeavyAlcohol || liverRisk?.risk !== "Low") {
    diet.push({
      title: "Hepatic Protection & Alcohol Cessation",
      description:
        "Eliminate or substantially restrict alcohol consumption to halt hepatic steatosis progression. Avoid excessive fructose, high-fructose corn syrup, and ultra-processed snacks.",
    })
  }

  // Baseline healthy diet if few specific issues
  if (diet.length === 0) {
    diet.push({
      title: "Mediterranean-Style Balanced Nutrition",
      description:
        "Focus on colorful vegetables, seasonal fruits, legumes, whole grains, nuts, and healthy fats while limiting red meat and refined carbohydrates.",
    })
    diet.push({
      title: "Adequate Daily Hydration",
      description:
        "Maintain healthy water intake (approximately 2–3 liters daily) to support renal filtration and cellular metabolism, unless medically restricted.",
    })
  }

  // -------------------------------------------------------------
  // 2. LIFESTYLE RECOMMENDATIONS
  // -------------------------------------------------------------
  if (
    data.exerciseFrequency?.toLowerCase() === "sedentary" ||
    data.exerciseFrequency?.toLowerCase() === "rarely"
  ) {
    lifestyle.push({
      title: "Structured Aerobic Exercise (150 min/week)",
      description:
        "Engage in at least 150 minutes of moderate-intensity aerobic exercise (brisk walking, cycling, swimming) per week, split into 30 minutes on 5 days, plus 2 sessions of resistance training (WHO/AHA guidelines).",
    })
  } else {
    lifestyle.push({
      title: "Maintain Regular Physical Conditioning",
      description:
        "Continue consistent aerobic and resistance training to preserve cardiovascular fitness, insulin sensitivity, and lean musculoskeletal mass.",
    })
  }

  if (isSmoker) {
    lifestyle.push({
      title: "Tobacco Cessation Support",
      description:
        "Smoking is a primary modifiable accelerator of atherosclerotic cardiovascular disease and endothelial injury. Consult a healthcare provider regarding nicotine replacement therapy or cessation counseling.",
    })
  }

  const sleepNum = Number(data.sleepHours)
  if (Number.isFinite(sleepNum) && (sleepNum < 6 || sleepNum > 9)) {
    lifestyle.push({
      title: "Restorative Sleep Hygiene (7–8 Hours)",
      description:
        "Aim for 7 to 8 hours of uninterrupted, quality nocturnal sleep. Chronic sleep deprivation increases sympathetic tone, morning blood pressure, and systemic insulin resistance.",
    })
  }

  if (data.stressLevel?.toLowerCase() === "high") {
    lifestyle.push({
      title: "Stress Reduction & Autonomic Balance",
      description:
        "Incorporate daily mindfulness, diaphragmatic breathing, yoga, or progressive relaxation to reduce chronic hypothalamic-pituitary-adrenal axis activation and cortisol levels.",
    })
  }

  if (isOverweight) {
    lifestyle.push({
      title: "Gradual Metabolic Weight Optimization",
      description:
        "A modest reduction of 5% to 10% of total body weight produces clinically significant improvements in blood pressure, glycemic regulation, and lipid parameters.",
    })
  }

  // -------------------------------------------------------------
  // 3. PREVENTIVE CARE RECOMMENDATIONS
  // -------------------------------------------------------------
  if (hasHighBP) {
    preventive.push({
      title: "Home Blood Pressure Log & Clinical Evaluation",
      description:
        "Measure and log resting blood pressure twice daily for 7 days (morning and evening). Present records to a primary care clinician for diagnostic staging.",
    })
  }

  if (hasElevatedGlucose || diabetesRisk?.risk !== "Low") {
    preventive.push({
      title: "Laboratory HbA1c & Fasting Plasma Glucose Confirmation",
      description:
        "Schedule a formal venous blood test for fasting plasma glucose and glycosylated hemoglobin (HbA1c) to verify glycemic classification per ADA clinical criteria.",
    })
  }

  if (hasElevatedCholesterol || heartRisk?.risk !== "Low") {
    preventive.push({
      title: "Comprehensive Fasting Lipid Profile",
      description:
        "Obtain a complete lipid panel (Total Cholesterol, LDL-C, HDL-C, and Triglycerides) to calculate non-HDL cholesterol and guide ASCVD risk management.",
    })
  }

  if (kidneyRisk?.risk !== "Low") {
    preventive.push({
      title: "Renal Function Testing (eGFR & UACR)",
      description:
        "Because chronic kidney disease cannot be diagnosed from screening alone, request serum creatinine (to calculate 2021 CKD-EPI eGFR) and a random urine albumin-to-creatinine ratio (UACR).",
    })
  }

  if (liverRisk?.risk !== "Low") {
    preventive.push({
      title: "Comprehensive Liver Function Tests (LFTs)",
      description:
        "Order a liver biochemical panel (AST, ALT, Alkaline Phosphatase, Total Bilirubin, Albumin) and a complete blood count (platelets) to enable exact FIB-4 fibrosis index calculation.",
    })
  }

  if (data.gender === "female" && data.age >= 40) {
    preventive.push({
      title: "Biennial Screening Mammography (USPSTF 2024)",
      description:
        "The U.S. Preventive Services Task Force recommends biennial screening mammography for women aged 40 to 74 years. Discuss personal and familial risk history with your gynecologist.",
    })
  } else if (data.gender === "female" && data.familyCancer) {
    preventive.push({
      title: "Genetic Cancer Risk Assessment (Familial Counseling)",
      description:
        "Given immediate family history of cancer, seek formal genetic risk assessment (e.g. BRCA1/2, Lynch syndrome) and individualized early surveillance protocols.",
    })
  }

  if (preventive.length === 0) {
    preventive.push({
      title: "Annual Preventive Wellness Examination",
      description:
        "Schedule an annual physical checkup with a primary care physician including baseline blood pressure, fasting metabolic panel, and age-appropriate screenings.",
    })
  }

  return {
    dietRecommendations: diet.slice(0, 4),
    lifestyleRecommendations: lifestyle.slice(0, 4),
    preventiveCare: preventive.slice(0, 4),
  }
}
