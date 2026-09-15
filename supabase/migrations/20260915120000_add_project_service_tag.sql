-- Links a project to the service it showcases, for the "related case studies"
-- section on each /servicii/[slug] page (layers/services). No CHECK
-- constraint: a 6th service later needs no migration, only a new entry in
-- SERVICE_TAG_IDS (layers/core/shared/types/service-tag.ts) — validity is
-- enforced in application code via isServiceTagId.
alter table public.projects add column if not exists service_tag text;
