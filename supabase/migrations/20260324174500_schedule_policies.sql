CREATE POLICY "Users can manage own schedule days" ON public.schedule_days
    FOR ALL
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can manage own scheduled meals" ON public.scheduled_meals
    FOR ALL
    USING (
        EXISTS (
            SELECT 1
            FROM public.schedule_days sd
            WHERE sd.id = scheduled_meals.schedule_day_id
              AND (sd.user_id = auth.uid() OR public.is_admin())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.schedule_days sd
            WHERE sd.id = scheduled_meals.schedule_day_id
              AND (sd.user_id = auth.uid() OR public.is_admin())
        )
    );
