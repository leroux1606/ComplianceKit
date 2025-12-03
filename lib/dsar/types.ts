/**
 * DSAR (Data Subject Access Request) Types
 * Based on GDPR Articles 15-22
 */

export type DsarRequestType =
  | "access"       // Article 15 - Right of access
  | "erasure"      // Article 17 - Right to erasure ("right to be forgotten")
  | "rectification" // Article 16 - Right to rectification
  | "portability"  // Article 20 - Right to data portability
  | "restriction"  // Article 18 - Right to restriction of processing
  | "objection";   // Article 21 - Right to object

export type DsarStatus =
  | "pending"      // Awaiting verification or initial review
  | "verified"     // Email verified, awaiting processing
  | "in_progress"  // Being processed
  | "completed"    // Request fulfilled
  | "rejected";    // Request denied (with reason)

export type DsarPriority = "low" | "normal" | "high" | "urgent";

export type DsarActivityAction =
  | "created"
  | "verified"
  | "status_changed"
  | "assigned"
  | "note_added"
  | "response_drafted"
  | "response_sent"
  | "extended"
  | "completed"
  | "rejected";

export const DSAR_REQUEST_TYPES: Record<DsarRequestType, { label: string; description: string }> = {
  access: {
    label: "Right of Access",
    description: "Request a copy of all personal data held about you",
  },
  erasure: {
    label: "Right to Erasure",
    description: "Request deletion of your personal data",
  },
  rectification: {
    label: "Right to Rectification",
    description: "Request correction of inaccurate personal data",
  },
  portability: {
    label: "Data Portability",
    description: "Request your data in a portable format",
  },
  restriction: {
    label: "Restriction of Processing",
    description: "Request limitation on how your data is processed",
  },
  objection: {
    label: "Right to Object",
    description: "Object to certain types of data processing",
  },
};

export const DSAR_STATUSES: Record<DsarStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "yellow" },
  verified: { label: "Verified", color: "blue" },
  in_progress: { label: "In Progress", color: "purple" },
  completed: { label: "Completed", color: "green" },
  rejected: { label: "Rejected", color: "red" },
};

export const DSAR_PRIORITIES: Record<DsarPriority, { label: string; color: string }> = {
  low: { label: "Low", color: "slate" },
  normal: { label: "Normal", color: "blue" },
  high: { label: "High", color: "orange" },
  urgent: { label: "Urgent", color: "red" },
};

/**
 * Calculate due date (GDPR requires response within 30 days)
 * Can be extended by 2 months for complex requests
 */
export function calculateDueDate(createdAt: Date = new Date()): Date {
  const dueDate = new Date(createdAt);
  dueDate.setDate(dueDate.getDate() + 30);
  return dueDate;
}

/**
 * Check if a DSAR is overdue
 */
export function isDsarOverdue(dueDate: Date, status: DsarStatus): boolean {
  if (status === "completed" || status === "rejected") return false;
  return new Date() > new Date(dueDate);
}

/**
 * Get days remaining until due date
 */
export function getDaysRemaining(dueDate: Date): number {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}



