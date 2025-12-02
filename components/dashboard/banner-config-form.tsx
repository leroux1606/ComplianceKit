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
import { bannerConfigSchema, type BannerConfigInput } from "@/lib/validations";
import { saveBannerConfig } from "@/lib/actions/banner";
import { BannerPreview } from "@/components/dashboard/banner-preview";

interface BannerConfigFormProps {
  websiteId: string;
  initialConfig?: BannerConfigInput;
}

export function BannerConfigForm({
  websiteId,
  initialConfig,
}: BannerConfigFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues: BannerConfigInput = initialConfig || {
    theme: "light",
    position: "bottom",
    primaryColor: "#0f172a",
    textColor: "#ffffff",
    buttonStyle: "rounded",
    animation: "slide",
    customCss: "",
  };

  const form = useForm<BannerConfigInput>({
    resolver: zodResolver(bannerConfigSchema),
    defaultValues,
  });

  const watchedValues = form.watch();

  async function onSubmit(values: BannerConfigInput) {
    setIsLoading(true);

    const result = await saveBannerConfig(websiteId, values);

    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }

    toast.success("Banner configuration saved");
    setIsLoading(false);
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Configuration Form */}
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose a preset theme or customize colors
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="center">Center (Modal)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Where the banner appears on the page
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          className="w-12 h-10 p-1 cursor-pointer"
                          disabled={isLoading}
                          {...field}
                        />
                        <Input
                          type="text"
                          placeholder="#0f172a"
                          disabled={isLoading}
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
                name="textColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          className="w-12 h-10 p-1 cursor-pointer"
                          disabled={isLoading}
                          {...field}
                        />
                        <Input
                          type="text"
                          placeholder="#ffffff"
                          disabled={isLoading}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="buttonStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Button Style</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="pill">Pill</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="animation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Animation</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select animation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="slide">Slide</SelectItem>
                      <SelectItem value="fade">Fade</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How the banner appears on the page
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customCss"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom CSS (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder=".ck-banner { /* your styles */ }"
                      rows={4}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Add custom CSS to further customize the banner
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Configuration
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Live Preview */}
      <div className="lg:sticky lg:top-6">
        <div className="rounded-lg border bg-muted/30 p-4">
          <h3 className="mb-4 font-semibold">Live Preview</h3>
          <BannerPreview config={watchedValues} />
        </div>
      </div>
    </div>
  );
}

