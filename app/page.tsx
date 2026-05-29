import { Header } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { DiseaseSection } from "@/components/landing/disease-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"
import { FloatingAIButton } from "@/components/ui/floating-ai-button"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <DiseaseSection />
        {/*<TestimonialsSection /> */}
        <CTASection />
      </main>
      <Footer />
      <FloatingAIButton />
    </div>
  )
}
