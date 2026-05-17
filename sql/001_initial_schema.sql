-- Xreviews Phase 1 schema reference
-- Postgres / Neon compatible. Drizzle schema source of truth:
-- packages/db/src/schema.ts

create extension if not exists pgcrypto;

create type user_role as enum ('user', 'business', 'admin');
create type subject_category as enum ('medical_clinic', 'real_estate', 'auto_repair');
create type subject_status as enum ('pending', 'active', 'merged', 'hidden');
create type review_status as enum ('draft', 'pending', 'published', 'disputed', 'hidden', 'removed');
create type evidence_type as enum ('receipt', 'invoice', 'estimate', 'contract', 'photo', 'video', 'message', 'other');
create type business_claim_status as enum ('pending', 'approved', 'rejected', 'revoked');
create type moderation_case_status as enum ('open', 'under_review', 'resolved', 'rejected');
create type legal_request_status as enum ('received', 'reviewing', 'action_taken', 'rejected', 'closed');
create type subscription_plan as enum ('free_claim', 'official_basic', 'official_pro', 'multi_location', 'data_api');
create type subscription_status as enum ('none', 'active', 'past_due', 'canceled', 'paused');
create type business_response_type as enum ('explanation', 'apology', 'correction', 'dispute', 'resolved');
create type review_vote_type as enum ('helpful', 'not_helpful');

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null default '',
  email_verified boolean not null default false,
  image text,
  role user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  provider_id text not null,
  account_id text not null,
  access_token text,
  refresh_token text,
  id_token text,
  access_token_expires_at timestamptz,
  refresh_token_expires_at timestamptz,
  scope text,
  password_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider_id, account_id)
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  ip_hash text,
  user_agent_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table verification_tokens (
  id uuid primary key default gen_random_uuid(),
  identifier text not null,
  value text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(identifier, value)
);

create table subject_categories (
  id subject_category primary key,
  label_ko text not null,
  label_en text not null,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category subject_category not null references subject_categories(id),
  subcategory text,
  description text,
  website_url text,
  phone text,
  status subject_status not null default 'pending',
  created_by_user_id uuid references users(id) on delete set null,
  merged_into_subject_id uuid references subjects(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table subject_locations (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id) on delete cascade,
  country text not null default 'KR',
  region text,
  city text,
  district text,
  address_line text,
  postal_code text,
  lat numeric(10, 7),
  lng numeric(10, 7),
  created_at timestamptz not null default now()
);

create table subject_aliases (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id) on delete cascade,
  alias text not null,
  normalized_alias text not null,
  source text not null default 'user',
  created_at timestamptz not null default now(),
  unique(subject_id, normalized_alias)
);

create table risk_tags (
  id uuid primary key default gen_random_uuid(),
  category subject_category not null references subject_categories(id),
  code text not null,
  label_ko text not null,
  label_en text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(category, code)
);

create table subject_category_risk_tags (
  category subject_category not null references subject_categories(id) on delete cascade,
  risk_tag_id uuid not null references risk_tags(id) on delete cascade,
  sort_order int not null default 0,
  is_active boolean not null default true,
  primary key (category, risk_tag_id)
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id) on delete cascade,
  user_id uuid not null references users(id) on delete restrict,
  title text not null,
  body text not null,
  issue_summary text,
  status review_status not null default 'pending',
  severity_score int not null default 0 check (severity_score >= 0 and severity_score <= 100),
  evidence_level int not null default 0 check (evidence_level >= 0 and evidence_level <= 5),
  positive_content_detected boolean not null default false,
  author_liability_confirmed boolean not null default false,
  is_medical_category boolean not null default false,
  ip_hash text,
  user_agent_hash text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table review_tag_links (
  review_id uuid not null references reviews(id) on delete cascade,
  risk_tag_id uuid not null references risk_tags(id) on delete restrict,
  primary key (review_id, risk_tag_id)
);

create table review_evidence (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references reviews(id) on delete set null,
  uploaded_by_user_id uuid not null references users(id) on delete restrict,
  evidence_type evidence_type not null,
  r2_object_key text not null unique,
  file_name text not null,
  file_type text not null,
  file_size_bytes int not null check (file_size_bytes > 0),
  file_sha256 text,
  is_private boolean not null default true,
  created_at timestamptz not null default now()
);

