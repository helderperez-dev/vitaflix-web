CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Admin write for vitaflix bucket"
  on "storage"."objects"
  as permissive
  for all
  to public
using (((bucket_id = 'vitaflix'::text) AND (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text))))));



  create policy "Public read for vitaflix bucket"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'vitaflix'::text));
