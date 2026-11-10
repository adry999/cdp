-- Business-card page (/c, layers/card): one row per visit or button click, so the admin sees how many
-- people scanned a card and what they did. Anonymous by design: no IP, user agent or cookie is stored,
-- only which card, what happened, where the QR was printed (optional ?s=) and when.

create table card_events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  card_slug   text not null check (card_slug ~ '^[a-z0-9-]{1,40}$'),
  kind        text not null check (kind in ('view', 'save', 'whatsapp', 'telegram', 'budget')),
  source      text check (source is null or source ~ '^[a-z0-9-]{1,30}$')
);

create index on card_events (created_at desc);

alter table card_events enable row level security;
-- Written only by POST /api/card/events with the service-role client; admins read.
create policy admin_read_card_events on card_events for select using (is_admin());

-- Counts per card and kind since p_since (null = all time). Security invoker: RLS applies, so only an
-- admin sees anything. Aggregated in Postgres, so the admin page never hits the 1000-row API limit.
create or replace function public.card_event_counts(p_since timestamptz default null)
returns table (card_slug text, kind text, total bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select e.card_slug, e.kind, count(*)::bigint
  from card_events e
  where p_since is null or e.created_at >= p_since
  group by e.card_slug, e.kind
$$;

revoke all on function public.card_event_counts(timestamptz) from public, anon;
grant execute on function public.card_event_counts(timestamptz) to authenticated;
