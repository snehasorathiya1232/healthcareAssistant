import { NextResponse } from "next/server"

type Risk = "Low" | "Medium" | "High"

function riskLevel(score: number): Risk {
  if (score >= 70) return "High"
  if (score >= 40) return "Medium"
  return "Low"
}

function clamp(num: number, min = 0, max = 100) {
  return Math.min(Math.max(num, min), max)
}

function num(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    const age = num(data.age)
    const height = num(data.height)
    const weight = num(data.weight)
    const systolic = num(data.bloodPressureSystolic)
    const diastolic = num(data.bloodPressureDiastolic)
    const sugar = num(data.bloodSugar)
    const cholesterol = num(data.cholesterol)
    const heartRate = num(data.heartRate)

    if (!age || !height || !weight) {
      return NextResponse.json(
        { error: "Age, height, and weight are required." },
        { status: 400 }
      )
    }

    const symptoms: string[] = data.symptoms || []
    const lowerSymptoms = symptoms.map((s) => s.toLowerCase())

    const emergencySymptoms = [
      "chest pain",
      "breathing difficulty",
      "severe breathing difficulty",
      "fainting",
      "loss of consciousness",
      "blood vomiting",
      "stroke-like symptoms",
    ]

    const hasEmergency = lowerSymptoms.some((s) =>
      emergencySymptoms.includes(s)
    )

    if (hasEmergency) {
      return NextResponse.json({
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
            title: "Urgent Medical Consultation",
            description:
              "This result needs professional medical evaluation as soon as possible.",
          },
        ],
        disclaimer:
          "This application does not provide medical diagnosis and should not replace professional medical advice.",
      })
    }

    const bmi = weight / Math.pow(height / 100, 2)

    let diabetesScore = 0
    let heartScore = 0
    let kidneyScore = 0
    let liverScore = 0

    if (age > 45) {
      diabetesScore += 15
      heartScore += 15
    }

    if (bmi >= 25) {
      diabetesScore += 20
      heartScore += 15
      liverScore += 10
    }

    if (sugar >= 140) diabetesScore += 35
    else if (sugar >= 100) diabetesScore += 20

    if (data.familyDiabetes) diabetesScore += 15
    if (data.familyHeartDisease) heartScore += 15

    if (systolic >= 140 || diastolic >= 90) {
      heartScore += 30
      kidneyScore += 25
    } else if (systolic >= 120 || diastolic >= 80) {
      heartScore += 15
      kidneyScore += 10
    }

    if (cholesterol >= 240) heartScore += 30
    else if (cholesterol >= 200) heartScore += 15

    if (heartRate > 100 || heartRate < 55) heartScore += 10

    if (data.smokingStatus === "current") {
      heartScore += 20
      liverScore += 10
    }

    if (data.alcoholConsumption === "heavy") liverScore += 30
    if (data.exerciseFrequency === "rarely") {
      diabetesScore += 10
      heartScore += 10
    }

    if (num(data.sleepHours) < 6) {
      heartScore += 10
      diabetesScore += 5
    }

    if (data.stressLevel === "high") heartScore += 15

    if (lowerSymptoms.includes("frequent urination")) diabetesScore += 15
    if (lowerSymptoms.includes("excessive thirst")) diabetesScore += 15
    if (lowerSymptoms.includes("fatigue")) diabetesScore += 10
    if (lowerSymptoms.includes("dizziness")) heartScore += 10
    if (lowerSymptoms.includes("vomiting")) kidneyScore += 10
    if (lowerSymptoms.includes("stomach pain")) liverScore += 10

    diabetesScore = clamp(diabetesScore)
    heartScore = clamp(heartScore)
    kidneyScore = clamp(kidneyScore)
    liverScore = clamp(liverScore)

    const averageRisk =
      (diabetesScore + heartScore + kidneyScore + liverScore) / 4

    const overallScore = clamp(Math.round(100 - averageRisk))

    return NextResponse.json({
      overallScore,
      summary:
        overallScore >= 75
          ? "Your overall health risk looks low, but continue healthy habits."
          : overallScore >= 50
          ? "Some risk factors need attention. Lifestyle improvement is recommended."
          : "Multiple risk factors detected. Please consult a healthcare professional.",
      riskResults: [
        {
          disease: "Diabetes",
          risk: riskLevel(diabetesScore),
          percentage: diabetesScore,
          description:
            "Calculated using age, BMI, blood sugar, family history, lifestyle, and symptoms.",
          factors: ["BMI", "Blood sugar", "Family history", "Symptoms"],
        },
        {
          disease: "Heart Disease",
          risk: riskLevel(heartScore),
          percentage: heartScore,
          description:
            "Calculated using blood pressure, cholesterol, heart rate, age, smoking, and stress.",
          factors: ["Blood pressure", "Cholesterol", "Heart rate", "Lifestyle"],
        },
        {
          disease: "Kidney Disease",
          risk: riskLevel(kidneyScore),
          percentage: kidneyScore,
          description:
            "Calculated using blood pressure, symptoms, and related health risk factors.",
          factors: ["Blood pressure", "Hydration symptoms", "Medical history"],
        },
        {
          disease: "Liver Disorders",
          risk: riskLevel(liverScore),
          percentage: liverScore,
          description:
            "Calculated using BMI, alcohol intake, medications, and digestive symptoms.",
          factors: ["BMI", "Alcohol", "Medications", "Symptoms"],
        },
      ],
      dietRecommendations: [
        {
          title: "Balanced Diet",
          description:
            "Eat more vegetables, fruits, whole grains, and lean protein.",
        },
        {
          title: "Reduce Sugar and Junk Food",
          description:
            "Avoid excess sugar, fried food, and processed snacks.",
        },
        {
          title: "Stay Hydrated",
          description:
            "Drink enough water daily unless restricted by a doctor.",
        },
      ],
      lifestyleRecommendations: [
        {
          title: "Daily Walking",
          description:
            "Walk at least 30 minutes daily for better heart and sugar control.",
        },
        {
          title: "Sleep Improvement",
          description:
            "Try to maintain 7-8 hours of sleep every night.",
        },
        {
          title: "Stress Control",
          description:
            "Practice breathing, meditation, or light exercise to reduce stress.",
        },
      ],
      preventiveCare: [
        {
          title: "Regular Checkup",
          description:
            "Check blood pressure, sugar, and cholesterol regularly.",
        },
        {
          title: "Doctor Consultation",
          description:
            "Consult a doctor if symptoms continue or risk is high.",
        },
      ],
      disclaimer:
        "This application does not provide medical diagnosis and should not replace professional medical advice. Please consult a qualified healthcare professional.",
    })
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while analyzing health data." },
      { status: 500 }
    )
  }
}