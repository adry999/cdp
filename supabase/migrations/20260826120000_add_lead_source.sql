-- The contact form has always collected „De unde ai auzit de noi?" and the API
-- has always thrown it away — there was no column to put it in.
alter table public.leads add column if not exists source text;

comment on column public.leads.source is
  'Free-text answer to "how did you hear about us", captured from the contact form.';

-- utm has existed since the initial schema and was never populated; the lead
-- endpoint now writes it. Index the common attribution lookup.
create index if not exists leads_created_at_source_idx
  on public.leads (created_at desc, source);
