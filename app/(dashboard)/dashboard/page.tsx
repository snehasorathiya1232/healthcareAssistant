"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import {
  Activity,
  ClipboardPlus,
  FileText,
  HeartPulse,
  History,
  LogOut,
  ShieldCheck,
  TrendingUp,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push("/login")
        return
      }

      setEmail(data.user.email ?? null)
    }

    checkUser()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <aside className="hidden md:flex w-72 min-h-screen bg-white border-r p-6 flex-col justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-10">
              <div className="h-10 w-10 rounded-xl bg-teal-600 flex items-center justify-center">
                <HeartPulse className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">HealthAssistant</h1>
                <p className="text-xs text-slate-500">AI-Powered Health Insights</p>
              </div>
            </Link>

            <nav className="space-y-2">
              <DashboardLink icon={<Activity />} text="Dashboard" active />
              <DashboardLink icon={<ClipboardPlus />} text="New Assessment" href="/predict" />
              <DashboardLink icon={<FileText />} text="Latest Result" href="/results" />
              <DashboardLink icon={<History />} text="History" href="/dashboard" />
              <DashboardLink icon={<User />} text="Profile" href="/dashboard" />
            </nav>
          </div>

          <div className="rounded-2xl bg-teal-50 p-5">
            <ShieldCheck className="h-12 w-12 text-teal-600 mb-3" />
            <h3 className="font-semibold mb-2">Your Health. Our Priority.</h3>
            <p className="text-sm text-slate-600">
              Your data is protected and used only for health assessment features.
            </p>
          </div>
        </aside>

        <main className="flex-1 p-5 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back 👋
              </h1>
              <p className="text-slate-500">
                {email || "User"} · Here is your health overview.
              </p>
            </div>

            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
            <ActionCard
              icon={<ClipboardPlus className="h-7 w-7 text-teal-600" />}
              title="Take New Assessment"
              description="Answer health questions and get risk insights."
              button="Start Assessment"
              href="/predict"
            />

            <ActionCard
              icon={<TrendingUp className="h-7 w-7 text-purple-600" />}
              title="View Latest Result"
              description="Check your most recent health risk analysis."
              button="View Result"
              href="/results"
            />

            <ActionCard
              icon={<HeartPulse className="h-7 w-7 text-rose-600" />}
              title="Health Tips"
              description="Get simple preventive care suggestions."
              button="Explore Tips"
              href="/alerts"
            />
          </div>

          <h2 className="text-xl font-bold mb-4">Overview</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <StatCard title="Total Assessments" value="1" subtitle="Current session" />
            <StatCard title="This Month" value="1" subtitle="Assessment completed" />
            <StatCard title="Risk Detected" value="Live" subtitle="Based on latest result" />
            <StatCard title="Overall Health" value="Good" subtitle="Check latest report" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Latest Assessment Summary</CardTitle>
                <CardDescription>Based on your last completed assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl bg-teal-50 p-5">
                  <p className="text-sm text-teal-700 font-medium mb-2">
                    Health report available
                  </p>
                  <h3 className="text-2xl font-bold text-teal-700 mb-2">
                    View Your Latest Result
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Your latest assessment includes disease risk analysis,
                    recommendations, and preventive care guidance.
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/results">View Full Result</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Level Trend</CardTitle>
                <CardDescription>Charts will appear after database history is added</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-56 rounded-xl bg-gradient-to-br from-teal-50 to-white border flex items-center justify-center text-center p-6">
                  <div>
                    <Activity className="h-12 w-12 text-teal-600 mx-auto mb-3" />
                    <p className="font-semibold">Trend Tracking Coming Soon</p>
                    <p className="text-sm text-slate-500">
                      Supabase history will enable real health progress charts.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Assessments</CardTitle>
              <CardDescription>
                Your saved assessment history will appear here after database storage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-xl overflow-hidden">
                <div className="grid grid-cols-4 bg-slate-100 p-3 text-sm font-semibold">
                  <span>Date</span>
                  <span>Risk Level</span>
                  <span>Main Risk</span>
                  <span>Action</span>
                </div>

                <div className="grid grid-cols-4 p-3 text-sm items-center">
                  <span>Latest</span>
                  <span className="text-teal-700 font-medium">Calculated</span>
                  <span>Based on assessment</span>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/results">View</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

function DashboardLink({
  icon,
  text,
  href = "/dashboard",
  active = false,
}: {
  icon: React.ReactNode
  text: string
  href?: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
        active
          ? "bg-teal-50 text-teal-700"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      <span className="h-5 w-5">{icon}</span>
      {text}
    </Link>
  )
}

function ActionCard({
  icon,
  title,
  description,
  button,
  href,
}: {
  icon: React.ReactNode
  title: string
  description: string
  button: string
  href: string
}) {
  return (
    <Card>
      <CardContent className="p-6 flex gap-5">
        <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center">
          {icon}
        </div>

        <div>
          <h3 className="font-bold mb-1">{title}</h3>
          <p className="text-sm text-slate-500 mb-4">{description}</p>
          <Button asChild size="sm">
            <Link href={href}>{button}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string
  subtitle: string
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-slate-500 mb-2">{title}</p>
        <h3 className="text-3xl font-bold mb-1">{value}</h3>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </CardContent>
    </Card>
  )
}