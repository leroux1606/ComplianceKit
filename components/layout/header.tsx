"use client";

import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { ChevronRight } from "lucide-react";

import { UserNav } from "@/components/layout/user-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/i18n/config";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/websites": "Websites",
  "/dashboard/analytics": "Analytics",
  "/dashboard/dsar": "Data Requests",
  "/dashboard/policies": "Policies",
  "/dashboard/billing": "Billing",
  "/dashboard/settings": "Settings",
};

function getPageTitle(pathname: string): { section: string; title: string } | null {
  if (pathname === "/dashboard") return null;

  for (const [route, title] of Object.entries(PAGE_TITLES)) {
    if (route === pathname || (route !== "/dashboard" && pathname.startsWith(route + "/"))) {
      const sub = pathname.slice(route.length).replace(/^\//, "").split("/")[0];
      const isSubPage = sub && sub.length > 0 && !PAGE_TITLES[pathname];
      return { section: title, title: isSubPage ? sub : title };
    }
  }

  return null;
}

export function Header() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const breadcrumb = getPageTitle(pathname);

  return (
    <header
      className="flex h-16 items-center justify-between border-b bg-card px-6"
      role="banner"
    >
      <nav aria-label="Breadcrumb">
        {breadcrumb ? (
          <ol className="flex items-center gap-1.5 text-sm" role="list">
            <li>
              <span className="text-muted-foreground">ComplianceKit</span>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            </li>
            <li>
              <span className="font-medium text-foreground">{breadcrumb.section}</span>
            </li>
          </ol>
        ) : (
          <span className="text-sm font-medium text-foreground">ComplianceKit</span>
        )}
      </nav>

      <div className="flex items-center gap-3">
        <LanguageSwitcher currentLocale={locale} variant="minimal" />
        <UserNav />
      </div>
    </header>
  );
}




