-- projects.preview_token was never used by any code and stayed readable by anon through
-- REST on published rows. Dropped rather than left as a latent secret.

alter table public.projects drop column if exists preview_token;
