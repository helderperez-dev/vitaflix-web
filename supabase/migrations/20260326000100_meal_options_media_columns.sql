ALTER TABLE public.meal_options
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.meal_options
ADD COLUMN IF NOT EXISTS substitution_notes JSONB;
