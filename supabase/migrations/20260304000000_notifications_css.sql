-- Add css columns to support more advanced template features
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS css TEXT;
ALTER TABLE public.notification_triggers ADD COLUMN IF NOT EXISTS css_template TEXT;
ALTER TABLE public.notification_templates ADD COLUMN IF NOT EXISTS css TEXT;

-- Remove media_url from templates if no longer needed (user specifically mentioned removing it)
-- Note: Not dropping the column yet to avoid breaking stuff, just removing from UI.
