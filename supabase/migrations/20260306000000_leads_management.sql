-- Create Lead Funnels table
CREATE TABLE public.lead_funnels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create Lead Funnel Steps table
CREATE TABLE public.lead_funnel_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    funnel_id UUID REFERENCES public.lead_funnels(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create Leads table
CREATE TABLE public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    source TEXT,
    funnel_id UUID REFERENCES public.lead_funnels(id) ON DELETE SET NULL,
    step_id UUID REFERENCES public.lead_funnel_steps(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_archived BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT leads_contact_check CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_funnels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_funnel_steps;

-- Enable RLS
ALTER TABLE public.lead_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_funnel_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow admins to do everything
CREATE POLICY "Admins can manage lead_funnels" ON public.lead_funnels
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage lead_funnel_steps" ON public.lead_funnel_steps
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage leads" ON public.leads
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

-- Allow anonymous inserts to leads via public API
CREATE POLICY "Anyone can insert leads" ON public.leads
    FOR INSERT WITH CHECK (true);
