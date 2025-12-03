"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  MoreHorizontal, 
  Play, 
  CheckCircle2, 
  XCircle,
  Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { updateDsar, rejectDsar } from "@/lib/actions/dsar";
import type { DataSubjectRequest } from "@prisma/client";

interface DsarStatusActionsProps {
  dsar: DataSubjectRequest;
}

export function DsarStatusActions({ dsar }: DsarStatusActionsProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  async function handleStatusChange(newStatus: string) {
    setIsPending(true);

    try {
      const result = await updateDsar(dsar.id, { status: newStatus as "pending" | "verified" | "in_progress" | "completed" | "rejected" });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
      router.refresh();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsPending(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setIsPending(true);

    try {
      const result = await rejectDsar(dsar.id, rejectReason);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Request rejected");
      setShowRejectDialog(false);
      router.refresh();
    } catch {
      toast.error("Failed to reject request");
    } finally {
      setIsPending(false);
    }
  }

  if (dsar.status === "completed" || dsar.status === "rejected") {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Actions
                <MoreHorizontal className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {dsar.status === "pending" && (
            <DropdownMenuItem onClick={() => handleStatusChange("verified")}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark as Verified
            </DropdownMenuItem>
          )}
          {(dsar.status === "pending" || dsar.status === "verified") && (
            <DropdownMenuItem onClick={() => handleStatusChange("in_progress")}>
              <Play className="mr-2 h-4 w-4" />
              Start Processing
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowRejectDialog(true)}
            className="text-destructive"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject Request
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this data subject request. 
              This will be sent to the requester.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Request"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}