create table review_votes (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  vote_type review_vote_type not null,
  created_at timestamptz not null default now(),
  unique(review_id, user_id)
);

create table review_reports (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  reporter_user_id uuid references users(id) on delete set null,
  reason text not null,
  body text,
  status moderation_case_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table business_profiles (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null unique references subjects(id) on delete cascade,
  owner_user_id uuid not null references users(id) on delete restrict,
  official_display_name text,
  official_badge_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table business_claims (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  business_name text not null,
  registration_number text,
  contact_email text not null,
  contact_phone text,
  status business_claim_status not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table business_responses (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  business_profile_id uuid not null references business_profiles(id) on delete cascade,
  body text not null,
  response_type business_response_type not null default 'explanation',
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table business_improvement_posts (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references subjects(id) on delete cascade,
  business_profile_id uuid not null references business_profiles(id) on delete cascade,
  title text not null,
  body text not null,
  category text not null default 'other',
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table business_subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_profile_id uuid not null unique references business_profiles(id) on delete cascade,
  plan subscription_plan not null default 'free_claim',
  status subscription_status not null default 'none',
  started_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table moderation_cases (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references reviews(id) on delete cascade,
  subject_id uuid references subjects(id) on delete cascade,
  opened_by_user_id uuid references users(id) on delete set null,
  assigned_admin_user_id uuid references users(id) on delete set null,
  reason text not null,
  status moderation_case_status not null default 'open',
  decision text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table legal_requests (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references subjects(id) on delete set null,
  review_id uuid references reviews(id) on delete set null,
  requester_name text not null,
  requester_email text not null,
  requester_role text not null,
  request_type text not null,
  body text not null,
  status legal_request_status not null default 'received',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table takedown_requests (
  id uuid primary key default gen_random_uuid(),
  legal_request_id uuid references legal_requests(id) on delete set null,
  subject_id uuid references subjects(id) on delete set null,
  review_id uuid references reviews(id) on delete set null,
  requester_email text not null,
  reason text not null,
  status legal_request_status not null default 'received',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references users(id) on delete set null,
  actor_role user_role not null default 'user',
  action text not null,
  target_type text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table risk_scores (
  subject_id uuid primary key references subjects(id) on delete cascade,
  score int not null default 0 check (score >= 0 and score <= 100),
  published_review_count int not null default 0,
  evidence_weight_sum int not null default 0,
  repeated_tag_count int not null default 0,
  recent_review_count int not null default 0,
  resolved_count int not null default 0,
  calculated_at timestamptz not null default now()
);

create table subject_daily_stats (
  subject_id uuid not null references subjects(id) on delete cascade,
  stat_date date not null,
  published_review_count int not null default 0,
  search_count int not null default 0,
  share_count int not null default 0,
  evidence_count int not null default 0,
  top_risk_tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  primary key (subject_id, stat_date)
);

create table search_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  anonymous_id text,
  query text not null,
  category subject_category,
  result_count int not null default 0,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table share_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  anonymous_id text,
  subject_id uuid references subjects(id) on delete set null,
  review_id uuid references reviews(id) on delete set null,
  channel text,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index accounts_user_id_idx on accounts(user_id);
create index sessions_user_id_idx on sessions(user_id);
create index users_role_idx on users(role);
create index subjects_category_status_idx on subjects(category, status);
create index subject_locations_subject_id_idx on subject_locations(subject_id);
create index subject_aliases_subject_id_idx on subject_aliases(subject_id);
create index risk_tags_category_active_idx on risk_tags(category, is_active);
create index reviews_subject_status_created_at_idx on reviews(subject_id, status, created_at desc);
create index reviews_user_id_idx on reviews(user_id);
create index review_evidence_review_id_idx on review_evidence(review_id);
create index business_claims_status_idx on business_claims(status);
create index moderation_cases_status_idx on moderation_cases(status);
create index legal_requests_status_idx on legal_requests(status);
create index audit_logs_target_idx on audit_logs(target_type, target_id);
create index search_events_category_created_at_idx on search_events(category, created_at);
