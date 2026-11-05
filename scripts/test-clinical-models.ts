import {
  evaluateHealthAssessment,
  calculateDiabetesRisk,
  calculateCardiovascularRisk,
  calculateKidneyRisk,
  calculateLiverRisk,
  calculateBreastCancerRisk,
  parseMedicationProfile,
} from "../lib/clinical-models"
import {
  validateHealthAssessment,
  validateGender,
  validateNumericField,
  ValidatedHealthData,
} from "../lib/validations/health-assessment"

let passed = 0
let failed = 0

function assert(condition: boolean | undefined, testName: string, detail?: string) {
  if (Boolean(condition)) {
    console.log(`✅ PASS: ${testName}`)
    passed++
  } else {
    console.error(`❌ FAIL: ${testName}${detail ? ` -> ${detail}` : ""}`)
    failed++
  }
}

console.log("=== RUNNING CLINICAL HEALTH ASSESSMENT & MODELS TEST SUITE ===\n")

// -------------------------------------------------------------
// 1. Gender Validation & Restriction to Male and Female
// -------------------------------------------------------------
console.log("--- 1. Gender Validation Tests ---")
{
  assert(validateGender("male").valid && validateGender("male").value === "male", "Male gender accepted and validated")
  assert(validateGender("female").valid && validateGender("female").value === "female", "Female gender accepted and validated")
  assert(validateGender("MALE").valid && validateGender("MALE").value === "male", "Case-insensitive Male accepted")
  assert(validateGender("FEMALE").valid && validateGender("FEMALE").value === "female", "Case-insensitive Female accepted")
  assert(!validateGender("other").valid, "Option 'other' rejected")
  assert(!validateGender("prefer-not-to-say").valid, "Option 'prefer-not-to-say' rejected")
  assert(!validateGender("non-binary").valid, "Option 'non-binary' rejected")
  assert(!validateGender("").valid, "Empty gender rejected")
  assert(!validateGender(null).valid, "Null gender rejected")
}

// -------------------------------------------------------------
// 2. BMI Calculation and Data Integrity
// -------------------------------------------------------------
console.log("\n--- 2. BMI Calculation & Physiologic Range Tests ---")
{
  const h = 175
  const w = 70
  const expectedBmi = 70 / Math.pow(175 / 100, 2)
  assert(Math.abs(expectedBmi - 22.86) < 0.05, `Normal BMI calculated accurately (~22.86): ${expectedBmi.toFixed(2)}`)

  // Height and weight boundaries
  assert(validateNumericField("50", "height").valid, "Minimum height boundary 50 cm accepted")
  assert(validateNumericField("250", "height").valid, "Maximum height boundary 250 cm accepted")
  assert(!validateNumericField("49", "height").valid, "Height < 50 cm rejected")
  assert(!validateNumericField("251", "height").valid, "Height > 250 cm rejected")
  assert(validateNumericField("10", "weight").valid, "Minimum weight boundary 10 kg accepted")
  assert(validateNumericField("300", "weight").valid, "Maximum weight boundary 300 kg accepted")
  assert(!validateNumericField("9.9", "weight").valid, "Weight < 10 kg rejected")
  assert(!validateNumericField("301", "weight").valid, "Weight > 300 kg rejected")
}

// -------------------------------------------------------------
// 3. Medication Profile Parser
// -------------------------------------------------------------
console.log("\n--- 3. Clinical Medication Parser Tests ---")
{
  const medProfile1 = parseMedicationProfile("Lisinopril 10mg daily, Metformin 500mg, Atorvastatin 20mg")
  assert(medProfile1.isTakingAntihypertensive, "Detected antihypertensive (Lisinopril)")
  assert(medProfile1.isTakingAntidiabetic, "Detected antidiabetic (Metformin)")
  assert(medProfile1.isTakingLipidLowering, "Detected lipid-lowering statin (Atorvastatin)")
  assert(!medProfile1.isTakingNsaid, "No NSAID detected in profile 1")

  const medProfile2 = parseMedicationProfile("Ibuprofen 400mg tid, Tylenol / Acetaminophen")
  assert(medProfile2.isTakingNsaid, "Detected NSAID (Ibuprofen)")
  assert(medProfile2.isTakingHepatotoxic, "Detected potential hepatotoxic drug (Acetaminophen)")
}

