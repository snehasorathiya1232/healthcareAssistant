import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import {
  validateHealthAssessment,
  generateSafetyWarnings,
} from "@/lib/validations/health-assessment"
import { evaluateHealthAssessment } from "@/lib/clinical-models"

type Risk = "Low" | "Medium" | "High"

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
    // Validate health data strictly
    // -----------------------------------------

    const validation = validateHealthAssessment(data)
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Validation failed. Please correct the invalid inputs.",
          errors: validation.errors,
        },
        { status: 400 }
      )
    }

    const validatedData = validation.validatedData!
    const {
      age,
      gender,
      height,
      weight,
      bloodPressureSystolic: systolic,
      bloodPressureDiastolic: diastolic,
      bloodSugar: sugar,
      cholesterol,
      heartRate,
      isPediatric,
    } = validatedData

    const safetyWarnings = generateSafetyWarnings(validatedData)

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
        gender,
        isScreeningEstimate: true,
        isPediatric,
        safetyWarnings,
        overallScore: 20,

        summary:
          "Emergency warning signs detected. Please seek urgent medical help immediately.",

        riskResults: [
          {
            disease: "Emergency Health Risk",

            risk: "High" as Risk,

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
          "Screening Estimate Notice: Emergency warning signs detected. This screening estimate is not a clinical diagnosis. Please seek immediate professional medical attention.",
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
    // Clinical Model Evaluation Engine
    // Uses validated models:
    // - Diabetes: ADA Diabetes Risk Test & ADA 2024 Glycemic Criteria
    // - Heart Disease: Framingham 10-Year General CVD Profile (D'Agostino 2008 / ATP III)
    // - Kidney Disease: SCORED Clinical Screening Tool & CKD-EPI 2021 Equation
    // - Liver Disease: FIB-4 Index & AASLD/EASL MASLD/ALD Framework
    // - Breast Cancer: USPSTF 2024 / ACS Screening Guidelines & Gail Model Principles
    // -----------------------------------------
    const clinicalResult = evaluateHealthAssessment(validatedData)

    // -----------------------------------------
    // SAVE ASSESSMENT TO SUPABASE
    // -----------------------------------------
    let savedId = null
    const {
      data: savedRow,
      error: saveError,
    } = await supabase
      .from("health_assessments")
      .insert({
        user_id: user.id,
        overall_score: clinicalResult.overallScore,
        summary: clinicalResult.summary,
        input_data: data,
        result_data: clinicalResult,
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
      ...clinicalResult,
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