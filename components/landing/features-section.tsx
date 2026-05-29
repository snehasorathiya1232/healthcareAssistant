import { Brain, LineChart, Bell, Shield, Users, Smartphone } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Advanced machine learning algorithms analyze your health data to predict potential disease risks with high accuracy."
  },
  {
    icon: LineChart,
    title: "Risk Visualization",
    description: "Clear visual indicators show your risk levels for various diseases with easy-to-understand charts and meters."
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Receive personalized health reminders, medication alerts, and weather-based health warnings."
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your health data is encrypted and stored securely. We never share your information with third parties."
  },
  {
    icon: Users,
    title: "Expert Recommendations",
    description: "Get personalized diet plans, lifestyle tips, and preventive care suggestions based on your risk profile."
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Access your health dashboard anytime, anywhere with our fully responsive mobile-first design."
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl mb-4">
            Comprehensive Health Monitoring
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to understand, track, and improve your health in one intelligent platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
