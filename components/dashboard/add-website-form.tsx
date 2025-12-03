"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

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
import { websiteSchema, type WebsiteInput } from "@/lib/validations";
import { createWebsite } from "@/lib/actions/website";

export function AddWebsiteForm() {
  const t = useTranslations("websites");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<WebsiteInput>({
    resolver: zodResolver(websiteSchema),
    defaultValues: {
      name: "",
      url: "",
      description: "",
    },
  });

  async function onSubmit(values: WebsiteInput) {
    setIsLoading(true);

    const result = await createWebsite(values);

    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }

    toast.success(t("websiteAdded"));
    router.push(`/dashboard/websites/${result.websiteId}`);
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
              <FormLabel>{t("websiteName")}</FormLabel>
              <FormControl>
                <Input
                  placeholder="My Website"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t("websiteNameDescription")}
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
              <FormLabel>{t("websiteUrl")}</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t("websiteUrlDescription")}
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
              <FormLabel>{t("descriptionOptional")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief description of your website..."
                  disabled={isLoading}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t("descriptionDescription")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("addWebsite")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            {tCommon("cancel")}
          </Button>
        </div>
      </form>
    </Form>
  );
}



