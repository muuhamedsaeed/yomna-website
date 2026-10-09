-- Required when the site is deployed as static files and talks to Supabase
-- directly from the browser. Replace the email below with the admin Auth email.

alter table public.projects
  add column if not exists thumb_image text not null default '';

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = lower('REPLACE_WITH_ADMIN_EMAIL');
$$;

grant execute on function public.is_portfolio_admin() to anon, authenticated;

grant insert, update, delete on public.site_config, public.skills, public.software,
  public.brands, public.career, public.projects, public.contact_project_types,
  public.contact_budget_options to authenticated;
grant select, insert, update, delete on public.inquiries to authenticated;
grant usage, select on all sequences in schema public to authenticated;

drop policy if exists "Portfolio admin manages site config" on public.site_config;
create policy "Portfolio admin manages site config" on public.site_config
  for all to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

drop policy if exists "Portfolio admin manages skills" on public.skills;
create policy "Portfolio admin manages skills" on public.skills
  for all to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

drop policy if exists "Portfolio admin manages software" on public.software;
create policy "Portfolio admin manages software" on public.software
  for all to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

drop policy if exists "Portfolio admin manages brands" on public.brands;
create policy "Portfolio admin manages brands" on public.brands
  for all to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

drop policy if exists "Portfolio admin manages career" on public.career;
create policy "Portfolio admin manages career" on public.career
  for all to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

drop policy if exists "Portfolio admin manages projects" on public.projects;
create policy "Portfolio admin manages projects" on public.projects
  for all to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

drop policy if exists "Portfolio admin manages project type options" on public.contact_project_types;
create policy "Portfolio admin manages project type options" on public.contact_project_types
  for all to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

drop policy if exists "Portfolio admin manages budget options" on public.contact_budget_options;
create policy "Portfolio admin manages budget options" on public.contact_budget_options
  for all to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

drop policy if exists "Portfolio admin manages inquiries" on public.inquiries;
create policy "Portfolio admin manages inquiries" on public.inquiries
  for all to authenticated
  using (public.is_portfolio_admin())
  with check (public.is_portfolio_admin());

insert into storage.buckets (id, name, public)
values ('portfolio-assets', 'portfolio-assets', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Portfolio admin reads assets" on storage.objects;
create policy "Portfolio admin reads assets" on storage.objects
  for select to authenticated
  using (bucket_id = 'portfolio-assets' and public.is_portfolio_admin());

drop policy if exists "Portfolio admin uploads assets" on storage.objects;
create policy "Portfolio admin uploads assets" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'portfolio-assets' and public.is_portfolio_admin());

drop policy if exists "Portfolio admin updates assets" on storage.objects;
create policy "Portfolio admin updates assets" on storage.objects
  for update to authenticated
  using (bucket_id = 'portfolio-assets' and public.is_portfolio_admin())
  with check (bucket_id = 'portfolio-assets' and public.is_portfolio_admin());

drop policy if exists "Portfolio admin deletes assets" on storage.objects;
create policy "Portfolio admin deletes assets" on storage.objects
  for delete to authenticated
  using (bucket_id = 'portfolio-assets' and public.is_portfolio_admin());
