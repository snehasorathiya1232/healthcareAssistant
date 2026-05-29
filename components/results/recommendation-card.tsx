import { ChevronRight } from "lucide-react"

interface RecommendationCardProps {
  title: string
  description: string
}

export function RecommendationCard({ title, description }: RecommendationCardProps) {
  return (
    <div className="group p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground mb-0.5 group-hover:text-primary transition-colors">
            {title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-0.5 transition-colors" />
      </div>
    </div>
  )
}
