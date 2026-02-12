"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deletePolicy } from "@/lib/actions/policy";

interface DeletePolicyButtonProps {
  policyId: string;
  websiteId: string;
}

export function DeletePolicyButton({
  policyId,
  websiteId,
}: DeletePolicyButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this policy? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);

    try {
      await deletePolicy(policyId);
      router.push(`/dashboard/websites/${websiteId}/policies`);
    } catch (error) {
      console.error("Failed to delete policy:", error);
      alert(`Failed to delete policy: ${(error as Error).message}`);
      setIsDeleting(false);
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Deleting...
        </>
      ) : (
        <>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </>
      )}
    </Button>
  );
}
