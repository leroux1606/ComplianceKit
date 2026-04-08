"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, Trash2, ChevronDown, Crown, Shield, Eye, ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { inviteTeamMember, revokeTeamMember, updateMemberRole } from "@/lib/actions/team";
import type { TeamMemberWithUser } from "@/lib/actions/team";

interface TeamPageClientProps {
  members: TeamMemberWithUser[];
  maxMembers: number;
  planName: string;
}

const roleConfig = {
  admin: { label: "Admin", icon: Shield, badge: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
  viewer: { label: "Viewer", icon: Eye, badge: "bg-muted text-muted-foreground" },
};

const statusConfig = {
  pending: { label: "Pending", badge: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  active: { label: "Active", badge: "bg-green-500/10 text-green-700 border-green-500/20" },
};

export function TeamPageClient({ members: initialMembers, maxMembers, planName }: TeamPageClientProps) {
  const [members, setMembers] = useState(initialMembers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "viewer">("viewer");
  const [isInviting, setIsInviting] = useState(false);

  const activeCount = members.filter((m) => m.status !== "revoked").length;
  const canInvite = maxMembers === -1 || activeCount < maxMembers - 1; // -1 reserves seat for owner

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setIsInviting(true);
    try {
      const result = await inviteTeamMember(email.trim(), role);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      // Optimistic UI: add pending member
      setMembers((prev) => [
        {
          id: crypto.randomUUID(),
          email: email.trim().toLowerCase(),
          role,
          status: "pending",
          invitedAt: new Date(),
          acceptedAt: null,
          user: null,
        },
        ...prev,
      ]);
    } catch {
      toast.error("Failed to send invitation.");
    } finally {
      setIsInviting(false);
    }
  }

  async function handleRevoke(memberId: string, memberEmail: string) {
    if (!confirm(`Remove ${memberEmail} from your team?`)) return;
    const result = await revokeTeamMember(memberId);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    toast.success("Team member removed.");
  }

  async function handleRoleChange(memberId: string, newRole: "admin" | "viewer") {
    const result = await updateMemberRole(memberId, newRole);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    toast.success("Role updated.");
  }

  const seatLabel =
    maxMembers === -1
      ? "Unlimited seats"
      : `${activeCount} / ${maxMembers - 1} seat${maxMembers - 1 !== 1 ? "s" : ""} used`;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Invite form */}
      <Card>
        <CardHeader>
          <CardTitle>Invite a team member</CardTitle>
          <CardDescription>
            {seatLabel} · {planName} plan
            {maxMembers === 1 && (
              <>
                {" "}·{" "}
                <Link href="/dashboard/billing" className="text-primary underline">
                  Upgrade for team access
                </Link>
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!canInvite || isInviting}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "admin" | "viewer")} disabled={!canInvite}>
                <SelectTrigger id="invite-role" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={!canInvite || isInviting || !email.trim()}>
              <UserPlus className="mr-2 h-4 w-4" />
              {isInviting ? "Sending…" : "Invite"}
            </Button>
          </form>
          {!canInvite && maxMembers !== 1 && (
            <p className="mt-2 text-sm text-amber-600">
              Seat limit reached.{" "}
              <Link href="/dashboard/billing" className="underline">Upgrade</Link> to add more team members.
            </p>
          )}
          <div className="mt-4 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground space-y-0.5">
            <p><strong>Admin</strong> — can manage websites, scans, policies, and DSARs</p>
            <p><strong>Viewer</strong> — read-only access to websites, scans, and policies</p>
          </div>
        </CardContent>
      </Card>

      {/* Members list */}
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>People with access to this account</CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No team members yet. Invite someone above.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Owner row */}
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Crown className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">You (account owner)</p>
                </div>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20">
                  Owner
                </Badge>
              </div>

              {members.map((member) => {
                const roleCfg = roleConfig[member.role as keyof typeof roleConfig] ?? roleConfig.viewer;
                const statusCfg = statusConfig[member.status as keyof typeof statusConfig];

                return (
                  <div key={member.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <Avatar className="h-8 w-8">
                      {member.user?.image && <AvatarImage src={member.user.image} />}
                      <AvatarFallback>
                        {member.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {member.user?.name ?? member.email}
                      </p>
                      {member.user?.name && (
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {statusCfg && member.status !== "active" && (
                        <Badge variant="outline" className={statusCfg.badge}>
                          {statusCfg.label}
                        </Badge>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1 h-7">
                            <roleCfg.icon className="h-3 w-3" />
                            {roleCfg.label}
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleRoleChange(member.id, "admin")}>
                            <Shield className="mr-2 h-3.5 w-3.5" />
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRoleChange(member.id, "viewer")}>
                            <Eye className="mr-2 h-3.5 w-3.5" />
                            Make Viewer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleRevoke(member.id, member.email)}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
