"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Building2, Mail, MapPin, User } from "lucide-react";

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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { companyInfoSchema, type CompanyInfoInput } from "@/lib/validations";
import { updateCompanyInfo } from "@/lib/actions/policy";

interface CompanyInfoFormProps {
  websiteId: string;
  initialData?: {
    companyName: string | null;
    companyAddress: string | null;
    companyEmail: string | null;
    dpoName: string | null;
    dpoEmail: string | null;
  } | null;
}

export function CompanyInfoForm({ websiteId, initialData }: CompanyInfoFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<CompanyInfoInput>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      companyName: initialData?.companyName || "",
      companyAddress: initialData?.companyAddress || "",
      companyEmail: initialData?.companyEmail || "",
      dpoName: initialData?.dpoName || "",
      dpoEmail: initialData?.dpoEmail || "",
    },
  });

  async function onSubmit(values: CompanyInfoInput) {
    setIsPending(true);

    try {
      const result = await updateCompanyInfo(websiteId, values);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Company information saved successfully");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  const isComplete = 
    initialData?.companyName && 
    initialData?.companyAddress && 
    initialData?.companyEmail;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Information
        </CardTitle>
        <CardDescription>
          This information will be used to generate your privacy and cookie policies.
          {!isComplete && (
            <span className="block mt-1 text-amber-600 dark:text-amber-400">
              Please complete all required fields before generating policies.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Acme Inc."
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Email *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="privacy@company.com"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Contact email for privacy inquiries
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="companyAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Address *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        placeholder="123 Business Street, City, Country"
                        className="pl-9 min-h-[80px]"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Full registered business address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-6">
              <h4 className="text-sm font-medium mb-4">
                Data Protection Officer (Optional)
              </h4>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="dpoName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DPO Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="John Smith"
                            className="pl-9"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dpoEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DPO Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="dpo@company.com"
                            className="pl-9"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Required for GDPR compliance if you have a DPO
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Company Information
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

