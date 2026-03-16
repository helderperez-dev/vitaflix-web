ALTER TABLE public.ai_prompts
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'general',
ADD COLUMN IF NOT EXISTS action_type TEXT NOT NULL DEFAULT 'generation',
ADD COLUMN IF NOT EXISTS input_type TEXT NOT NULL DEFAULT 'text',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS default_prompt_template TEXT;

ALTER TABLE public.ai_prompts
DROP CONSTRAINT IF EXISTS ai_prompts_action_type_check;

ALTER TABLE public.ai_prompts
ADD CONSTRAINT ai_prompts_action_type_check CHECK (action_type IN ('generation', 'enhancement', 'translation'));

ALTER TABLE public.ai_prompts
DROP CONSTRAINT IF EXISTS ai_prompts_input_type_check;

ALTER TABLE public.ai_prompts
ADD CONSTRAINT ai_prompts_input_type_check CHECK (input_type IN ('text', 'image'));

UPDATE public.ai_prompts
SET default_prompt_template = prompt_template
WHERE default_prompt_template IS NULL;

INSERT INTO public.ai_prompts (key, prompt_template, default_prompt_template, description, category, action_type, input_type, model_config, is_active)
VALUES
(
    'text_generation',
    'You are the writing copilot for the Vitaflix nutrition app. Create polished copy for the field "{field_label}" in {target_language}. Keep terminology natural for that locale. Base context: "{context}". Entity: "{entity_name}". Input reference: "{input_text}". Keep the response concise, clear, and directly usable in the field with no extra explanations.',
    'You are the writing copilot for the Vitaflix nutrition app. Create polished copy for the field "{field_label}" in {target_language}. Keep terminology natural for that locale. Base context: "{context}". Entity: "{entity_name}". Input reference: "{input_text}". Keep the response concise, clear, and directly usable in the field with no extra explanations.',
    'Generate fresh text for a field using the app tone and locale.',
    'content',
    'generation',
    'text',
    '{"temperature":0.7}'::jsonb,
    true
),
(
    'text_enhancement',
    'You are a senior editor for nutrition and recipe apps. Improve the following text in {target_language} while preserving factual meaning and intent: "{input_text}". Optimize readability, clarity, tone consistency, and grammar. Keep it concise and field-ready. Do not add markdown or explanations.',
    'You are a senior editor for nutrition and recipe apps. Improve the following text in {target_language} while preserving factual meaning and intent: "{input_text}". Optimize readability, clarity, tone consistency, and grammar. Keep it concise and field-ready. Do not add markdown or explanations.',
    'Enhance existing text quality and clarity.',
    'content',
    'enhancement',
    'text',
    '{"temperature":0.4}'::jsonb,
    true
),
(
    'text_translation',
    'Translate the text below from {source_language} to {target_language} for the Vitaflix app. Preserve meaning, nutritional terminology, and brand tone. Input: "{input_text}". Return only the translated text.',
    'Translate the text below from {source_language} to {target_language} for the Vitaflix app. Preserve meaning, nutritional terminology, and brand tone. Input: "{input_text}". Return only the translated text.',
    'Translate text to another supported app language.',
    'localization',
    'translation',
    'text',
    '{"temperature":0.2}'::jsonb,
    true
),
(
    'image_generation',
    'Create a premium food photograph for Vitaflix featuring "{entity_name}". Style: natural daylight, realistic textures, appetizing composition, clean background, editorial food photography, high detail, true-to-life colors, soft shadows, no text overlays, no watermarks.',
    'Create a premium food photograph for Vitaflix featuring "{entity_name}". Style: natural daylight, realistic textures, appetizing composition, clean background, editorial food photography, high detail, true-to-life colors, soft shadows, no text overlays, no watermarks.',
    'Generate product and meal images from scratch in app style.',
    'visual',
    'generation',
    'image',
    '{"aspect_ratio":"1:1","image_size":"2K"}'::jsonb,
    true
),
(
    'image_enhancement',
    'Enhance the provided food image for Vitaflix to look like a professional studio food photo. Keep the same dish identity and ingredients while improving framing, lighting, sharpness, color balance, depth, and plating appeal. Avoid unrealistic artifacts, text overlays, and watermarks.',
    'Enhance the provided food image for Vitaflix to look like a professional studio food photo. Keep the same dish identity and ingredients while improving framing, lighting, sharpness, color balance, depth, and plating appeal. Avoid unrealistic artifacts, text overlays, and watermarks.',
    'Enhance existing uploaded images to professional photography quality.',
    'visual',
    'enhancement',
    'image',
    '{"aspect_ratio":"1:1","image_size":"2K"}'::jsonb,
    true
)
ON CONFLICT (key) DO UPDATE SET
    prompt_template = EXCLUDED.prompt_template,
    default_prompt_template = EXCLUDED.default_prompt_template,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    action_type = EXCLUDED.action_type,
    input_type = EXCLUDED.input_type,
    model_config = EXCLUDED.model_config,
    is_active = EXCLUDED.is_active,
    updated_at = timezone('utc'::text, now());
