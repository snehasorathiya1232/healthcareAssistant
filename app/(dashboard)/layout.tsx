"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ClipboardPlus,
  FileText,
  Bell,
  User,
  LogOut,
  HeartPulse,
} from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const menu = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Health Prediction",
      href: "/predict",
      icon: ClipboardPlus,
    },
    {
      title: "Results",
      href: "/results",
      icon: FileText,
    },
    {
      title: "Alerts",
      href: "/alerts",
      icon: Bell,
    },
    {
      title: "Profile",
      href: "/profile",
      icon: User,
    },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r flex flex-col justify-between">
        <div>
          <div className="p-6 border-b flex items-center gap-3">
            <HeartPulse className="text-teal-600 h-8 w-8" />
            <div>
              <h1 className="font-bold text-xl">HealthPredict</h1>
              <p className="text-xs text-gray-500">
                AI Healthcare Assistant
              </p>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {menu.map((item) => {
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                    pathname === item.href
                      ? "bg-teal-100 text-teal-700 font-semibold"
                      : "hover:bg-slate-100 text-gray-700"
                  }`}
                >
                  <Icon size={20} />
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t">
          <button className="flex items-center gap-3 text-red-600 hover:bg-red-50 w-full rounded-xl px-4 py-3">
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}