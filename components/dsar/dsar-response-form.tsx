"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { completeDsar, addDsarNote } from "@/lib/actions/dsar";
import type { DataSubjectRequest } from "@prisma/client";
import { DSAR_REQUEST_TYPES, type DsarRequestType } from "@/lib/dsar/types";

interface DsarResponseFormProps {
  dsar: DataSubjectRequest;
}

export function DsarResponseForm({ dsar }: DsarResponseFormProps) {
  const router = useRouter();
  const [response, setResponse] = useState(dsar.responseContent || "");
  const [note, setNote] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);

  const requestType = DSAR_REQUEST_TYPES[dsar.requestType as DsarRequestType];

  async function handleComplete() {
    if (!response.trim()) {
      toast.error("Please provide a response");
      return;
    }

    setIsPending(true);

    try {
      const result = await completeDsar(dsar.id, response);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Request completed and response sent");
      router.refresh();
    } catch {
      toast.error("Failed to complete request");
    } finally {
      setIsPending(false);
    }
  }

  async function handleAddNote() {
    if (!note.trim()) {
      toast.error("Please enter a note");
      return;
    }

    setIsAddingNote(true);

    try {
      const result = await addDsarNote(dsar.id, note);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Note added");
      setNote("");
      router.refresh();
    } catch {
      toast.error("Failed to add note");
    } finally {
      setIsAddingNote(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Response Form */}
      <Card>
        <CardHeader>
          <CardTitle>Prepare Response</CardTitle>
          <CardDescription>
            Draft your response to this {requestType?.label.toLowerCase() || "data subject"} request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={getResponsePlaceholder(dsar.requestType as DsarRequestType)}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            className="min-h-[200px]"
          />
          <div className="flex justify-end">
            <Button onClick={handleComplete} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Complete & Send Response
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Note */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Internal Note</CardTitle>
          <CardDescription>
            Notes are only visible to your team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Add a note about this request..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={handleAddNote} 
              disabled={isAddingNote}
            >
              {isAddingNote ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Note"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getResponsePlaceholder(requestType: DsarRequestType): string {
  switch (requestType) {
    case "access":
      return "Dear [Name],\n\nIn response to your data access request, please find attached all personal data we hold about you...\n\nThe data includes:\n- Account information\n- Transaction history\n- Communication records\n\nIf you have any questions, please don't hesitate to contact us.";
    case "erasure":
      return "Dear [Name],\n\nWe have processed your request for data erasure. The following data has been deleted:\n\n- [List deleted data]\n\nPlease note that we may retain certain data as required by law for [X] years.";
    case "rectification":
      return "Dear [Name],\n\nWe have updated your personal data as requested:\n\n- [Old value] → [New value]\n\nThe changes have been applied to all our systems.";
    case "portability":
      return "Dear [Name],\n\nPlease find attached your personal data in a machine-readable format (JSON/CSV).\n\nThe export includes:\n- Profile data\n- Activity data\n- Preferences";
    case "restriction":
      return "Dear [Name],\n\nWe have restricted the processing of your personal data as requested. Your data will only be stored and not processed for any other purpose until further notice.";
    case "objection":
      return "Dear [Name],\n\nWe have received your objection to data processing. We have [stopped/continued] processing your data for [purpose] because [reason].";
    default:
      return "Dear [Name],\n\nThank you for your request. We have processed it as follows:\n\n[Details of action taken]";
  }
}

