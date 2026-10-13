-- Decision D13: the dashboard has a single role, 'admin'. 'editor' was never used
-- (no rows), so the check constraint narrows to 'admin'. Idempotent: the constraint is
-- looked up by definition, dropped if present, and recreated under a fixed name.

do $$
declare
  c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.app_users'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute format('alter table public.app_users drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.app_users
  add constraint app_users_role_check check (role = 'admin');
