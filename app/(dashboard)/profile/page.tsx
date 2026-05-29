"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  User, Mail, Phone, MapPin, Calendar, Edit, Save, X,
  Shield, Trash2, Download, FileText, Activity, Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

const assessmentHistory = [
  { id: 1, date: "April 16, 2026", score: 82, status: "completed" },
  { id: 2, date: "March 15, 2026", score: 77, status: "completed" },
  { id: 3, date: "February 12, 2026", score: 74, status: "completed" },
  { id: 4, date: "January 10, 2026", score: 71, status: "completed" },
]

export default function ProfilePage() {
  const { data: session } = useSession()

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    emergencyContact: "",
  })

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    medicationReminders: true,
    healthTips: true,
    weeklyReport: false,
  })

  const initials =
    profile.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch("/api/user/profile")

      if (res.ok) {
        const data = await res.json()

        setProfile({
          name: data.name ?? "",
          email: data.email ?? "",
          phone: data.profile?.phone ?? "",
          location: data.profile?.location ?? "",
          dateOfBirth: data.profile?.dateOfBirth ?? "",
          gender: data.profile?.gender ?? "",
          bloodGroup: data.profile?.bloodGroup ?? "",
          emergencyContact: data.profile?.emergencyContact ?? "",
        })

        if (data.profile) {
          setNotifications({
            emailAlerts: data.profile.emailAlerts ?? true,
            pushNotifications: data.profile.pushNotifications ?? true,
            medicationReminders: data.profile.medicationReminders ?? true,
            healthTips: data.profile.healthTips ?? true,
            weeklyReport: data.profile.weeklyReport ?? false,
          })
        }
      }
    }

    loadProfile()
  }, [session])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage("")

    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, ...notifications }),
    })

    setIsSaving(false)

    if (res.ok) {
      setSaveMessage("Profile saved successfully!")
      setIsEditing(false)
      setTimeout(() => setSaveMessage(""), 3000)
    } else {
      setSaveMessage("Failed to save. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your personal information and preferences</p>
        </div>

        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {saveMessage && (
        <div className="p-3 rounded-lg bg-primary/10 text-primary text-sm">
          {saveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </div>

              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
              <Avatar className="h-20 w-20 bg-primary/10">
                <AvatarFallback className="text-2xl font-bold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {profile.name || "User"}
                </h3>
                <p className="text-sm text-muted-foreground">Member since 2026</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: "name", label: "Full Name", icon: User, type: "text" },
                { key: "email", label: "Email Address", icon: Mail, type: "email" },
                { key: "phone", label: "Phone Number", icon: Phone, type: "tel" },
                { key: "location", label: "Location", icon: MapPin, type: "text" },
                { key: "dateOfBirth", label: "Date of Birth", icon: Calendar, type: "date" },
                { key: "emergencyContact", label: "Emergency Contact", icon: Phone, type: "tel" },
              ].map((field) => {
                const Icon = field.icon
                const value = profile[field.key as keyof typeof profile]

                return (
                  <div key={field.key} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {field.label}
                    </label>

                    {isEditing ? (
                      <input
                        type={field.type}
                        value={value}
                        onChange={(e) =>
                          setProfile({ ...profile, [field.key]: e.target.value })
                        }
                        className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    ) : (
                      <p className="text-foreground">{value || "-"}</p>
                    )}
                  </div>
                )
              })}

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Gender
                </label>

                {isEditing ? (
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="text-foreground">{profile.gender || "-"}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  Blood Group
                </label>

                {isEditing ? (
                  <select
                    value={profile.bloodGroup}
                    onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                ) : (
                  <p className="text-foreground">{profile.bloodGroup || "-"}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive alerts</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {[
                { key: "emailAlerts", label: "Email Alerts", desc: "Receive health updates via email" },
                { key: "pushNotifications", label: "Push Notifications", desc: "Browser push notifications" },
                { key: "medicationReminders", label: "Medication Reminders", desc: "Never miss a dose" },
                { key: "healthTips", label: "Health Tips", desc: "Daily health recommendations" },
                { key: "weeklyReport", label: "Weekly Report", desc: "Summary of your health data" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>

                  <button
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        [item.key]: !notifications[item.key as keyof typeof notifications],
                      })
                    }
                    className={cn(
                      "relative w-11 h-6 rounded-full transition-colors",
                      notifications[item.key as keyof typeof notifications]
                        ? "bg-primary"
                        : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
                        notifications[item.key as keyof typeof notifications] && "translate-x-5"
                      )}
                    />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Account Stats</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total Assessments</span>
                </div>
                <span className="font-semibold text-foreground">4</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Last Assessment</span>
                </div>
                <span className="font-semibold text-foreground">Today</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Avg Health Score</span>
                </div>
                <span className="font-semibold text-risk-low">76</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assessment History</CardTitle>
          <CardDescription>Track your health journey over time</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Health Score</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>

              <tbody>
                {assessmentHistory.map((assessment) => (
                  <tr key={assessment.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 text-sm text-foreground">{assessment.date}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              assessment.score >= 70
                                ? "bg-risk-low"
                                : assessment.score >= 40
                                ? "bg-risk-medium"
                                : "bg-risk-high"
                            )}
                            style={{ width: `${assessment.score}%` }}
                          />
                        </div>

                        <span
                          className={cn(
                            "text-sm font-medium",
                            assessment.score >= 70
                              ? "text-risk-low"
                              : assessment.score >= 40
                              ? "text-risk-medium"
                              : "text-risk-high"
                          )}
                        >
                          {assessment.score}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-risk-low/10 text-risk-low">
                        Completed
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Report
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription>Irreversible actions for your account</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Delete Account</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data
            </p>
          </div>

          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}