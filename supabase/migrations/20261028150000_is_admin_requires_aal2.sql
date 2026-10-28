-- is_admin() now also requires a session that passed the TOTP challenge (aal2).
--
-- DO NOT APPLY before BOTH are true:
--   1. the MFA code (/admin/mfa, aal2 check in requireAdmin) is in production, and
--   2. the admin has enrolled a TOTP factor.
-- Applied earlier, the admin (aal1 session) loses write access to every RLS-protected table.
--
-- Same signature, language, volatility, security definer and search_path as the original in
-- 20260805173853_initial_schema.sql; no later migration changes its grants or ownership.

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from app_users where id = auth.uid())
     and coalesce(auth.jwt() ->> 'aal', '') = 'aal2';
$$;
