drop extension if exists "pg_net";

create type "public"."unit_type_enum" as enum ('weight', 'volume', 'piece', 'portion', 'energy', 'other');

drop policy "Admins can manage templates" on "public"."notification_templates";

drop policy "Admins can manage countries" on "public"."countries";

drop policy "Admins can manage lead_funnel_steps" on "public"."lead_funnel_steps";

drop policy "Admins can manage lead_funnels" on "public"."lead_funnels";

drop policy "Admins can manage leads" on "public"."leads";

drop policy "Anyone can insert leads" on "public"."leads";

drop policy "Admins can manage meal_countries" on "public"."meal_countries";

drop policy "Admins can manage measurement_units" on "public"."measurement_units";

drop policy "Admins can manage product_countries" on "public"."product_countries";

alter table "public"."notification_templates" alter column "channel" drop default;


  create table "public"."brand_store_markets" (
    "brand_id" uuid not null,
    "store_market_id" uuid not null
      );


alter table "public"."brand_store_markets" enable row level security;


  create table "public"."brands" (
    "id" uuid not null default gen_random_uuid(),
    "name" jsonb not null,
    "logo_url" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."brands" enable row level security;


  create table "public"."dietary_tags" (
    "id" uuid not null default gen_random_uuid(),
    "name" jsonb not null,
    "color" text default '#3AD49F'::text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."dietary_tags" enable row level security;


  create table "public"."meal_categories" (
    "id" uuid not null default gen_random_uuid(),
    "name" jsonb not null,
    "color" text default '#3AD49F'::text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."meal_categories" enable row level security;


  create table "public"."meal_category_links" (
    "meal_id" uuid not null,
    "category_id" uuid not null
      );


alter table "public"."meal_category_links" enable row level security;


  create table "public"."meal_day_configurations" (
    "id" uuid not null default gen_random_uuid(),
    "daily_meals_count" integer not null,
    "slot_index" integer not null,
    "category_id" uuid not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."meal_day_configurations" enable row level security;


  create table "public"."meal_dietary_tags" (
    "meal_id" uuid not null,
    "dietary_tag_id" uuid not null
      );


alter table "public"."meal_dietary_tags" enable row level security;


  create table "public"."meal_plan_sizes" (
    "id" uuid not null default gen_random_uuid(),
    "name" jsonb not null default '{}'::jsonb,
    "slug" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."meal_plan_sizes" enable row level security;


  create table "public"."product_brands" (
    "product_id" uuid not null,
    "brand_id" uuid not null
      );


alter table "public"."product_brands" enable row level security;


  create table "public"."product_group_links" (
    "product_id" uuid not null,
    "group_id" uuid not null
      );


alter table "public"."product_group_links" enable row level security;


  create table "public"."product_groups" (
    "id" uuid not null default gen_random_uuid(),
    "name" jsonb not null,
    "slug" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."product_groups" enable row level security;


  create table "public"."product_images" (
    "id" uuid not null default gen_random_uuid(),
    "product_id" uuid,
    "url" text not null,
    "storage_path" text not null,
    "is_default" boolean default false,
    "display_order" integer default 0,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."product_images" enable row level security;


  create table "public"."product_tags" (
    "product_id" uuid not null,
    "tag_id" uuid not null
      );


alter table "public"."product_tags" enable row level security;


  create table "public"."store_markets" (
    "id" uuid not null default gen_random_uuid(),
    "slug" text not null,
    "name" jsonb not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."store_markets" enable row level security;


  create table "public"."system_settings" (
    "key" text not null,
    "value" jsonb not null,
    "description" text,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."system_settings" enable row level security;


  create table "public"."tags" (
    "id" uuid not null default gen_random_uuid(),
    "name" jsonb not null,
    "color" text default '#3AD49F'::text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."tags" enable row level security;


  create table "public"."units" (
    "id" uuid not null default gen_random_uuid(),
    "slug" text not null,
    "name" jsonb not null default '{}'::jsonb,
    "unit_type" public.unit_type_enum not null default 'weight'::public.unit_type_enum,
    "symbol" text not null,
    "base_unit_slug" text,
    "conversion_factor" double precision not null default 1,
    "is_default" boolean not null default false,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."units" enable row level security;


  create table "public"."user_roles" (
    "id" uuid not null default gen_random_uuid(),
    "slug" text not null,
    "name" jsonb not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."user_roles" enable row level security;


  create table "public"."wellness_objectives" (
    "id" uuid not null default gen_random_uuid(),
    "slug" text not null,
    "name" jsonb not null,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."wellness_objectives" enable row level security;

alter table "public"."notification_templates" alter column channel type "public"."notification_channel_enum" using channel::text::"public"."notification_channel_enum";

alter table "public"."notification_templates" alter column "channel" set default null;

alter table "public"."meal_options" add column "images" jsonb default '[]'::jsonb;

alter table "public"."meal_options" add column "substitution_notes" jsonb;

alter table "public"."meal_plans" add column "daily_meals_count" integer default 3;

alter table "public"."meal_plans" add column "name" text;

alter table "public"."meals" add column "images" jsonb default '[]'::jsonb;

alter table "public"."meals" add column "is_public" boolean default false;

alter table "public"."notification_templates" drop column "media_url";

alter table "public"."notification_templates" alter column "channel" set default 'email'::public.notification_channel_enum;

alter table "public"."notification_templates" alter column "channel" set not null;

alter table "public"."notification_templates" alter column "created_at" set default now();

alter table "public"."notification_templates" alter column "created_at" drop not null;

alter table "public"."notification_templates" alter column "type" set not null;

alter table "public"."notification_templates" alter column "updated_at" set default now();

alter table "public"."notification_templates" alter column "updated_at" drop not null;

alter table "public"."notification_triggers" drop column "css_template";

alter table "public"."notification_triggers" drop column "html_template";

alter table "public"."notifications" drop column "css";

alter table "public"."notifications" add column "error_message" text;

alter table "public"."notifications" add column "metadata" jsonb default '{}'::jsonb;

alter table "public"."notifications" add column "target" text;

alter table "public"."notifications" alter column "user_id" drop not null;

alter table "public"."products" drop column "tag";

alter table "public"."products" add column "images" jsonb default '[]'::jsonb;

alter table "public"."products" add column "tags" text[] default '{}'::text[];

alter table "public"."users" add column "avatar_url" text;

alter table "public"."users" add column "preferences" jsonb default '{}'::jsonb;

alter table "public"."users" alter column "objective" set data type text using "objective"::text;

alter table "public"."users" alter column "role" set data type text using "role"::text;

CREATE UNIQUE INDEX brand_store_markets_pkey ON public.brand_store_markets USING btree (brand_id, store_market_id);

CREATE UNIQUE INDEX brands_pkey ON public.brands USING btree (id);

CREATE UNIQUE INDEX dietary_tags_name_key ON public.dietary_tags USING btree (name);

CREATE UNIQUE INDEX dietary_tags_pkey ON public.dietary_tags USING btree (id);

CREATE UNIQUE INDEX meal_categories_name_key ON public.meal_categories USING btree (name);

CREATE UNIQUE INDEX meal_categories_pkey ON public.meal_categories USING btree (id);

CREATE UNIQUE INDEX meal_category_links_pkey ON public.meal_category_links USING btree (meal_id, category_id);

CREATE UNIQUE INDEX meal_day_configurations_daily_meals_count_slot_index_key ON public.meal_day_configurations USING btree (daily_meals_count, slot_index);

CREATE UNIQUE INDEX meal_day_configurations_pkey ON public.meal_day_configurations USING btree (id);

CREATE UNIQUE INDEX meal_dietary_tags_pkey ON public.meal_dietary_tags USING btree (meal_id, dietary_tag_id);

CREATE UNIQUE INDEX meal_plan_sizes_pkey ON public.meal_plan_sizes USING btree (id);

CREATE UNIQUE INDEX meal_plan_sizes_slug_key ON public.meal_plan_sizes USING btree (slug);

CREATE UNIQUE INDEX product_brands_pkey ON public.product_brands USING btree (product_id, brand_id);

CREATE UNIQUE INDEX product_group_links_pkey ON public.product_group_links USING btree (product_id, group_id);

CREATE UNIQUE INDEX product_groups_pkey ON public.product_groups USING btree (id);

CREATE UNIQUE INDEX product_images_pkey ON public.product_images USING btree (id);

CREATE UNIQUE INDEX product_tags_pkey ON public.product_tags USING btree (product_id, tag_id);

CREATE UNIQUE INDEX store_markets_pkey ON public.store_markets USING btree (id);

CREATE UNIQUE INDEX store_markets_slug_key ON public.store_markets USING btree (slug);

CREATE UNIQUE INDEX system_settings_pkey ON public.system_settings USING btree (key);

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);

CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id);

CREATE UNIQUE INDEX units_pkey ON public.units USING btree (id);

CREATE UNIQUE INDEX units_slug_key ON public.units USING btree (slug);

CREATE UNIQUE INDEX user_roles_pkey ON public.user_roles USING btree (id);

CREATE UNIQUE INDEX user_roles_slug_key ON public.user_roles USING btree (slug);

CREATE UNIQUE INDEX wellness_objectives_pkey ON public.wellness_objectives USING btree (id);

CREATE UNIQUE INDEX wellness_objectives_slug_key ON public.wellness_objectives USING btree (slug);

alter table "public"."brand_store_markets" add constraint "brand_store_markets_pkey" PRIMARY KEY using index "brand_store_markets_pkey";

alter table "public"."brands" add constraint "brands_pkey" PRIMARY KEY using index "brands_pkey";

alter table "public"."dietary_tags" add constraint "dietary_tags_pkey" PRIMARY KEY using index "dietary_tags_pkey";

alter table "public"."meal_categories" add constraint "meal_categories_pkey" PRIMARY KEY using index "meal_categories_pkey";

alter table "public"."meal_category_links" add constraint "meal_category_links_pkey" PRIMARY KEY using index "meal_category_links_pkey";

alter table "public"."meal_day_configurations" add constraint "meal_day_configurations_pkey" PRIMARY KEY using index "meal_day_configurations_pkey";

alter table "public"."meal_dietary_tags" add constraint "meal_dietary_tags_pkey" PRIMARY KEY using index "meal_dietary_tags_pkey";

alter table "public"."meal_plan_sizes" add constraint "meal_plan_sizes_pkey" PRIMARY KEY using index "meal_plan_sizes_pkey";

alter table "public"."product_brands" add constraint "product_brands_pkey" PRIMARY KEY using index "product_brands_pkey";

alter table "public"."product_group_links" add constraint "product_group_links_pkey" PRIMARY KEY using index "product_group_links_pkey";

alter table "public"."product_groups" add constraint "product_groups_pkey" PRIMARY KEY using index "product_groups_pkey";

alter table "public"."product_images" add constraint "product_images_pkey" PRIMARY KEY using index "product_images_pkey";

alter table "public"."product_tags" add constraint "product_tags_pkey" PRIMARY KEY using index "product_tags_pkey";

alter table "public"."store_markets" add constraint "store_markets_pkey" PRIMARY KEY using index "store_markets_pkey";

alter table "public"."system_settings" add constraint "system_settings_pkey" PRIMARY KEY using index "system_settings_pkey";

alter table "public"."tags" add constraint "tags_pkey" PRIMARY KEY using index "tags_pkey";

alter table "public"."units" add constraint "units_pkey" PRIMARY KEY using index "units_pkey";

alter table "public"."user_roles" add constraint "user_roles_pkey" PRIMARY KEY using index "user_roles_pkey";

alter table "public"."wellness_objectives" add constraint "wellness_objectives_pkey" PRIMARY KEY using index "wellness_objectives_pkey";

alter table "public"."brand_store_markets" add constraint "brand_store_markets_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE not valid;

alter table "public"."brand_store_markets" validate constraint "brand_store_markets_brand_id_fkey";

alter table "public"."brand_store_markets" add constraint "brand_store_markets_store_market_id_fkey" FOREIGN KEY (store_market_id) REFERENCES public.store_markets(id) ON DELETE CASCADE not valid;

alter table "public"."brand_store_markets" validate constraint "brand_store_markets_store_market_id_fkey";

alter table "public"."dietary_tags" add constraint "dietary_tags_name_key" UNIQUE using index "dietary_tags_name_key";

alter table "public"."meal_categories" add constraint "meal_categories_name_key" UNIQUE using index "meal_categories_name_key";

alter table "public"."meal_category_links" add constraint "meal_category_links_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.meal_categories(id) ON DELETE CASCADE not valid;

alter table "public"."meal_category_links" validate constraint "meal_category_links_category_id_fkey";

alter table "public"."meal_category_links" add constraint "meal_category_links_meal_id_fkey" FOREIGN KEY (meal_id) REFERENCES public.meals(id) ON DELETE CASCADE not valid;

alter table "public"."meal_category_links" validate constraint "meal_category_links_meal_id_fkey";

alter table "public"."meal_day_configurations" add constraint "meal_day_configurations_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.meal_categories(id) ON DELETE CASCADE not valid;

alter table "public"."meal_day_configurations" validate constraint "meal_day_configurations_category_id_fkey";

alter table "public"."meal_day_configurations" add constraint "meal_day_configurations_daily_meals_count_slot_index_key" UNIQUE using index "meal_day_configurations_daily_meals_count_slot_index_key";

alter table "public"."meal_dietary_tags" add constraint "meal_dietary_tags_dietary_tag_id_fkey" FOREIGN KEY (dietary_tag_id) REFERENCES public.dietary_tags(id) ON DELETE CASCADE not valid;

alter table "public"."meal_dietary_tags" validate constraint "meal_dietary_tags_dietary_tag_id_fkey";

alter table "public"."meal_dietary_tags" add constraint "meal_dietary_tags_meal_id_fkey" FOREIGN KEY (meal_id) REFERENCES public.meals(id) ON DELETE CASCADE not valid;

alter table "public"."meal_dietary_tags" validate constraint "meal_dietary_tags_meal_id_fkey";

alter table "public"."meal_plan_sizes" add constraint "meal_plan_sizes_slug_key" UNIQUE using index "meal_plan_sizes_slug_key";

alter table "public"."product_brands" add constraint "product_brands_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE not valid;

alter table "public"."product_brands" validate constraint "product_brands_brand_id_fkey";

alter table "public"."product_brands" add constraint "product_brands_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."product_brands" validate constraint "product_brands_product_id_fkey";

alter table "public"."product_group_links" add constraint "product_group_links_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public.product_groups(id) ON DELETE CASCADE not valid;

alter table "public"."product_group_links" validate constraint "product_group_links_group_id_fkey";

alter table "public"."product_group_links" add constraint "product_group_links_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."product_group_links" validate constraint "product_group_links_product_id_fkey";

alter table "public"."product_images" add constraint "product_images_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."product_images" validate constraint "product_images_product_id_fkey";

alter table "public"."product_tags" add constraint "product_tags_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."product_tags" validate constraint "product_tags_product_id_fkey";

alter table "public"."product_tags" add constraint "product_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE not valid;

alter table "public"."product_tags" validate constraint "product_tags_tag_id_fkey";

alter table "public"."store_markets" add constraint "store_markets_slug_key" UNIQUE using index "store_markets_slug_key";

alter table "public"."tags" add constraint "tags_name_key" UNIQUE using index "tags_name_key";

alter table "public"."units" add constraint "units_base_unit_slug_fkey" FOREIGN KEY (base_unit_slug) REFERENCES public.units(slug) ON DELETE SET NULL not valid;

alter table "public"."units" validate constraint "units_base_unit_slug_fkey";

alter table "public"."units" add constraint "units_slug_key" UNIQUE using index "units_slug_key";

alter table "public"."user_roles" add constraint "user_roles_slug_key" UNIQUE using index "user_roles_slug_key";

alter table "public"."wellness_objectives" add constraint "wellness_objectives_slug_key" UNIQUE using index "wellness_objectives_slug_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO public.users (id, email, role)
    VALUES (
        new.id, 
        new.email, 
        COALESCE(new.raw_user_meta_data->>'role', 'user')
    );
    RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.map_brand_store_alias(alias_text text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
declare
  normalized text;
begin
  normalized := lower(trim(coalesce(alias_text, '')));
  normalized := translate(normalized, 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc');
  normalized := replace(normalized, '-', ' ');
  normalized := regexp_replace(normalized, '\s+', ' ', 'g');

  if normalized in ('varios', 'varias', 'various', 'all stores', 'todas as lojas', 'multilojas', 'multi store') then return 'all'; end if;
  if normalized = 'continente' then return 'continente'; end if;
  if normalized = 'pingo doce' then return 'pingo_doce'; end if;
  if normalized = 'mercadona' then return 'mercadona'; end if;
  if normalized = 'lidl' then return 'lidl'; end if;
  if normalized = 'auchan' then return 'auchan'; end if;
  if normalized = 'intermarche' then return 'intermarche'; end if;
  if normalized = 'minipreco' then return 'minipreco'; end if;
  if normalized = 'aldi' then return 'aldi'; end if;

  return null;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.parse_brand_store_markets(name_text text)
 RETURNS text[]
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
declare
  parts text[];
  suffix text;
  token text;
  mapped text;
  markets text[] := '{}'::text[];
begin
  if name_text is null or trim(name_text) = '' then
    return '{}'::text[];
  end if;

  parts := regexp_split_to_array(name_text, '\s-\s');
  if array_length(parts, 1) is null or array_length(parts, 1) < 2 then
    return '{}'::text[];
  end if;

  suffix := parts[array_length(parts, 1)];

  foreach token in array regexp_split_to_array(suffix, '\s*,\s*')
  loop
    mapped := public.map_brand_store_alias(token);
    if mapped is null then
      return '{}'::text[];
    end if;
    if mapped = 'all' then
      return '{}'::text[];
    end if;
    if not (mapped = any(markets)) then
      markets := array_append(markets, mapped);
    end if;
  end loop;

  return markets;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN NEW.updated_at = timezone('utc', now()); RETURN NEW; END;
$function$
;

CREATE OR REPLACE FUNCTION public.strip_brand_store_suffix(name_text text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
declare
  parts text[];
  suffix text;
  token text;
  mapped text;
  base text;
begin
  if name_text is null or trim(name_text) = '' then
    return name_text;
  end if;

  parts := regexp_split_to_array(name_text, '\s-\s');
  if array_length(parts, 1) is null or array_length(parts, 1) < 2 then
    return trim(name_text);
  end if;

  suffix := parts[array_length(parts, 1)];

  foreach token in array regexp_split_to_array(suffix, '\s*,\s*')
  loop
    mapped := public.map_brand_store_alias(token);
    if mapped is null then
      return trim(name_text);
    end if;
  end loop;

  base := array_to_string(parts[1:array_length(parts, 1)-1], ' - ');
  return trim(base);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
    RETURN user_role = 'admin';
END;
$function$
;

grant delete on table "public"."brand_store_markets" to "anon";

grant insert on table "public"."brand_store_markets" to "anon";

grant references on table "public"."brand_store_markets" to "anon";

grant select on table "public"."brand_store_markets" to "anon";

grant trigger on table "public"."brand_store_markets" to "anon";

grant truncate on table "public"."brand_store_markets" to "anon";

grant update on table "public"."brand_store_markets" to "anon";

grant delete on table "public"."brand_store_markets" to "authenticated";

grant insert on table "public"."brand_store_markets" to "authenticated";

grant references on table "public"."brand_store_markets" to "authenticated";

grant select on table "public"."brand_store_markets" to "authenticated";

grant trigger on table "public"."brand_store_markets" to "authenticated";

grant truncate on table "public"."brand_store_markets" to "authenticated";

grant update on table "public"."brand_store_markets" to "authenticated";

grant delete on table "public"."brand_store_markets" to "service_role";

grant insert on table "public"."brand_store_markets" to "service_role";

grant references on table "public"."brand_store_markets" to "service_role";

grant select on table "public"."brand_store_markets" to "service_role";

grant trigger on table "public"."brand_store_markets" to "service_role";

grant truncate on table "public"."brand_store_markets" to "service_role";

grant update on table "public"."brand_store_markets" to "service_role";

grant delete on table "public"."brands" to "anon";

grant insert on table "public"."brands" to "anon";

grant references on table "public"."brands" to "anon";

grant select on table "public"."brands" to "anon";

grant trigger on table "public"."brands" to "anon";

grant truncate on table "public"."brands" to "anon";

grant update on table "public"."brands" to "anon";

grant delete on table "public"."brands" to "authenticated";

grant insert on table "public"."brands" to "authenticated";

grant references on table "public"."brands" to "authenticated";

grant select on table "public"."brands" to "authenticated";

grant trigger on table "public"."brands" to "authenticated";

grant truncate on table "public"."brands" to "authenticated";

grant update on table "public"."brands" to "authenticated";

grant delete on table "public"."brands" to "service_role";

grant insert on table "public"."brands" to "service_role";

grant references on table "public"."brands" to "service_role";

grant select on table "public"."brands" to "service_role";

grant trigger on table "public"."brands" to "service_role";

grant truncate on table "public"."brands" to "service_role";

grant update on table "public"."brands" to "service_role";

grant delete on table "public"."dietary_tags" to "anon";

grant insert on table "public"."dietary_tags" to "anon";

grant references on table "public"."dietary_tags" to "anon";

grant select on table "public"."dietary_tags" to "anon";

grant trigger on table "public"."dietary_tags" to "anon";

grant truncate on table "public"."dietary_tags" to "anon";

grant update on table "public"."dietary_tags" to "anon";

grant delete on table "public"."dietary_tags" to "authenticated";

grant insert on table "public"."dietary_tags" to "authenticated";

grant references on table "public"."dietary_tags" to "authenticated";

grant select on table "public"."dietary_tags" to "authenticated";

grant trigger on table "public"."dietary_tags" to "authenticated";

grant truncate on table "public"."dietary_tags" to "authenticated";

grant update on table "public"."dietary_tags" to "authenticated";

grant delete on table "public"."dietary_tags" to "service_role";

grant insert on table "public"."dietary_tags" to "service_role";

grant references on table "public"."dietary_tags" to "service_role";

grant select on table "public"."dietary_tags" to "service_role";

grant trigger on table "public"."dietary_tags" to "service_role";

grant truncate on table "public"."dietary_tags" to "service_role";

grant update on table "public"."dietary_tags" to "service_role";

grant delete on table "public"."meal_categories" to "anon";

grant insert on table "public"."meal_categories" to "anon";

grant references on table "public"."meal_categories" to "anon";

grant select on table "public"."meal_categories" to "anon";

grant trigger on table "public"."meal_categories" to "anon";

grant truncate on table "public"."meal_categories" to "anon";

grant update on table "public"."meal_categories" to "anon";

grant delete on table "public"."meal_categories" to "authenticated";

grant insert on table "public"."meal_categories" to "authenticated";

grant references on table "public"."meal_categories" to "authenticated";

grant select on table "public"."meal_categories" to "authenticated";

grant trigger on table "public"."meal_categories" to "authenticated";

grant truncate on table "public"."meal_categories" to "authenticated";

grant update on table "public"."meal_categories" to "authenticated";

grant delete on table "public"."meal_categories" to "service_role";

grant insert on table "public"."meal_categories" to "service_role";

grant references on table "public"."meal_categories" to "service_role";

grant select on table "public"."meal_categories" to "service_role";

grant trigger on table "public"."meal_categories" to "service_role";

grant truncate on table "public"."meal_categories" to "service_role";

grant update on table "public"."meal_categories" to "service_role";

grant delete on table "public"."meal_category_links" to "anon";

grant insert on table "public"."meal_category_links" to "anon";

grant references on table "public"."meal_category_links" to "anon";

grant select on table "public"."meal_category_links" to "anon";

grant trigger on table "public"."meal_category_links" to "anon";

grant truncate on table "public"."meal_category_links" to "anon";

grant update on table "public"."meal_category_links" to "anon";

grant delete on table "public"."meal_category_links" to "authenticated";

grant insert on table "public"."meal_category_links" to "authenticated";

grant references on table "public"."meal_category_links" to "authenticated";

grant select on table "public"."meal_category_links" to "authenticated";

grant trigger on table "public"."meal_category_links" to "authenticated";

grant truncate on table "public"."meal_category_links" to "authenticated";

grant update on table "public"."meal_category_links" to "authenticated";

grant delete on table "public"."meal_category_links" to "service_role";

grant insert on table "public"."meal_category_links" to "service_role";

grant references on table "public"."meal_category_links" to "service_role";

grant select on table "public"."meal_category_links" to "service_role";

grant trigger on table "public"."meal_category_links" to "service_role";

grant truncate on table "public"."meal_category_links" to "service_role";

grant update on table "public"."meal_category_links" to "service_role";

grant delete on table "public"."meal_day_configurations" to "anon";

grant insert on table "public"."meal_day_configurations" to "anon";

grant references on table "public"."meal_day_configurations" to "anon";

grant select on table "public"."meal_day_configurations" to "anon";

grant trigger on table "public"."meal_day_configurations" to "anon";

grant truncate on table "public"."meal_day_configurations" to "anon";

grant update on table "public"."meal_day_configurations" to "anon";

grant delete on table "public"."meal_day_configurations" to "authenticated";

grant insert on table "public"."meal_day_configurations" to "authenticated";

grant references on table "public"."meal_day_configurations" to "authenticated";

grant select on table "public"."meal_day_configurations" to "authenticated";

grant trigger on table "public"."meal_day_configurations" to "authenticated";

grant truncate on table "public"."meal_day_configurations" to "authenticated";

grant update on table "public"."meal_day_configurations" to "authenticated";

grant delete on table "public"."meal_day_configurations" to "service_role";

grant insert on table "public"."meal_day_configurations" to "service_role";

grant references on table "public"."meal_day_configurations" to "service_role";

grant select on table "public"."meal_day_configurations" to "service_role";

grant trigger on table "public"."meal_day_configurations" to "service_role";

grant truncate on table "public"."meal_day_configurations" to "service_role";

grant update on table "public"."meal_day_configurations" to "service_role";

grant delete on table "public"."meal_dietary_tags" to "anon";

grant insert on table "public"."meal_dietary_tags" to "anon";

grant references on table "public"."meal_dietary_tags" to "anon";

grant select on table "public"."meal_dietary_tags" to "anon";

grant trigger on table "public"."meal_dietary_tags" to "anon";

grant truncate on table "public"."meal_dietary_tags" to "anon";

grant update on table "public"."meal_dietary_tags" to "anon";

grant delete on table "public"."meal_dietary_tags" to "authenticated";

grant insert on table "public"."meal_dietary_tags" to "authenticated";

grant references on table "public"."meal_dietary_tags" to "authenticated";

grant select on table "public"."meal_dietary_tags" to "authenticated";

grant trigger on table "public"."meal_dietary_tags" to "authenticated";

grant truncate on table "public"."meal_dietary_tags" to "authenticated";

grant update on table "public"."meal_dietary_tags" to "authenticated";

grant delete on table "public"."meal_dietary_tags" to "service_role";

grant insert on table "public"."meal_dietary_tags" to "service_role";

grant references on table "public"."meal_dietary_tags" to "service_role";

grant select on table "public"."meal_dietary_tags" to "service_role";

grant trigger on table "public"."meal_dietary_tags" to "service_role";

grant truncate on table "public"."meal_dietary_tags" to "service_role";

grant update on table "public"."meal_dietary_tags" to "service_role";

grant delete on table "public"."meal_plan_sizes" to "anon";

grant insert on table "public"."meal_plan_sizes" to "anon";

grant references on table "public"."meal_plan_sizes" to "anon";

grant select on table "public"."meal_plan_sizes" to "anon";

grant trigger on table "public"."meal_plan_sizes" to "anon";

grant truncate on table "public"."meal_plan_sizes" to "anon";

grant update on table "public"."meal_plan_sizes" to "anon";

grant delete on table "public"."meal_plan_sizes" to "authenticated";

grant insert on table "public"."meal_plan_sizes" to "authenticated";

grant references on table "public"."meal_plan_sizes" to "authenticated";

grant select on table "public"."meal_plan_sizes" to "authenticated";

grant trigger on table "public"."meal_plan_sizes" to "authenticated";

grant truncate on table "public"."meal_plan_sizes" to "authenticated";

grant update on table "public"."meal_plan_sizes" to "authenticated";

grant delete on table "public"."meal_plan_sizes" to "service_role";

grant insert on table "public"."meal_plan_sizes" to "service_role";

grant references on table "public"."meal_plan_sizes" to "service_role";

grant select on table "public"."meal_plan_sizes" to "service_role";

grant trigger on table "public"."meal_plan_sizes" to "service_role";

grant truncate on table "public"."meal_plan_sizes" to "service_role";

grant update on table "public"."meal_plan_sizes" to "service_role";

grant delete on table "public"."product_brands" to "anon";

grant insert on table "public"."product_brands" to "anon";

grant references on table "public"."product_brands" to "anon";

grant select on table "public"."product_brands" to "anon";

grant trigger on table "public"."product_brands" to "anon";

grant truncate on table "public"."product_brands" to "anon";

grant update on table "public"."product_brands" to "anon";

grant delete on table "public"."product_brands" to "authenticated";

grant insert on table "public"."product_brands" to "authenticated";

grant references on table "public"."product_brands" to "authenticated";

grant select on table "public"."product_brands" to "authenticated";

grant trigger on table "public"."product_brands" to "authenticated";

grant truncate on table "public"."product_brands" to "authenticated";

grant update on table "public"."product_brands" to "authenticated";

grant delete on table "public"."product_brands" to "service_role";

grant insert on table "public"."product_brands" to "service_role";

grant references on table "public"."product_brands" to "service_role";

grant select on table "public"."product_brands" to "service_role";

grant trigger on table "public"."product_brands" to "service_role";

grant truncate on table "public"."product_brands" to "service_role";

grant update on table "public"."product_brands" to "service_role";

grant delete on table "public"."product_group_links" to "anon";

grant insert on table "public"."product_group_links" to "anon";

grant references on table "public"."product_group_links" to "anon";

grant select on table "public"."product_group_links" to "anon";

grant trigger on table "public"."product_group_links" to "anon";

grant truncate on table "public"."product_group_links" to "anon";

grant update on table "public"."product_group_links" to "anon";

grant delete on table "public"."product_group_links" to "authenticated";

grant insert on table "public"."product_group_links" to "authenticated";

grant references on table "public"."product_group_links" to "authenticated";

grant select on table "public"."product_group_links" to "authenticated";

grant trigger on table "public"."product_group_links" to "authenticated";

grant truncate on table "public"."product_group_links" to "authenticated";

grant update on table "public"."product_group_links" to "authenticated";

grant delete on table "public"."product_group_links" to "service_role";

grant insert on table "public"."product_group_links" to "service_role";

grant references on table "public"."product_group_links" to "service_role";

grant select on table "public"."product_group_links" to "service_role";

grant trigger on table "public"."product_group_links" to "service_role";

grant truncate on table "public"."product_group_links" to "service_role";

grant update on table "public"."product_group_links" to "service_role";

grant delete on table "public"."product_groups" to "anon";

grant insert on table "public"."product_groups" to "anon";

grant references on table "public"."product_groups" to "anon";

grant select on table "public"."product_groups" to "anon";

grant trigger on table "public"."product_groups" to "anon";

grant truncate on table "public"."product_groups" to "anon";

grant update on table "public"."product_groups" to "anon";

grant delete on table "public"."product_groups" to "authenticated";

grant insert on table "public"."product_groups" to "authenticated";

grant references on table "public"."product_groups" to "authenticated";

grant select on table "public"."product_groups" to "authenticated";

grant trigger on table "public"."product_groups" to "authenticated";

grant truncate on table "public"."product_groups" to "authenticated";

grant update on table "public"."product_groups" to "authenticated";

grant delete on table "public"."product_groups" to "service_role";

grant insert on table "public"."product_groups" to "service_role";

grant references on table "public"."product_groups" to "service_role";

grant select on table "public"."product_groups" to "service_role";

grant trigger on table "public"."product_groups" to "service_role";

grant truncate on table "public"."product_groups" to "service_role";

grant update on table "public"."product_groups" to "service_role";

grant delete on table "public"."product_images" to "anon";

grant insert on table "public"."product_images" to "anon";

grant references on table "public"."product_images" to "anon";

grant select on table "public"."product_images" to "anon";

grant trigger on table "public"."product_images" to "anon";

grant truncate on table "public"."product_images" to "anon";

grant update on table "public"."product_images" to "anon";

grant delete on table "public"."product_images" to "authenticated";

grant insert on table "public"."product_images" to "authenticated";

grant references on table "public"."product_images" to "authenticated";

grant select on table "public"."product_images" to "authenticated";

grant trigger on table "public"."product_images" to "authenticated";

grant truncate on table "public"."product_images" to "authenticated";

grant update on table "public"."product_images" to "authenticated";

grant delete on table "public"."product_images" to "service_role";

grant insert on table "public"."product_images" to "service_role";

grant references on table "public"."product_images" to "service_role";

grant select on table "public"."product_images" to "service_role";

grant trigger on table "public"."product_images" to "service_role";

grant truncate on table "public"."product_images" to "service_role";

grant update on table "public"."product_images" to "service_role";

grant delete on table "public"."product_tags" to "anon";

grant insert on table "public"."product_tags" to "anon";

grant references on table "public"."product_tags" to "anon";

grant select on table "public"."product_tags" to "anon";

grant trigger on table "public"."product_tags" to "anon";

grant truncate on table "public"."product_tags" to "anon";

grant update on table "public"."product_tags" to "anon";

grant delete on table "public"."product_tags" to "authenticated";

grant insert on table "public"."product_tags" to "authenticated";

grant references on table "public"."product_tags" to "authenticated";

grant select on table "public"."product_tags" to "authenticated";

grant trigger on table "public"."product_tags" to "authenticated";

grant truncate on table "public"."product_tags" to "authenticated";

grant update on table "public"."product_tags" to "authenticated";

grant delete on table "public"."product_tags" to "service_role";

grant insert on table "public"."product_tags" to "service_role";

grant references on table "public"."product_tags" to "service_role";

grant select on table "public"."product_tags" to "service_role";

grant trigger on table "public"."product_tags" to "service_role";

grant truncate on table "public"."product_tags" to "service_role";

grant update on table "public"."product_tags" to "service_role";

grant delete on table "public"."store_markets" to "anon";

grant insert on table "public"."store_markets" to "anon";

grant references on table "public"."store_markets" to "anon";

grant select on table "public"."store_markets" to "anon";

grant trigger on table "public"."store_markets" to "anon";

grant truncate on table "public"."store_markets" to "anon";

grant update on table "public"."store_markets" to "anon";

grant delete on table "public"."store_markets" to "authenticated";

grant insert on table "public"."store_markets" to "authenticated";

grant references on table "public"."store_markets" to "authenticated";

grant select on table "public"."store_markets" to "authenticated";

grant trigger on table "public"."store_markets" to "authenticated";

grant truncate on table "public"."store_markets" to "authenticated";

grant update on table "public"."store_markets" to "authenticated";

grant delete on table "public"."store_markets" to "service_role";

grant insert on table "public"."store_markets" to "service_role";

grant references on table "public"."store_markets" to "service_role";

grant select on table "public"."store_markets" to "service_role";

grant trigger on table "public"."store_markets" to "service_role";

grant truncate on table "public"."store_markets" to "service_role";

grant update on table "public"."store_markets" to "service_role";

grant delete on table "public"."system_settings" to "anon";

grant insert on table "public"."system_settings" to "anon";

grant references on table "public"."system_settings" to "anon";

grant select on table "public"."system_settings" to "anon";

grant trigger on table "public"."system_settings" to "anon";

grant truncate on table "public"."system_settings" to "anon";

grant update on table "public"."system_settings" to "anon";

grant delete on table "public"."system_settings" to "authenticated";

grant insert on table "public"."system_settings" to "authenticated";

grant references on table "public"."system_settings" to "authenticated";

grant select on table "public"."system_settings" to "authenticated";

grant trigger on table "public"."system_settings" to "authenticated";

grant truncate on table "public"."system_settings" to "authenticated";

grant update on table "public"."system_settings" to "authenticated";

grant delete on table "public"."system_settings" to "service_role";

grant insert on table "public"."system_settings" to "service_role";

grant references on table "public"."system_settings" to "service_role";

grant select on table "public"."system_settings" to "service_role";

grant trigger on table "public"."system_settings" to "service_role";

grant truncate on table "public"."system_settings" to "service_role";

grant update on table "public"."system_settings" to "service_role";

grant delete on table "public"."tags" to "anon";

grant insert on table "public"."tags" to "anon";

grant references on table "public"."tags" to "anon";

grant select on table "public"."tags" to "anon";

grant trigger on table "public"."tags" to "anon";

grant truncate on table "public"."tags" to "anon";

grant update on table "public"."tags" to "anon";

grant delete on table "public"."tags" to "authenticated";

grant insert on table "public"."tags" to "authenticated";

grant references on table "public"."tags" to "authenticated";

grant select on table "public"."tags" to "authenticated";

grant trigger on table "public"."tags" to "authenticated";

grant truncate on table "public"."tags" to "authenticated";

grant update on table "public"."tags" to "authenticated";

grant delete on table "public"."tags" to "service_role";

grant insert on table "public"."tags" to "service_role";

grant references on table "public"."tags" to "service_role";

grant select on table "public"."tags" to "service_role";

grant trigger on table "public"."tags" to "service_role";

grant truncate on table "public"."tags" to "service_role";

grant update on table "public"."tags" to "service_role";

grant delete on table "public"."units" to "anon";

grant insert on table "public"."units" to "anon";

grant references on table "public"."units" to "anon";

grant select on table "public"."units" to "anon";

grant trigger on table "public"."units" to "anon";

grant truncate on table "public"."units" to "anon";

grant update on table "public"."units" to "anon";

grant delete on table "public"."units" to "authenticated";

grant insert on table "public"."units" to "authenticated";

grant references on table "public"."units" to "authenticated";

grant select on table "public"."units" to "authenticated";

grant trigger on table "public"."units" to "authenticated";

grant truncate on table "public"."units" to "authenticated";

grant update on table "public"."units" to "authenticated";

grant delete on table "public"."units" to "service_role";

grant insert on table "public"."units" to "service_role";

grant references on table "public"."units" to "service_role";

grant select on table "public"."units" to "service_role";

grant trigger on table "public"."units" to "service_role";

grant truncate on table "public"."units" to "service_role";

grant update on table "public"."units" to "service_role";

grant delete on table "public"."user_roles" to "anon";

grant insert on table "public"."user_roles" to "anon";

grant references on table "public"."user_roles" to "anon";

grant select on table "public"."user_roles" to "anon";

grant trigger on table "public"."user_roles" to "anon";

grant truncate on table "public"."user_roles" to "anon";

grant update on table "public"."user_roles" to "anon";

grant delete on table "public"."user_roles" to "authenticated";

grant insert on table "public"."user_roles" to "authenticated";

grant references on table "public"."user_roles" to "authenticated";

grant select on table "public"."user_roles" to "authenticated";

grant trigger on table "public"."user_roles" to "authenticated";

grant truncate on table "public"."user_roles" to "authenticated";

grant update on table "public"."user_roles" to "authenticated";

grant delete on table "public"."user_roles" to "service_role";

grant insert on table "public"."user_roles" to "service_role";

grant references on table "public"."user_roles" to "service_role";

grant select on table "public"."user_roles" to "service_role";

grant trigger on table "public"."user_roles" to "service_role";

grant truncate on table "public"."user_roles" to "service_role";

grant update on table "public"."user_roles" to "service_role";

grant delete on table "public"."wellness_objectives" to "anon";

grant insert on table "public"."wellness_objectives" to "anon";

grant references on table "public"."wellness_objectives" to "anon";

grant select on table "public"."wellness_objectives" to "anon";

grant trigger on table "public"."wellness_objectives" to "anon";

grant truncate on table "public"."wellness_objectives" to "anon";

grant update on table "public"."wellness_objectives" to "anon";

grant delete on table "public"."wellness_objectives" to "authenticated";

grant insert on table "public"."wellness_objectives" to "authenticated";

grant references on table "public"."wellness_objectives" to "authenticated";

grant select on table "public"."wellness_objectives" to "authenticated";

grant trigger on table "public"."wellness_objectives" to "authenticated";

grant truncate on table "public"."wellness_objectives" to "authenticated";

grant update on table "public"."wellness_objectives" to "authenticated";

grant delete on table "public"."wellness_objectives" to "service_role";

grant insert on table "public"."wellness_objectives" to "service_role";

grant references on table "public"."wellness_objectives" to "service_role";

grant select on table "public"."wellness_objectives" to "service_role";

grant trigger on table "public"."wellness_objectives" to "service_role";

grant truncate on table "public"."wellness_objectives" to "service_role";

grant update on table "public"."wellness_objectives" to "service_role";


  create policy "Admins can manage brand_store_markets"
  on "public"."brand_store_markets"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text)))));



  create policy "Anyone can read brand_store_markets"
  on "public"."brand_store_markets"
  as permissive
  for select
  to public
using (true);



  create policy "Admin write for brands"
  on "public"."brands"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text)))));



  create policy "Public read for brands"
  on "public"."brands"
  as permissive
  for select
  to public
using (true);



  create policy "Allow authenticated write access"
  on "public"."dietary_tags"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Allow public read access"
  on "public"."dietary_tags"
  as permissive
  for select
  to public
using (true);



  create policy "Allow authenticated write access"
  on "public"."meal_categories"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Allow public read access"
  on "public"."meal_categories"
  as permissive
  for select
  to public
using (true);



  create policy "Allow authenticated write access"
  on "public"."meal_category_links"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Allow public read access"
  on "public"."meal_category_links"
  as permissive
  for select
  to public
using (true);



  create policy "Admins can manage meal day configurations"
  on "public"."meal_day_configurations"
  as permissive
  for all
  to public
using (public.is_admin());



  create policy "Anyone can read meal day configurations"
  on "public"."meal_day_configurations"
  as permissive
  for select
  to public
using (true);



  create policy "Allow authenticated write access"
  on "public"."meal_dietary_tags"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Allow public read access"
  on "public"."meal_dietary_tags"
  as permissive
  for select
  to public
using (true);



  create policy "Enable all access for admins"
  on "public"."meal_plan_sizes"
  as permissive
  for all
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "Enable read access for all users"
  on "public"."meal_plan_sizes"
  as permissive
  for select
  to public
using (true);



  create policy "Allow authenticated users to manage templates"
  on "public"."notification_templates"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Allow authenticated users to view templates"
  on "public"."notification_templates"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Admin write for product_brands"
  on "public"."product_brands"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text)))));



  create policy "Public read for product_brands"
  on "public"."product_brands"
  as permissive
  for select
  to public
