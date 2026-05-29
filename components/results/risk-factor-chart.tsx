"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

const data = [
  { name: "Blood Pressure", value: 72, status: "good" },
  { name: "Cholesterol", value: 58, status: "warning" },
  { name: "Blood Sugar", value: 85, status: "good" },
  { name: "BMI", value: 78, status: "good" },
  { name: "Heart Rate", value: 90, status: "good" },
  { name: "Stress Level", value: 45, status: "warning" },
]

const getBarColor = (status: string) => {
  switch (status) {
    case "good": return "oklch(0.65 0.2 145)"
    case "warning": return "oklch(0.75 0.18 85)"
    case "danger": return "oklch(0.55 0.22 25)"
    default: return "oklch(0.55 0.15 200)"
  }
}

export function RiskFactorChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Factor Scores</CardTitle>
        <CardDescription>How your individual health metrics contribute to your overall score</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
              <XAxis 
                type="number" 
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                type="category" 
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
                className="text-muted-foreground"
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{ color: 'var(--color-foreground)', fontWeight: 600 }}
                formatter={(value: number) => [`${value}/100`, 'Score']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-risk-low" />
            <span className="text-sm text-muted-foreground">Good (70-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-risk-medium" />
            <span className="text-sm text-muted-foreground">Needs Attention (40-69)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-risk-high" />
            <span className="text-sm text-muted-foreground">Critical (0-39)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
