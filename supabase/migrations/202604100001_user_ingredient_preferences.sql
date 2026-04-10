-- Create user_ingredient_preferences table
CREATE TABLE IF NOT EXISTS public.user_ingredient_preferences ( 
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, 
    meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE, 
    original_product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE, 
    preferred_product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE, 
    preferred_unit TEXT NOT NULL, 
    preferred_quantity DOUBLE PRECISION NOT NULL, 
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL, 
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL, 
    UNIQUE(user_id, meal_id, original_product_id) 
); 

-- Enable Row Level Security
ALTER TABLE public.user_ingredient_preferences ENABLE ROW LEVEL SECURITY; 

-- Create RLS Policy
DO $$ 
BEGIN 
    IF NOT EXISTS ( 
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_ingredient_preferences' AND policyname = 'Users can manage their own ingredient preferences' 
    ) THEN 
        CREATE POLICY "Users can manage their own ingredient preferences" 
        ON public.user_ingredient_preferences FOR ALL 
        USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    END IF; 
END $$;
