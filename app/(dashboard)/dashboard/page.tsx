"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

import {
  Activity,
  ClipboardPlus,
  TrendingUp,
  HeartPulse,
  LogOut,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
    <main className="flex-1 p-8">

      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-4xl font-bold">
            Welcome back 👋
          </h1>

          <p className="text-lg text-gray-600 mt-2">
            {email?.split("@")[0]}
          </p>
        </div>

        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>

      </div>

      <div className="grid md:grid-cols-3 gap-6">

        <ActionCard
          icon={<ClipboardPlus className="h-8 w-8 text-teal-600" />}
          title="Health Prediction"
          description="Start a new health assessment."
          button="Start"
          href="/predict"
        />

        <ActionCard
          icon={<TrendingUp className="h-8 w-8 text-purple-600" />}
          title="Results"
          description="View your latest prediction."
          button="View"
          href="/results"
        />

        <ActionCard
          icon={<HeartPulse className="h-8 w-8 text-red-500" />}
          title="Health Tips"
          description="Get personalized health advice."
          button="Open"
          href="/alerts"
        />

      </div>

      <h2 className="text-2xl font-bold mt-10 mb-5">
        Overview
      </h2>

      <div className="grid md:grid-cols-4 gap-5">

        <StatCard
          title="Assessments"
          value="1"
          subtitle="Completed"
        />

        <StatCard
          title="Risk"
          value="Low"
          subtitle="Latest Result"
        />

        <StatCard
          title="Health"
          value="Good"
          subtitle="Current Status"
        />

        <StatCard
          title="History"
          value="1"
          subtitle="Saved"
        />

      </div>

    </main>
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
      <CardContent className="p-6">

        <div className="mb-4">
          {icon}
        </div>

        <h3 className="font-bold text-lg">
          {title}
        </h3>

        <p className="text-gray-500 mt-2 mb-5">
          {description}
        </p>

        <Button asChild>
          <Link href={href}>{button}</Link>
        </Button>

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

        <p className="text-gray-500 text-sm">
          {title}
        </p>

        <h2 className="text-3xl font-bold my-2">
          {value}
        </h2>

        <p className="text-xs text-gray-400">
          {subtitle}
        </p>

      </CardContent>
    </Card>
  )
}