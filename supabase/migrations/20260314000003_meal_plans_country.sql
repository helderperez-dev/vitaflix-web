ALTER TABLE public.meal_plans
    ADD COLUMN IF NOT EXISTS country_id UUID REFERENCES public.countries(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS meal_plans_country_id_idx ON public.meal_plans(country_id);

UPDATE public.meal_plans AS mp
SET country_id = u.country_id
FROM public.users AS u
WHERE mp.user_id = u.id
  AND mp.country_id IS NULL;
