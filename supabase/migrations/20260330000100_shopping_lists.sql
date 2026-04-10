create extension if not exists pgcrypto;

create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shopping_lists_valid_period check (start_date <= end_date)
);

create table if not exists public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.shopping_lists(id) on delete cascade,
  name text not null,
  display_label text not null,
  quantity numeric,
  unit text,
  uses_count integer not null default 0,
  is_checked boolean not null default false,
  is_manual boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shopping_lists_user_idx
  on public.shopping_lists(user_id, created_at desc);

create index if not exists shopping_lists_period_idx
  on public.shopping_lists(user_id, start_date, end_date);

create index if not exists shopping_list_items_list_idx
  on public.shopping_list_items(list_id, sort_order);

create index if not exists shopping_list_items_checked_idx
  on public.shopping_list_items(list_id, is_checked);

alter table public.shopping_lists enable row level security;
alter table public.shopping_list_items enable row level security;

drop policy if exists shopping_lists_select_own on public.shopping_lists;
create policy shopping_lists_select_own
  on public.shopping_lists
  for select
  using (auth.uid() = user_id);

drop policy if exists shopping_lists_insert_own on public.shopping_lists;
create policy shopping_lists_insert_own
  on public.shopping_lists
  for insert
  with check (auth.uid() = user_id);

drop policy if exists shopping_lists_update_own on public.shopping_lists;
create policy shopping_lists_update_own
  on public.shopping_lists
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists shopping_lists_delete_own on public.shopping_lists;
create policy shopping_lists_delete_own
  on public.shopping_lists
  for delete
  using (auth.uid() = user_id);

drop policy if exists shopping_list_items_select_own on public.shopping_list_items;
create policy shopping_list_items_select_own
  on public.shopping_list_items
  for select
  using (
    exists (
      select 1
      from public.shopping_lists lists
      where lists.id = shopping_list_items.list_id
        and lists.user_id = auth.uid()
    )
  );

drop policy if exists shopping_list_items_insert_own on public.shopping_list_items;
create policy shopping_list_items_insert_own
  on public.shopping_list_items
  for insert
  with check (
    exists (
      select 1
      from public.shopping_lists lists
      where lists.id = shopping_list_items.list_id
        and lists.user_id = auth.uid()
    )
  );

drop policy if exists shopping_list_items_update_own on public.shopping_list_items;
create policy shopping_list_items_update_own
  on public.shopping_list_items
  for update
  using (
    exists (
      select 1
      from public.shopping_lists lists
      where lists.id = shopping_list_items.list_id
        and lists.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.shopping_lists lists
      where lists.id = shopping_list_items.list_id
        and lists.user_id = auth.uid()
    )
  );

drop policy if exists shopping_list_items_delete_own on public.shopping_list_items;
create policy shopping_list_items_delete_own
  on public.shopping_list_items
  for delete
  using (
    exists (
      select 1
      from public.shopping_lists lists
      where lists.id = shopping_list_items.list_id
        and lists.user_id = auth.uid()
    )
  );

create or replace function public.set_shopping_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shopping_lists_set_updated_at on public.shopping_lists;
create trigger shopping_lists_set_updated_at
before update on public.shopping_lists
for each row
execute function public.set_shopping_updated_at();

drop trigger if exists shopping_list_items_set_updated_at on public.shopping_list_items;
create trigger shopping_list_items_set_updated_at
before update on public.shopping_list_items
for each row
execute function public.set_shopping_updated_at();
