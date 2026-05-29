"use client"

import { useEffect, useState } from "react"

interface HealthScoreGaugeProps {
  score: number
}

export function HealthScoreGauge({ score }: HealthScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score)
    }, 100)
    return () => clearTimeout(timer)
  }, [score])

  const getScoreColor = (s: number) => {
    if (s >= 70) return "text-risk-low"
    if (s >= 40) return "text-risk-medium"
    return "text-risk-high"
  }

  const getScoreLabel = (s: number) => {
    if (s >= 70) return "Good"
    if (s >= 40) return "Fair"
    return "Needs Attention"
  }

  const getScoreBgColor = (s: number) => {
    if (s >= 70) return "bg-risk-low"
    if (s >= 40) return "bg-risk-medium"
    return "bg-risk-high"
  }

  // SVG calculations
  const size = 180
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = radius * Math.PI // Half circle
  const progress = (animatedScore / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg width={size} height={size / 2 + 20} className="transform -rotate-0">
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted"
          />
          {/* Progress arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className={getScoreColor(score)}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        
        {/* Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className={`text-5xl font-bold ${getScoreColor(score)}`}>
            {animatedScore}
          </span>
          <span className="text-sm text-muted-foreground">/100</span>
        </div>
      </div>
      
      {/* Label */}
      <div className={`mt-2 px-4 py-1 rounded-full text-sm font-medium text-white ${getScoreBgColor(score)}`}>
        {getScoreLabel(score)}
      </div>
    </div>
  )
}
