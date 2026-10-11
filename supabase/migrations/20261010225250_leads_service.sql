-- Records which service a visitor picked in the contact dialog's "Serviciu"
-- chips (optional). The check mirrors SERVICE_TAG_IDS in
-- layers/core/shared/types/service-tag.ts; a service added there needs a new
-- migration that replaces this constraint. "Nu știu" in the dialog is stored
-- as null. `stage` stays: the dialog also sends the picked service's
-- qualifier stage, so the admin's stage column keeps working.
alter table public.leads add column if not exists service text;

alter table public.leads drop constraint if exists leads_service_check;
alter table public.leads
  add constraint leads_service_check check (
    service is null
    or service in ('website', 'web-app', 'wordpress', 'shopify', 'ai-automation', 'granturi')
  );
