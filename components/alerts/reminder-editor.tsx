"use client"

import { useState, useEffect } from "react"
import {
  Droplets,
  Pill,
  Footprints,
  Moon,
  Apple,
  Clock,
  Plus,
  Trash2,
  Edit3,
  Timer,
  Sparkles,
  Check,
  BellRing,
  RotateCcw,
  Activity,
  Smartphone,
  Send,
  CheckCircle2,
  MessageCircle,
  PhoneCall,
  PhoneIncoming,
  PhoneOff,
  Volume2,
  Share2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export type ReminderCategory = "water" | "medicine" | "glucose" | "walk" | "sleep" | "meal" | "general"

export type HealthReminder = {
  id: string
  title: string
  category: ReminderCategory
  timingType: "time" | "interval"
  timeValue: string // e.g. "05:30" or "5"
  timePeriod: "AM" | "PM"
  frequencyLabel: string // e.g. "Every 5 hours" or "At 05:30 AM"
  notes?: string
  isActive: boolean
  createdAt: string
}

const categoryConfig: Record<
  ReminderCategory,
  { label: string; icon: any; colorClass: string; badgeClass: string; cardBorder: string }
> = {
  water: {
    label: "Hydration",
    icon: Droplets,
    colorClass: "text-blue-500",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    cardBorder: "hover:border-blue-400/50",
  },
  medicine: {
    label: "Medication",
    icon: Pill,
    colorClass: "text-rose-500",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    cardBorder: "hover:border-rose-400/50",
  },
  glucose: {
    label: "Blood Sugar Check",
    icon: Activity,
    colorClass: "text-purple-500",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    cardBorder: "hover:border-purple-400/50",
  },
  walk: {
    label: "Activity & Walk",
    icon: Footprints,
    colorClass: "text-emerald-500",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    cardBorder: "hover:border-emerald-400/50",
  },
  sleep: {
    label: "Sleep & Rest",
    icon: Moon,
    colorClass: "text-violet-500",
    badgeClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800",
    cardBorder: "hover:border-violet-400/50",
  },
  meal: {
    label: "Nutrition / Diet",
    icon: Apple,
    colorClass: "text-amber-500",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    cardBorder: "hover:border-amber-400/50",
  },
  general: {
    label: "Routine",
    icon: Clock,
    colorClass: "text-sky-500",
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800",
    cardBorder: "hover:border-sky-400/50",
  },
}

const defaultReminders: HealthReminder[] = [
  {
    id: "rem-1",
    title: "Drinking Water",
    category: "water",
    timingType: "interval",
    timeValue: "5",
    timePeriod: "AM",
    frequencyLabel: "Every 5 hours",
    notes: "Keep your water bottle filled; drink at least 300-500ml per reminder",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rem-2",
    title: "Take Morning Medicine",
    category: "medicine",
    timingType: "time",
    timeValue: "05:30",
    timePeriod: "AM",
    frequencyLabel: "At 05:30 AM",
    notes: "Take prescribed morning medications on an empty stomach or with light food",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rem-sugar",
    title: "Check Fasting Blood Sugar",
    category: "glucose",
    timingType: "time",
    timeValue: "07:30",
    timePeriod: "AM",
    frequencyLabel: "At 07:30 AM",
    notes: "Record fasting blood sugar level before morning breakfast",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rem-3",
    title: "Evening Walk & Stretch",
    category: "walk",
    timingType: "time",
    timeValue: "06:30",
    timePeriod: "PM",
    frequencyLabel: "At 06:30 PM",
    notes: "20-30 minutes brisk walking to help regulate evening blood sugar",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
]

export function ReminderEditor() {
  const [reminders, setReminders] = useState<HealthReminder[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>("all")

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState("")
  const [formCategory, setFormCategory] = useState<ReminderCategory>("water")
  const [formTimingType, setFormTimingType] = useState<"time" | "interval">("interval")
  const [formTimeValue, setFormTimeValue] = useState("5")
  const [formTimePeriod, setFormTimePeriod] = useState<"AM" | "PM">("AM")
  const [formNotes, setFormNotes] = useState("")
  const [formError, setFormError] = useState("")

  // Digital Notification state
  const [notificationPermission, setNotificationPermission] = useState<string>("default")
  const [testNotificationSent, setTestNotificationSent] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  const handleEnableNotifications = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const permission = await Notification.requestPermission()
        setNotificationPermission(permission)
        if (permission === "granted") {
          new Notification("HealthPredict AI", {
            body: "Digital health notifications enabled! You will receive timely reminders for hydration, blood sugar checks, and medicines.",
            icon: "/favicon.ico",
          })
        }
      } catch (e) {
        console.error("Notification permission error:", e)
      }
    }
  }

  const handleSendTestNotification = () => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("Health Reminder Alert", {
        body: "Time for a healthy habit! Drink a glass of water, check your blood sugar, or take your medicine.",
        icon: "/favicon.ico",
      })
      setTestNotificationSent(true)
      setTimeout(() => setTestNotificationSent(false), 3000)
    } else {
      handleEnableNotifications()
    }
  }

  // Voice Call Modal State
  const [voiceCallDialogOpen, setVoiceCallDialogOpen] = useState(false)
  const [activeVoiceReminder, setActiveVoiceReminder] = useState<HealthReminder | null>(null)
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false)

  // WhatsApp Notification Handlers
  const handleShareWhatsApp = (rem: HealthReminder) => {
    const text = encodeURIComponent(
      `*HealthPredict AI - Health Reminder*\n` +
      `Activity: ${rem.title}\n` +
      `Schedule: ${rem.frequencyLabel}\n` +
      (rem.notes ? `Notes: ${rem.notes}\n` : "") +
      `\nSent via AI Enabled Personal Healthcare Assistant.`
    )
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank")
  }

  const handleShareAllWhatsApp = () => {
    const active = reminders.filter((r) => r.isActive)
    const list = active
      .map((r, i) => `${i + 1}. *${r.title}* (${r.frequencyLabel})`)
      .join("\n")
    const text = encodeURIComponent(
      `*HealthPredict AI - My Daily Health Schedule*\n\n` +
      list +
      `\n\nDaily preventive care powered by AI Enabled Personal Healthcare Assistant.`
    )
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank")
  }

  // Automated Voice Call Handler (Web Speech API)
  const handleTriggerVoiceCall = (rem?: HealthReminder) => {
    const target = rem || reminders.find((r) => r.isActive) || reminders[0]
    if (!target) return

    setActiveVoiceReminder(target)
    setVoiceCallDialogOpen(true)
    setIsVoiceCallActive(true)

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const spokenText =
        `Hello! This is your AI Enabled Personal Healthcare Assistant automated voice reminder. ` +
        `It is time for your scheduled health activity: ${target.title}, scheduled ${target.frequencyLabel}. ` +
        `${target.notes || "Please follow your preventive routine."} ` +
        `Remember to stay hydrated and maintain healthy habits. Have a wonderful and healthy day!`
      const utterance = new SpeechSynthesisUtterance(spokenText)
      utterance.rate = 0.95
      utterance.pitch = 1.05
      utterance.onend = () => setIsVoiceCallActive(false)
      utterance.onerror = () => setIsVoiceCallActive(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleEndVoiceCall = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
    setIsVoiceCallActive(false)
    setVoiceCallDialogOpen(false)
  }

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("healthcare_user_reminders")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReminders(parsed)
          setIsLoaded(true)
          return
        }
      }
      setReminders(defaultReminders)
      localStorage.setItem("healthcare_user_reminders", JSON.stringify(defaultReminders))
    } catch {
      setReminders(defaultReminders)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Sync to LocalStorage
  const saveReminders = (updated: HealthReminder[]) => {
    setReminders(updated)
    try {
      localStorage.setItem("healthcare_user_reminders", JSON.stringify(updated))
    } catch (e) {
      console.error("Failed to save reminders:", e)
    }
  }

  // Open Dialog for Adding
  const handleOpenAdd = () => {
    setEditingId(null)
    setFormTitle("Drinking Water")
    setFormCategory("water")
    setFormTimingType("interval")
    setFormTimeValue("5")
    setFormTimePeriod("AM")
    setFormNotes("")
    setFormError("")
    setDialogOpen(true)
  }

  // Open Dialog for Quick Presets
  const handleQuickAdd = (
    title: string,
    category: ReminderCategory,
    timingType: "time" | "interval",
    timeValue: string,
    timePeriod: "AM" | "PM",
    notes: string
  ) => {
    const label =
      timingType === "interval"
        ? `Every ${timeValue} hour${timeValue !== "1" ? "s" : ""}`
        : `At ${timeValue} ${timePeriod}`

    const newRem: HealthReminder = {
      id: "rem-" + Date.now(),
      title,
      category,
      timingType,
      timeValue,
      timePeriod,
      frequencyLabel: label,
      notes,
      isActive: true,
      createdAt: new Date().toISOString(),
    }

    saveReminders([newRem, ...reminders])
  }

  // Open Dialog for Editing
  const handleOpenEdit = (reminder: HealthReminder) => {
    setEditingId(reminder.id)
    setFormTitle(reminder.title)
    setFormCategory(reminder.category)
    setFormTimingType(reminder.timingType)
    setFormTimeValue(reminder.timeValue)
    setFormTimePeriod(reminder.timePeriod || "AM")
    setFormNotes(reminder.notes || "")
    setFormError("")
    setDialogOpen(true)
  }

  // Delete Reminder
  const handleDelete = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id)
    saveReminders(updated)
  }

  // Toggle Reminder Active
  const handleToggle = (id: string) => {
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, isActive: !r.isActive } : r
    )
    saveReminders(updated)
  }

  // Reset to default reminders
  const handleResetDefaults = () => {
    saveReminders(defaultReminders)
  }

  // Save / Submit Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      setFormError("Please enter a reminder title.")
      return
    }

    if (!formTimeValue.trim()) {
      setFormError("Please enter a valid time or interval.")
      return
    }

    const label =
      formTimingType === "interval"
        ? `Every ${formTimeValue} hour${formTimeValue !== "1" ? "s" : ""}`
        : `At ${formTimeValue} ${formTimePeriod}`

    if (editingId) {
      // Edit existing
      const updated = reminders.map((r) => {
        if (r.id === editingId) {
          return {
            ...r,
            title: formTitle.trim(),
            category: formCategory,
            timingType: formTimingType,
            timeValue: formTimeValue.trim(),
            timePeriod: formTimePeriod,
            frequencyLabel: label,
            notes: formNotes.trim() || undefined,
          }
        }
        return r
      })
      saveReminders(updated)
    } else {
      // Add new
      const newReminder: HealthReminder = {
        id: "rem-" + Date.now(),
        title: formTitle.trim(),
        category: formCategory,
        timingType: formTimingType,
        timeValue: formTimeValue.trim(),
        timePeriod: formTimePeriod,
        frequencyLabel: label,
        notes: formNotes.trim() || undefined,
        isActive: true,
        createdAt: new Date().toISOString(),
      }
      saveReminders([newReminder, ...reminders])
    }

    setDialogOpen(false)
  }

  // Filtered list
  const filteredReminders = reminders.filter((r) => {
    if (filterCategory === "all") return true
    if (filterCategory === "active") return r.isActive
    return r.category === filterCategory
  })

  const activeCount = reminders.filter((r) => r.isActive).length

  if (!isLoaded) {
    return null
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <BellRing className="h-4 w-4" />
              </div>
              <CardTitle className="text-xl font-bold">Health Reminder Editor</CardTitle>
              <Badge variant="outline" className="ml-1 bg-primary/5 text-primary border-primary/20">
                {activeCount} Active
              </Badge>
            </div>
            <CardDescription className="mt-1">
              Customize personal daily health alarms for hydration, medicine doses, and fitness.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
              className="text-xs h-9 text-muted-foreground hover:text-foreground"
              title="Reset to sample reminders"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
            <Button onClick={handleOpenAdd} size="sm" className="h-9 px-4 gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              Add Reminder
            </Button>
          </div>
        </div>

        {/* Quick Add Presets Bar */}
        <div className="pt-3 border-t border-border/60 mt-3">
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-amber-500" />
            Quick Presets (Click to add):
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                handleQuickAdd(
                  "Drink Water",
                  "water",
                  "interval",
                  "5",
                  "AM",
                  "Hydration check: drink 250-500ml water"
                )
              }
              className="text-xs px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors flex items-center gap-1"
            >
              <Droplets className="h-3 w-3 text-blue-500" />
              + Water (Every 5h)
            </button>
            <button
              onClick={() =>
                handleQuickAdd(
                  "Drink Water",
                  "water",
                  "interval",
                  "2",
                  "AM",
                  "Hydration check: drink 1 glass of water"
                )
              }
              className="text-xs px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors flex items-center gap-1"
            >
              <Droplets className="h-3 w-3 text-blue-500" />
              + Water (Every 2h)
            </button>
            <button
              onClick={() =>
                handleQuickAdd(
                  "Take Medicine",
                  "medicine",
                  "time",
                  "05:30",
                  "AM",
                  "Take prescribed medication with warm water"
                )
              }
              className="text-xs px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors flex items-center gap-1"
            >
              <Pill className="h-3 w-3 text-rose-500" />
              + Medicine (5:30 AM)
            </button>
            <button
              onClick={() =>
                handleQuickAdd(
                  "Night Medicine",
                  "medicine",
                  "time",
                  "09:30",
                  "PM",
                  "Take nighttime dose after dinner"
                )
              }
              className="text-xs px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors flex items-center gap-1"
            >
              <Pill className="h-3 w-3 text-rose-500" />
              + Medicine (9:30 PM)
            </button>
            <button
              onClick={() =>
                handleQuickAdd(
                  "Check Fasting Sugar",
                  "glucose",
                  "time",
                  "07:30",
                  "AM",
                  "Record fasting blood sugar level before breakfast"
                )
              }
              className="text-xs px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-900 bg-purple-50/60 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors flex items-center gap-1"
            >
              <Activity className="h-3 w-3 text-purple-500" />
              + Blood Sugar (7:30 AM)
            </button>
            <button
              onClick={() =>
                handleQuickAdd(
                  "Post-Meal Sugar Check",
                  "glucose",
                  "time",
                  "02:00",
                  "PM",
                  "Check postprandial glucose (2 hours after lunch)"
                )
              }
              className="text-xs px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-900 bg-purple-50/60 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors flex items-center gap-1"
            >
              <Activity className="h-3 w-3 text-purple-500" />
              + Sugar (Post-Lunch)
            </button>
            <button
              onClick={() =>
                handleQuickAdd(
                  "Post-Meal Walk",
                  "walk",
                  "time",
                  "07:30",
                  "PM",
                  "15-20 min light walk for healthy digestion"
                )
              }
              className="text-xs px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors flex items-center gap-1"
            >
              <Footprints className="h-3 w-3 text-emerald-500" />
              + Walk (7:30 PM)
            </button>
          </div>
        </div>

        {/* Digital Communication Channel / Notification Banner */}
        <div className="pt-3 border-t border-border/60 mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                Digital Communication Channel
                <Badge
                  variant="outline"
                  className={`text-[10px] h-4 px-1.5 ${
                    notificationPermission === "granted"
                      ? "bg-green-500/10 text-green-600 border-green-200"
                      : "bg-amber-500/10 text-amber-600 border-amber-200"
                  }`}
                >
                  {notificationPermission === "granted" ? "Push Active" : "Push Inactive"}
                </Badge>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Receive browser alert notifications for water, medicines, and sugar checks on your device.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            {notificationPermission !== "granted" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleEnableNotifications}
                className="h-7 text-xs bg-background"
              >
                Enable Notifications
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSendTestNotification}
                className="h-7 text-xs bg-background text-primary border-primary/30"
              >
                {testNotificationSent ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                    Sent!
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3 mr-1" />
                    Send Test Alert
                  </>
                )}
              </Button>
            )}

            {/* WhatsApp Integration Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleShareAllWhatsApp}
              className="h-7 text-xs bg-background text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
              title="Share entire daily schedule to WhatsApp"
            >
              <MessageCircle className="h-3 w-3 mr-1 text-emerald-500" />
              WhatsApp
            </Button>

            {/* Automated Voice Call Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleTriggerVoiceCall()}
              className="h-7 text-xs bg-background text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800"
              title="Demonstrate automated voice call reminder"
            >
              <PhoneCall className="h-3 w-3 mr-1 text-indigo-500" />
              Voice Call Alert
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3">
          <span className="text-xs text-muted-foreground mr-1">Filter:</span>
          {[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "water", label: "Water" },
            { id: "medicine", label: "Medicine" },
            { id: "glucose", label: "Blood Sugar" },
            { id: "walk", label: "Activity" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium ${
                filterCategory === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {filteredReminders.length === 0 ? (
          <div className="py-12 text-center rounded-xl border border-dashed border-border bg-muted/20">
            <Clock className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium text-foreground">No reminders in this view</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Click &quot;Add Reminder&quot; above or choose a preset to schedule your water and medicine timings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredReminders.map((rem) => {
              const config = categoryConfig[rem.category] || categoryConfig.general
              const IconComponent = config.icon

              return (
                <div
                  key={rem.id}
                  className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 bg-card ${
                    rem.isActive ? "border-border shadow-xs " + config.cardBorder : "opacity-60 border-border/60 bg-muted/30"
                  }`}
                >
                  <div>
                    {/* Top row: Category Badge & Status Switch */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <Badge variant="outline" className={`text-xs py-0.5 px-2 font-medium flex items-center gap-1.5 ${config.badgeClass}`}>
                        <IconComponent className={`h-3 w-3 ${config.colorClass}`} />
                        {config.label}
                      </Badge>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {rem.isActive ? "On" : "Paused"}
                        </span>
                        <Switch
                          checked={rem.isActive}
                          onCheckedChange={() => handleToggle(rem.id)}
                          aria-label="Toggle reminder"
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className={`font-semibold text-base leading-snug ${rem.isActive ? "text-foreground" : "text-muted-foreground line-through"}`}>
                      {rem.title}
                    </h3>

                    {/* Schedule Badge */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mt-2">
                      {rem.timingType === "interval" ? (
                        <Timer className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                      )}
                      <span>{rem.frequencyLabel}</span>
                    </div>

                    {/* Notes */}
                    {rem.notes && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                        {rem.notes}
                      </p>
                    )}
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50 text-xs">
                    <span className="text-[11px] text-muted-foreground">
                      {rem.timingType === "interval" ? "Repeating Alarm" : "Daily Schedule"}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShareWhatsApp(rem)}
                        className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                        title="Share this reminder to WhatsApp"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTriggerVoiceCall(rem)}
                        className="h-7 w-7 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
                        title="Trigger automated voice call"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(rem)}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                        title="Edit reminder"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(rem.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Delete reminder"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmitForm}>
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editingId ? "Edit Health Reminder" : "Add Health Reminder"}
              </DialogTitle>
              <DialogDescription>
                Set up recurring alarms for your water intake, medicines, or daily activity.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {formError && (
                <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Reminder Title
                </label>
                <Input
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value)
                    setFormError("")
                  }}
                  placeholder="e.g. Drinking Water, Take Blood Pressure Medicine"
                  className="h-10 text-sm"
                  required
                />
              </div>

              {/* Category Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(categoryConfig) as ReminderCategory[]).map((catKey) => {
                    const cfg = categoryConfig[catKey]
                    const CatIcon = cfg.icon
                    const isSelected = formCategory === catKey
                    return (
                      <button
                        type="button"
                        key={catKey}
                        onClick={() => {
                          setFormCategory(catKey)
                          if (!editingId) {
                            if (catKey === "water") setFormTitle("Drinking Water")
                            if (catKey === "medicine") setFormTitle("Take Medicine")
                            if (catKey === "glucose") setFormTitle("Check Blood Sugar")
                            if (catKey === "walk") setFormTitle("Daily Walk")
                            if (catKey === "sleep") setFormTitle("Bedtime Wind-Down")
                            if (catKey === "meal") setFormTitle("Healthy Meal")
                          }
                        }}
                        className={`flex items-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/30"
                            : "border-border hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <CatIcon className={`h-3.5 w-3.5 ${cfg.colorClass}`} />
                        <span className="truncate">{cfg.label.split(" ")[0]}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Timing Type Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Schedule Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormTimingType("interval")
                      if (formTimingType !== "interval") setFormTimeValue("5")
                    }}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg border text-xs transition-all ${
                      formTimingType === "interval"
                        ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/30"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <Timer className="h-4 w-4" />
                    Repeating Interval (e.g. Every 5h)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormTimingType("time")
                      if (formTimingType !== "time") setFormTimeValue("05:30")
                    }}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg border text-xs transition-all ${
                      formTimingType === "time"
                        ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/30"
                        : "border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    Exact Time (e.g. 5:30 AM)
                  </button>
                </div>
              </div>

              {/* Timing Input Controls */}
              {formTimingType === "interval" ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Repeat Every (Hours)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Every</span>
                    <Input
                      type="number"
                      min="1"
                      max="24"
                      value={formTimeValue}
                      onChange={(e) => setFormTimeValue(e.target.value)}
                      className="h-10 text-sm w-28 text-center font-semibold"
                      required
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      {formTimeValue === "1" ? "hour" : "hours"}
                    </span>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    {["2", "3", "4", "5", "6", "8"].map((h) => (
                      <button
                        type="button"
                        key={h}
                        onClick={() => setFormTimeValue(h)}
                        className={`text-[11px] px-2 py-0.5 rounded border ${
                          formTimeValue === h
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-muted-foreground border-border hover:text-foreground"
                        }`}
                      >
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Exact Time
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      placeholder="05:30"
                      value={formTimeValue}
                      onChange={(e) => setFormTimeValue(e.target.value)}
                      className="h-10 text-sm font-semibold text-center flex-1"
                      required
                    />
                    <div className="flex rounded-lg border border-border p-1 bg-muted/40">
                      <button
                        type="button"
                        onClick={() => setFormTimePeriod("AM")}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                          formTimePeriod === "AM"
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormTimePeriod("PM")}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                          formTimePeriod === "PM"
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        PM
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { val: "05:30", period: "AM" as const },
                      { val: "08:00", period: "AM" as const },
                      { val: "01:00", period: "PM" as const },
                      { val: "06:30", period: "PM" as const },
                      { val: "09:30", period: "PM" as const },
                    ].map((t) => (
                      <button
                        type="button"
                        key={t.val + t.period}
                        onClick={() => {
                          setFormTimeValue(t.val)
                          setFormTimePeriod(t.period)
                        }}
                        className={`text-[11px] px-2 py-0.5 rounded border ${
                          formTimeValue === t.val && formTimePeriod === t.period
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-muted-foreground border-border hover:text-foreground"
                        }`}
                      >
                        {t.val} {t.period}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Instructions / Notes (Optional)
                </label>
                <Input
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Take with warm water before meals"
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingId ? "Save Changes" : "Create Reminder"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Automated Voice Call Simulation Dialog */}
      <Dialog
        open={voiceCallDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleEndVoiceCall()
          else setVoiceCallDialogOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-sm text-center p-6">
          <div className="mx-auto my-3 relative">
            <div
              className={`h-20 w-20 rounded-full mx-auto flex items-center justify-center transition-all ${
                isVoiceCallActive
                  ? "bg-primary/20 text-primary ring-8 ring-primary/10 animate-pulse"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <PhoneIncoming className="h-10 w-10 text-primary" />
            </div>
            {isVoiceCallActive && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500" />
              </span>
            )}
          </div>

          <DialogHeader className="text-center sm:text-center">
            <DialogTitle className="text-lg font-bold">
              Automated Health Voice Call
            </DialogTitle>
            <DialogDescription className="text-xs">
              AI Enabled Personal Healthcare Assistant Automated Call System
            </DialogDescription>
          </DialogHeader>

          {activeVoiceReminder && (
            <div className="my-4 p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-left space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary">
                  {activeVoiceReminder.title}
                </span>
                <Badge variant="outline" className="text-[10px] h-4">
                  {activeVoiceReminder.frequencyLabel}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {activeVoiceReminder.notes ||
                  "Time to maintain your scheduled daily preventive health routine."}
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
            <Volume2
              className={`h-4 w-4 ${isVoiceCallActive ? "text-primary animate-bounce" : ""}`}
            />
            <span>
              {isVoiceCallActive
                ? "Speaking automated voice reminder..."
                : "Voice announcement finished"}
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTriggerVoiceCall(activeVoiceReminder || undefined)}
              className="text-xs"
            >
              <Volume2 className="h-3.5 w-3.5 mr-1.5" />
              Replay Audio
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndVoiceCall}
              className="text-xs gap-1.5"
            >
              <PhoneOff className="h-3.5 w-3.5" />
              End Call
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