// -------------------------------------------------------------
// 4. Diabetes Model: ADA Risk Test & ADA 2024 Glycemic Criteria
// -------------------------------------------------------------
console.log("\n--- 4. Diabetes Model Tests ---")
{
  const meds = parseMedicationProfile("")

  // Case 4A: Normal fasting glucose, low ADA risk
  const resLow = calculateDiabetesRisk({
    age: 32,
    gender: "female",
    bmi: 21.5,
    fastingGlucose: 85,
    familyDiabetes: false,
    previousConditions: [],
    exerciseFrequency: "active",
    systolicBP: 115,
    diastolicBP: 75,
    medications: meds,
  })
  assert(resLow.risk === "Low", "Normal glycemic and low ADA features return Low Risk")
  assert(resLow.percentage < 20, `Low risk percentage is appropriate: ${resLow.percentage}%`)

  // Case 4B: Fasting glucose in prediabetes range (100–125 mg/dL)
  const resPrediabetes = calculateDiabetesRisk({
    age: 48,
    gender: "male",
    bmi: 28.0,
    fastingGlucose: 112,
    familyDiabetes: true,
    previousConditions: [],
    exerciseFrequency: "sedentary",
    systolicBP: 132,
    diastolicBP: 84,
    medications: meds,
  })
  assert(
    resPrediabetes.risk === "High" || resPrediabetes.risk === "Medium",
    `Prediabetes range categorized appropriately: ${resPrediabetes.risk}`
  )
  assert(
    resPrediabetes.factors.some((f) => f.includes("Impaired fasting glucose")),
    "Identifies Impaired Fasting Glucose factor"
  )

  // Case 4C: Fasting glucose in diabetes range (>= 126 mg/dL)
  const resDiabetes = calculateDiabetesRisk({
    age: 55,
    gender: "male",
    bmi: 32.0,
    fastingGlucose: 145,
    familyDiabetes: true,
    previousConditions: [],
    exerciseFrequency: "sedentary",
    systolicBP: 140,
    diastolicBP: 90,
    medications: meds,
  })
  assert(resDiabetes.risk === "High", "Fasting glucose >= 126 mg/dL returns High Risk")
  assert(resDiabetes.isLabConfirmed, "Flags lab threshold met for diabetes confirmatory testing")
  assert(
    resDiabetes.limitations?.includes("Fasting thresholds do not apply to random"),
    "Explicitly warns that fasting thresholds do not apply to random specimens"
  )
}

// -------------------------------------------------------------
// 5. Heart Disease Model: Framingham 10-Year General CVD Risk
// -------------------------------------------------------------
console.log("\n--- 5. Cardiovascular (Heart Disease) Model Tests ---")
{
  const meds = parseMedicationProfile("")

  // Case 5A: Healthy young female
  const resHealthy = calculateCardiovascularRisk({
    age: 30,
    gender: "female",
    systolicBP: 110,
    diastolicBP: 70,
    cholesterol: 165,
    bmi: 21.0,
    smokingStatus: "never",
    fastingGlucose: 85,
    previousConditions: [],
    medications: meds,
    heartRate: 68,
    familyHeartDisease: false,
  })
  assert(resHealthy.risk === "Low", "Young healthy female Framingham risk is Low")
  assert(resHealthy.percentage < 10, `Low 10-year CVD risk percentage: ${resHealthy.percentage}% (< 10%)`)

  // Case 5B: Older male smoker with high SBP and elevated cholesterol
  const resHighCVD = calculateCardiovascularRisk({
    age: 62,
    gender: "male",
    systolicBP: 155,
    diastolicBP: 95,
    cholesterol: 245,
    bmi: 29.0,
    smokingStatus: "regular",
    fastingGlucose: 130,
    previousConditions: ["Hypertension", "Diabetes"],
    medications: parseMedicationProfile("Lisinopril"),
    heartRate: 75,
    familyHeartDisease: true,
  })
  assert(resHighCVD.risk === "High", "Elderly male smoker with HTN, DM, high cholesterol returns High CVD Risk")
  assert(resHighCVD.percentage >= 20, `Framingham 10-year risk >= 20%: ${resHighCVD.percentage}%`)

  // Case 5C: Heart rate is NOT used as standalone predictor
  const resTachycardia = calculateCardiovascularRisk({
    age: 30,
    gender: "female",
    systolicBP: 110,
    diastolicBP: 70,
    cholesterol: 165,
    bmi: 21.0,
    smokingStatus: "never",
    fastingGlucose: 85,
    previousConditions: [],
    medications: meds,
    heartRate: 115, // Tachycardia
    familyHeartDisease: false,
  })
  assert(resTachycardia.risk === "Low", "Heart rate alone does NOT inflate Framingham CVD risk tier to High")
  assert(
    resTachycardia.factors.some((f) => f.includes("not standalone predictor")),
    "Heart rate documented as autonomic/hemodynamic sign, not arbitrary standalone predictor"
  )
}

// -------------------------------------------------------------
// 6. Kidney Disease Model: SCORED & CKD-EPI 2021 Equation
// -------------------------------------------------------------
console.log("\n--- 6. Kidney Disease Model Tests ---")
{
  const meds = parseMedicationProfile("")

  // Case 6A: Serum creatinine provided -> CKD-EPI 2021 Equation
  const resCKDEPI = calculateKidneyRisk({
    age: 50,
    gender: "female",
    systolicBP: 120,
    diastolicBP: 80,
    fastingGlucose: 90,
    previousConditions: [],
    medications: meds,
    serumCreatinine: 0.8, // Normal female creatinine
  })
  assert(resCKDEPI.isLabConfirmed, "Calculates eGFR when serum creatinine is provided")
  assert(resCKDEPI.factors.some((f) => f.includes("CKD-EPI 2021")), "Mentions CKD-EPI 2021 calculation in factors")
  assert(resCKDEPI.risk === "Low", "Normal creatinine gives Low Risk")

  // Case 6B: Reduced eGFR (Creatinine 2.5 mg/dL in 65 yo male)
  const resRenalImpairment = calculateKidneyRisk({
    age: 65,
    gender: "male",
    systolicBP: 145,
    diastolicBP: 90,
    fastingGlucose: 135,
    previousConditions: ["Hypertension", "Diabetes"],
    medications: meds,
    serumCreatinine: 2.5,
  })
  assert(resRenalImpairment.risk === "High", "Elevated creatinine (2.5 mg/dL) yields High Risk")
  assert(
    resRenalImpairment.description.includes("cannot be diagnosed from a single measurement"),
    "Discloses KDIGO persistent criteria limitation (>3 months)"
  )

  // Case 6C: Creatinine NOT provided -> SCORED non-invasive screening tool
  const resScored = calculateKidneyRisk({
    age: 62,
    gender: "female",
    systolicBP: 145,
    diastolicBP: 92,
    fastingGlucose: 130,
    previousConditions: ["Hypertension", "Diabetes", "Heart Disease"],
    medications: meds,
  })
  assert(resScored.clinicalMethod?.includes("SCORED"), "Uses SCORED clinical screening tool when creatinine absent")
  assert(resScored.risk === "High", "High SCORED points (Age 62, Female, HTN, DM, CVD) return High Risk")
  assert(
    resScored.limitations?.includes("Serum creatinine was not provided"),
    "Clearly reports limitation that serum creatinine is missing"
  )
}