using (true);



  create policy "Allow admin all access"
  on "public"."product_group_links"
  as permissive
  for all
  to public
using (true);



  create policy "Allow public read access"
  on "public"."product_group_links"
  as permissive
  for select
  to public
using (true);



  create policy "Allow admin all access"
  on "public"."product_groups"
  as permissive
  for all
  to public
using (true);



  create policy "Allow public read access"
  on "public"."product_groups"
  as permissive
  for select
  to public
using (true);



  create policy "Admin write for product_images"
  on "public"."product_images"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text)))));



  create policy "Public read for product_images"
  on "public"."product_images"
  as permissive
  for select
  to public
using (true);



  create policy "Admin write for product_tags"
  on "public"."product_tags"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text)))));



  create policy "Public read for product_tags"
  on "public"."product_tags"
  as permissive
  for select
  to public
using (true);



  create policy "Admins can manage store_markets"
  on "public"."store_markets"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text)))));



  create policy "Anyone can read store_markets"
  on "public"."store_markets"
  as permissive
  for select
  to public
using (true);



  create policy "Admin write for tags"
  on "public"."tags"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text)))));



  create policy "Allow all for authenticated users"
  on "public"."tags"
  as permissive
  for all
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "Public read for tags"
  on "public"."tags"
  as permissive
  for select
  to public
