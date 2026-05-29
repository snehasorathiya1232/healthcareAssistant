import { ClipboardList, Cpu, BarChart3, Lightbulb } from "lucide-react"

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Input Your Data",
    description: "Enter your health information including age, blood pressure, sugar levels, BMI, and lifestyle habits through our simple form."
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Analysis",
    description: "Our advanced AI algorithms process your data and compare it against millions of health records to identify patterns."
  },
  {
    icon: BarChart3,
    step: "03",
    title: "View Results",
    description: "See your personalized risk assessment with clear visual indicators showing high, medium, or low risk for various conditions."
  },
  {
    icon: Lightbulb,
    step: "04",
    title: "Get Recommendations",
    description: "Receive tailored diet plans, exercise routines, and preventive care suggestions to improve your health outcomes."
  }
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Four simple steps to understand your health risks and take control of your wellbeing.
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border hidden lg:block -translate-x-1/2" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative flex gap-6 ${index % 2 === 1 ? 'lg:flex-row-reverse lg:text-right' : ''}`}
              >
                {/* Step Number Circle */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                    <step.icon className="h-7 w-7" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-card border-2 border-primary text-xs font-bold text-primary">
                    {step.step}
                  </span>
                </div>

                {/* Content */}
                <div className={`flex-1 pt-2 ${index % 2 === 1 ? 'lg:pr-8' : 'lg:pl-0'}`}>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
