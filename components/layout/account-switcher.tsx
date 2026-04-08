"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeftRight, ChevronDown, User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { switchActiveAccount } from "@/lib/actions/team";

interface Membership {
  id: string;
  role: string;
  owner: { id: string; name: string | null; email: string; companyName: string | null };
}

interface AccountSwitcherProps {
  memberships: Membership[];
  activeOwnerId: string | null; // null = own account
  currentUserEmail: string;
}

export function AccountSwitcher({ memberships, activeOwnerId, currentUserEmail }: AccountSwitcherProps) {
  const [pending, setPending] = useState<string | null>(null);

  if (memberships.length === 0) return null;

  const activeAccount = activeOwnerId
    ? memberships.find((m) => m.owner.id === activeOwnerId)
    : null;

  const currentLabel = activeAccount
    ? activeAccount.owner.companyName || activeAccount.owner.name || activeAccount.owner.email
    : "My account";

  async function handleSwitch(ownerId: string | null) {
    setPending(ownerId ?? "own");
    try {
      await switchActiveAccount(ownerId);
    } catch {
      toast.error("Failed to switch account.");
      setPending(null);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between text-xs h-8 gap-1"
          disabled={!!pending}
        >
          <div className="flex items-center gap-1.5 truncate">
            <ArrowLeftRight className="h-3 w-3 shrink-0" />
            <span className="truncate">{currentLabel}</span>
          </div>
          <ChevronDown className="h-3 w-3 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Switch workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Own account */}
        <DropdownMenuItem
          onClick={() => handleSwitch(null)}
          className={!activeOwnerId ? "bg-muted/50" : ""}
        >
          <User className="mr-2 h-3.5 w-3.5" />
          <div className="truncate">
            <p className="text-sm">My account</p>
            <p className="text-xs text-muted-foreground truncate">{currentUserEmail}</p>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {memberships.map((m) => {
          const label = m.owner.companyName || m.owner.name || m.owner.email;
          const isActive = activeOwnerId === m.owner.id;
          return (
            <DropdownMenuItem
              key={m.id}
              onClick={() => handleSwitch(m.owner.id)}
              className={isActive ? "bg-muted/50" : ""}
            >
              <div className="truncate w-full">
                <p className="text-sm truncate">{label}</p>
                <p className="text-xs text-muted-foreground capitalize">{m.role} access</p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
