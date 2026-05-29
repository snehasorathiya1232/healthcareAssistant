"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", score: 72, bloodPressure: 120, sugar: 95 },
  { month: "Feb", score: 74, bloodPressure: 118, sugar: 92 },
  { month: "Mar", score: 71, bloodPressure: 122, sugar: 98 },
  { month: "Apr", score: 76, bloodPressure: 116, sugar: 90 },
  { month: "May", score: 79, bloodPressure: 115, sugar: 88 },
  { month: "Jun", score: 82, bloodPressure: 112, sugar: 86 },
]

export function ActivityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Trends</CardTitle>
        <CardDescription>Your health score progression over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.55 0.15 200)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.55 0.15 200)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
                className="text-muted-foreground"
                domain={[60, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{ color: 'var(--color-foreground)', fontWeight: 600 }}
                itemStyle={{ color: 'var(--color-muted-foreground)' }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="oklch(0.55 0.15 200)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorScore)"
                name="Health Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
