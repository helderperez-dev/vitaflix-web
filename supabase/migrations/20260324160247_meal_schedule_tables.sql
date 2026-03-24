CREATE TABLE IF NOT EXISTS public.meal_plan_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
    slot_key TEXT NOT NULL,
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    default_time TIME NOT NULL,
    default_meal_id UUID REFERENCES public.meals(id) ON DELETE SET NULL,
    default_meal_option_id UUID REFERENCES public.meal_options(id) ON DELETE SET NULL,
    calorie_target INTEGER,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (plan_id, position)
);

CREATE TABLE IF NOT EXISTS public.schedule_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.meal_plans(id) ON DELETE SET NULL,
    schedule_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
    generated_from TEXT NOT NULL DEFAULT 'plan' CHECK (generated_from IN ('plan', 'repeat', 'ai', 'manual')),
    notes TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (user_id, schedule_date)
);

CREATE TABLE IF NOT EXISTS public.scheduled_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_day_id UUID NOT NULL REFERENCES public.schedule_days(id) ON DELETE CASCADE,
    plan_slot_id UUID REFERENCES public.meal_plan_slots(id) ON DELETE SET NULL,
    meal_id UUID REFERENCES public.meals(id) ON DELETE SET NULL,
    meal_option_id UUID REFERENCES public.meal_options(id) ON DELETE SET NULL,
    custom_name TEXT,
    scheduled_time TIME NOT NULL,
    position INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
    completed_at TIMESTAMP WITH TIME ZONE,
    was_overridden BOOLEAN NOT NULL DEFAULT false,
    calorie_target INTEGER,
    notes TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (schedule_day_id, position)
);

CREATE INDEX IF NOT EXISTS meal_plan_slots_plan_position_idx
    ON public.meal_plan_slots(plan_id, position);

CREATE INDEX IF NOT EXISTS schedule_days_user_date_idx
    ON public.schedule_days(user_id, schedule_date);

CREATE INDEX IF NOT EXISTS scheduled_meals_day_time_idx
    ON public.scheduled_meals(schedule_day_id, scheduled_time);

ALTER TABLE public.meal_plan_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_meals ENABLE ROW LEVEL SECURITY;
