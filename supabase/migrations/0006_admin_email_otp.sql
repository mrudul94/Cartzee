-- Admin two-step sign-in by email code (replaces authenticator-app MFA).
-- One row per Supabase login session: the 6-digit code is stored only as a SHA-256 hash,
-- expires after 10 minutes, allows 5 tries, and once verified marks that session (and only that session) as trusted.
-- Only server code with the service-role key can touch this table.

create table if not exists public.admin_login_codes (
  session_id  uuid primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  code_hash   text not null,
  sent_at     timestamptz not null default now(),
  expires_at  timestamptz not null,
  attempts    int not null default 0 check (attempts >= 0),
  verified_at timestamptz
);

create index if not exists admin_login_codes_user_idx on public.admin_login_codes (user_id);

alter table public.admin_login_codes enable row level security;
revoke all on public.admin_login_codes from anon, authenticated;
