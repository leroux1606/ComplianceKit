import { z } from "zod";

// ============================================
// Auth Validations
// ============================================

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

// ============================================
// Website Validations
// ============================================

export const websiteSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  url: z
    .string()
    .min(1, "URL is required")
    .refine(
      (url) => {
        try {
          let normalized = url.trim().toLowerCase();
          if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
            normalized = "https://" + normalized;
          }
          new URL(normalized);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid URL" }
    ),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

export const websiteUpdateSchema = websiteSchema.partial();

export type WebsiteInput = z.infer<typeof websiteSchema>;

// ============================================
// Company Info Validations
// ============================================

export const companyInfoSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  companyAddress: z.string().min(5, "Company address is required"),
  companyEmail: z.string().email("Please enter a valid email address"),
  dpoName: z.string().optional(),
  dpoEmail: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
});

export type CompanyInfoInput = z.infer<typeof companyInfoSchema>;

// ============================================
// Banner Config Validations
// ============================================

export const bannerConfigSchema = z.object({
  theme: z.enum(["light", "dark", "custom"]),
  position: z.enum(["bottom", "top", "center"]),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  buttonStyle: z.enum(["rounded", "square", "pill"]),
  animation: z.enum(["slide", "fade", "none"]),
  customCss: z.string().max(5000, "Custom CSS must be less than 5000 characters").optional(),
});

export type BannerConfigInput = z.infer<typeof bannerConfigSchema>;

// ============================================
// DSAR Validations
// ============================================

export const dsarSubmissionSchema = z.object({
  requestType: z.enum(["access", "erasure", "rectification", "portability", "restriction", "objection"]),
  requesterEmail: z.string().email("Please enter a valid email address"),
  requesterName: z.string().min(2, "Name must be at least 2 characters").optional(),
  requesterPhone: z.string().optional(),
  description: z.string().min(10, "Please provide more details about your request"),
  additionalInfo: z.string().optional(),
});

export type DsarSubmissionInput = z.infer<typeof dsarSubmissionSchema>;

export const dsarUpdateSchema = z.object({
  status: z.enum(["pending", "verified", "in_progress", "completed", "rejected"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  assignedTo: z.string().optional(),
  internalNotes: z.string().optional(),
  responseContent: z.string().optional(),
});

export type DsarUpdateInput = z.infer<typeof dsarUpdateSchema>;


