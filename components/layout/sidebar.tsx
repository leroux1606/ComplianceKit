"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Globe,
  FileText,
  CreditCard,
  Settings,
  Shield,
  Inbox,
  BarChart3,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/icons/logo";

const navigationItems = [
  {
    key: "dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    key: "websites",
    href: "/dashboard/websites",
    icon: Globe,
  },
  {
    key: "analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    key: "dsar",
    href: "/dashboard/dsar",
    icon: Inbox,
  },
  {
    key: "policies",
    href: "/dashboard/policies",
    icon: FileText,
  },
  {
    key: "billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    key: "settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const tBilling = useTranslations("billing");

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard">
          <Logo />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigationItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{tBilling("plans.free")}</p>
              <p className="text-xs text-muted-foreground">1 website</p>
            </div>
          </div>
          <Link
            href="/dashboard/billing"
            className="mt-3 block text-center text-sm font-medium text-primary hover:underline"
          >
            {tBilling("upgrade")}
          </Link>
        </div>
      </div>
    </div>
  );
}


