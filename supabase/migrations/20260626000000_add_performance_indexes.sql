-- Create missing indexes to prevent high Disk I/O consumption

-- Index for meal options by associated meal (solves sequential scan of ~111,000 rows)
CREATE INDEX IF NOT EXISTS idx_meal_options_associated_meal_id ON public.meal_options (associated_meal_id);

-- Index for leads by funnel (solves sequential scan of ~25,000 rows)
CREATE INDEX IF NOT EXISTS idx_leads_funnel_id ON public.leads (funnel_id);

-- Index for scheduled meals by day (solves sequential scans for daily schedules)
CREATE INDEX IF NOT EXISTS idx_scheduled_meals_schedule_day_id ON public.scheduled_meals (schedule_day_id);

-- Index for meals visibility (solves sequential scan when filtering public meals)
CREATE INDEX IF NOT EXISTS idx_meals_is_public ON public.meals (is_public);

-- Index for meal plans by user (solves sequential scan on user profiles)
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON public.meal_plans (user_id);
