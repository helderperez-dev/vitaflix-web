"use server"

import { createClient } from "@/lib/supabase/server"

type PromptKey =
    | "text_generation"
    | "text_enhancement"
    | "text_translation"
    | "image_generation"
    | "image_enhancement"

type PromptRow = {
    key: PromptKey
    prompt_template: string
    model_config: Record<string, unknown> | null
}

type AIRuntimeContext = {
    domain?: string
    entityType?: string
    fieldType?: string
    ingredientProductIds?: string[]
    ingredientNames?: string[]
    preparationModes?: string[]
    cookTimeMinutes?: number
    extra?: string
}

type MealStepIngredientInput = {
    productId?: string
    name?: string
    quantity: number
    unit?: string
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

function normalizeLanguage(locale: string) {
    const normalized = locale.toLowerCase()
    if (normalized === "pt" || normalized === "pt-pt") return "Portuguese (Portugal)"
    if (normalized === "pt-br") return "Portuguese (Brazil)"
    if (normalized === "es") return "Spanish"
    return "English"
}

function fillPromptTemplate(template: string, variables: Record<string, string>) {
    return template.replace(/\{([^}]+)\}/g, (_, rawKey: string) => {
        const key = rawKey.trim()
        return variables[key] ?? ""
    })
}

function extractLocalizedText(input: unknown) {
    if (typeof input === "string") return input
    if (!input || typeof input !== "object") return ""
    const dictionary = input as Record<string, unknown>
    const preferredOrder = ["en", "pt-pt", "pt-br", "es"]
    for (const key of preferredOrder) {
        const candidate = dictionary[key]
        if (typeof candidate === "string" && candidate.trim()) return candidate.trim()
    }
    const fallback = Object.values(dictionary).find(value => typeof value === "string" && value.trim())
    return typeof fallback === "string" ? fallback.trim() : ""
}

async function getPromptByKey(key: PromptKey): Promise<PromptRow | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from("ai_prompts")
        .select("key, prompt_template, model_config")
        .eq("key", key)
        .eq("is_active", true)
        .single()

    if (error || !data) {
        return null
    }

    return data as PromptRow
}

async function enrichMealIngredientsFromIds(runtimeContext?: AIRuntimeContext) {
    const ingredientIds = Array.from(new Set(runtimeContext?.ingredientProductIds || []))
    if (ingredientIds.length === 0) {
        return runtimeContext?.ingredientNames || []
    }

    const supabase = await createClient()
    const { data } = await supabase
        .from("products")
        .select("name")
        .in("id", ingredientIds)

    const resolvedNames = (data || [])
        .map(row => extractLocalizedText((row as { name?: unknown }).name))
        .filter(Boolean)

    const combined = [...(runtimeContext?.ingredientNames || []), ...resolvedNames]
    return Array.from(new Set(combined))
}

async function buildContextText(baseContext?: string, runtimeContext?: AIRuntimeContext) {
    const parts: string[] = []
    if (runtimeContext?.domain) parts.push(`Domain: ${runtimeContext.domain}`)
    if (runtimeContext?.entityType) parts.push(`Entity type: ${runtimeContext.entityType}`)
    if (runtimeContext?.fieldType) parts.push(`Field type: ${runtimeContext.fieldType}`)

    const ingredientNames = await enrichMealIngredientsFromIds(runtimeContext)
    if (ingredientNames.length > 0) {
        parts.push(`Ingredients: ${ingredientNames.join(", ")}`)
    }

    if ((runtimeContext?.preparationModes || []).length > 0) {
        parts.push(`Preparation mode: ${(runtimeContext?.preparationModes || []).join(" | ")}`)
    }

    if (typeof runtimeContext?.cookTimeMinutes === "number" && runtimeContext.cookTimeMinutes > 0) {
        parts.push(`Cook time: ${runtimeContext.cookTimeMinutes} minutes`)
    }

    if (runtimeContext?.extra?.trim()) {
        parts.push(`Extra context: ${runtimeContext.extra.trim()}`)
    }

    if (baseContext?.trim()) {
        parts.unshift(baseContext.trim())
    }

    return parts.join(". ")
}

function extractTextFromChoice(choice: any) {
    const content = choice?.message?.content
    if (typeof content === "string") return content.trim()
    if (Array.isArray(content)) {
        const text = content
            .map((part: any) => {
                if (typeof part === "string") return part
                if (part?.type === "text") return part.text || ""
                return ""
            })
            .join(" ")
            .trim()
        return text
    }
    return ""
}