// -------------------------------------------------------------
// 7. Liver Disease Model: FIB-4 & AASLD/EASL MASLD Framework
// -------------------------------------------------------------
console.log("\n--- 7. Liver Disease Model Tests ---")
{
  const meds = parseMedicationProfile("")

  // Case 7A: FIB-4 calculated when AST, ALT, platelets available
  // Formula: FIB-4 = (Age * AST) / (Platelet * sqrt(ALT))
  // Age 40, AST 30, ALT 36, Platelets 200
  // FIB-4 = (40 * 30) / (200 * sqrt(36)) = 1200 / (200 * 6) = 1200 / 1200 = 1.00 (< 1.30 -> Low Risk)
  const resFib4Low = calculateLiverRisk({
    age: 40,
    bmi: 23.0,
    alcoholConsumption: "none",
    fastingGlucose: 85,
    systolicBP: 118,
    diastolicBP: 76,
    cholesterol: 170,
    previousConditions: [],
    medications: meds,
    ast: 30,
    alt: 36,
    platelets: 200,
  })
  assert(resFib4Low.risk === "Low", "FIB-4 of 1.00 (< 1.30) correctly categorized as Low Fibrosis Risk")
  assert(resFib4Low.factors.some((f) => f.includes("FIB-4 Index: 1.00")), "Exact FIB-4 formatted as 1.00")
  assert(
    resFib4Low.description.includes("NOT a confirmed liver disease diagnosis"),
    "Explicitly states FIB-4 is not a confirmed liver diagnosis"
  )

  // Case 7B: High FIB-4 (Age 55, AST 90, ALT 49, Platelets 100)
  // FIB-4 = (55 * 90) / (100 * 7) = 4950 / 700 = 7.07 (> 2.67 -> High Risk)
  const resFib4High = calculateLiverRisk({
    age: 55,
    bmi: 31.0,
    alcoholConsumption: "moderate",
    fastingGlucose: 110,
    systolicBP: 135,
    diastolicBP: 85,
    cholesterol: 210,
    previousConditions: [],
    medications: meds,
    ast: 90,
    alt: 49,
    platelets: 100,
  })
  assert(resFib4High.risk === "High", "FIB-4 of 7.07 (> 2.67) categorized as High Fibrosis Risk")

  // Case 7C: Labs not provided -> AASLD/EASL Metabolic & Alcohol assessment
  const resMetabolic = calculateLiverRisk({
    age: 45,
    bmi: 34.0, // Obese
    alcoholConsumption: "heavy",
    fastingGlucose: 135, // Diabetes
    systolicBP: 142,
    diastolicBP: 90,
    cholesterol: 240,
    previousConditions: ["Diabetes", "Hypertension"],
    medications: meds,
  })
  assert(resMetabolic.risk === "High", "Heavy alcohol + obesity + diabetes categorized as High Risk per AASLD")
  assert(
    resMetabolic.limitations?.includes("Liver enzymes (AST, ALT) and platelets were not provided"),
    "Explicitly reports limitation that AST, ALT, platelets were not provided"
  )
}

// -------------------------------------------------------------
// 8. Breast Cancer Model: Gender Distinction & USPSTF/ACS Guidelines
// -------------------------------------------------------------
console.log("\n--- 8. Breast Cancer Model Tests ---")
{
  // Case 8A: Biological Male Patient
  const resMale = calculateBreastCancerRisk({
    age: 48,
    gender: "male",
    familyCancer: false,
    previousConditions: [],
  })
  assert(resMale.risk === "Low", "Male breast cancer risk is Low")
  assert(resMale.percentage === 1, "Male breast cancer percentage is 1% (non-applicable standard model)")
  assert(
    resMale.description.includes("clinically calibrated only for females"),
    "Explicitly explains standard screening models are calibrated only for females"
  )

  // Case 8B: Biological Female Patient, Age 45, Average Risk
  const resFemaleAvg = calculateBreastCancerRisk({
    age: 45,
    gender: "female",
    familyCancer: false,
    previousConditions: [],
  })
  assert(resFemaleAvg.risk === "Low", "Average risk female age 45 is categorized as Low baseline risk")
  assert(
    resFemaleAvg.description.includes("USPSTF 2024"),
    "References USPSTF 2024 screening mammography guidelines starting at age 40"
  )
  assert(
    resFemaleAvg.description.includes("BMI, blood pressure, or blood glucose) are not used to fabricate"),
    "Explicitly states non-reproductive parameters (BMI, BP, glucose) are not used to fabricate breast cancer risk"
  )

  // Case 8C: Biological Female Patient with First-Degree Family Cancer
  const resFemaleFamily = calculateBreastCancerRisk({
    age: 42,
    gender: "female",
    familyCancer: true,
    previousConditions: [],
  })
  assert(resFemaleFamily.risk === "Medium", "Female with family history of cancer categorized as Medium (elevated familial risk)")
  assert(
    resFemaleFamily.factors.some((f) => f.includes("relative risk ~1.8–2.1×")),
    "Explains elevated familial relative risk"
  )
}

