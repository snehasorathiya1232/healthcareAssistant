"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Heart, Droplets, Shield, Activity, Stethoscope,
  Download, Share2, RefreshCw, ChevronRight,
  Apple, Dumbbell, Pill, AlertTriangle
} from "lucide-react"
import { RiskMeter } from "@/components/results/risk-meter"
import { RecommendationCard } from "@/components/results/recommendation-card"
import { RiskFactorChart } from "@/components/results/risk-factor-chart"
import Link from "next/link"

const iconMap: any = {
  Diabetes: Droplets,
  "Heart Disease": Heart,
  "Kidney Disease": Shield,
  "Liver Disorders": Stethoscope,
  "Emergency Health Risk": AlertTriangle,
}

export default function ResultsPage() {
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    const savedResult = localStorage.getItem("healthAssessmentResult")
    if (savedResult) {
      setResult(JSON.parse(savedResult))
    }
  }, [])

  if (!result) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-3">No Assessment Found</h1>
            <p className="text-muted-foreground mb-4">
              Please complete a health assessment first.
            </p>
            <Button asChild>
              <Link href="/predict">Take Assessment</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const riskResults = result.riskResults.map((item: any) => ({
    ...item,
    icon: iconMap[item.disease] || Activity,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Health Risk Analysis
          </h1>
          <p className="text-muted-foreground">
            Based on your latest assessment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>

          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>

          <Button size="sm" asChild>
            <Link href="/predict">
              <RefreshCw className="h-4 w-4 mr-2" />
              New Assessment
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">
                  {result.overallScore}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Overall Health Score
              </h2>

              <p className="text-muted-foreground mb-3">
                {result.summary}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Disease Risk Analysis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {riskResults.map((item: any, index: number) => (
            <RiskMeter key={index} {...item} />
          ))}
        </div>
      </div>

      <RiskFactorChart />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-risk-low/10 flex items-center justify-center">
                <Apple className="h-4 w-4 text-risk-low" />
              </div>
              <CardTitle className="text-base">Diet Recommendations</CardTitle>
            </div>
            <CardDescription>Nutritional changes for better health</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {result.dietRecommendations.map((rec: any, index: number) => (
              <RecommendationCard key={index} {...rec} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Dumbbell className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base">Lifestyle Changes</CardTitle>
            </div>
            <CardDescription>Daily habits to improve health</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {result.lifestyleRecommendations.map((rec: any, index: number) => (
              <RecommendationCard key={index} {...rec} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-chart-4/10 flex items-center justify-center">
                <Pill className="h-4 w-4 text-chart-4" />
              </div>
              <CardTitle className="text-base">Preventive Care</CardTitle>
            </div>
            <CardDescription>Recommended screenings and tests</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {result.preventiveCare.map((rec: any, index: number) => (
              <RecommendationCard key={index} {...rec} />
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-risk-medium/30 bg-risk-medium/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-risk-medium flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground mb-1">
                Important Disclaimer
              </h3>
              <p className="text-sm text-muted-foreground">
                {result.disclaimer}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6">
        <Button size="lg" asChild>
          <Link href="/predict">
            Take Another Assessment
            <ChevronRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>

        <Button size="lg" variant="outline" asChild>
          <Link href="/dashboard">
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}