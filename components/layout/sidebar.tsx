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
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/icons/logo";
import { AccountSwitcher } from "@/components/layout/account-switcher";

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
    key: "dataRequests",
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

const teamNavItem = {
  key: "team",
  href: "/dashboard/team",
  icon: Users,
};

interface Membership {
  id: string;
  role: string;
  owner: { id: string; name: string | null; email: string; companyName: string | null };
}

interface SidebarProps {
  planName: string;
  maxWebsites: number;
  maxTeamMembers: number;
  teamMemberships: Membership[];
  activeOwnerId: string | null;
  currentUserEmail: string;
}

export function Sidebar({ planName, maxWebsites, maxTeamMembers, teamMemberships, activeOwnerId, currentUserEmail }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const tBilling = useTranslations("billing");

  // Combine standard nav items + team (if plan allows)
  const navItems = maxTeamMembers !== 1
    ? [...navigationItems.slice(0, -2), teamNavItem, ...navigationItems.slice(-2)]
    : navigationItems;

  const websiteLabel =
    maxWebsites === -1
      ? "Unlimited websites"
      : `${maxWebsites} website${maxWebsites !== 1 ? "s" : ""}`;

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card" role="complementary">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" aria-label="ComplianceKit — go to dashboard home">
          <Logo />
        </Link>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Main navigation"
        className="flex-1 space-y-1 px-3 py-4"
      >
        {navItems.map((item) => {
          // Exact match for /dashboard, startsWith for others
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      {/* Account switcher (shown if user is a member of other accounts) */}
      {teamMemberships.length > 0 && (
        <div className="px-3 pb-2">
          <AccountSwitcher
            memberships={teamMemberships}
            activeOwnerId={activeOwnerId}
            currentUserEmail={currentUserEmail}
          />
        </div>
      )}

      {/* Plan / Upgrade Footer */}
      <div className="border-t p-4">
        <div className="rounded-lg bg-muted p-4" aria-label={`Current plan: ${planName}`}>
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
              aria-hidden="true"
            >
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{planName}</p>
              <p className="text-xs text-muted-foreground">{websiteLabel}</p>
            </div>
          </div>
          <Link
            href="/dashboard/billing"
            className="mt-3 block text-center text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-sm"
          >
            {tBilling("upgrade")}
          </Link>
        </div>
      </div>
    </div>
  );
}


