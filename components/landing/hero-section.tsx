"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap, Heart } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 blur-[100px]" />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            <Zap className="h-4 w-4" />
            Smart Health Predictions
          </div>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl text-balance">
            Predict Early.{" "}
            <span className="text-primary">Prevent Better.</span>{" "}
            Live Healthier.
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
            Your AI-powered personal healthcare assistant that analyzes your health data to predict disease risks and provides personalized recommendations for a healthier life.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/predict">
                Start Free Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link href="#how-it-works">
                See How It Works
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">India's Trusted</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">50,000+ Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">95% Accuracy</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-16 relative mx-auto max-w-5xl">
          <div className="rounded-xl border border-border bg-card p-2 shadow-2xl shadow-primary/10">
            <div className="rounded-lg bg-muted/50 p-4 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Health Score Card */}
                <div className="col-span-2 rounded-lg bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">Overall Health Score</span>
                    <span className="text-xs font-medium text-risk-low bg-risk-low/10 px-2 py-1 rounded-full">Good</span>
                  </div>
                  <div className="flex items-end gap-4">
                    <span className="text-5xl font-bold text-foreground">82</span>
                    <span className="text-sm text-muted-foreground mb-2">/100</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[82%] rounded-full bg-risk-low" />
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="rounded-lg bg-card p-4 shadow-sm">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Heart Risk</div>
                  <div className="text-2xl font-bold text-risk-low">Low</div>
                  <div className="text-xs text-muted-foreground mt-1">12% probability</div>
                </div>
                <div className="rounded-lg bg-card p-4 shadow-sm">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Diabetes Risk</div>
                  <div className="text-2xl font-bold text-risk-medium">Medium</div>
                  <div className="text-xs text-muted-foreground mt-1">34% probability</div>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
        </div>
      </div>
    </section>
  )
}
