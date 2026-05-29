import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"

interface HealthTipCardProps {
  title: string
  description: string
  category: string
}

export function HealthTipCard({ title, description, category }: HealthTipCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow hover:border-primary/30">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="h-5 w-5 text-chart-3" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {category}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
