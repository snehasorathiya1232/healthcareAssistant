import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"

const benefits = [
  "Free health risk assessment",
  "Personalized recommendations",
  "No credit card required"
]

export function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl lg:text-5xl mb-6 text-balance">
            Take Control of Your Health Today
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join over 50,000 users who have already discovered their health risks and are taking proactive steps towards a healthier future.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-primary-foreground/90">
                <CheckCircle className="h-5 w-5 text-primary-foreground" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="secondary" className="h-12 px-8 text-base" asChild>
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base border-primary-foreground/20 text-black hover:bg-primary-foreground/10" asChild>
              <Link href="/signup">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