function extractImageDataUrl(choice: any) {
    const images = choice?.message?.images
    if (Array.isArray(images) && images.length > 0) {
        const first = images[0]
        return first?.image_url?.url || first?.imageUrl?.url || ""
    }
    const content = choice?.message?.content
    if (Array.isArray(content)) {
        const imagePart = content.find((part: any) => part?.type === "image_url")
        if (imagePart?.image_url?.url) return imagePart.image_url.url
    }
    return ""
}

function parseStepsFromText(raw: string) {
    const fenced = raw.replace(/```json|```/gi, "").trim()
    try {
        const parsed = JSON.parse(fenced)
        if (Array.isArray(parsed)) {
            return parsed.map(step => String(step).trim()).filter(Boolean)
        }
    } catch {
    }
    return fenced
        .split("\n")
        .map(line => line.replace(/^\s*\d+[\).\-\:]\s*/, "").replace(/^\s*[-•]\s*/, "").trim())
        .filter(Boolean)
}

async function callOpenRouter(payload: Record<string, unknown>) {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
        throw new Error("Missing OPENROUTER_API_KEY")
    }

    const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
    })

    if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(errorBody || "OpenRouter request failed")
    }

    return response.json()
}

export async function generateTextWithAI(input: {
    action: "generate" | "enhance"
    inputText: string
    targetLanguage: string
    fieldLabel: string
    entityName?: string
    context?: string
    runtimeContext?: AIRuntimeContext
}) {
    try {
        const promptKey: PromptKey = input.action === "enhance" ? "text_enhancement" : "text_generation"
        const promptRow = await getPromptByKey(promptKey)
        if (!promptRow) return { error: "Prompt not configured" }

        const resolvedContext = await buildContextText(input.context, input.runtimeContext)
        const prompt = fillPromptTemplate(promptRow.prompt_template, {
            input_text: input.inputText || "",
            target_language: normalizeLanguage(input.targetLanguage),
            source_language: normalizeLanguage(input.targetLanguage),
            system_language: normalizeLanguage(input.targetLanguage),
            field_label: input.fieldLabel || "text",
            entity_name: input.entityName || "",
            context: resolvedContext,
        })

        const model = process.env.OPENROUTER_MODEL_TEXT_TO_TEXT || "openai/gpt-5"
        const json = await callOpenRouter({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature: Number((promptRow.model_config?.temperature as number) ?? 0.5),
        })

        const text = extractTextFromChoice(json?.choices?.[0])
        if (!text) return { error: "AI returned an empty response" }
        return { text }
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Failed to process text with AI" }
    }
}

export async function translateTextWithAI(input: {
    sourceText: string
    sourceLanguage: string
    targetLanguages: string[]
    fieldLabel: string
    entityName?: string
    context?: string
    runtimeContext?: AIRuntimeContext
}) {
    try {
        const promptRow = await getPromptByKey("text_translation")
        if (!promptRow) return { error: "Prompt not configured" }
        if (!input.sourceText.trim()) return { error: "Source text is required" }

        const resolvedContext = await buildContextText(input.context, input.runtimeContext)
        const model = process.env.OPENROUTER_MODEL_TEXT_TO_TEXT || "openai/gpt-5"
        const translations: Record<string, string> = {}

        for (const language of input.targetLanguages) {
            const prompt = fillPromptTemplate(promptRow.prompt_template, {
                input_text: input.sourceText,
                target_language: normalizeLanguage(language),
                source_language: normalizeLanguage(input.sourceLanguage),
                system_language: normalizeLanguage(language),
                field_label: input.fieldLabel || "text",
                entity_name: input.entityName || "",
                context: resolvedContext,
            })

            const json = await callOpenRouter({
                model,
                messages: [{ role: "user", content: prompt }],
                temperature: Number((promptRow.model_config?.temperature as number) ?? 0.2),
            })
            const text = extractTextFromChoice(json?.choices?.[0])
            if (text) {
                translations[language] = text
            }
        }

        return { translations }
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Failed to translate text with AI" }
    }
}

