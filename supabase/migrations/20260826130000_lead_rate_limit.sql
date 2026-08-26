-- The lead endpoint's rate limiter used Nitro's default in-memory storage,
-- which is per-instance. On Vercel every serverless invocation can land on a
-- fresh instance, so the "3 submissions per 10 minutes per IP" limit was
-- effectively unenforced in production — the honeypot was doing all the real
-- work. Using Postgres (already provisioned) as the shared counter avoids
-- standing up a new service (Redis/KV) just for this.

create table lead_rate_limits (
  ip          text not null,
  window_start timestamptz not null,
  hits        int not null default 1,
  primary key (ip, window_start)
);

-- Old windows are cheap to accumulate but pointless to keep; a caller-side
-- delete on each check keeps the table from growing unbounded without a cron.
create index on lead_rate_limits (window_start);

alter table lead_rate_limits enable row level security;
-- No public policies: this table is written only via the service-role client
-- in server/api/leads.post.ts, never from the browser.

create or replace function public.check_lead_rate_limit(p_ip text, p_max int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  -- Fixed window aligned to the Unix epoch, sized by p_window_seconds.
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits int;
begin
  delete from lead_rate_limits where window_start < now() - (p_window_seconds || ' seconds')::interval;

  insert into lead_rate_limits (ip, window_start, hits)
  values (p_ip, v_window, 1)
  on conflict (ip, window_start) do update set hits = lead_rate_limits.hits + 1
  returning hits into v_hits;

  return v_hits <= p_max;
end $$;

revoke all on function public.check_lead_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.check_lead_rate_limit(text, int, int) to service_role;

comment on function public.check_lead_rate_limit(text, int, int) is
  'Atomically increments and checks a per-IP rate limit window. Returns true if the request is still within budget. Called with the service-role client only.';
