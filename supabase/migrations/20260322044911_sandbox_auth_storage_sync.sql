drop policy "Admin write for vitaflix bucket" on "storage"."objects";


  create policy "Admin write for vitaflix bucket"
  on "storage"."objects"
  as permissive
  for all
  to public
using (((bucket_id = 'vitaflix'::text) AND (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text))))));
