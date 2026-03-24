drop policy "Admin write for vitaflix bucket" on "storage"."objects";


  create policy "Users can delete own meal review images"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'vitaflix'::text) AND (split_part(name, '/'::text, 1) = 'meal-reviews'::text) AND (split_part(name, '/'::text, 2) = (auth.uid())::text)));



  create policy "Users can update own meal review images"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'vitaflix'::text) AND (split_part(name, '/'::text, 1) = 'meal-reviews'::text) AND (split_part(name, '/'::text, 2) = (auth.uid())::text)))
with check (((bucket_id = 'vitaflix'::text) AND (split_part(name, '/'::text, 1) = 'meal-reviews'::text) AND (split_part(name, '/'::text, 2) = (auth.uid())::text)));



  create policy "Users can upload own meal review images"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'vitaflix'::text) AND (split_part(name, '/'::text, 1) = 'meal-reviews'::text) AND (split_part(name, '/'::text, 2) = (auth.uid())::text)));



  create policy "Admin write for vitaflix bucket"
  on "storage"."objects"
  as permissive
  for all
  to public
using (((bucket_id = 'vitaflix'::text) AND (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text))))));
