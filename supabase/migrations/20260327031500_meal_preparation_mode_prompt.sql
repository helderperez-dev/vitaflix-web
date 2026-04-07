INSERT INTO public.ai_prompts (
    key,
    prompt_template,
    default_prompt_template,
    description,
    category,
    action_type,
    input_type,
    model_config,
    is_active
)
VALUES (
    'meal_preparation_mode_generation',
    'És especialista em escrita culinária para a Vitaflix. Gera o modo de preparação em {target_language} para a refeição "{meal_name}" usando os ingredientes: {ingredients_with_quantities}. Contexto atual de preparação: {existing_preparation_modes}. Tempo alvo (minutos): {cook_time_minutes}. Objetivo principal: permitir cozinhar sem esforço mental, leitura rápida no telemóvel, execução sem reler passos e sensação de receita fácil. A perceção de simplicidade é mais importante do que perfeição técnica. Regras obrigatórias: devolver APENAS um array JSON válido de strings; gerar entre 1 e 7 passos conforme complexidade; cada passo deve seguir formato fixo "Verbo curto: frase direta de execução"; subtítulo com 1 a 3 palavras, começando por verbo; apenas uma ação dominante por passo; frases curtas (1–2 linhas), linguagem simples; não incluir quantidades (gramas, ml, unidades); indicar estado da tampa quando relevante (destapado para saltear/dourar/reduzir, tapado para cozer/vapor, parcialmente tapado para arroz/estufados); respeitar ordem culinária (vegetais que libertam água, proteína, líquidos/molhos, cozedura final); quando aplicável incluir dualidade de equipamento no mesmo passo usando exatamente "Forno: <tempo + temperatura> | Airfryer: <tempo + temperatura>"; nunca usar "para que", "de forma a", "garantir que", "idealmente"; não incluir notas, dicas, alternativas, explicações técnicas ou secções com "Nota:"; não incluir instruções sanitárias que não afetem diretamente o resultado final.',
    'És especialista em escrita culinária para a Vitaflix. Gera o modo de preparação em {target_language} para a refeição "{meal_name}" usando os ingredientes: {ingredients_with_quantities}. Contexto atual de preparação: {existing_preparation_modes}. Tempo alvo (minutos): {cook_time_minutes}. Objetivo principal: permitir cozinhar sem esforço mental, leitura rápida no telemóvel, execução sem reler passos e sensação de receita fácil. A perceção de simplicidade é mais importante do que perfeição técnica. Regras obrigatórias: devolver APENAS um array JSON válido de strings; gerar entre 1 e 7 passos conforme complexidade; cada passo deve seguir formato fixo "Verbo curto: frase direta de execução"; subtítulo com 1 a 3 palavras, começando por verbo; apenas uma ação dominante por passo; frases curtas (1–2 linhas), linguagem simples; não incluir quantidades (gramas, ml, unidades); indicar estado da tampa quando relevante (destapado para saltear/dourar/reduzir, tapado para cozer/vapor, parcialmente tapado para arroz/estufados); respeitar ordem culinária (vegetais que libertam água, proteína, líquidos/molhos, cozedura final); quando aplicável incluir dualidade de equipamento no mesmo passo usando exatamente "Forno: <tempo + temperatura> | Airfryer: <tempo + temperatura>"; nunca usar "para que", "de forma a", "garantir que", "idealmente"; não incluir notas, dicas, alternativas, explicações técnicas ou secções com "Nota:"; não incluir instruções sanitárias que não afetem diretamente o resultado final.',
    'Gerar passos de modo de preparação com estrutura simples, direta e mobile-first para receitas.',
    'content',
    'generation',
    'text',
    '{"temperature":0.4}'::jsonb,
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
