"use client"

import { useState } from "react"
import {
  Sun,
  Snowflake,
  CloudRain,
  Wind,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Thermometer,
  Heart,
  Droplets,
  Activity,
  MessageCircle,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type SeasonKey = "winter" | "summer" | "monsoon" | "smog"

interface SeasonAdvisory {
  id: SeasonKey
  title: string
  subtitle: string
  temperatureRange: string
  icon: any
  badgeClass: string
  headerBg: string
  primaryVulnerability: string
  clinicalMechanism: string
  vulnerableGroups: string[]
  recommendedActions: {
    title: string
    detail: string
    category: "cardio" | "hydration" | "activity" | "general"
  }[]
}

const seasonalAdvisories: Record<SeasonKey, SeasonAdvisory> = {
  winter: {
    id: "winter",
    title: "Cold Wave & Winter Advisory",
    subtitle: "Vasoconstriction & Morning Blood Pressure Surge Protection",
    temperatureRange: "10°C – 22°C (Cold to Frigid)",
    icon: Snowflake,
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    headerBg: "from-blue-500/10 via-cyan-500/5 to-transparent",
    primaryVulnerability: "Elevated Myocardial Infarction & Hypertensive Stroke Risk",
    clinicalMechanism:
      "Cold air exposure triggers sympathetic nervous system activation and acute cutaneous vasoconstriction. This raises systemic vascular resistance, spiking systolic blood pressure by 10–20 mmHg and increasing cardiac workload.",
    vulnerableGroups: [
      "Hypertensive Patients (Systolic >= 130 mmHg)",
      "Cardiovascular Disease / History of CAD",
      "Older Adults (Age >= 60)",
      "Smokers and Sedentary Individuals",
    ],
    recommendedActions: [
      {
        title: "Measure Morning BP 30 Mins After Waking",
        detail:
          "Avoid checking BP immediately upon rising. Sit quietly in a warm room for 15 minutes before taking a resting reading.",
        category: "cardio",
      },
      {
        title: "Avoid Abrupt Early Morning Cold Exposure",
        detail:
          "Perform 5–10 minutes of gentle indoor mobility exercises before stepping outside. Wear multiple warm layers covering head, neck, and chest.",
        category: "activity",
      },
      {
        title: "Maintain Consistent Winter Hydration",
        detail:
          "Thirst sensation decreases in cold weather, yet indoor heaters increase insensible water loss. Drink at least 2 liters of warm water daily.",
        category: "hydration",
      },
      {
        title: "Never Skip Antihypertensive Medications",
        detail:
          "Dosages prescribed in summer may need clinical physician review if cold-weather morning readings consistently exceed 140/90 mmHg.",
        category: "general",
      },
    ],
  },
  summer: {
    id: "summer",
    title: "Extreme Heat & Heatwave Advisory",
    subtitle: "Dehydration, Renal Strain & Hemoconcentration Management",
    temperatureRange: "35°C – 45°C+ (Extreme Heat)",
    icon: Sun,
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    headerBg: "from-amber-500/10 via-orange-500/5 to-transparent",
    primaryVulnerability: "Acute Kidney Injury (AKI), Electrolyte Derangement & Orthostatic Hypotension",
    clinicalMechanism:
      "High ambient temperatures provoke profuse diaphoresis (sweating). Uncompensated fluid loss contracts intravascular volume, concentrating serum glucose and elevating hematocrit, which places direct filtration stress on the kidneys.",
    vulnerableGroups: [
      "Diabetic Patients (Prone to Hyperglycemic Dehydration)",
      "Chronic Kidney Disease (CKD) Patients",
      "Patients on Diuretics or ACE Inhibitors / ARBs",
      "Outdoor Workers & Athletes",
    ],
    recommendedActions: [
      {
        title: "Target 2.5L to 3.5L of Water Daily",
        detail:
          "Drink water in steady 250ml increments every 60–90 minutes. Incorporate unsweetened lemon water or oral rehydration fluids if sweating profusely.",
        category: "hydration",
      },
      {
        title: "Protect Temperature-Sensitive Medications",
        detail:
          "Store insulin, glucometer test strips, and thyroid tablets strictly below 30°C in a cool, shaded environment. Do not leave in parked vehicles.",
        category: "general",
      },
      {
        title: "Shift Aerobic Workouts to Off-Peak Hours",
        detail:
          "Schedule all outdoor walking or exercise before 7:30 AM or after 6:30 PM to avoid peak solar radiation and heat exhaustion.",
        category: "activity",
      },
      {
        title: "Monitor for Postural Lightheadedness",
        detail:
          "Vasodilation from heat can cause sudden blood pressure drops upon standing. Stand up gradually from sitting or lying down.",
        category: "cardio",
      },
    ],
  },
  smog: {
    id: "smog",
    title: "High AQI & Smog Air Quality Alert",
    subtitle: "PM2.5 Arterial Inflammation & Cardiorespiratory Defense",
    temperatureRange: "AQI 200 – 450+ (Unhealthy to Hazardous)",
    icon: Wind,
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    headerBg: "from-rose-500/10 via-red-500/5 to-transparent",
    primaryVulnerability: "Vascular Endothelial Dysfunction & Acute Asthmatic / Cardiac Distress",
    clinicalMechanism:
      "Fine particulate matter (PM2.5) penetrates deep into pulmonary alveoli and enters systemic circulation. This triggers chronic vascular endothelial inflammation, oxidative stress, and accelerated coronary plaque vulnerability.",
    vulnerableGroups: [
      "Individuals with Coronary Artery Disease (CAD)",
      "Asthma, Bronchitis & COPD Patients",
      "Active Smokers and Secondhand Smoke Exposures",
      "Elderly and Pediatric Populations",
    ],
    recommendedActions: [
      {
        title: "Wear N95 / KF94 Masks When Outdoors",
        detail:
          "Standard cloth masks do not filter sub-micron PM2.5 particulates. Use properly sealed N95 respirators during peak commuting hours.",
        category: "general",
      },
      {
        title: "Shift High-Intensity Cardio Indoors",
        detail:
          "Heavy aerobic respiration outdoors increases particulate deposition tenfold into lung tissue. Substitute outdoor runs with indoor yoga or bodyweight circuits.",
        category: "activity",
      },
      {
        title: "Run HEPA Air Filtration in Sleeping Quarters",
        detail:
          "Keep windows sealed during night and early morning temperature inversions when particulate matter is trapped near ground level.",
        category: "general",
      },
      {
        title: "Increase Dietary Antioxidant Intake",
        detail:
          "Boost consumption of vitamin C (citrus fruits, bell peppers), vitamin E (nuts, seeds), and omega-3 fatty acids to help counteract particulate-induced oxidative stress.",
        category: "cardio",
      },
    ],
  },
  monsoon: {
    id: "monsoon",
    title: "Monsoon & High Humidity Advisory",
    subtitle: "Waterborne Pathogen, Liver Defense & Diabetic Foot Safety",
    temperatureRange: "24°C – 32°C (Relative Humidity > 85%)",
    icon: CloudRain,
    badgeClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800",
    headerBg: "from-teal-500/10 via-emerald-500/5 to-transparent",
    primaryVulnerability: "Gastrointestinal Infections, Liver Stress & Fungal Skin Complications",
    clinicalMechanism:
      "Sustained humidity promotes rapid bacterial and fungal proliferation on food, water reservoirs, and damp skin folds. Gastrointestinal infections cause acute dehydration and severe glucose instability.",
    vulnerableGroups: [
      "Diabetic Individuals with Neuropathy",
      "Patients with Pre-existing Liver Disorders",
      "Individuals with Sensitive Gastrointestinal Tracts",
      "Sedentary Workers Lacking Indoor Exercise Alternatives",
    ],
    recommendedActions: [
      {
        title: "Strictly Drink Boiled or Certified Filtered Water",
        detail:
          "Avoid street ice, raw roadside salads, and pre-cut fruits. Waterborne bacterial gastroenteritis carries high metabolic shock risks.",
        category: "hydration",
      },
      {
        title: "Daily Diabetic Foot Inspection & Antifungal Care",
        detail:
          "Check between toes for maceration, fungal infections, or painless micro-ulcers. Keep feet dry and change damp socks immediately.",
        category: "general",
      },
      {
        title: "Indoor Exercise Routine (150 min/week)",
        detail:
          "Rainy weather often halts outdoor walking routines. Use indoor stair climbing, stationary cycling, or pacing to maintain daily glycemic regulation.",
        category: "activity",
      },
      {
        title: "Monitor Electrolytes During Diarrheal Episodes",
        detail:
          "If fever or gastrointestinal disturbance occurs, use oral rehydration salts (ORS) promptly and consult a healthcare provider.",
        category: "general",
      },
    ],
  },
}

interface WeatherHealthWarningsProps {
  assessmentScore?: number | null
  userRiskSummary?: string | null
}

export function WeatherHealthWarnings({
  assessmentScore,
  userRiskSummary,
}: WeatherHealthWarningsProps) {
  // Determine current season automatically based on calendar month
  const getCurrentDefaultSeason = (): SeasonKey => {
    const month = new Date().getMonth() // 0 = Jan, 11 = Dec
    if (month === 10 || month === 11 || month === 0 || month === 1) {
      // Nov, Dec, Jan, Feb -> Winter / Smog Season
      return month === 10 ? "smog" : "winter"
    } else if (month >= 2 && month <= 5) {
      // Mar, Apr, May, Jun -> Summer Heatwave
      return "summer"
    } else {
      // Jul, Aug, Sep, Oct -> Monsoon / High Humidity
      return "monsoon"
    }
  }

  const [activeSeason, setActiveSeason] = useState<SeasonKey>(getCurrentDefaultSeason)
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({})

  const current = seasonalAdvisories[activeSeason]
  const IconComponent = current.icon

  const toggleAction = (actionTitle: string) => {
    setCompletedActions((prev) => ({
      ...prev,
      [actionTitle]: !prev[actionTitle],
    }))
  }

  const handleShareWeatherWhatsApp = () => {
    const actionsList = current.recommendedActions
      .map((a, i) => `${i + 1}. *${a.title}*: ${a.detail}`)
      .join("\n\n")
    const text = encodeURIComponent(
      `🌦️ *${current.title} (${current.temperatureRange})*\n` +
      `*Primary Threat:* ${current.primaryVulnerability}\n\n` +
      `*Recommended Actions:*\n` +
      actionsList +
      `\n\nShared via AI Enabled Personal Healthcare Assistant.`
    )
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank")
  }

  // Correlate with user assessment
  const hasVulnerabilityNotice =
    assessmentScore !== undefined && assessmentScore !== null && assessmentScore < 75

  return (
    <Card className="border-border shadow-sm overflow-hidden">
      {/* Header Banner */}
      <CardHeader className={`pb-4 bg-gradient-to-r ${current.headerBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-card border border-border flex items-center justify-center text-foreground shadow-xs">
                <IconComponent className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl font-bold">
                Weather & Seasonal Health Warnings
              </CardTitle>
              <Badge variant="outline" className={`ml-1 ${current.badgeClass}`}>
                {current.temperatureRange}
              </Badge>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              Clinically calibrated seasonal health precautions per WHO and AHA guidelines.
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-center bg-background/80 backdrop-blur-xs p-1 rounded-lg border border-border">
            <span className="text-[11px] font-semibold text-muted-foreground px-2">Season:</span>
            {(
              [
                { id: "winter", label: "Winter", icon: Snowflake },
                { id: "smog", label: "Smog / AQI", icon: Wind },
                { id: "summer", label: "Summer", icon: Sun },
                { id: "monsoon", label: "Monsoon", icon: CloudRain },
              ] as const
            ).map((s) => {
              const SIcon = s.icon
              const isSelected = activeSeason === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSeason(s.id)}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md transition-all font-medium ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <SIcon className="h-3 w-3" />
                  <span className="hidden md:inline">{s.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Personalized Risk Banner if User has Assessment Score */}
        {hasVulnerabilityNotice && (
          <div className="mt-3 flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-semibold">Personalized Health Notice (Score: {assessmentScore}):</span>{" "}
              Your latest health assessment indicates heightened sensitivity to seasonal stress. Pay close attention to hydration and blood pressure safeguards under {current.title}.
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4 space-y-5">
        {/* Clinical Threat Overview */}
        <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">
              Primary Seasonal Threat: {current.primaryVulnerability}
            </h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {current.clinicalMechanism}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-muted-foreground">Most Vulnerable:</span>
            {current.vulnerableGroups.map((group, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-[10px] px-2 py-0.5 font-normal bg-background border border-border"
              >
                {group}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actionable Prevention Checklist */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Doctor-Recommended Seasonal Action Steps
            </h4>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {Object.values(completedActions).filter(Boolean).length} / {current.recommendedActions.length} Completed
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleShareWeatherWhatsApp}
                className="h-7 text-xs bg-background text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                title="Share this seasonal advisory on WhatsApp"
              >
                <MessageCircle className="h-3 w-3 mr-1 text-emerald-500" />
                Share on WhatsApp
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {current.recommendedActions.map((action, index) => {
              const isChecked = !!completedActions[action.title]
              return (
                <div
                  key={index}
                  onClick={() => toggleAction(action.title)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    isChecked
                      ? "border-green-500/40 bg-green-500/5 dark:bg-green-950/10"
                      : "border-border bg-card hover:border-primary/40 hover:shadow-xs"
                  }`}
                >
                  <div
                    className={`h-5 w-5 rounded-md border flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${
                      isChecked
                        ? "bg-green-600 border-green-600 text-white"
                        : "border-muted-foreground/40 bg-background"
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </div>

                  <div className="space-y-1">
                    <p
                      className={`text-xs font-semibold ${
                        isChecked ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {action.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {action.detail}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
