"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Save, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updatePolicy } from "@/lib/actions/policy";

interface PolicyEditorProps {
  policyId: string;
  content: string;
}

export function PolicyEditor({ policyId, content }: PolicyEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      const result = await updatePolicy(policyId, editedContent);
      if (!result.success) {
        toast.error(result.error || "Failed to save policy");
        return;
      }
      toast.success("Policy saved successfully");
      setIsEditing(false);
      router.refresh();
    } catch {
      toast.error("Failed to save policy");
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setEditedContent(content);
    setIsEditing(false);
  }

  if (!isEditing) {
    return (
      <div className="flex justify-end mb-3">
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit Policy
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Edit the policy content below. Use Markdown formatting.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
            ) : (
              <><Save className="h-4 w-4 mr-2" />Save Changes</>
            )}
          </Button>
        </div>
      </div>
      <Textarea
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        className="min-h-[500px] font-mono text-sm"
        placeholder="Enter policy content in Markdown format..."
      />
    </div>
  );
}
