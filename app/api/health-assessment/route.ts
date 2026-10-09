import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

type Risk = "Low" | "Medium" | "High"

function riskLevel(score: number): Risk {
  if (score >= 70) return "High"
  if (score >= 40) return "Medium"
  return "Low"
}

function clamp(
  value: number,
  min = 0,
  max = 100
): number {
  return Math.min(Math.max(value, min), max)
}

function num(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export async function POST(req: Request) {
  try {
    // -----------------------------------------
    // Read request
    // -----------------------------------------

    const data = await req.json()

    // -----------------------------------------
    // Get Supabase environment variables
    // -----------------------------------------

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://ardkyccwuobszvtjswmo.supabase.co"

    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "sb_publishable_RPRvYAfvx8FYGwZarM5ECw_FFQALkum"

    // -----------------------------------------
    // Get Authorization token
    // -----------------------------------------

    const authHeader =
      req.headers.get("Authorization")

    if (!authHeader) {
      return NextResponse.json(
        {
          error:
            "You are not logged in. Please login again.",
        },
        { status: 401 }
      )
    }

    const token = authHeader.replace(
      "Bearer ",
      ""
    )

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Authentication token is missing.",
        },
        { status: 401 }
      )
    }

    // -----------------------------------------
    // IMPORTANT:
    // Create Supabase client WITH user's token
    // -----------------------------------------

    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    // -----------------------------------------
    // Verify logged-in user
    // -----------------------------------------

    const {
      data: userData,
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !userData.user) {
      console.error(
        "USER AUTH ERROR:",
        userError
      )

      return NextResponse.json(
        {
          error:
            "Your login session is invalid. Please login again.",
        },
        { status: 401 }
      )
    }

    const user = userData.user

    // -----------------------------------------
    // Read health data
    // -----------------------------------------

    const age = num(data.age)
    const height = num(data.height)
    const weight = num(data.weight)

    const systolic = num(
      data.bloodPressureSystolic
    )

    const diastolic = num(
      data.bloodPressureDiastolic
    )

    const sugar = num(data.bloodSugar)

    const cholesterol = num(
      data.cholesterol
    )

    const heartRate = num(
      data.heartRate
    )

    // -----------------------------------------
    // Required fields
    // -----------------------------------------

    if (!age || !height || !weight) {
      return NextResponse.json(
        {
          error:
            "Age, height, and weight are required.",
        },
        { status: 400 }
      )
    }

    // -----------------------------------------
    // Symptoms
    // -----------------------------------------

    const symptoms: string[] =
      Array.isArray(data.symptoms)
        ? data.symptoms
        : []

    const lowerSymptoms =
      symptoms.map((s) =>
        String(s).toLowerCase()
      )

    // -----------------------------------------
    // Emergency symptoms
    // -----------------------------------------

    const emergencySymptoms = [
      "chest pain",
      "breathing difficulty",
      "severe breathing difficulty",
      "fainting",
      "loss of consciousness",
      "blood vomiting",
      "stroke-like symptoms",
    ]

    const hasEmergency =
      lowerSymptoms.some((symptom) =>
        emergencySymptoms.includes(symptom)
      )

    // -----------------------------------------
    // Emergency result
    // -----------------------------------------

    if (hasEmergency) {
      const emergencyResult = {
        overallScore: 20,

        summary:
          "Emergency warning signs detected. Please seek urgent medical help immediately.",

        riskResults: [
          {
            disease: "Emergency Health Risk",

            risk: "High",

            percentage: 95,

            description:
              "Your selected symptoms may indicate a serious medical condition.",

            factors: symptoms,
          },
        ],

        dietRecommendations: [],

        lifestyleRecommendations: [
          {
            title: "Seek Emergency Care",

            description:
              "Do not ignore these symptoms. Contact a doctor or emergency service immediately.",
          },
        ],

        preventiveCare: [
          {
            title:
              "Urgent Medical Consultation",

            description:
              "This result needs professional medical evaluation as soon as possible.",
          },
        ],

        disclaimer:
          "This application does not provide medical diagnosis and should not replace professional medical advice.",
      }

      // Save emergency assessment
      let emergencyId = null
      const { data: emergencyRow, error: emergencySaveError } =
        await supabase
          .from("health_assessments")
          .insert({
            user_id: user.id,
            overall_score: 20,
            summary:
              emergencyResult.summary,
            input_data: data,
            result_data: emergencyResult,
          })
          .select("id")
          .maybeSingle()

      if (emergencyRow?.id) {
        emergencyId = emergencyRow.id
      }

      if (emergencySaveError) {
        console.warn(
          "EMERGENCY SAVE WARNING:",
          emergencySaveError
        )
      }

      return NextResponse.json({
        ...emergencyResult,
        id: emergencyId,
      })
    }

    // -----------------------------------------
    // BMI
    // -----------------------------------------

    const bmi =
      weight /
      Math.pow(height / 100, 2)

    // -----------------------------------------
    // Risk scores
    // -----------------------------------------

    let diabetesScore = 0
    let heartScore = 0
    let kidneyScore = 0
    let liverScore = 0
    let breastCancerScore = 0

    // -----------------------------------------
    // Age
    // -----------------------------------------

    if (age > 45) {
      diabetesScore += 15
      heartScore += 15
    }

    // -----------------------------------------
    // BMI
    // -----------------------------------------

    if (bmi >= 25) {
      diabetesScore += 20
      heartScore += 15
      liverScore += 10
    }

    // -----------------------------------------
    // Blood sugar
    // -----------------------------------------

    if (sugar >= 140) {
      diabetesScore += 35
    } else if (sugar >= 100) {
      diabetesScore += 20
    }

    // -----------------------------------------
    // Family history
    // -----------------------------------------

    if (data.familyDiabetes) {
      diabetesScore += 15
    }

    if (data.familyHeartDisease) {
      heartScore += 15
    }

    // -----------------------------------------
    // Blood pressure
    // -----------------------------------------

    if (
      systolic >= 140 ||
      diastolic >= 90
    ) {
      heartScore += 30
      kidneyScore += 25
    } else if (
      systolic >= 120 ||
      diastolic >= 80
    ) {
      heartScore += 15
      kidneyScore += 10
    }

    // -----------------------------------------
    // Cholesterol
    // -----------------------------------------

    if (cholesterol >= 240) {
      heartScore += 30
    } else if (cholesterol >= 200) {
      heartScore += 15
    }

    // -----------------------------------------
    // Heart rate
    // -----------------------------------------

    if (
      heartRate > 100 ||
      (heartRate > 0 && heartRate < 55)
    ) {
      heartScore += 10
    }

    // -----------------------------------------
    // Smoking
    // -----------------------------------------

    if (
      data.smokingStatus === "current" ||
      data.smokingStatus === "regular"
    ) {
      heartScore += 20
      liverScore += 10
    }

    // -----------------------------------------
    // Alcohol
    // -----------------------------------------

    if (
      data.alcoholConsumption ===
      "heavy"
    ) {
      liverScore += 30
    }

    // -----------------------------------------
    // Exercise
    // -----------------------------------------

    if (
      data.exerciseFrequency ===
      "rarely"
    ) {
      diabetesScore += 10
      heartScore += 10
    }

    if (
      data.exerciseFrequency ===
      "sedentary"
    ) {
      diabetesScore += 10
      heartScore += 10
    }

    // -----------------------------------------
    // Sleep
    // -----------------------------------------

    const sleepHours =
      num(data.sleepHours)

    if (
      sleepHours > 0 &&
      sleepHours < 6
    ) {
      heartScore += 10
      diabetesScore += 5
    }

    // -----------------------------------------
    // Stress
    // -----------------------------------------

    if (
      data.stressLevel === "high"
    ) {
      heartScore += 15
    }

    // -----------------------------------------
    // Breast cancer risk
    // -----------------------------------------

    if (data.gender === "female") {
      if (age > 40) {
        breastCancerScore += 20
      }

      if (data.familyCancer) {
        breastCancerScore += 30
      }

      if (bmi >= 25) {
        breastCancerScore += 10
      }

      if (
        data.alcoholConsumption ===
        "heavy"
      ) {
        breastCancerScore += 10
      }

      if (
        data.exerciseFrequency ===
        "rarely" ||
        data.exerciseFrequency ===
        "sedentary"
      ) {
        breastCancerScore += 10
      }
    }

    // -----------------------------------------
    // Symptoms
    // -----------------------------------------

    if (
      lowerSymptoms.includes(
        "frequent urination"
      )
    ) {
      diabetesScore += 15
    }

    if (
      lowerSymptoms.includes(
        "excessive thirst"
      )
    ) {
      diabetesScore += 15
    }

    if (
      lowerSymptoms.includes("fatigue")
    ) {
      diabetesScore += 10
    }

    if (
      lowerSymptoms.includes("dizziness")
    ) {
      heartScore += 10
    }

    if (
      lowerSymptoms.includes("vomiting")
    ) {
      kidneyScore += 10
    }

    if (
      lowerSymptoms.includes(
        "stomach pain"
      )
    ) {
      liverScore += 10
    }

    // -----------------------------------------
    // Clamp scores
    // -----------------------------------------

    diabetesScore = clamp(
      diabetesScore
    )

    heartScore = clamp(
      heartScore
    )

    kidneyScore = clamp(
      kidneyScore
    )

    liverScore = clamp(
      liverScore
    )

    breastCancerScore = clamp(
      breastCancerScore
    )

    // -----------------------------------------
    // Overall score
    // -----------------------------------------

    const averageRisk =
      (
        diabetesScore +
        heartScore +
        kidneyScore +
        liverScore +
        breastCancerScore
      ) / 5

    const overallScore = clamp(
      Math.round(
        100 - averageRisk
      )
    )

    // -----------------------------------------
    // Summary
    // -----------------------------------------

    const summary =
      overallScore >= 75
        ? "Your overall health risk looks low, but continue healthy habits."
        : overallScore >= 50
        ? "Some risk factors need attention. Lifestyle improvement is recommended."
        : "Multiple risk factors detected. Please consult a healthcare professional."

    // -----------------------------------------
    // Result data
    // -----------------------------------------

    const resultData = {
      overallScore,

      summary,

      riskResults: [
        {
          disease: "Diabetes",

          risk: riskLevel(
            diabetesScore
          ),

          percentage:
            diabetesScore,

          description:
            "Calculated using age, BMI, blood sugar, family history, lifestyle, and symptoms.",

          factors: [
            "BMI",
            "Blood sugar",
            "Family history",
            "Symptoms",
          ],
        },

        {
          disease:
            "Heart Disease",

          risk: riskLevel(
            heartScore
          ),

          percentage:
            heartScore,

          description:
            "Calculated using blood pressure, cholesterol, heart rate, age, smoking, and stress.",

          factors: [
            "Blood pressure",
            "Cholesterol",
            "Heart rate",
            "Lifestyle",
          ],
        },

        {
          disease:
            "Kidney Disease",

          risk: riskLevel(
            kidneyScore
          ),

          percentage:
            kidneyScore,

          description:
            "Calculated using blood pressure, symptoms, and related health risk factors.",

          factors: [
            "Blood pressure",
            "Symptoms",
            "Medical history",
          ],
        },

        {
          disease:
            "Liver Disorders",

          risk: riskLevel(
            liverScore
          ),

          percentage:
            liverScore,

          description:
            "Calculated using BMI, alcohol intake, medications, and digestive symptoms.",

          factors: [
            "BMI",
            "Alcohol",
            "Medications",
            "Symptoms",
          ],
        },

        {
          disease:
            "Breast Cancer",

          risk: riskLevel(
            breastCancerScore
          ),

          percentage:
            breastCancerScore,

          description:
            "Calculated using gender, age, family history, BMI, lifestyle, and related risk factors.",

          factors: [
            "Age",
            "Family history",
            "BMI",
            "Lifestyle",
          ],
        },
      ],

      dietRecommendations: [
        {
          title:
            "Balanced Diet",

          description:
            "Eat more vegetables, fruits, whole grains, and lean protein.",
        },

        {
          title:
            "Reduce Sugar and Junk Food",

          description:
            "Avoid excess sugar, fried food, and processed snacks.",
        },

        {
          title:
            "Stay Hydrated",

          description:
            "Drink enough water daily unless restricted by a doctor.",
        },
      ],

      lifestyleRecommendations: [
        {
          title:
            "Daily Walking",

          description:
            "Walk at least 30 minutes daily for better heart and sugar control.",
        },

        {
          title:
            "Sleep Improvement",

          description:
            "Try to maintain 7-8 hours of sleep every night.",
        },

        {
          title:
            "Stress Control",

          description:
            "Practice breathing, meditation, or light exercise to reduce stress.",
        },
      ],

      preventiveCare: [
        {
          title:
            "Regular Checkup",

          description:
            "Check blood pressure, sugar, and cholesterol regularly.",
        },

        {
          title:
            "Doctor Consultation",

          description:
            "Consult a doctor if symptoms continue or risk is high.",
        },
      ],

      disclaimer:
        "This application does not provide medical diagnosis and should not replace professional medical advice. Please consult a qualified healthcare professional.",
    }

    // -----------------------------------------
    // SAVE ASSESSMENT
    // -----------------------------------------

    let savedId = null
    const {
      data: savedRow,
      error: saveError,
    } = await supabase
      .from("health_assessments")
      .insert({
        user_id: user.id,
        overall_score: overallScore,
        summary: summary,
        input_data: data,
        result_data: resultData,
      })
      .select("id")
      .maybeSingle()

    if (savedRow?.id) {
      savedId = savedRow.id
    }

    if (saveError) {
      console.warn(
        "ASSESSMENT SAVE WARNING:",
        saveError
      )
    }

    return NextResponse.json({
      ...resultData,
      id: savedId,
    })
  } catch (error) {
    console.error(
      "HEALTH ASSESSMENT ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Something went wrong while analyzing health data.",
      },
      { status: 500 }
    )
  }
}