"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { requestPasswordReset } from "@/lib/actions/password-reset";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const result = await requestPasswordReset(values.email);

    if (result.success) {
      setSuccess(true);
      form.reset();
    } else if (result.error) {
      setError(result.error);
    }

    setIsLoading(false);
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Check your email</h3>
          <p className="text-sm text-muted-foreground">
            If an account exists with that email address, we've sent you a password reset link.
          </p>
          <p className="text-sm text-muted-foreground">
            The link will expire in 1 hour.
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setSuccess(false)}
        >
          Send another email
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send reset link
        </Button>
      </form>
    </Form>
  );
}