export async function generateImageWithAI(input: {
    entityName: string
    context?: string
    runtimeContext?: AIRuntimeContext
}) {
    try {
        const promptRow = await getPromptByKey("image_generation")
        if (!promptRow) return { error: "Prompt not configured" }

        const resolvedContext = await buildContextText(input.context, input.runtimeContext)
        const prompt = fillPromptTemplate(promptRow.prompt_template, {
            input_text: "",
            target_language: "English",
            source_language: "English",
            system_language: "English",
            field_label: "image",
            entity_name: input.entityName || "food",
            context: resolvedContext,
        })

        const model = process.env.OPENROUTER_MODEL_TEXT_TO_IMAGE || "openai/gpt-5-image"
        const json = await callOpenRouter({
            model,
            messages: [{ role: "user", content: prompt }],
            modalities: ["image", "text"],
            image_config: promptRow.model_config || { aspect_ratio: "1:1", image_size: "2K" },
        })

        const imageDataUrl = extractImageDataUrl(json?.choices?.[0])
        if (!imageDataUrl) return { error: "AI did not return an image" }
        return { imageDataUrl }
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Failed to generate image with AI" }
    }
}

export async function enhanceImageWithAI(input: {
    imageUrl: string
    entityName: string
    context?: string
    runtimeContext?: AIRuntimeContext
}) {
    try {
        const promptRow = await getPromptByKey("image_enhancement")
        if (!promptRow) return { error: "Prompt not configured" }
        if (!input.imageUrl) return { error: "Image URL is required" }

        const resolvedContext = await buildContextText(input.context, input.runtimeContext)
        const prompt = fillPromptTemplate(promptRow.prompt_template, {
            input_text: "",
            target_language: "English",
            source_language: "English",
            system_language: "English",
            field_label: "image",
            entity_name: input.entityName || "food",
            context: resolvedContext,
        })

        const model = process.env.OPENROUTER_MODEL_TEXT_TO_IMAGE || "openai/gpt-5-image"
        const json = await callOpenRouter({
            model,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: input.imageUrl } },
                    ],
                },
            ],
            modalities: ["image", "text"],
            image_config: promptRow.model_config || { aspect_ratio: "1:1", image_size: "2K" },
        })

        const imageDataUrl = extractImageDataUrl(json?.choices?.[0])
        if (!imageDataUrl) return { error: "AI did not return an enhanced image" }
        return { imageDataUrl }
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Failed to enhance image with AI" }
    }
}

export async function generateMealPreparationStepsWithAI(input: {
    targetLanguage: string
    mealName: string
    ingredients: MealStepIngredientInput[]
    existingPreparationModes?: string[]
    cookTimeMinutes?: number
}) {
    try {
        if (!input.ingredients.length) {
            return { error: "Ingredients are required to generate steps" }
        }

        const ingredientIds = Array.from(
            new Set(input.ingredients.map(ingredient => ingredient.productId).filter(Boolean))
        ) as string[]

        const productNameById: Record<string, string> = {}
        if (ingredientIds.length > 0) {
            const supabase = await createClient()
            const { data } = await supabase
                .from("products")
                .select("id, name")
                .in("id", ingredientIds)

            ;(data || []).forEach((row: any) => {
                const localized = extractLocalizedText(row?.name)
                if (row?.id && localized) {
                    productNameById[row.id] = localized
                }
            })
        }

        const ingredientLines = input.ingredients.map((ingredient) => {
            const resolvedName = ingredient.name || (ingredient.productId ? productNameById[ingredient.productId] : "") || "ingredient"
            const quantity = Number(ingredient.quantity || 0)
            const unit = ingredient.unit || ""
            return `${quantity} ${unit}`.trim() + ` ${resolvedName}`.trim()
        })

        const prompt = [
            `You are a professional recipe writer for a nutrition app.`,
            `Generate clear preparation steps in ${normalizeLanguage(input.targetLanguage)}.`,
            `Meal: "${input.mealName || "Meal"}".`,
            `Ingredients with quantities: ${ingredientLines.join("; ")}.`,
            input.cookTimeMinutes ? `Target cook time: about ${input.cookTimeMinutes} minutes.` : "",
            input.existingPreparationModes?.length
                ? `If useful, improve and incorporate this existing preparation context: ${input.existingPreparationModes.join(" | ")}.`
                : "",
            `Return ONLY a valid JSON array of strings.`,
            `Each item must be one concise actionable step.`,
            `Do not include markdown or explanations.`,
        ].filter(Boolean).join(" ")

        const model = process.env.OPENROUTER_MODEL_TEXT_TO_TEXT || "openai/gpt-5"
        const json = await callOpenRouter({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
        })

        const text = extractTextFromChoice(json?.choices?.[0])
        if (!text) {
            return { error: "AI returned empty steps" }
        }

        const steps = parseStepsFromText(text)
        if (!steps.length) {
            return { error: "Could not parse generated steps" }
        }

        return { steps }
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Failed to generate preparation steps" }
    }
}
