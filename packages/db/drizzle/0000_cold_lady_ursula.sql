CREATE EXTENSION IF NOT EXISTS "pgcrypto";--> statement-breakpoint
CREATE TYPE "public"."business_claim_status" AS ENUM('pending', 'approved', 'rejected', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."business_response_type" AS ENUM('explanation', 'apology', 'correction', 'dispute', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."evidence_type" AS ENUM('receipt', 'invoice', 'estimate', 'contract', 'photo', 'video', 'message', 'other');--> statement-breakpoint
CREATE TYPE "public"."legal_request_status" AS ENUM('received', 'reviewing', 'action_taken', 'rejected', 'closed');--> statement-breakpoint
CREATE TYPE "public"."moderation_case_status" AS ENUM('open', 'under_review', 'resolved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('draft', 'pending', 'published', 'disputed', 'hidden', 'removed');--> statement-breakpoint
CREATE TYPE "public"."review_vote_type" AS ENUM('helpful', 'not_helpful');--> statement-breakpoint
CREATE TYPE "public"."subject_category" AS ENUM('medical_clinic', 'real_estate', 'auto_repair');--> statement-breakpoint
CREATE TYPE "public"."subject_status" AS ENUM('pending', 'active', 'merged', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('free_claim', 'official_basic', 'official_pro', 'multi_location', 'data_api');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('none', 'active', 'past_due', 'canceled', 'paused');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'business', 'admin');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider_id" text NOT NULL,
	"account_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"actor_role" "user_role" DEFAULT 'user' NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip_hash" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"business_name" text NOT NULL,
	"registration_number" text,
	"contact_email" text NOT NULL,
	"contact_phone" text,
	"status" "business_claim_status" DEFAULT 'pending' NOT NULL,
	"admin_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_improvement_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid NOT NULL,
	"business_profile_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"category" text DEFAULT 'other' NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"official_display_name" text,
	"official_badge_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"business_profile_id" uuid NOT NULL,
	"body" text NOT NULL,
	"response_type" "business_response_type" DEFAULT 'explanation' NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_profile_id" uuid NOT NULL,
	"plan" "subscription_plan" DEFAULT 'free_claim' NOT NULL,
	"status" "subscription_status" DEFAULT 'none' NOT NULL,
	"started_at" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legal_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid,
	"review_id" uuid,
	"requester_name" text NOT NULL,
	"requester_email" text NOT NULL,
	"requester_role" text NOT NULL,
	"request_type" text NOT NULL,
	"body" text NOT NULL,
	"status" "legal_request_status" DEFAULT 'received' NOT NULL,
	"admin_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderation_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid,
	"subject_id" uuid,
	"opened_by_user_id" uuid,
	"assigned_admin_user_id" uuid,
	"reason" text NOT NULL,
	"status" "moderation_case_status" DEFAULT 'open' NOT NULL,
	"decision" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid,
	"uploaded_by_user_id" uuid NOT NULL,
	"evidence_type" "evidence_type" NOT NULL,
	"r2_object_key" text NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size_bytes" integer NOT NULL,
	"file_sha256" text,
	"is_private" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "review_evidence_file_size_positive" CHECK ("review_evidence"."file_size_bytes" > 0)
);
--> statement-breakpoint
CREATE TABLE "review_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"reporter_user_id" uuid,
	"reason" text NOT NULL,
	"body" text,
	"status" "moderation_case_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_tag_links" (
	"review_id" uuid NOT NULL,
	"risk_tag_id" uuid NOT NULL,
	CONSTRAINT "review_tag_links_pk" PRIMARY KEY("review_id","risk_tag_id")
);
--> statement-breakpoint
CREATE TABLE "review_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"vote_type" "review_vote_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"issue_summary" text,
	"status" "review_status" DEFAULT 'pending' NOT NULL,
	"severity_score" integer DEFAULT 0 NOT NULL,
	"evidence_level" integer DEFAULT 0 NOT NULL,
	"positive_content_detected" boolean DEFAULT false NOT NULL,
	"author_liability_confirmed" boolean DEFAULT false NOT NULL,
	"is_medical_category" boolean DEFAULT false NOT NULL,
	"ip_hash" text,
	"user_agent_hash" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_severity_score_range" CHECK ("reviews"."severity_score" >= 0 and "reviews"."severity_score" <= 100),
	CONSTRAINT "reviews_evidence_level_range" CHECK ("reviews"."evidence_level" >= 0 and "reviews"."evidence_level" <= 5)
);
--> statement-breakpoint
CREATE TABLE "risk_scores" (
	"subject_id" uuid PRIMARY KEY NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"published_review_count" integer DEFAULT 0 NOT NULL,
	"evidence_weight_sum" integer DEFAULT 0 NOT NULL,
	"repeated_tag_count" integer DEFAULT 0 NOT NULL,
	"recent_review_count" integer DEFAULT 0 NOT NULL,
	"resolved_count" integer DEFAULT 0 NOT NULL,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "risk_scores_score_range" CHECK ("risk_scores"."score" >= 0 and "risk_scores"."score" <= 100)
);
--> statement-breakpoint
CREATE TABLE "risk_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" "subject_category" NOT NULL,
	"code" text NOT NULL,
	"label_ko" text NOT NULL,
	"label_en" text,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"anonymous_id" text,
	"query" text NOT NULL,
	"category" "subject_category",
	"result_count" integer DEFAULT 0 NOT NULL,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_hash" text,
	"user_agent_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "share_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"anonymous_id" text,
	"subject_id" uuid,
	"review_id" uuid,
	"channel" text,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subject_aliases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid NOT NULL,
	"alias" text NOT NULL,
	"normalized_alias" text NOT NULL,
	"source" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subject_categories" (
	"id" "subject_category" PRIMARY KEY NOT NULL,
	"label_ko" text NOT NULL,
	"label_en" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subject_category_risk_tags" (
	"category" "subject_category" NOT NULL,
	"risk_tag_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "subject_category_risk_tags_pk" PRIMARY KEY("category","risk_tag_id")
);
--> statement-breakpoint
CREATE TABLE "subject_daily_stats" (
	"subject_id" uuid NOT NULL,
	"stat_date" date NOT NULL,
	"published_review_count" integer DEFAULT 0 NOT NULL,
	"search_count" integer DEFAULT 0 NOT NULL,
	"share_count" integer DEFAULT 0 NOT NULL,
	"evidence_count" integer DEFAULT 0 NOT NULL,
	"top_risk_tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subject_daily_stats_pk" PRIMARY KEY("subject_id","stat_date")
);
--> statement-breakpoint
CREATE TABLE "subject_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid NOT NULL,
	"country" text DEFAULT 'KR' NOT NULL,
	"region" text,
	"city" text,
	"district" text,
	"address_line" text,
	"postal_code" text,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"category" "subject_category" NOT NULL,
	"subcategory" text,
	"description" text,
	"website_url" text,
	"phone" text,
	"status" "subject_status" DEFAULT 'pending' NOT NULL,
	"created_by_user_id" uuid,
	"merged_into_subject_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "takedown_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legal_request_id" uuid,
	"subject_id" uuid,
	"review_id" uuid,
	"requester_email" text NOT NULL,
	"reason" text NOT NULL,
	"status" "legal_request_status" DEFAULT 'received' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_claims" ADD CONSTRAINT "business_claims_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_claims" ADD CONSTRAINT "business_claims_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_improvement_posts" ADD CONSTRAINT "business_improvement_posts_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_improvement_posts" ADD CONSTRAINT "business_improvement_posts_business_profile_id_business_profiles_id_fk" FOREIGN KEY ("business_profile_id") REFERENCES "public"."business_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_responses" ADD CONSTRAINT "business_responses_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_responses" ADD CONSTRAINT "business_responses_business_profile_id_business_profiles_id_fk" FOREIGN KEY ("business_profile_id") REFERENCES "public"."business_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business_subscriptions" ADD CONSTRAINT "business_subscriptions_business_profile_id_business_profiles_id_fk" FOREIGN KEY ("business_profile_id") REFERENCES "public"."business_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_requests" ADD CONSTRAINT "legal_requests_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_requests" ADD CONSTRAINT "legal_requests_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_cases" ADD CONSTRAINT "moderation_cases_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_cases" ADD CONSTRAINT "moderation_cases_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_cases" ADD CONSTRAINT "moderation_cases_opened_by_user_id_users_id_fk" FOREIGN KEY ("opened_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_cases" ADD CONSTRAINT "moderation_cases_assigned_admin_user_id_users_id_fk" FOREIGN KEY ("assigned_admin_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_evidence" ADD CONSTRAINT "review_evidence_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_evidence" ADD CONSTRAINT "review_evidence_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_reporter_user_id_users_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_tag_links" ADD CONSTRAINT "review_tag_links_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_tag_links" ADD CONSTRAINT "review_tag_links_risk_tag_id_risk_tags_id_fk" FOREIGN KEY ("risk_tag_id") REFERENCES "public"."risk_tags"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_scores" ADD CONSTRAINT "risk_scores_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_tags" ADD CONSTRAINT "risk_tags_category_subject_categories_id_fk" FOREIGN KEY ("category") REFERENCES "public"."subject_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_events" ADD CONSTRAINT "search_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_events" ADD CONSTRAINT "share_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_events" ADD CONSTRAINT "share_events_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_events" ADD CONSTRAINT "share_events_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_aliases" ADD CONSTRAINT "subject_aliases_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_category_risk_tags" ADD CONSTRAINT "subject_category_risk_tags_category_subject_categories_id_fk" FOREIGN KEY ("category") REFERENCES "public"."subject_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_category_risk_tags" ADD CONSTRAINT "subject_category_risk_tags_risk_tag_id_risk_tags_id_fk" FOREIGN KEY ("risk_tag_id") REFERENCES "public"."risk_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_daily_stats" ADD CONSTRAINT "subject_daily_stats_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subject_locations" ADD CONSTRAINT "subject_locations_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_category_subject_categories_id_fk" FOREIGN KEY ("category") REFERENCES "public"."subject_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_merged_into_subject_id_subjects_id_fk" FOREIGN KEY ("merged_into_subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "takedown_requests" ADD CONSTRAINT "takedown_requests_legal_request_id_legal_requests_id_fk" FOREIGN KEY ("legal_request_id") REFERENCES "public"."legal_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "takedown_requests" ADD CONSTRAINT "takedown_requests_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "takedown_requests" ADD CONSTRAINT "takedown_requests_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_provider_account_unique" ON "accounts" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_user_id_idx" ON "audit_logs" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_target_idx" ON "audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs" USING btree ("action","created_at");--> statement-breakpoint
CREATE INDEX "business_claims_subject_id_idx" ON "business_claims" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "business_claims_user_id_idx" ON "business_claims" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "business_claims_status_idx" ON "business_claims" USING btree ("status");--> statement-breakpoint
CREATE INDEX "business_improvement_posts_subject_id_idx" ON "business_improvement_posts" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "business_improvement_posts_business_profile_id_idx" ON "business_improvement_posts" USING btree ("business_profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "business_profiles_subject_id_unique" ON "business_profiles" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "business_profiles_owner_user_id_idx" ON "business_profiles" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX "business_responses_review_id_idx" ON "business_responses" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "business_responses_business_profile_id_idx" ON "business_responses" USING btree ("business_profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "business_subscriptions_business_profile_id_unique" ON "business_subscriptions" USING btree ("business_profile_id");--> statement-breakpoint
CREATE INDEX "business_subscriptions_plan_status_idx" ON "business_subscriptions" USING btree ("plan","status");--> statement-breakpoint
CREATE INDEX "legal_requests_subject_id_idx" ON "legal_requests" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "legal_requests_review_id_idx" ON "legal_requests" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "legal_requests_status_idx" ON "legal_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "moderation_cases_review_id_idx" ON "moderation_cases" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "moderation_cases_subject_id_idx" ON "moderation_cases" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "moderation_cases_status_idx" ON "moderation_cases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "moderation_cases_assigned_admin_user_id_idx" ON "moderation_cases" USING btree ("assigned_admin_user_id");--> statement-breakpoint
CREATE INDEX "review_evidence_review_id_idx" ON "review_evidence" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "review_evidence_uploaded_by_user_id_idx" ON "review_evidence" USING btree ("uploaded_by_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "review_evidence_r2_object_key_unique" ON "review_evidence" USING btree ("r2_object_key");--> statement-breakpoint
CREATE INDEX "review_reports_review_id_idx" ON "review_reports" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "review_reports_reporter_user_id_idx" ON "review_reports" USING btree ("reporter_user_id");--> statement-breakpoint
CREATE INDEX "review_reports_status_idx" ON "review_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "review_tag_links_risk_tag_id_idx" ON "review_tag_links" USING btree ("risk_tag_id");--> statement-breakpoint
CREATE INDEX "review_votes_review_id_idx" ON "review_votes" USING btree ("review_id");--> statement-breakpoint
CREATE UNIQUE INDEX "review_votes_review_user_unique" ON "review_votes" USING btree ("review_id","user_id");--> statement-breakpoint
CREATE INDEX "reviews_subject_status_created_at_idx" ON "reviews" USING btree ("subject_id","status","created_at");--> statement-breakpoint
CREATE INDEX "reviews_user_id_idx" ON "reviews" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "risk_tags_category_code_unique" ON "risk_tags" USING btree ("category","code");--> statement-breakpoint
CREATE INDEX "risk_tags_category_active_idx" ON "risk_tags" USING btree ("category","is_active");--> statement-breakpoint
CREATE INDEX "search_events_user_id_idx" ON "search_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "search_events_category_created_at_idx" ON "search_events" USING btree ("category","created_at");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_unique" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "share_events_subject_id_idx" ON "share_events" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "share_events_review_id_idx" ON "share_events" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "share_events_created_at_idx" ON "share_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "subject_aliases_subject_id_idx" ON "subject_aliases" USING btree ("subject_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subject_aliases_subject_normalized_unique" ON "subject_aliases" USING btree ("subject_id","normalized_alias");--> statement-breakpoint
CREATE INDEX "subject_category_risk_tags_risk_tag_id_idx" ON "subject_category_risk_tags" USING btree ("risk_tag_id");--> statement-breakpoint
CREATE INDEX "subject_locations_subject_id_idx" ON "subject_locations" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "subject_locations_region_city_district_idx" ON "subject_locations" USING btree ("region","city","district");--> statement-breakpoint
CREATE UNIQUE INDEX "subjects_slug_unique" ON "subjects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "subjects_category_status_idx" ON "subjects" USING btree ("category","status");--> statement-breakpoint
CREATE INDEX "subjects_created_by_user_id_idx" ON "subjects" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "subjects_merged_into_subject_id_idx" ON "subjects" USING btree ("merged_into_subject_id");--> statement-breakpoint
CREATE INDEX "takedown_requests_legal_request_id_idx" ON "takedown_requests" USING btree ("legal_request_id");--> statement-breakpoint
CREATE INDEX "takedown_requests_subject_id_idx" ON "takedown_requests" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "takedown_requests_review_id_idx" ON "takedown_requests" USING btree ("review_id");--> statement-breakpoint
CREATE INDEX "takedown_requests_status_idx" ON "takedown_requests" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "verification_tokens_value_unique" ON "verification_tokens" USING btree ("value");--> statement-breakpoint
CREATE UNIQUE INDEX "verification_tokens_identifier_value_unique" ON "verification_tokens" USING btree ("identifier","value");
