-- Kindergarten app's screenshots are taken on demo data; the admin shows the
-- "demo screens only" warning before publishing (design: Codepedia Admin, view=projects).
update public.projects
   set screens_demo = true
 where slug_ro = 'kindergarten-app';
