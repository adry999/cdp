-- project_stack.name has no per-locale column, so the capability names are the
-- English technical terms (as framework names were before); the roles stay localized.
update public.project_stack s set name = v.name_en
  from (values
    ('Aplicație web', 'Web app'),
    ('Bază de date în cloud', 'Cloud database'),
    ('Integrare SMS', 'SMS gateway'),
    ('Plăți', 'Payments'),
    ('Raport contabil', 'Accounting export')
  ) as v(name_ro, name_en)
 where s.name = v.name_ro
   and s.project_id = (select id from public.projects where slug_ro = 'startica-app');
