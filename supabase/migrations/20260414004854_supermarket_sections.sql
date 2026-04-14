CREATE TABLE IF NOT EXISTS public.supermarket_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name JSONB NOT NULL,
    slug TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.supermarket_sections ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
    IF NOT EXISTS ( 
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'supermarket_sections' AND policyname = 'Allow read access for all users' 
    ) THEN 
        CREATE POLICY "Allow read access for all users" ON public.supermarket_sections FOR SELECT USING (true); 
    END IF; 
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS ( 
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'supermarket_sections' AND policyname = 'Allow full access for admins' 
    ) THEN 
        CREATE POLICY "Allow full access for admins" ON public.supermarket_sections FOR ALL USING ( 
          EXISTS ( 
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
          ) 
        ); 
    END IF; 
END $$;

-- Add relation to products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS supermarket_section_id UUID REFERENCES public.supermarket_sections(id) ON DELETE SET NULL;