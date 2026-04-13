-- AlterTable: add verificationTokenExpiresAt to data_subject_requests
ALTER TABLE "data_subject_requests" ADD COLUMN "verificationTokenExpiresAt" TIMESTAMP(3);
