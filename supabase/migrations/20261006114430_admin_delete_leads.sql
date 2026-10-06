-- Erasure on request, as the privacy policy promises: admins may delete a lead.
create policy admin_delete_leads on public.leads for delete using (public.is_admin());
