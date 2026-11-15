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
  Droplets,
  Heart,
  Activity,
  MessageCircle,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export type SeasonKey = "winter" | "smog" | "summer" | "monsoon"

interface SimpleAdvisory {
  id: SeasonKey
  name: string
  temp: string
  icon: any
  badgeClass: string
  colorClass: string
  bgGradient: string
  keyRisk: string
  shortAdvice: string
  tips: {
    id: string
    title: string
    icon: any
  }[]
}

const advisories: Record<SeasonKey, SimpleAdvisory> = {
  winter: {
    id: "winter",
    name: "Winter Cold",
    temp: "14°C • Cold",
    icon: Snowflake,
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200",
    colorClass: "text-blue-500",
    bgGradient: "from-blue-500/10 via-cyan-500/5 to-transparent",
    keyRisk: "Cold air causes morning blood pressure spikes",
    shortAdvice: "Protect your heart by keeping warm and checking resting blood pressure.",
    tips: [
      { id: "w1", title: "Wear warm layers & cover your neck before stepping outside", icon: ShieldAlert },
      { id: "w2", title: "Check blood pressure 30 minutes after waking, not right away", icon: Heart },
      { id: "w3", title: "Drink 2+ liters of warm water to prevent winter dehydration", icon: Droplets },
    ],
  },
  smog: {
    id: "smog",
    name: "Smog / AQI",
    temp: "AQI 260 • Poor",
    icon: Wind,
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200",
    colorClass: "text-rose-500",
    bgGradient: "from-rose-500/10 via-orange-500/5 to-transparent",
    keyRisk: "Fine dust particles strain heart and lungs",
    shortAdvice: "Limit outdoor exertion and filter indoor air during peak smog hours.",
    tips: [
      { id: "s1", title: "Wear an N95 mask during morning and evening rush hours", icon: ShieldAlert },
      { id: "s2", title: "Exercise indoors instead of jogging outdoors in smog", icon: Activity },
      { id: "s3", title: "Keep bedroom windows closed and run air filtration if available", icon: Wind },
    ],
  },
  summer: {
    id: "summer",
    name: "Summer Heat",
    temp: "38°C • Hot",
    icon: Sun,
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200",
    colorClass: "text-amber-500",
    bgGradient: "from-amber-500/10 via-yellow-500/5 to-transparent",
    keyRisk: "Extreme sweating risks dehydration & kidney strain",
    shortAdvice: "Maintain high fluid intake and exercise only during cooler hours.",
    tips: [
      { id: "h1", title: "Drink 2.5L – 3.5L of water in steady intervals throughout the day", icon: Droplets },
      { id: "h2", title: "Walk or exercise before 7:30 AM or after 6:30 PM", icon: Activity },
      { id: "h3", title: "Store medications, insulin & test strips in a cool shaded spot", icon: Heart },
    ],
  },
  monsoon: {
    id: "monsoon",
    name: "Monsoon",
    temp: "28°C • Humid",
    icon: CloudRain,
    badgeClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200",
    colorClass: "text-teal-500",
    bgGradient: "from-teal-500/10 via-emerald-500/5 to-transparent",
    keyRisk: "High humidity raises waterborne infection & fungal risk",
    shortAdvice: "Drink only boiled water and inspect feet daily for minor cuts.",
    tips: [
      { id: "m1", title: "Drink only boiled/filtered water; avoid raw street food", icon: Droplets },
      { id: "m2", title: "Keep feet completely dry and clean; inspect daily if diabetic", icon: ShieldAlert },
      { id: "m3", title: "Do 20 mins of indoor marching/stretching to regulate blood sugar", icon: Activity },
    ],
  },
}

interface WeatherHealthWarningsProps {
  assessmentScore?: number | null
  userRiskSummary?: string | null
}

