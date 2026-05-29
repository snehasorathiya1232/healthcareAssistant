import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, FileText, Bell, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const activities = [
  {
    id: 1,
    type: "assessment",
    title: "Health Assessment Completed",
    description: "Your diabetes risk decreased to Low",
    time: "2 hours ago",
    icon: Activity,
    iconBg: "bg-primary/10",
    iconColor: "text-primary"
  },
  {
    id: 2,
    type: "report",
    title: "New Report Generated",
    description: "Monthly health summary is ready",
    time: "Yesterday",
    icon: FileText,
    iconBg: "bg-chart-2/10",
    iconColor: "text-chart-2"
  },
  {
    id: 3,
    type: "alert",
    title: "Health Alert",
    description: "High pollen count in your area today",
    time: "Yesterday",
    icon: Bell,
    iconBg: "bg-risk-medium/10",
    iconColor: "text-risk-medium"
  },
  {
    id: 4,
    type: "goal",
    title: "Goal Achieved",
    description: "You completed your weekly exercise target",
    time: "3 days ago",
    icon: CheckCircle,
    iconBg: "bg-risk-low/10",
    iconColor: "text-risk-low"
  }
]

export function RecentActivityList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest health events and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div 
              key={activity.id}
              className={cn(
                "flex items-start gap-4 pb-4",
                index !== activities.length - 1 && "border-b border-border"
              )}
            >
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0", activity.iconBg)}>
                <activity.icon className={cn("h-5 w-5", activity.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
