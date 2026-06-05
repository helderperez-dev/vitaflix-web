ALTER TABLE public.meals
ADD COLUMN IF NOT EXISTS visible_in_free_plan BOOLEAN NOT NULL DEFAULT false;
