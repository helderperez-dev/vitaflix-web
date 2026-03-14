CREATE TABLE IF NOT EXISTS public.countries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name JSONB NOT NULL,
    slug TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.product_countries (
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, country_id)
);

CREATE TABLE IF NOT EXISTS public.meal_countries (
    meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
    country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
    PRIMARY KEY (meal_id, country_id)
);

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS country_id UUID REFERENCES public.countries(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS users_country_id_idx ON public.users(country_id);
CREATE INDEX IF NOT EXISTS product_countries_country_id_idx ON public.product_countries(country_id);
CREATE INDEX IF NOT EXISTS product_countries_product_id_idx ON public.product_countries(product_id);
CREATE INDEX IF NOT EXISTS meal_countries_country_id_idx ON public.meal_countries(country_id);
CREATE INDEX IF NOT EXISTS meal_countries_meal_id_idx ON public.meal_countries(meal_id);

ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_countries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read countries" ON public.countries;
CREATE POLICY "Anyone can read countries" ON public.countries
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage countries" ON public.countries;
CREATE POLICY "Admins can manage countries" ON public.countries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Anyone can read product_countries" ON public.product_countries;
CREATE POLICY "Anyone can read product_countries" ON public.product_countries
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage product_countries" ON public.product_countries;
CREATE POLICY "Admins can manage product_countries" ON public.product_countries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Anyone can read meal_countries" ON public.meal_countries;
CREATE POLICY "Anyone can read meal_countries" ON public.meal_countries
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage meal_countries" ON public.meal_countries;
CREATE POLICY "Admins can manage meal_countries" ON public.meal_countries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

INSERT INTO public.countries (name, slug)
VALUES
    ('{"en":"Portugal","pt-pt":"Portugal","pt-br":"Portugal","es":"Portugal"}'::jsonb, 'pt'),
    ('{"en":"Brazil","pt-pt":"Brasil","pt-br":"Brasil","es":"Brasil"}'::jsonb, 'br')
ON CONFLICT (slug) DO NOTHING;
