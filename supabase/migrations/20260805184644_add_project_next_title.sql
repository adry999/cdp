-- Adds the "next steps" CTA heading shown at the bottom of a case study
-- (CaseStudyNext.vue). Applied to the remote project on 2026-08-05 but never
-- captured as a local migration file until this reconstruction — the base
-- schema alone was not enough to reproduce the database from scratch.

alter table projects add column if not exists next_title_ro text;
alter table projects add column if not exists next_title_en text;
