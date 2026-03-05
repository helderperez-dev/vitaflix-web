-- Add attachments column to notifications
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
