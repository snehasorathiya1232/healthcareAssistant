import { Heart, Droplets, Activity, Shield, Stethoscope } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const diseases = [
  {
    icon: Droplets,
    title: "Diabetes",
    description: "Type 1 & Type 2 diabetes risk assessment based on glucose levels, BMI, family history, and lifestyle factors.",
    color: "text-chart-1",
    bgColor: "bg-chart-1/10"
  },
  {
    icon: Heart,
    title: "Heart Disease",
    description: "Cardiovascular risk prediction using blood pressure, cholesterol levels, smoking status, and exercise habits.",
    color: "text-chart-5",
    bgColor: "bg-chart-5/10"
  },
  {
    icon: Activity,
    title: "Breast Cancer",
    description: "Early detection risk factors including age, genetics, hormonal factors, and lifestyle considerations.",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10"
  },
  {
    icon: Shield,
    title: "Kidney Disease",
    description: "Renal health assessment based on creatinine levels, blood pressure, diabetes status, and hydration habits.",
    color: "text-chart-2",
    bgColor: "bg-chart-2/10"
  },
  {
    icon: Stethoscope,
    title: "Liver Disorders",
    description: "Liver function risk analysis considering enzyme levels, alcohol consumption, obesity, and medication use.",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10"
  }
]

export function DiseaseSection() {
  return (
    <section id="diseases" className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl mb-4">
            Diseases We Predict
          </h2>
          <p className="text-lg text-muted-foreground">
            Our AI models are trained on extensive medical datasets to accurately predict risks for these major health conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diseases.map((disease, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all hover:border-primary/30">
              <CardHeader>
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${disease.bgColor} ${disease.color} mb-2`}>
                  <disease.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{disease.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{disease.description}</p>
              </CardContent>
            </Card>
          ))}
          
          {/* Coming Soon Card */}
          <Card className="border-dashed bg-muted/50">
            <CardHeader>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground mb-2">
                <span className="text-xl font-bold">+</span>
              </div>
              <CardTitle className="text-lg text-muted-foreground">More Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{"We're continuously expanding our prediction models to cover more health conditions."}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
