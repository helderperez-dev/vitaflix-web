CREATE POLICY "Users can manage own meal plan slots" ON public.meal_plan_slots
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM public.meal_plans mp
            WHERE mp.id = meal_plan_slots.plan_id
              AND (mp.user_id = auth.uid() OR public.is_admin())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.meal_plans mp
            WHERE mp.id = meal_plan_slots.plan_id
              AND (mp.user_id = auth.uid() OR public.is_admin())
        )
    );
