import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface RiskCardProps {
  label: string
  risk: "Low" | "Medium" | "High"
  percentage: number
  icon: LucideIcon
  trend: "up" | "down"
}

export function RiskCard({ label, risk, percentage, icon: Icon, trend }: RiskCardProps) {
  const getRiskColor = (r: string) => {
    switch (r) {
      case "Low": return "text-risk-low"
      case "Medium": return "text-risk-medium"
      case "High": return "text-risk-high"
      default: return "text-muted-foreground"
    }
  }

  const getRiskBgColor = (r: string) => {
    switch (r) {
      case "Low": return "bg-risk-low"
      case "Medium": return "bg-risk-medium"
      case "High": return "bg-risk-high"
      default: return "bg-muted"
    }
  }

  const getRiskBgLight = (r: string) => {
    switch (r) {
      case "Low": return "bg-risk-low/10"
      case "Medium": return "bg-risk-medium/10"
      case "High": return "bg-risk-high/10"
      default: return "bg-muted"
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", getRiskBgLight(risk))}>
            <Icon className={cn("h-5 w-5", getRiskColor(risk))} />
          </div>
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trend === "down" ? "text-risk-low bg-risk-low/10" : "text-risk-high bg-risk-high/10"
          )}>
            {trend === "down" ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <TrendingUp className="h-3 w-3" />
            )}
            {trend === "down" ? "Improving" : "Increased"}
          </div>
        </div>
        
        <h3 className="text-sm font-medium text-muted-foreground mb-1">{label}</h3>
        <div className="flex items-end gap-2 mb-3">
          <span className={cn("text-2xl font-bold", getRiskColor(risk))}>{risk}</span>
          <span className="text-sm text-muted-foreground mb-1">{percentage}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all", getRiskBgColor(risk))}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
