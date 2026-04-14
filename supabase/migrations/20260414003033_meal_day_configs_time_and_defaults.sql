-- Add time column to meal_day_configurations
ALTER TABLE public.meal_day_configurations
ADD COLUMN IF NOT EXISTS "time" TIME;

-- Update existing records with default times based on slot index (assuming 3 or 6 meals exist)
UPDATE public.meal_day_configurations 
SET "time" = CASE 
    WHEN daily_meals_count = 3 THEN 
        CASE slot_index 
            WHEN 0 THEN '08:00:00'::TIME
            WHEN 1 THEN '13:00:00'::TIME
            WHEN 2 THEN '20:00:00'::TIME
            ELSE '12:00:00'::TIME
        END
    WHEN daily_meals_count = 6 THEN
        CASE slot_index
            WHEN 0 THEN '08:00:00'::TIME
            WHEN 1 THEN '10:30:00'::TIME
            WHEN 2 THEN '13:00:00'::TIME
            WHEN 3 THEN '16:30:00'::TIME
            WHEN 4 THEN '20:00:00'::TIME
            WHEN 5 THEN '22:30:00'::TIME
            ELSE '12:00:00'::TIME
        END
    ELSE '12:00:00'::TIME
END
WHERE "time" IS NULL;

-- Insert default configurations for missing daily meal counts (1, 2, 4, 5) if they don't exist
DO $$
DECLARE
    v_breakfast_id UUID := '091a0015-ae02-4aac-857e-cb8a6024c3be';
    v_lunch_id UUID := '1bcf782e-22db-40f0-b383-cd9070db59d3';
    v_dinner_id UUID := '60178a3f-6288-4100-a2bc-4d4e72adfdc1';
    v_snack_id UUID := '1c5900cf-c357-4180-affe-1ff5d0f31c05';
BEGIN
    -- 1 Meal
    IF NOT EXISTS (SELECT 1 FROM public.meal_day_configurations WHERE daily_meals_count = 1) THEN
        INSERT INTO public.meal_day_configurations (daily_meals_count, slot_index, category_id, "time")
        VALUES (1, 0, v_lunch_id, '13:00:00');
    END IF;

    -- 2 Meals
    IF NOT EXISTS (SELECT 1 FROM public.meal_day_configurations WHERE daily_meals_count = 2) THEN
        INSERT INTO public.meal_day_configurations (daily_meals_count, slot_index, category_id, "time")
        VALUES 
            (2, 0, v_lunch_id, '13:00:00'),
            (2, 1, v_dinner_id, '20:00:00');
    END IF;

    -- 4 Meals
    IF NOT EXISTS (SELECT 1 FROM public.meal_day_configurations WHERE daily_meals_count = 4) THEN
        INSERT INTO public.meal_day_configurations (daily_meals_count, slot_index, category_id, "time")
        VALUES 
            (4, 0, v_breakfast_id, '08:00:00'),
            (4, 1, v_lunch_id, '13:00:00'),
            (4, 2, v_snack_id, '16:30:00'),
            (4, 3, v_dinner_id, '20:00:00');
    END IF;

    -- 5 Meals
    IF NOT EXISTS (SELECT 1 FROM public.meal_day_configurations WHERE daily_meals_count = 5) THEN
        INSERT INTO public.meal_day_configurations (daily_meals_count, slot_index, category_id, "time")
        VALUES 
            (5, 0, v_breakfast_id, '08:00:00'),
            (5, 1, v_snack_id, '10:30:00'),
            (5, 2, v_lunch_id, '13:00:00'),
            (5, 3, v_snack_id, '16:30:00'),
            (5, 4, v_dinner_id, '20:00:00');
    END IF;
END $$;
