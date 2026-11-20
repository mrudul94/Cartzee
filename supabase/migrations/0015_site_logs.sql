-- Site health (Admin → Site logs, Super Admin only).
-- site_logs: crashes and errors from the shop's server (Next onRequestError) and shoppers' browsers (/api/log).
-- site_presence: one row per open browser tab, refreshed about once a minute (/api/presence) → "visitors now".
-- Only the server (service role) reads or writes these tables; shoppers and customers have no access.
-- No raw IP addresses are stored: ip_hash is a salted SHA-256, used only to rate-limit error reports.

create table if not exists public.site_logs (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  level text not null check (level in ('error', 'warn', 'info')),
  source text not null check (source in ('server', 'browser')),
  path text not null default '' check (char_length(path) <= 500),
  message text not null check (char_length(message) <= 1000),
  detail text not null default '' check (char_length(detail) <= 8000),
  user_agent text not null default '' check (char_length(user_agent) <= 300),
  ip_hash text not null default '' check (char_length(ip_hash) <= 64)
);
create index if not exists site_logs_created_idx on public.site_logs (created_at desc);
create index if not exists site_logs_ip_idx on public.site_logs (ip_hash, created_at desc);

create table if not exists public.site_presence (
  session_id text primary key check (char_length(session_id) between 8 and 64),
  path text not null default '' check (char_length(path) <= 500),
  last_seen timestamptz not null default now()
);
create index if not exists site_presence_seen_idx on public.site_presence (last_seen desc);

alter table public.site_logs enable row level security;
alter table public.site_presence enable row level security;
revoke all on public.site_logs, public.site_presence from anon, authenticated;
