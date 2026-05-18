ALTER TABLE "business_claims" ADD COLUMN "applicant_name" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "business_claims" ADD COLUMN "verification_note" text;