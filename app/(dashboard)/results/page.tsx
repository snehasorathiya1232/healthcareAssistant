import { Suspense } from "react"
import ResultsContent from "./results-content"

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">
            Loading results...
          </p>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  )
}