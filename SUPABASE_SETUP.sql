-- SALATA production policies
-- Run once in Supabase -> SQL Editor.

-- Required database grants (important when the menu table was created manually).
grant usage on schema public to anon, authenticated;
grant select on public.menu_items to anon, authenticated;
grant insert, update, delete on public.menu_items to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Public customers can read menu items.
drop policy if exists "Public can read menu items" on public.menu_items;
create policy "Public can read menu items"
on public.menu_items
for select
to anon, authenticated
using (true);

-- Only signed-in admins can manage menu items.
drop policy if exists "Admins can insert menu items" on public.menu_items;
create policy "Admins can insert menu items"
on public.menu_items
for insert
to authenticated
with check (true);

drop policy if exists "Admins can update menu items" on public.menu_items;
create policy "Admins can update menu items"
on public.menu_items
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Admins can delete menu items" on public.menu_items;
create policy "Admins can delete menu items"
on public.menu_items
for delete
to authenticated
using (true);

-- Storage: public viewing, signed-in admin uploads/deletes.
drop policy if exists "Public can view menu images" on storage.objects;
create policy "Public can view menu images"
on storage.objects
for select
to public
using (bucket_id = 'menu-images');

drop policy if exists "Admins can upload menu images" on storage.objects;
create policy "Admins can upload menu images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'menu-images');

drop policy if exists "Admins can update menu images" on storage.objects;
create policy "Admins can update menu images"
on storage.objects
for update
to authenticated
using (bucket_id = 'menu-images')
with check (bucket_id = 'menu-images');

drop policy if exists "Admins can delete menu images" on storage.objects;
create policy "Admins can delete menu images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'menu-images');
