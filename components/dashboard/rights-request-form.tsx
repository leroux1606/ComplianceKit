"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, SendHorizonal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitAccountRightsRequest } from "@/lib/actions/user";

const rightsSchema = z.object({
  requestType: z.enum(["objection", "restriction"], {
    message: "Please select a request type",
  }),
  description: z
    .string()
    .min(20, "Please provide at least 20 characters describing your request"),
});

type RightsInput = z.infer<typeof rightsSchema>;

export function RightsRequestForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RightsInput>({
    resolver: zodResolver(rightsSchema),
    defaultValues: { description: "" },
  });

  async function onSubmit(values: RightsInput) {
    setIsLoading(true);
    const result = await submitAccountRightsRequest(values.requestType, values.description);
    setIsLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      setSubmitted(true);
      toast.success("Your request has been submitted. We will respond within 30 days.");
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 p-4 text-sm text-green-800 dark:text-green-300">
        <p className="font-medium">Request submitted successfully.</p>
        <p className="mt-1 opacity-80">
          We will review your request and respond within 30 days as required by GDPR Art. 12.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="requestType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Request Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your right" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="objection">
                    Right to Object (Art. 21) — object to how we process your data
                  </SelectItem>
                  <SelectItem value="restriction">
                    Right to Restriction (Art. 18) — limit processing of your data
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please describe your request and the specific processing activity you are objecting to or want restricted…"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                We will acknowledge your request within 1 month (GDPR Art. 12).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {!isLoading && <SendHorizonal className="mr-2 h-4 w-4" />}
          Submit Request
        </Button>
      </form>
    </Form>
  );
}
