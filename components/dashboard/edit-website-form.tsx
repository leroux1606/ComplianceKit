"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
import { websiteSchema, type WebsiteInput } from "@/lib/validations";
import { updateWebsite } from "@/lib/actions/website";

interface EditWebsiteFormProps {
  website: {
    id: string;
    name: string;
    url: string;
    description: string | null;
    scanSchedule: string;
  };
}

export function EditWebsiteForm({ website }: EditWebsiteFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<WebsiteInput>({
    resolver: zodResolver(websiteSchema),
    defaultValues: {
      name: website.name,
      url: website.url,
      description: website.description || "",
      scanSchedule: (website.scanSchedule as "none" | "weekly" | "monthly") || "none",
    },
  });

  async function onSubmit(values: WebsiteInput) {
    setIsLoading(true);

    const result = await updateWebsite(website.id, values);

    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }

    toast.success("Website updated successfully");
    router.push(`/dashboard/websites/${website.id}`);
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="My Website"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A friendly name to identify your website
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The full URL of your website
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief description of your website..."
                  disabled={isLoading}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Help you remember what this website is for
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scanSchedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Automatic Scan Schedule</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a schedule" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Off — manual scans only</SelectItem>
                  <SelectItem value="weekly">Weekly — scan every 7 days</SelectItem>
                  <SelectItem value="monthly">Monthly — scan every 30 days</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Automatic scans run in the background and email you if your compliance score drops.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
