drop policy if exists "Allow authenticated uploads to reviews" on storage.objects;
drop policy if exists "Allow public read access to reviews" on storage.objects;
drop policy if exists "Public read access for reviews" on storage.objects;
drop policy if exists "Users can upload own meal review images" on storage.objects;
drop policy if exists "Users can update own meal review images" on storage.objects;
drop policy if exists "Users can delete own meal review images" on storage.objects;
drop policy if exists "Users can upload review images" on storage.objects;
drop policy if exists "Users can update review images" on storage.objects;
drop policy if exists "Users can delete review images" on storage.objects;

create policy "Users can upload review images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'vitaflix'
    and split_part(name, '/', 1) = 'meal-reviews'
    and split_part(name, '/', 2) = auth.uid()::text
  );

create policy "Users can update review images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'vitaflix'
    and split_part(name, '/', 1) = 'meal-reviews'
    and split_part(name, '/', 2) = auth.uid()::text
  )
  with check (
    bucket_id = 'vitaflix'
    and split_part(name, '/', 1) = 'meal-reviews'
    and split_part(name, '/', 2) = auth.uid()::text
  );

create policy "Users can delete review images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'vitaflix'
    and split_part(name, '/', 1) = 'meal-reviews'
    and split_part(name, '/', 2) = auth.uid()::text
  );

create policy "Public read access for reviews"
  on storage.objects
  for select
  to public
  using (
    bucket_id = 'vitaflix'
    and split_part(name, '/', 1) = 'meal-reviews'
  );