export function WeatherHealthWarnings({ assessmentScore }: WeatherHealthWarningsProps) {
  // Auto-detect current season by month
  const getDefaultSeason = (): SeasonKey => {
    const month = new Date().getMonth()
    if (month === 10) return "smog"
    if (month === 11 || month === 0 || month === 1) return "winter"
    if (month >= 2 && month <= 5) return "summer"
    return "monsoon"
  }

  const [activeSeason, setActiveSeason] = useState<SeasonKey>(getDefaultSeason)
  const [checkedTips, setCheckedTips] = useState<Record<string, boolean>>({})

  const current = advisories[activeSeason]
  const IconComponent = current.icon

  const toggleTip = (id: string) => {
    setCheckedTips((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const completedCount = current.tips.filter((t) => checkedTips[t.id]).length

  const handleShareWhatsApp = () => {
    const tipsList = current.tips.map((t, i) => `${i + 1}. ${t.title}`).join("\n")
    const msg = encodeURIComponent(
      `🌦️ *${current.name} Health Alert (${current.temp})*\n` +
      `*Risk:* ${current.keyRisk}\n\n` +
      `*Action Steps:*\n${tipsList}\n\n` +
      `Shared via AI Enabled Personal Healthcare Assistant.`
    )
    window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank")
  }

  return (
    <Card className="border-border shadow-xs overflow-hidden h-full flex flex-col justify-between">
      <div>
        {/* Compact Header */}
        <CardHeader className={`p-4 pb-3 bg-gradient-to-r ${current.bgGradient}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-card border border-border flex items-center justify-center">
                <IconComponent className={`h-4 w-4 ${current.colorClass}`} />
              </div>
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  Seasonal Health Alert
                </CardTitle>
                <p className="text-[11px] text-muted-foreground">{current.shortAdvice}</p>
              </div>
            </div>
            <Badge variant="outline" className={`text-[11px] font-semibold ${current.badgeClass}`}>
              {current.temp}
            </Badge>
          </div>

          {/* Quick Season Switcher */}
          <div className="flex items-center gap-1 pt-3">
            {(
              [
                { id: "winter", label: "Winter", icon: Snowflake },
                { id: "smog", label: "Smog", icon: Wind },
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
                  className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md font-medium transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-background/80 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <SIcon className="h-3 w-3" />
                  {s.label}
                </button>
              )
            })}
          </div>

          {assessmentScore !== undefined && assessmentScore !== null && assessmentScore < 70 && (
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300 font-medium bg-amber-500/10 px-2.5 py-1 rounded-md">
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
              <span>Attention: Your health score ({assessmentScore}) means extra care is advised.</span>
            </div>
          )}
        </CardHeader>

        {/* Actionable Tips (Clean & Checkable) */}
        <CardContent className="p-4 pt-3 space-y-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Today&apos;s Checklist ({completedCount}/{current.tips.length})
          </p>

          <div className="space-y-1.5">
            {current.tips.map((tip) => {
              const isDone = !!checkedTips[tip.id]
              const TipIcon = tip.icon

              return (
                <div
                  key={tip.id}
                  onClick={() => toggleTip(tip.id)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center gap-2.5 select-none ${
                    isDone
                      ? "border-green-500/40 bg-green-500/5 text-muted-foreground"
                      : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-colors ${
                      isDone
                        ? "bg-green-600 border-green-600 text-white"
                        : "border-muted-foreground/40 bg-background"
                    }`}
                  >
                    {isDone && <CheckCircle2 className="h-3 w-3" />}
                  </div>

                  <TipIcon className={`h-3.5 w-3.5 flex-shrink-0 ${isDone ? "text-muted-foreground" : current.colorClass}`} />

                  <span className={`leading-snug ${isDone ? "line-through opacity-70" : "font-medium text-foreground"}`}>
                    {tip.title}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </div>

      {/* Footer Share */}
      <div className="p-3 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs">
        <span className="text-[11px] text-muted-foreground">Stay safe this season</span>
        <Button
          size="sm"
          variant="outline"
          onClick={handleShareWhatsApp}
          className="h-7 text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
        >
          <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
          Share on WhatsApp
        </Button>
      </div>
    </Card>
  )
}
