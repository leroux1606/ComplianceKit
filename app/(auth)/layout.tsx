import { Logo } from "@/components/icons/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-10 text-primary-foreground">
        <Logo className="text-primary-foreground [&>div]:bg-primary-foreground [&>div>svg]:text-primary" />
        
        <div className="space-y-4">
          <blockquote className="text-lg font-medium">
            &ldquo;ComplianceKit made GDPR compliance simple for our business. 
            We went from confused to compliant in just one afternoon.&rdquo;
          </blockquote>
          <p className="text-sm opacity-80">
            — Sarah Chen, CEO at TechStart
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-4 text-sm opacity-80">
            <span>✓ Cookie Scanning</span>
            <span>✓ Privacy Policies</span>
            <span>✓ Consent Management</span>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-8">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}


