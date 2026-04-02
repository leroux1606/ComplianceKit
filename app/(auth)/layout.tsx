import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Logo } from "@/components/icons/logo";
import { Shield, Check } from "lucide-react";

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
          <div className="space-y-6">
            <p className="text-2xl font-medium text-white leading-relaxed">
              Everything you need for GDPR compliance — in one place.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-white/80 text-sm">
                <Check className="h-4 w-4 text-accent shrink-0" />
                Automated cookie scanning &amp; categorization
              </li>
              <li className="flex items-center gap-3 text-white/80 text-sm">
                <Check className="h-4 w-4 text-accent shrink-0" />
                Auto-generated privacy &amp; cookie policies
              </li>
              <li className="flex items-center gap-3 text-white/80 text-sm">
                <Check className="h-4 w-4 text-accent shrink-0" />
                Customizable consent banner
              </li>
              <li className="flex items-center gap-3 text-white/80 text-sm">
                <Check className="h-4 w-4 text-accent shrink-0" />
                Data subject access request management
              </li>
            </ul>
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
