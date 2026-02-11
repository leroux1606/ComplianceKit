"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

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
import { verifyResetToken, resetPassword } from "@/lib/actions/password-reset";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Verify token on mount
  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setTokenError("No reset token provided. Please request a new password reset link.");
        setIsVerifying(false);
        return;
      }

      const result = await verifyResetToken(token);
      
      if (!result.valid) {
        setTokenError(result.error || "Invalid reset link.");
      }
      
      setIsVerifying(false);
    }

    checkToken();
  }, [token]);

  async function onSubmit(values: ResetPasswordInput) {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    const result = await resetPassword(token, values.password);

    if (result.success) {
      setSuccess(true);
      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    } else if (result.error) {
      setError(result.error);
    }

    setIsLoading(false);
  }

  // Loading state while verifying token
  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verifying reset link...</p>
      </div>
    );
  }

  // Token error state
  if (tokenError) {
    return (
      <div className="space-y-4 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Invalid Reset Link</h3>
          <p className="text-sm text-muted-foreground">
            {tokenError}
          </p>
        </div>
        <Link href="/forgot-password">
          <Button variant="outline" className="w-full">
            Request a new reset link
          </Button>
        </Link>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Password reset successful!</h3>
          <p className="text-sm text-muted-foreground">
            Your password has been updated. You can now sign in with your new password.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to sign in...
          </p>
        </div>
      </div>
    );
  }

  // Reset form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
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
          Reset Password
        </Button>

        <div className="text-center">
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Back to sign in
          </Link>
        </div>
      </form>
    </Form>
  );
}
