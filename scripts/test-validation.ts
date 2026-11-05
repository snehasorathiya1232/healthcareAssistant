import {
  validateHealthAssessment,
  validateNumericField,
  validateGender,
  validateBloodPressurePair,
  generateSafetyWarnings,
} from "../lib/validations/health-assessment"

let passed = 0
let failed = 0

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`)
    passed++
  } else {
    console.error(`❌ FAIL: ${testName}`)
    failed++
  }
}

console.log("=== RUNNING HEALTH ASSESSMENT VALIDATION TEST SUITE ===\n")

// Baseline valid adult dataset
const validBaseline = {
  age: "35",
  gender: "male",
  height: "175",
  weight: "70",
  bloodPressureSystolic: "120",
  bloodPressureDiastolic: "80",
  bloodSugar: "90",
  cholesterol: "180",
  heartRate: "72",
}

// 1. Boundary Tests: Minimum values
{
  const minData = {
    age: "10",
    gender: "male",
    height: "50",
    weight: "10",
    bloodPressureSystolic: "50",
    bloodPressureDiastolic: "20", // 50 > 20
    bloodSugar: "20",
    cholesterol: "50",
    heartRate: "20",
  }
  const res = validateHealthAssessment(minData)
  assert(res.isValid, "Valid minimum boundary inputs accepted")
}

// 2. Boundary Tests: Maximum values
{
  const maxData = {
    age: "90",
    gender: "female",
    height: "250",
    weight: "300",
    bloodPressureSystolic: "250",
    bloodPressureDiastolic: "150", // 250 > 150
    bloodSugar: "600",
    cholesterol: "600",
    heartRate: "250",
  }
  const res = validateHealthAssessment(maxData)
  assert(res.isValid, "Valid maximum boundary inputs accepted")
}

// 3. Just below minimum boundaries (should fail)
{
  assert(!validateNumericField("9", "age").valid, "Age 9 rejected (< 10)")
  assert(!validateNumericField("49.9", "height").valid, "Height 49.9 rejected (< 50)")
  assert(!validateNumericField("9.9", "weight").valid, "Weight 9.9 rejected (< 10)")
  assert(!validateNumericField("49", "bloodPressureSystolic").valid, "Systolic 49 rejected (< 50)")
  assert(!validateNumericField("19", "bloodPressureDiastolic").valid, "Diastolic 19 rejected (< 20)")
  assert(!validateNumericField("19.9", "bloodSugar").valid, "Blood sugar 19.9 rejected (< 20)")
  assert(!validateNumericField("49.9", "cholesterol").valid, "Cholesterol 49.9 rejected (< 50)")
  assert(!validateNumericField("19", "heartRate").valid, "Heart rate 19 rejected (< 20)")
}

// 4. Just above maximum boundaries (should fail)
{
  assert(!validateNumericField("91", "age").valid, "Age 91 rejected (> 90)")
  assert(!validateNumericField("250.1", "height").valid, "Height 250.1 rejected (> 250)")
  assert(!validateNumericField("300.1", "weight").valid, "Weight 300.1 rejected (> 300)")
  assert(!validateNumericField("251", "bloodPressureSystolic").valid, "Systolic 251 rejected (> 250)")
  assert(!validateNumericField("151", "bloodPressureDiastolic").valid, "Diastolic 151 rejected (> 150)")
  assert(!validateNumericField("600.1", "bloodSugar").valid, "Blood sugar 600.1 rejected (> 600)")
  assert(!validateNumericField("600.1", "cholesterol").valid, "Cholesterol 600.1 rejected (> 600)")
  assert(!validateNumericField("251", "heartRate").valid, "Heart rate 251 rejected (> 250)")
}

// 5. Empty, Non-numeric, Negative, NaN, Infinity
{
  assert(!validateNumericField("", "age").valid, "Empty string rejected")
  assert(!validateNumericField("   ", "age").valid, "Whitespace rejected")
  assert(!validateNumericField("abc", "height").valid, "Letters rejected")
  assert(!validateNumericField("-25", "weight").valid, "Negative values rejected")
  assert(!validateNumericField("NaN", "bloodSugar").valid, "NaN string rejected")
  assert(!validateNumericField("Infinity", "cholesterol").valid, "Infinity rejected")
}

// 6. Decimal rejection for integer-only fields
{
  assert(!validateNumericField("25.5", "age").valid, "Decimal rejected for age")
  assert(!validateNumericField("120.5", "bloodPressureSystolic").valid, "Decimal rejected for systolic BP")
  assert(!validateNumericField("80.5", "bloodPressureDiastolic").valid, "Decimal rejected for diastolic BP")
  assert(!validateNumericField("72.5", "heartRate").valid, "Decimal rejected for heart rate")
}

// 7. Decimal allowance for supported fields
{
  assert(validateNumericField("175.5", "height").valid, "Decimal accepted for height (175.5 cm)")
  assert(validateNumericField("68.2", "weight").valid, "Decimal accepted for weight (68.2 kg)")
  assert(validateNumericField("95.4", "bloodSugar").valid, "Decimal accepted for blood sugar (95.4 mg/dL)")
  assert(validateNumericField("185.5", "cholesterol").valid, "Decimal accepted for cholesterol (185.5 mg/dL)")
}

// 8. Blood Pressure Systolic > Diastolic constraint
{
  const equalBp = validateBloodPressurePair("120", "120")
  assert(!equalBp.valid, "Equal systolic and diastolic rejected (120 vs 120)")

  const invertedBp = validateBloodPressurePair("100", "120")
  assert(!invertedBp.valid, "Inverted blood pressure rejected (100 systolic < 120 diastolic)")

  const validBp = validateBloodPressurePair("121", "120")
  assert(validBp.valid, "Valid blood pressure accepted when systolic > diastolic (121 > 120)")
}

// 9. Gender validation
{
  assert(validateGender("male").valid, "Male gender accepted")
  assert(validateGender("female").valid, "Female gender accepted")
  assert(!validateGender("other").valid, "Other gender rejected")
  assert(!validateGender("prefer-not-to-say").valid, "Prefer-not-to-say gender rejected")
  assert(!validateGender("").valid, "Empty gender rejected")
}

// 10. Safety Warnings Generation
{
  // Hypertensive Crisis
  const crisisData = {
    ...validBaseline,
    bloodPressureSystolic: "185",
    bloodPressureDiastolic: "125",
  }
  const valCrisis = validateHealthAssessment(crisisData)
  const warningsCrisis = generateSafetyWarnings(valCrisis.validatedData!)
  const hasCrisisAlert = warningsCrisis.some(
    (w) => w.severity === "critical" && w.category === "blood_pressure"
  )
  assert(hasCrisisAlert, "Hypertensive Crisis correctly generates critical safety warning")

  // Critical Hypoglycemia
  const lowSugarData = {
    ...validBaseline,
    bloodSugar: "48",
  }
  const valLowSugar = validateHealthAssessment(lowSugarData)
  const warningsLowSugar = generateSafetyWarnings(valLowSugar.validatedData!)
  const hasHypoAlert = warningsLowSugar.some(
    (w) => w.severity === "critical" && w.category === "blood_sugar"
  )
  assert(hasHypoAlert, "Blood sugar < 54 correctly generates critical hypoglycemia warning")

  // Critical Hyperglycemia
  const highSugarData = {
    ...validBaseline,
    bloodSugar: "350",
  }
  const valHighSugar = validateHealthAssessment(highSugarData)
  const warningsHighSugar = generateSafetyWarnings(valHighSugar.validatedData!)
  const hasHyperAlert = warningsHighSugar.some(
    (w) => w.severity === "critical" && w.category === "blood_sugar"
  )
  assert(hasHyperAlert, "Blood sugar >= 300 correctly generates critical hyperglycemia warning")

  // Resting Tachycardia & Bradycardia
  const tachyData = { ...validBaseline, heartRate: "135" }
  const valTachy = validateHealthAssessment(tachyData)
  const warningsTachy = generateSafetyWarnings(valTachy.validatedData!)
  assert(
    warningsTachy.some((w) => w.category === "heart_rate" && w.severity === "warning"),
    "Resting heart rate > 120 bpm generates tachycardia warning"
  )

  const bradyData = { ...validBaseline, heartRate: "45" }
  const valBrady = validateHealthAssessment(bradyData)
  const warningsBrady = generateSafetyWarnings(valBrady.validatedData!)
  assert(
    warningsBrady.some((w) => w.category === "heart_rate" && w.severity === "warning"),
    "Resting heart rate < 50 bpm generates bradycardia warning"
  )
}

// 11. Pediatric (Minors under 18) Handling
{
  const pediatricData = {
    ...validBaseline,
    age: "14",
  }
  const valPediatric = validateHealthAssessment(pediatricData)
  assert(valPediatric.validatedData!.isPediatric === true, "Age 14 is flagged as pediatric")
  const pediatricWarnings = generateSafetyWarnings(valPediatric.validatedData!)
  const hasPediatricWarning = pediatricWarnings.some(
    (w) => w.category === "pediatric" && w.severity === "warning"
  )
  assert(hasPediatricWarning, "Pediatric population notice is explicitly generated for age 14")

  const adultData = { ...validBaseline, age: "25" }
  const valAdult = validateHealthAssessment(adultData)
  assert(valAdult.validatedData!.isPediatric === false, "Age 25 is flagged as adult (not pediatric)")
}

// 12. Direct API Payload Validation (Preventing bypass)
{
  const invalidDirectPayload = {
    age: "999", // out of bounds
    gender: "invalid",
    height: "20",
    weight: "500",
    bloodPressureSystolic: "20",
    bloodPressureDiastolic: "90", // systolic < diastolic
    bloodSugar: "-5",
    cholesterol: "900",
    heartRate: "300",
  }
  const res = validateHealthAssessment(invalidDirectPayload)
  assert(!res.isValid, "Direct invalid payload correctly rejected by server validator")
  assert(Boolean(res.errors.age), "Age error captured in server validation")
  assert(Boolean(res.errors.gender), "Gender error captured in server validation")
  assert(Boolean(res.errors.height), "Height error captured in server validation")
  assert(Boolean(res.errors.weight), "Weight error captured in server validation")
  assert(Boolean(res.errors.bloodPressureSystolic), "BP relationship error captured in server validation")
  assert(Boolean(res.errors.bloodSugar), "Blood sugar error captured in server validation")
  assert(Boolean(res.errors.cholesterol), "Cholesterol error captured in server validation")
  assert(Boolean(res.errors.heartRate), "Heart rate error captured in server validation")
}

console.log(`\n========================================`)
console.log(`TOTAL TESTS: ${passed + failed}`)
console.log(`PASSED: ${passed}`)
console.log(`FAILED: ${failed}`)
console.log(`========================================`)

if (failed > 0) {
  process.exit(1)
}
