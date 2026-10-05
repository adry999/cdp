-- Records which engagement stage a visitor picked in the contact form's
-- "Etapa" chips (optional). The check mirrors STAGE_IDS in
-- layers/core/shared/types/service-stage.ts; a stage added there needs a new
-- migration that replaces this constraint. "Nu știu" in the form is stored as null.
alter table public.leads add column if not exists stage text;

alter table public.leads drop constraint if exists leads_stage_check;
alter table public.leads
  add constraint leads_stage_check check (stage is null or stage in ('A', 'B', 'C', 'D', 'E'));
