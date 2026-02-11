import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Logo } from "@/components/icons/logo";
import { Shield, Check, Sparkles } from "lucide-react";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect authenticated users away from auth pages
  if (session?.user) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 pattern-dots opacity-10" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 p-10">
          <Logo className="text-white [&_span]:text-white" />
        </div>
        
        <div className="relative z-10 p-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              <Sparkles className="mr-2 h-4 w-4" />
              Trusted by 10,000+ businesses
            </div>
            <blockquote className="text-2xl font-medium text-white leading-relaxed">
              &ldquo;ComplianceKit made GDPR compliance simple for our business. 
              We went from confused to compliant in just one afternoon.&rdquo;
            </blockquote>
            <p className="text-white/70">
              — Sarah Chen, CEO at TechStart
            </p>
          </div>
        </div>

        <div className="relative z-10 p-10">
          <div className="flex flex-wrap items-center gap-6 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-accent" />
              <span>Cookie Scanning</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-accent" />
              <span>Privacy Policies</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-accent" />
              <span>Consent Management</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex items-center justify-center p-8 gradient-bg relative">
        <div className="absolute inset-0 pattern-dots opacity-20" />
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="lg:hidden flex justify-center mb-8">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
