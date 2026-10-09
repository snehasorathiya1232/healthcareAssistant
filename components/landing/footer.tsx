import Link from "next/link"
import { Activity } from "lucide-react"

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Disease Predictions", href: "#diseases" },
    { label: "Start Assessment", href: "/signup" }
  ],
  account: [
    { label: "Create Account", href: "/signup" },
    { label: "Sign In", href: "/login" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Assessment History", href: "/history" }
  ],
  info: [
    { label: "Health Alerts & Tips", href: "/alerts" },
    { label: "Risk Results", href: "/results" },
    { label: "Privacy Notice", href: "#" },
    { label: "Disclaimer", href: "#" }
  ]
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">HealthPredict AI</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-enabled personal healthcare assistant. Predict health risks early, get personalized recommendations, and take control of your wellbeing.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Account</h3>
            <ul className="space-y-3">
              {footerLinks.account.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Information</h3>
            <ul className="space-y-3">
              {footerLinks.info.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {`© ${new Date().getFullYear()} HealthPredict AI — AI Enabled Personal Healthcare Assistant. Developed by Sneha Sorathiya.`}
          </p>
          <p className="text-xs text-muted-foreground text-center md:text-right max-w-sm">
            This tool is for educational and preventive support only. It does not replace professional medical advice.
          </p>
        </div>
      </div>
    </footer>
  )
}
