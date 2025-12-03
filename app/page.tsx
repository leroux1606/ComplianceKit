import Link from "next/link";
import {
  Shield,
  Cookie,
  FileText,
  Zap,
  Check,
  ArrowRight,
  Globe,
  Lock,
  BarChart3,
  Users,
  Sparkles,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons/logo";

const features = [
  {
    icon: Cookie,
    title: "Cookie Scanner",
    description:
      "Automatically detect all cookies and tracking scripts on your website with our advanced AI-powered scanning engine.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: FileText,
    title: "Policy Generator",
    description:
      "Generate GDPR-compliant privacy policies and cookie policies tailored specifically to your website's needs.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Globe,
    title: "Consent Banner",
    description:
      "Deploy a beautiful, customizable cookie consent banner that seamlessly integrates with your website design.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track consent rates, compliance scores, and user preferences with detailed analytics and insights.",
    color: "from-orange-500 to-amber-500",
  },
];

const stats = [
  { value: "10K+", label: "Websites Protected" },
  { value: "99.9%", label: "Uptime Guarantee" },
  { value: "50M+", label: "Consents Managed" },
  { value: "24/7", label: "Expert Support" },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$29",
    description: "Perfect for small websites and blogs",
    features: [
      "1 website",
      "Monthly compliance scans",
      "Basic cookie banner",
      "Privacy policy generator",
      "Email support",
    ],
  },
  {
    name: "Professional",
    price: "$99",
    description: "For growing businesses and agencies",
    features: [
      "5 websites",
      "Weekly compliance scans",
      "Custom branded banner",
      "All policy types",
      "Priority support",
      "Analytics dashboard",
      "DSAR management",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$299",
    description: "For large organizations with custom needs",
    features: [
      "Unlimited websites",
      "Daily compliance scans",
      "White-label solution",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
    ],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Documentation
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild className="gradient-primary glow-primary hover:opacity-90 transition-opacity">
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
        {/* Background elements */}
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm backdrop-blur-sm">
              <Sparkles className="mr-2 h-4 w-4 text-primary animate-pulse-glow" />
              <span className="text-primary font-medium">Trusted by 10,000+ businesses worldwide</span>
            </div>
            
            {/* Headline */}
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              <span className="text-foreground">GDPR Compliance</span>
              <br />
              <span className="text-gradient">Made Simple</span>
            </h1>
            
            {/* Subheadline */}
            <p className="mb-10 text-xl text-muted-foreground md:text-2xl max-w-2xl mx-auto leading-relaxed">
              Scan your website for cookies, generate privacy policies, and deploy 
              compliant consent banners in minutes. <span className="text-foreground font-medium">No legal expertise required.</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button size="lg" asChild className="gradient-primary glow-primary hover:opacity-90 transition-all text-lg px-8 py-6 rounded-xl">
                <Link href="/sign-up">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-border/50 hover:bg-muted/50 text-lg px-8 py-6 rounded-xl">
                <Link href="#features">
                  See How It Works
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm mb-6">
              <Zap className="mr-2 h-4 w-4 text-accent" />
              <span className="text-accent font-medium">Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Everything You Need for <span className="text-gradient">Compliance</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              ComplianceKit provides all the tools you need to make your website GDPR-compliant without the complexity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm hover-lift"
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color}`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 md:py-32 relative">
        <div className="absolute inset-0 pattern-grid opacity-20" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Get Compliant in <span className="text-gradient">3 Simple Steps</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              No technical expertise needed. Our automated system handles everything for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: "01", title: "Add Your Website", description: "Enter your website URL and our AI will automatically scan it for cookies and tracking scripts.", icon: Globe },
              { step: "02", title: "Generate Policies", description: "We'll create customized privacy and cookie policies based on your specific scan results.", icon: FileText },
              { step: "03", title: "Deploy Banner", description: "Add our consent banner to your website with a single line of code. That's it!", icon: Shield },
            ].map((item, index) => (
              <div key={item.step} className="relative">
                {/* Connector line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/50 to-transparent" />
                )}
                
                <div className="text-center">
                  <div className="mb-6 relative inline-flex">
                    <div className="h-20 w-20 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
                      <item.icon className="h-10 w-10 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm mb-6">
              <Users className="mr-2 h-4 w-4 text-primary" />
              <span className="text-primary font-medium">Flexible Plans</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Simple, <span className="text-gradient">Transparent</span> Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 hover-lift ${
                  plan.popular 
                    ? "border-primary/50 bg-gradient-to-b from-primary/10 to-transparent glow-primary" 
                    : "border-border/50 bg-card/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full gradient-primary px-4 py-1.5 text-sm font-medium text-white shadow-lg">
                      <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>
                
                <div className="mb-8">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                
                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start text-sm">
                      <Check className="mr-3 h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className={`w-full rounded-xl py-6 ${
                    plan.popular 
                      ? "gradient-primary hover:opacity-90" 
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                  asChild
                >
                  <Link href="/sign-up">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 gradient-primary opacity-90" />
            <div className="absolute inset-0 pattern-dots opacity-10" />
            
            <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-white">
                Ready to Get Compliant?
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
                Join thousands of businesses that trust ComplianceKit for their GDPR compliance needs. 
                Start your free trial today — no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="secondary" asChild className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-xl shadow-lg">
                  <Link href="/sign-up">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl">
                  <Link href="#pricing">
                    View Pricing
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo />
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ComplianceKit. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
