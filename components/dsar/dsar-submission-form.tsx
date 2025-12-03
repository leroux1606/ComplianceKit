"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dsarSubmissionSchema, type DsarSubmissionInput } from "@/lib/validations";
import { DSAR_REQUEST_TYPES, type DsarRequestType } from "@/lib/dsar/types";

interface DsarSubmissionFormProps {
  embedCode: string;
  companyName?: string;
  contactEmail?: string;
}

export function DsarSubmissionForm({
  embedCode,
  companyName,
  contactEmail,
}: DsarSubmissionFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<DsarSubmissionInput>({
    resolver: zodResolver(dsarSubmissionSchema),
    defaultValues: {
      requestType: "access",
      requesterEmail: "",
      requesterName: "",
      requesterPhone: "",
      description: "",
      additionalInfo: "",
    },
  });

  async function onSubmit(values: DsarSubmissionInput) {
    setIsPending(true);

    try {
      const response = await fetch(`/api/dsar/${embedCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to submit request");
        return;
      }

      setIsSubmitted(true);
      toast.success("Request submitted successfully");
    } catch {
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Request Submitted</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your data subject request has been submitted successfully. 
              {contactEmail && (
                <span> You will receive a confirmation at your email address.</span>
              )}
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Under GDPR, we are required to respond within 30 days.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Data Subject Request</CardTitle>
            <CardDescription>
              {companyName 
                ? `Submit a request to ${companyName}` 
                : "Exercise your data protection rights"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="requestType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the type of request" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(DSAR_REQUEST_TYPES).map(([key, { label, description }]) => (
                        <SelectItem key={key} value={key}>
                          <div>
                            <span className="font-medium">{label}</span>
                            <span className="text-muted-foreground text-xs block">
                              {description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="requesterEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      We&apos;ll use this to verify your identity
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requesterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="requesterPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+27 12 345 6789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Details *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe your request in detail. Include any specific data or information you're requesting."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Be as specific as possible to help us process your request efficiently
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information that might help us identify your data (e.g., account username, order numbers)"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Your Rights Under GDPR</p>
              <p>
                Under the General Data Protection Regulation (GDPR), you have the right to access, 
                rectify, erase, and port your personal data. We are required to respond to your 
                request within 30 days.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}



