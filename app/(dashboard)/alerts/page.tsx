"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Bell, Pill, Droplets, Cloud, Sun, Wind, Thermometer,
  Check, X, Clock, Plus, Settings, Calendar
} from "lucide-react"
import { cn } from "@/lib/utils"

type AlertCategory = "all" | "medication" | "health" | "weather"

interface Alert {
  id: number
  type: "medication" | "health" | "weather"
  title: string
  description: string
  time: string
  status: "pending" | "completed" | "dismissed"
  priority: "low" | "medium" | "high"
}

const alerts: Alert[] = [
  {
    id: 1,
    type: "medication",
    title: "Take Metformin 500mg",
    description: "Morning dose with breakfast",
    time: "8:00 AM",
    status: "completed",
    priority: "high"
  },
  {
    id: 2,
    type: "health",
    title: "Blood Sugar Check",
    description: "Time for your fasting blood sugar measurement",
    time: "7:00 AM",
    status: "completed",
    priority: "high"
  },
  {
    id: 3,
    type: "weather",
    title: "High Pollen Alert",
    description: "Pollen count is high today. Consider wearing a mask outdoors.",
    time: "Today",
    status: "pending",
    priority: "medium"
  },
  {
    id: 4,
    type: "medication",
    title: "Take Aspirin 75mg",
    description: "After lunch as prescribed",
    time: "1:00 PM",
    status: "pending",
    priority: "high"
  },
  {
    id: 5,
    type: "health",
    title: "Drink Water Reminder",
    description: "You have not logged water intake in 2 hours",
    time: "Now",
    status: "pending",
    priority: "low"
  },
  {
    id: 6,
    type: "weather",
    title: "UV Index High",
    description: "Apply sunscreen if going outdoors between 11 AM - 3 PM",
    time: "Today",
    status: "pending",
    priority: "medium"
  },
  {
    id: 7,
    type: "medication",
    title: "Take Metformin 500mg",
    description: "Evening dose with dinner",
    time: "7:00 PM",
    status: "pending",
    priority: "high"
  },
  {
    id: 8,
    type: "health",
    title: "Evening Walk Reminder",
    description: "30 minutes walk scheduled for today",
    time: "6:00 PM",
    status: "pending",
    priority: "medium"
  }
]

const weatherData = {
  temperature: 28,
  condition: "Partly Cloudy",
  humidity: 65,
  uvIndex: 7,
  pollenCount: "High",
  airQuality: "Moderate"
}

export default function AlertsPage() {
  const [filter, setFilter] = useState<AlertCategory>("all")
  const [alertList, setAlertList] = useState(alerts)

  const filteredAlerts = alertList.filter(alert => 
    filter === "all" || alert.type === filter
  )

  const pendingCount = alertList.filter(a => a.status === "pending").length
  const completedCount = alertList.filter(a => a.status === "completed").length

  const markAsComplete = (id: number) => {
    setAlertList(prev => prev.map(alert => 
      alert.id === id ? { ...alert, status: "completed" as const } : alert
    ))
  }

  const dismissAlert = (id: number) => {
    setAlertList(prev => prev.map(alert => 
      alert.id === id ? { ...alert, status: "dismissed" as const } : alert
    ))
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "medication": return Pill
      case "health": return Droplets
      case "weather": return Cloud
      default: return Bell
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "medication": return "text-chart-4 bg-chart-4/10"
      case "health": return "text-primary bg-primary/10"
      case "weather": return "text-chart-3 bg-chart-3/10"
      default: return "text-muted-foreground bg-muted"
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return "bg-risk-high/10 text-risk-high"
      case "medium": return "bg-risk-medium/10 text-risk-medium"
      case "low": return "bg-muted text-muted-foreground"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Alerts & Reminders</h1>
          <p className="text-muted-foreground">
            Stay on top of your health with personalized notifications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Reminder
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-risk-low/10 flex items-center justify-center">
                <Check className="h-5 w-5 text-risk-low" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completedCount}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                <Pill className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">3</p>
                <p className="text-xs text-muted-foreground">Medications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">2</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { key: "all", label: "All" },
              { key: "medication", label: "Medication" },
              { key: "health", label: "Health" },
              { key: "weather", label: "Weather" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as AlertCategory)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  filter === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Alert Cards */}
          <div className="space-y-3">
            {filteredAlerts.filter(a => a.status !== "dismissed").map((alert) => {
              const Icon = getAlertIcon(alert.type)
              return (
                <Card 
                  key={alert.id} 
                  className={cn(
                    "transition-all",
                    alert.status === "completed" && "opacity-60"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0", getAlertColor(alert.type))}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={cn(
                            "font-medium",
                            alert.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"
                          )}>
                            {alert.title}
                          </h3>
                          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getPriorityBadge(alert.priority))}>
                            {alert.priority}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {alert.time}
                          </span>
                        </div>
                      </div>
                      {alert.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-risk-low hover:text-risk-low hover:bg-risk-low/10"
                            onClick={() => markAsComplete(alert.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => dismissAlert(alert.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {alert.status === "completed" && (
                        <div className="flex items-center gap-1 text-risk-low text-xs font-medium">
                          <Check className="h-4 w-4" />
                          Done
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Weather Widget */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Weather & Health</CardTitle>
              <CardDescription>{"Today's conditions in your area"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Temperature */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Sun className="h-10 w-10 text-chart-3" />
                  <div>
                    <p className="text-3xl font-bold text-foreground">{weatherData.temperature}°C</p>
                    <p className="text-sm text-muted-foreground">{weatherData.condition}</p>
                  </div>
                </div>
              </div>

              {/* Weather Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Humidity</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">{weatherData.humidity}%</p>
                </div>
                <div className="p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Sun className="h-4 w-4 text-chart-3" />
                    <span className="text-xs text-muted-foreground">UV Index</span>
                  </div>
                  <p className="text-lg font-semibold text-risk-medium">{weatherData.uvIndex} High</p>
                </div>
                <div className="p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Wind className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Air Quality</span>
                  </div>
                  <p className="text-lg font-semibold text-risk-medium">{weatherData.airQuality}</p>
                </div>
                <div className="p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Thermometer className="h-4 w-4 text-risk-high" />
                    <span className="text-xs text-muted-foreground">Pollen</span>
                  </div>
                  <p className="text-lg font-semibold text-risk-high">{weatherData.pollenCount}</p>
                </div>
              </div>

              {/* Weather Advisory */}
              <div className="p-3 rounded-lg bg-risk-medium/10 border border-risk-medium/20">
                <h4 className="text-sm font-medium text-foreground mb-1">Health Advisory</h4>
                <p className="text-xs text-muted-foreground">
                  High pollen count detected. If you have allergies or respiratory conditions, 
                  consider staying indoors during peak hours (10 AM - 4 PM).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Pill className="h-4 w-4 mr-2" />
                Add Medication Reminder
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Droplets className="h-4 w-4 mr-2" />
                Log Water Intake
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Health Check
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
