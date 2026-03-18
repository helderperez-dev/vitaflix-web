create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', '')), '')
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(excluded.display_name, public.users.display_name),
        updated_at = timezone('utc'::text, now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();


  drop policy if exists "Admin write for vitaflix bucket" on "storage"."objects";
  create policy "Admin write for vitaflix bucket"
  on "storage"."objects"
  as permissive
  for all
  to public
using (((bucket_id = 'vitaflix'::text) AND (EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'))))));



  drop policy if exists "Public read for vitaflix bucket" on "storage"."objects";
  create policy "Public read for vitaflix bucket"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'vitaflix'::text));
