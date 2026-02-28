-- 1. Create custom types
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other');
CREATE TYPE objective_enum AS ENUM ('lose_weight', 'gain_muscle', 'maintain');
CREATE TYPE subscription_status_enum AS ENUM ('active', 'canceled', 'incomplete', 'past_due', 'trialing');
CREATE TYPE user_role_enum AS ENUM ('admin', 'user');

-- 2. Users Table (Extends Supabase Auth)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    genre gender_enum,
    height INTEGER CHECK (height BETWEEN 50 AND 250),
    weight DOUBLE PRECISION CHECK (weight BETWEEN 20 AND 300),
    birthday TIMESTAMP WITH TIME ZONE,
    objective objective_enum,
    tmb DOUBLE PRECISION,
    recommended_kcal_intake INTEGER,
    extra_data_complete BOOLEAN DEFAULT FALSE,
    role user_role_enum DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Products (Ingredients)
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name JSONB NOT NULL, -- { "pt": "...", "en": "..." }
    kcal INTEGER NOT NULL CHECK (kcal > 0),
    protein DOUBLE PRECISION DEFAULT 0,
    carbs DOUBLE PRECISION DEFAULT 0,
    fat DOUBLE PRECISION DEFAULT 0,
    tag TEXT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    brand TEXT,
    picture BIGINT,
    brand_picture BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Meals (Recipes Base)
CREATE TABLE public.meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name JSONB NOT NULL,
    meal_types TEXT[] NOT NULL,
    cook_time INTEGER DEFAULT 0,
    preparation_mode JSONB NOT NULL,
    satiety INTEGER CHECK (satiety BETWEEN 0 AND 10),
    restrictions TEXT[],
    publish_on TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Meal Options (Caloric Variations)
CREATE TABLE public.meal_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    associated_meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
    ingredients JSONB NOT NULL, -- Array of { productId, quantity, unit }
    kcal INTEGER NOT NULL CHECK (kcal > 0),
    is_default BOOLEAN DEFAULT FALSE,
    macros JSONB, -- { protein: 0, fat: 0, carbs: 0 }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Meal Plans
CREATE TABLE public.meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    selected_meals JSONB NOT NULL, -- Mapping options to slots
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Subscriptions
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    paypal_subscription_id TEXT UNIQUE,
    status subscription_status_enum NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Transactions
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    provider_transaction_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Shopping Lists 
CREATE TABLE public.shopping_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.shopping_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shopping_list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity DOUBLE PRECISION NOT NULL,
    unit TEXT NOT NULL,
    checked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configure RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check Admin Status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
DECLARE
    user_role user_role_enum;
BEGIN
    SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
    RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users Policies
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Admins can manage users" ON public.users FOR ALL USING (public.is_admin());

-- Products Policies
CREATE POLICY "Anyone can read public products" ON public.products FOR SELECT USING (is_public = true OR public.is_admin());
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (public.is_admin());

-- Meals & Options Policies
CREATE POLICY "Anyone can read meals" ON public.meals FOR SELECT USING (true);
CREATE POLICY "Admins can manage meals" ON public.meals FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can read meal options" ON public.meal_options FOR SELECT USING (true);
CREATE POLICY "Admins can manage meal options" ON public.meal_options FOR ALL USING (public.is_admin());

-- Personal Data Policies (Plans, Subs, Shopping)
CREATE POLICY "Users can manage own meal plans" ON public.meal_plans FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can read own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage transactions" ON public.transactions FOR ALL USING (public.is_admin());
CREATE POLICY "Users can manage own shopping lists" ON public.shopping_lists FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can manage own shopping items" ON public.shopping_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.shopping_lists sl WHERE sl.id = shopping_list_id AND (sl.user_id = auth.uid() OR public.is_admin()))
);
