"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon, Check, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface RiskMeterProps {
  disease: string
  risk: "Low" | "Medium" | "High"
  percentage: number
  icon: LucideIcon
  description: string
  factors: string[]
}

export function RiskMeter({ disease, risk, percentage, icon: Icon, description, factors }: RiskMeterProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [percentage])

  const getRiskColor = (r: string) => {
    switch (r) {
      case "Low": return "text-risk-low"
      case "Medium": return "text-risk-medium"
      case "High": return "text-risk-high"
      default: return "text-muted-foreground"
    }
  }

  const getRiskBgColor = (r: string) => {
    switch (r) {
      case "Low": return "bg-risk-low"
      case "Medium": return "bg-risk-medium"
      case "High": return "bg-risk-high"
      default: return "bg-muted"
    }
  }

  const getRiskIcon = (r: string) => {
    switch (r) {
      case "Low": return Check
      case "Medium": return AlertTriangle
      case "High": return X
      default: return Check
    }
  }

  const RiskIcon = getRiskIcon(risk)

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 pb-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", `${getRiskBgColor(risk)}/10`)}>
                <Icon className={cn("h-5 w-5", getRiskColor(risk))} />
              </div>
              <h3 className="font-semibold text-foreground">{disease}</h3>
            </div>
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
              `${getRiskBgColor(risk)}/10`,
              getRiskColor(risk)
            )}>
              <RiskIcon className="h-3 w-3" />
              {risk} Risk
            </div>
          </div>
        </div>

        {/* Risk Meter */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Risk Level</span>
            <span className={cn("text-2xl font-bold", getRiskColor(risk))}>
              {animatedPercentage}%
            </span>
          </div>
          
          {/* Animated Progress Bar */}
          <div className="relative h-3 rounded-full bg-muted overflow-hidden mb-4">
            <div 
              className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out", getRiskBgColor(risk))}
              style={{ width: `${animatedPercentage}%` }}
            />
            {/* Scale markers */}
            <div className="absolute inset-0 flex">
              <div className="flex-1 border-r border-background/30" />
              <div className="flex-1 border-r border-background/30" />
              <div className="flex-1" />
            </div>
          </div>

          {/* Scale Labels */}
          <div className="flex justify-between text-xs text-muted-foreground mb-4">
            <span>0%</span>
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-3">{description}</p>

          {/* Factors */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-foreground">Key Factors:</p>
            {factors.map((factor, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className={cn("h-1.5 w-1.5 rounded-full", getRiskBgColor(risk))} />
                {factor}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
