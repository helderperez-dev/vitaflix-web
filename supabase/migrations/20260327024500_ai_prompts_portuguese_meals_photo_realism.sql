UPDATE public.ai_prompts
SET
    prompt_template = v.prompt_template,
    default_prompt_template = v.default_prompt_template,
    description = v.description,
    updated_at = timezone('utc'::text, now())
FROM (
    VALUES
    (
        'text_generation',
        'És o copiloto de escrita da app de nutrição Vitaflix. Cria texto claro e natural para o campo "{field_label}" em {target_language}, respeitando o vocabulário local. Contexto base: "{context}". Entidade: "{entity_name}". Referência de entrada: "{input_text}". Devolve apenas o texto final, pronto a usar no campo, sem explicações extra.',
        'És o copiloto de escrita da app de nutrição Vitaflix. Cria texto claro e natural para o campo "{field_label}" em {target_language}, respeitando o vocabulário local. Contexto base: "{context}". Entidade: "{entity_name}". Referência de entrada: "{input_text}". Devolve apenas o texto final, pronto a usar no campo, sem explicações extra.',
        'Gerar texto novo para um campo, no tom e idioma da app.'
    ),
    (
        'text_enhancement',
        'És um editor sénior para conteúdos de nutrição e receitas. Melhora o texto seguinte em {target_language}, preservando significado factual e intenção: "{input_text}". Otimiza clareza, legibilidade, consistência de tom e gramática. Mantém o resultado conciso e pronto para uso no campo. Não adiciones markdown nem explicações.',
        'És um editor sénior para conteúdos de nutrição e receitas. Melhora o texto seguinte em {target_language}, preservando significado factual e intenção: "{input_text}". Otimiza clareza, legibilidade, consistência de tom e gramática. Mantém o resultado conciso e pronto para uso no campo. Não adiciones markdown nem explicações.',
        'Melhorar qualidade e clareza de texto existente.'
    ),
    (
        'text_translation',
        'Traduz o texto abaixo de {source_language} para {target_language} para a app Vitaflix. Preserva significado, terminologia nutricional e tom da marca. Entrada: "{input_text}". Devolve apenas o texto traduzido.',
        'Traduz o texto abaixo de {source_language} para {target_language} para a app Vitaflix. Preserva significado, terminologia nutricional e tom da marca. Entrada: "{input_text}". Devolve apenas o texto traduzido.',
        'Traduzir texto para outro idioma suportado pela app.'
    ),
    (
        'image_generation',
        'Cria uma fotografia realista de refeição para a Vitaflix com o tema "{entity_name}". Objetivo visual: foto bonita e profissional, mas com aspeto caseiro e autêntico, como comida preparada por uma pessoa comum (não empratamento de chef nem estilo publicitário exagerado). Mantém aparência natural dos ingredientes, porções reais e pequenas imperfeições normais da confeção. Usa luz natural suave, cores fiéis e equilibradas, contraste moderado, nitidez limpa e sombra suave. Composição em ambiente real (mesa/bancada e contexto discreto do dia a dia), sem cenário artificial de estúdio. Sem texto, sem logótipos, sem marcas de água, sem artefactos irreais.',
        'Cria uma fotografia realista de refeição para a Vitaflix com o tema "{entity_name}". Objetivo visual: foto bonita e profissional, mas com aspeto caseiro e autêntico, como comida preparada por uma pessoa comum (não empratamento de chef nem estilo publicitário exagerado). Mantém aparência natural dos ingredientes, porções reais e pequenas imperfeições normais da confeção. Usa luz natural suave, cores fiéis e equilibradas, contraste moderado, nitidez limpa e sombra suave. Composição em ambiente real (mesa/bancada e contexto discreto do dia a dia), sem cenário artificial de estúdio. Sem texto, sem logótipos, sem marcas de água, sem artefactos irreais.',
        'Gerar imagens novas de refeições com aspeto real, caseiro e qualidade fotográfica profissional.'
    ),
    (
        'image_enhancement',
        'Melhora a fotografia enviada da refeição da Vitaflix preservando totalmente o prato original e o cenário original. Não recries a imagem nem mudes a comida, os ingredientes, a loiça, o fundo, os adereços, a disposição ou as porções. Apenas aplica melhorias fotográficas subtis, no estilo de edição profissional (tipo Lightroom): ajuste fino de exposição, balanço de brancos, realce de luz/sombra, contraste moderado, cor natural, redução de ruído, nitidez e, quando necessário, correção leve de perspetiva/ângulo sem alterar a composição real. O resultado deve parecer a mesma foto, só que mais bonita, limpa e profissional, mantendo autenticidade caseira. Sem texto, sem logótipos, sem marcas de água, sem artefactos irreais.',
        'Melhora a fotografia enviada da refeição da Vitaflix preservando totalmente o prato original e o cenário original. Não recries a imagem nem mudes a comida, os ingredientes, a loiça, o fundo, os adereços, a disposição ou as porções. Apenas aplica melhorias fotográficas subtis, no estilo de edição profissional (tipo Lightroom): ajuste fino de exposição, balanço de brancos, realce de luz/sombra, contraste moderado, cor natural, redução de ruído, nitidez e, quando necessário, correção leve de perspetiva/ângulo sem alterar a composição real. O resultado deve parecer a mesma foto, só que mais bonita, limpa e profissional, mantendo autenticidade caseira. Sem texto, sem logótipos, sem marcas de água, sem artefactos irreais.',
        'Melhorar fotos já carregadas preservando prato e cenário originais, com edição fotográfica profissional e natural.'
    )
) AS v(key, prompt_template, default_prompt_template, description)
WHERE public.ai_prompts.key = v.key;
