"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Activity, Heart, Droplets, Shield, TrendingUp, TrendingDown, 
  ArrowRight, Bell, Calendar, Plus, Flame, Moon, Footprints
} from "lucide-react"
import { HealthScoreGauge } from "@/components/dashboard/health-score-gauge"
import { RiskCard } from "@/components/dashboard/risk-card"
import { ActivityChart } from "@/components/dashboard/activity-chart"
import { RecentActivityList } from "@/components/dashboard/recent-activity-list"
import { HealthTipCard } from "@/components/dashboard/health-tip-card"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

const riskData = [
  { label: "Diabetes", risk: "Low", percentage: 15, icon: Droplets, trend: "down" as const },
  { label: "Heart Disease", risk: "Medium", percentage: 34, icon: Heart, trend: "up" as const },
  { label: "Kidney Disease", risk: "Low", percentage: 12, icon: Shield, trend: "down" as const },
] as const

const vitalStats = [
  { label: "Steps Today", value: "8,432", icon: Footprints, target: "10,000", progress: 84 },
  { label: "Sleep", value: "7.5 hrs", icon: Moon, target: "8 hrs", progress: 94 },
  { label: "Calories", value: "1,850", icon: Flame, target: "2,000", progress: 92 },
]

export default function DashboardPage() {
  const { data: session } = useSession()

  const firstName =
    session?.user?.name?.split(" ")[0] ?? "there"

  const [totalUsers, setTotalUsers] = useState(0)

  useEffect(() => {
    async function loadStats() {
      const res = await fetch("/api/admin/stats")

      if (res.ok) {
        const data = await res.json()
        setTotalUsers(data.totalUsers)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Welcome back, {firstName}</h1>

          <p className="text-sm text-muted-foreground mt-1">
            Registered Users: {totalUsers}
          </p>

          <p className="text-muted-foreground">{"Here's an overview of your health status"}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/alerts">
              <Bell className="h-4 w-4 mr-2" />
              3 Alerts
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/predict">
              <Plus className="h-4 w-4 mr-2" />
              New Assessment
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score - Spans 2 columns on large screens */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Overall Health Score</CardTitle>
                <CardDescription>Based on your latest health assessment</CardDescription>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Last updated: Today
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <HealthScoreGauge score={82} />
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-risk-low" />
                      <span className="text-sm text-muted-foreground">Improvement</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">+5</p>
                    <p className="text-xs text-muted-foreground">from last month</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Next Check</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">12</p>
                    <p className="text-xs text-muted-foreground">days remaining</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/results">
                    View Detailed Report
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Vitals */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Daily Vitals</CardTitle>
            <CardDescription>{"Today's progress"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {vitalStats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <stat.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{stat.label}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{stat.value}</span>
                </div>
                <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
                    style={{ width: `${stat.progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">Target: {stat.target}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Risk Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {riskData.map((item, index) => (
          <RiskCard key={index} {...item} />
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityChart />
        <RecentActivityList />
      </div>

      {/* Health Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <HealthTipCard
          title="Stay Hydrated"
          description="Drink at least 8 glasses of water daily to maintain optimal kidney function."
          category="Hydration"
        />
        <HealthTipCard
          title="Morning Walk"
          description="A 30-minute walk can reduce heart disease risk by up to 35%."
          category="Exercise"
        />
        <HealthTipCard
          title="Limit Sugar Intake"
          description="Reduce refined sugar to help manage blood glucose levels effectively."
          category="Diet"
        />
      </div>
    </div>
  )
}
