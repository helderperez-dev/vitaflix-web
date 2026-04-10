CREATE TABLE IF NOT EXISTS public.wellness_paces ( 
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY, 
  name jsonb NOT NULL, 
  slug text NOT NULL UNIQUE, 
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL, 
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL 
); 

ALTER TABLE public.wellness_paces ENABLE ROW LEVEL SECURITY; 

DO $$ 
BEGIN 
    IF NOT EXISTS ( 
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'wellness_paces' AND policyname = 'Allow read access for all users' 
    ) THEN 
        CREATE POLICY "Allow read access for all users" ON public.wellness_paces FOR SELECT USING (true); 
    END IF; 
END $$; 

DO $$ 
BEGIN 
    IF NOT EXISTS ( 
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'wellness_paces' AND policyname = 'Allow full access for admins' 
    ) THEN 
        CREATE POLICY "Allow full access for admins" ON public.wellness_paces FOR ALL USING ( 
          EXISTS ( 
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() AND users.role = 'admin'
          ) 
        ); 
    END IF; 
END $$; 

INSERT INTO public.wellness_paces (name, slug) VALUES 
  ('{"en": "Sustainable", "pt": "Sustentável"}'::jsonb, 'slow'), 
  ('{"en": "Balanced", "pt": "Equilibrado"}'::jsonb, 'balanced'), 
  ('{"en": "Fast", "pt": "Rápido"}'::jsonb, 'fast') 
ON CONFLICT (slug) DO NOTHING; 