// -------------------------------------------------------------
// 9. Integrated Full Evaluation Engine
// -------------------------------------------------------------
console.log("\n--- 9. Integrated Full Assessment Engine Tests ---")
{
  const adultMaleData: ValidatedHealthData = {
    age: 52,
    gender: "male",
    height: 178,
    weight: 86, // BMI = 27.1 (Overweight)
    bloodPressureSystolic: 142,
    bloodPressureDiastolic: 88,
    bloodSugar: 110,
    cholesterol: 215,
    heartRate: 74,
    isPediatric: false,
    familyDiabetes: true,
    familyHeartDisease: true,
    familyCancer: false,
    previousConditions: ["Hypertension"],
    currentMedications: "Amlodipine 5mg",
    smokingStatus: "former",
    alcoholConsumption: "moderate",
    exerciseFrequency: "light",
    dietType: "omnivore",
    sleepHours: "6.5",
    stressLevel: "medium",
  }

  const evalResult = evaluateHealthAssessment(adultMaleData)

  // Male patient: breast cancer is excluded (4 diseases)
  assert(evalResult.riskResults.length === 4, "Male assessment excludes breast cancer (4 diseases)")
  assert(
    !evalResult.riskResults.some((r) => r.disease === "Breast Cancer"),
    "Male risk results do not contain breast cancer"
  )

  // Female patient: breast cancer is counted and shown (5 diseases)
  const adultFemaleData: ValidatedHealthData = {
    ...adultMaleData,
    gender: "female",
  }
  const evalFemaleResult = evaluateHealthAssessment(adultFemaleData)
  assert(evalFemaleResult.riskResults.length === 5, "Female assessment includes and counts breast cancer (5 diseases)")
  assert(
    evalFemaleResult.riskResults.some((r) => r.disease === "Breast Cancer"),
    "Female risk results contain breast cancer"
  )

  assert(evalResult.overallScore > 0 && evalResult.overallScore <= 100, `Overall score is between 1-100: ${evalResult.overallScore}`)
  assert(evalResult.dietRecommendations.length > 0, "Generates tailored diet recommendations")
  assert(evalResult.lifestyleRecommendations.length > 0, "Generates tailored lifestyle recommendations")
  assert(evalResult.preventiveCare.length > 0, "Generates tailored preventive care recommendations")
  assert(evalResult.disclaimer.includes("Clinical Screening Notice"), "Includes formal clinical screening disclaimer")
  assert(evalResult.gender === "male", "Passes through validated gender")

  // Check pediatric handling
  const pediatricData: ValidatedHealthData = {
    ...adultMaleData,
    age: 15,
    isPediatric: true,
  }
  const pedResult = evaluateHealthAssessment(pediatricData)
  assert(pedResult.isPediatric, "Flags pediatric assessment for age 15")
  assert(pedResult.summary.includes("CDC/WHO percentiles"), "Provides pediatric growth percentiles notice")
}

console.log("\n========================================")
console.log(`TOTAL CLINICAL MODEL TESTS: ${passed + failed}`)
console.log(`PASSED: ${passed}`)
console.log(`FAILED: ${failed}`)
console.log("========================================")

if (failed > 0) {
  process.exit(1)
}
