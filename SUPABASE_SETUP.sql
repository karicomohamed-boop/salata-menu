-- SALATA production policies
-- Run this once in Supabase -> SQL Editor.

-- Public customers can read menu items.
create policy "Public can read menu items"
on public.menu_items
for select
to anon, authenticated
using (true);

-- Only signed-in admins can manage menu items.
create policy "Admins can insert menu items"
on public.menu_items
for insert
to authenticated
with check (true);

create policy "Admins can update menu items"
on public.menu_items
for update
to authenticated
using (true)
with check (true);

create policy "Admins can delete menu items"
on public.menu_items
for delete
to authenticated
using (true);

-- Storage: public viewing, signed-in admin uploads/deletes.
create policy "Public can view menu images"
on storage.objects
for select
to public
using (bucket_id = 'menu-images');

create policy "Admins can upload menu images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'menu-images');

create policy "Admins can update menu images"
on storage.objects
for update
to authenticated
using (bucket_id = 'menu-images')
with check (bucket_id = 'menu-images');

create policy "Admins can delete menu images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'menu-images');
