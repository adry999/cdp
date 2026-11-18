-- Retention for leads (contact form + qualification questionnaire), as the privacy policy states
-- (layers/consent/domain/privacyPolicy.ts): kept 12 months after the last exchange, unless we start
-- working together, then deleted.
--
-- "Last exchange" is what the admin records: a new lead, then each change of its status or notes.
-- "Working together" is the status 'castigat'; those leads are never purged.
--
-- No cron: like lead_rate_limits, the cleanup runs on writes. Every new lead deletes the stale ones,
-- so the table never keeps a lead much longer than 12 months past its last activity.

alter table public.leads add column if not exists last_activity_at timestamptz;
update public.leads set last_activity_at = created_at where last_activity_at is null;
alter table public.leads alter column last_activity_at set default now();
alter table public.leads alter column last_activity_at set not null;

create index if not exists leads_last_activity_at_idx on public.leads (last_activity_at);

create or replace function public.leads_touch_last_activity()
returns trigger
language plpgsql as $$
begin
  if new.status is distinct from old.status or new.notes is distinct from old.notes then
    new.last_activity_at := now();
  end if;
  return new;
end $$;

drop trigger if exists leads_touch_last_activity on public.leads;
create trigger leads_touch_last_activity
  before update on public.leads
  for each row execute function public.leads_touch_last_activity();

-- Security definer: the delete must not depend on who inserted the lead (the service-role client
-- today); search_path pinned as for every definer function in this schema.
create or replace function public.purge_stale_leads()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from leads
  where last_activity_at < now() - interval '12 months'
    and status <> 'castigat';
  return null;
end $$;

revoke all on function public.purge_stale_leads() from public, anon, authenticated;

drop trigger if exists leads_purge_stale on public.leads;
create trigger leads_purge_stale
  after insert on public.leads
  for each statement execute function public.purge_stale_leads();

comment on column public.leads.last_activity_at is
  'Last exchange with the lead: its creation, then each change of status or notes. Drives the 12-month retention.';
comment on function public.purge_stale_leads() is
  'Deletes leads whose last activity is older than 12 months, except won ones (status castigat). Runs after every insert into leads.';
