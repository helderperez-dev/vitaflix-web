CREATE TABLE IF NOT EXISTS public.meal_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL CHECK (length(btrim(comment)) > 0),
    images JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(images) = 'array'),
    points_awarded INTEGER NOT NULL DEFAULT 0 CHECK (points_awarded >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (meal_id, user_id)
);

CREATE INDEX IF NOT EXISTS meal_reviews_meal_id_idx ON public.meal_reviews(meal_id);
CREATE INDEX IF NOT EXISTS meal_reviews_user_id_idx ON public.meal_reviews(user_id);
CREATE INDEX IF NOT EXISTS meal_reviews_created_at_idx ON public.meal_reviews(created_at DESC);

CREATE TABLE IF NOT EXISTS public.user_point_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    points INTEGER NOT NULL CHECK (points <> 0),
    reference_type TEXT NOT NULL DEFAULT '',
    reference_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (user_id, action, reference_type, reference_id)
);

CREATE INDEX IF NOT EXISTS user_point_events_user_id_idx ON public.user_point_events(user_id);
CREATE INDEX IF NOT EXISTS user_point_events_action_idx ON public.user_point_events(action);
CREATE INDEX IF NOT EXISTS user_point_events_created_at_idx ON public.user_point_events(created_at DESC);

CREATE TABLE IF NOT EXISTS public.user_points_balances (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    total_points INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO public.system_settings (key, value, description, updated_at)
VALUES ('points_meal_review', '{"points": 10}'::jsonb, 'Points for each meal review action.', timezone('utc'::text, now()))
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.get_points_for_action(action_key text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    configured_points integer;
BEGIN
    SELECT (value->>'points')::integer
    INTO configured_points
    FROM public.system_settings
    WHERE key = concat('points_', action_key);

    RETURN COALESCE(configured_points, 10);
END;
$$;

CREATE OR REPLACE FUNCTION public.award_user_points(
    p_user_id uuid,
    p_action text,
    p_points integer,
    p_reference_type text DEFAULT '',
    p_reference_id uuid DEFAULT NULL,
    p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_event_id uuid;
BEGIN
    IF p_points = 0 THEN
        RETURN NULL;
    END IF;

    INSERT INTO public.user_point_events (user_id, action, points, reference_type, reference_id, metadata)
    VALUES (p_user_id, p_action, p_points, COALESCE(p_reference_type, ''), p_reference_id, COALESCE(p_metadata, '{}'::jsonb))
    ON CONFLICT (user_id, action, reference_type, reference_id) DO NOTHING
    RETURNING id INTO v_event_id;

    IF v_event_id IS NULL THEN
        RETURN NULL;
    END IF;

    INSERT INTO public.user_points_balances (user_id, total_points, updated_at)
    VALUES (p_user_id, p_points, timezone('utc'::text, now()))
    ON CONFLICT (user_id) DO UPDATE
    SET total_points = public.user_points_balances.total_points + EXCLUDED.total_points,
        updated_at = timezone('utc'::text, now());

    RETURN v_event_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_meal_review_before_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.points_awarded := public.get_points_for_action('meal_review');
    END IF;

    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_meal_review_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM public.award_user_points(
        NEW.user_id,
        'meal_review',
        NEW.points_awarded,
        'meal_review',
        NEW.id,
        jsonb_build_object('meal_id', NEW.meal_id, 'rating', NEW.rating)
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS meal_reviews_before_write ON public.meal_reviews;
CREATE TRIGGER meal_reviews_before_write
BEFORE INSERT OR UPDATE ON public.meal_reviews
FOR EACH ROW
EXECUTE FUNCTION public.handle_meal_review_before_write();

DROP TRIGGER IF EXISTS meal_reviews_after_insert_points ON public.meal_reviews;
CREATE TRIGGER meal_reviews_after_insert_points
AFTER INSERT ON public.meal_reviews
FOR EACH ROW
EXECUTE FUNCTION public.handle_meal_review_points();

ALTER TABLE public.meal_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_point_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points_balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read meal reviews" ON public.meal_reviews;
CREATE POLICY "Anyone can read meal reviews" ON public.meal_reviews
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can insert own meal reviews" ON public.meal_reviews;
CREATE POLICY "Users can insert own meal reviews" ON public.meal_reviews
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own meal reviews" ON public.meal_reviews;
CREATE POLICY "Users can update own meal reviews" ON public.meal_reviews
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own meal reviews" ON public.meal_reviews;
CREATE POLICY "Users can delete own meal reviews" ON public.meal_reviews
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage meal reviews" ON public.meal_reviews;
CREATE POLICY "Admins can manage meal reviews" ON public.meal_reviews
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users can read own point events" ON public.user_point_events;
CREATE POLICY "Users can read own point events" ON public.user_point_events
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage point events" ON public.user_point_events;
CREATE POLICY "Admins can manage point events" ON public.user_point_events
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users can read own points balance" ON public.user_points_balances;
CREATE POLICY "Users can read own points balance" ON public.user_points_balances
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage points balances" ON public.user_points_balances;
CREATE POLICY "Admins can manage points balances" ON public.user_points_balances
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users can upload own meal review images" ON "storage"."objects";
CREATE POLICY "Users can upload own meal review images"
ON "storage"."objects"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'vitaflix'
    AND split_part(name, '/', 1) = 'meal-reviews'
    AND split_part(name, '/', 2) = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can update own meal review images" ON "storage"."objects";
CREATE POLICY "Users can update own meal review images"
ON "storage"."objects"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'vitaflix'
    AND split_part(name, '/', 1) = 'meal-reviews'
    AND split_part(name, '/', 2) = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'vitaflix'
    AND split_part(name, '/', 1) = 'meal-reviews'
    AND split_part(name, '/', 2) = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can delete own meal review images" ON "storage"."objects";
CREATE POLICY "Users can delete own meal review images"
ON "storage"."objects"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (
    bucket_id = 'vitaflix'
    AND split_part(name, '/', 1) = 'meal-reviews'
    AND split_part(name, '/', 2) = auth.uid()::text
);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_publication
        WHERE pubname = 'supabase_realtime'
    ) AND NOT EXISTS (
        SELECT 1
        FROM pg_publication_rel pr
        JOIN pg_class c ON c.oid = pr.prrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        JOIN pg_publication p ON p.oid = pr.prpubid
        WHERE p.pubname = 'supabase_realtime'
          AND n.nspname = 'public'
          AND c.relname = 'meal_reviews'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.meal_reviews;
    END IF;
END;
$$;