using (true);



  create policy "units_admin_write"
  on "public"."units"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text)))));



  create policy "units_read_all"
  on "public"."units"
  as permissive
  for select
  to public
using (true);



  create policy "Admins can manage user roles"
  on "public"."user_roles"
  as permissive
  for all
  to public
using (public.is_admin());



  create policy "Anyone can read user roles"
  on "public"."user_roles"
  as permissive
  for select
  to public
using (true);



  create policy "Admins can manage wellness objectives"
  on "public"."wellness_objectives"
  as permissive
  for all
  to public
using (public.is_admin());



  create policy "Anyone can read wellness objectives"
  on "public"."wellness_objectives"
  as permissive
  for select
  to public
using (true);



  create policy "Admins can manage countries"
  on "public"."countries"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text)))));



  create policy "Admins can manage lead_funnel_steps"
  on "public"."lead_funnel_steps"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text)))));



  create policy "Admins can manage lead_funnels"
  on "public"."lead_funnels"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text)))));



  create policy "Admins can manage leads"
  on "public"."leads"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text)))));



  create policy "Anyone can insert leads"
  on "public"."leads"
  as permissive
  for insert
  to anon, authenticated
with check (true);



  create policy "Admins can manage meal_countries"
  on "public"."meal_countries"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text)))));



  create policy "Admins can manage measurement_units"
  on "public"."measurement_units"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text)))));



  create policy "Admins can manage product_countries"
  on "public"."product_countries"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::text)))));


CREATE TRIGGER units_set_updated_at BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

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



