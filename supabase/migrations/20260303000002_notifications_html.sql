-- Add html column to notifications
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS html TEXT;

-- Add html column to notification_triggers
ALTER TABLE public.notification_triggers ADD COLUMN IF NOT EXISTS html_template TEXT;

-- Create notification_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    channel notification_channel_enum,
    type TEXT DEFAULT 'marketing',
    subject TEXT,
    body TEXT,
    html TEXT,
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for notification_templates
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Admins can manage templates
CREATE POLICY "Admins can manage templates" ON public.notification_templates FOR ALL USING (public.is_admin());
