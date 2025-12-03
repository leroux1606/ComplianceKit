"use client";

import { Bell } from "lucide-react";
import { useLocale } from "next-intl";

import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/user-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/i18n/config";

export function Header() {
  const locale = useLocale() as Locale;

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div>
        {/* Breadcrumb or page title can go here */}
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher currentLocale={locale} variant="minimal" />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            2
          </span>
        </Button>
        <UserNav />
      </div>
    </header>
  );
}




