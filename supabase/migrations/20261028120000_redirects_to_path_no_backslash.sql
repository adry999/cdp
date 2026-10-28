-- Browsers read "/\host" as "//host", so a to_path starting with a backslash
-- is an off-site redirect. Tighten the local-path check from 20261006114133.
-- Standard string (standard_conforming_strings is on): the regex engine sees
-- [^/\\]. In a Postgres ARE bracket expression a backslash is an escape, so
-- "\\" is one literal backslash (a single "\]" would escape the bracket).
alter table public.redirects drop constraint redirects_to_path_local;
alter table public.redirects
  add constraint redirects_to_path_local check (to_path ~ '^/([^/\\]|$)');
