import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Logo } from "@/components/icons/logo";
import { LayoutDashboard, Users, Shield, AlertTriangle } from "lucide-react";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex h-full w-60 flex-col border-r bg-card">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Logo />
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            Admin
          </span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          <AdminNavItem href="/admin" icon={LayoutDashboard} label="Overview" exact />
          <AdminNavItem href="/admin/users" icon={Users} label="Users" />
          <AdminNavItem href="/admin/access" icon={AlertTriangle} label="Access Control" />
        </nav>
        <div className="border-t p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Shield className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center border-b bg-card px-6">
          <p className="text-sm font-medium">
            Signed in as{" "}
            <span className="text-primary">{session.user.email}</span>
          </p>
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">{children}</main>
      </div>
    </div>
  );
}

function AdminNavItem({
  href,
  icon: Icon,
  label,
  exact,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  exact?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}
