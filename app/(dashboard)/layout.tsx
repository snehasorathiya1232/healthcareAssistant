"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import {
  LayoutDashboard,
  ClipboardPlus,
  FileText,
  Bell,
  User,
  LogOut,
  HeartPulse,
  History,
  Menu,
  X,
} from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const menu = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Health Assessment",
      href: "/predict",
      icon: ClipboardPlus,
    },
    {
      title: "My Results",
      href: "/results",
      icon: FileText,
    },
    {
      title: "Alerts & Tips",
      href: "/alerts",
      icon: Bell,
    },
    {
      title: "History",
      href: "/history",
      icon: History,
    },
    {
      title: "Profile",
      href: "/profile",
      icon: User,
    },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border flex items-center justify-between px-4 h-14">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <HeartPulse className="text-primary-foreground h-4 w-4" />
          </div>
          <span className="font-bold text-base text-foreground">HealthPredict AI</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-border flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <HeartPulse className="text-primary-foreground h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground leading-tight">HealthPredict AI</h1>
              <p className="text-xs text-muted-foreground">Healthcare Assistant</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {menu.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon size={18} />
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-sm font-medium text-destructive hover:bg-destructive/10 w-full rounded-lg px-4 py-2.5 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto pt-16 md:pt-8">{children}</main>
    </div>
  )
}
