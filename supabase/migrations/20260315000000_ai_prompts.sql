CREATE TABLE IF NOT EXISTS public.ai_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    prompt_template TEXT NOT NULL,
    description TEXT,
    model_config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read prompts (needed for client-side generation if any)
-- Or maybe only admins should read prompts? The user wants to use it in the app.
-- Assuming admins configure it, but users (or the system on behalf of users) use it.
-- If the generation happens on the server (via Server Actions), we don't need public read access.
-- But for now, let's allow read for authenticated users to be safe, or just admins if it's strictly admin-facing.
-- The prompt usage is likely in the admin dashboard for creating products/meals.
-- So "Allow admin read access" is probably enough if only admins create content.
-- However, if regular users create recipes, they might need it.
-- Based on file structure `(admin)/dashboard`, it seems this is an admin tool.
-- So I'll restrict to admins for now, can be expanded later.

CREATE POLICY "Allow admin read access to ai_prompts" ON public.ai_prompts FOR SELECT USING (public.is_admin());
CREATE POLICY "Allow admin write access to ai_prompts" ON public.ai_prompts FOR ALL USING (public.is_admin());

-- Seed data
INSERT INTO public.ai_prompts (key, prompt_template, description) VALUES
('text_generation', 'Write a professional description for [context]. Focus on clarity and engagement.', 'General text generation prompt'),
('text_enhancement', 'Improve the following text to be more professional and engaging, while maintaining the original meaning: "[input_text]"', 'Text enhancement prompt'),
('text_translation', 'Translate the following text to [target_language]: "[input_text]"', 'Text translation prompt'),
('image_generation', 'Professional food photography of [product_name]. High resolution, appetizing, natural lighting, 4k.', 'Image generation prompt'),
('image_enhancement', 'Enhance this image to look like professional food photography. Improve lighting, sharpness, and color balance.', 'Image enhancement prompt')
ON CONFLICT (key) DO NOTHING;
