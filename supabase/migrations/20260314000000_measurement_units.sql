CREATE TABLE public.measurement_units (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name JSONB NOT NULL,
    slug TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE public.products
    ADD COLUMN unit_id UUID REFERENCES public.measurement_units(id) ON DELETE SET NULL;

CREATE INDEX products_unit_id_idx ON public.products(unit_id);

ALTER TABLE public.measurement_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read measurement_units" ON public.measurement_units
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage measurement_units" ON public.measurement_units
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );
