export type BrandMarketValue = "all" | "continente" | "pingo_doce" | "mercadona" | "lidl" | "auchan" | "intermarche" | "minipreco" | "aldi"
export type BrandMarketSelection = BrandMarketValue[]

type BrandMarketOption = {
    value: BrandMarketValue
    label: {
        pt: string
        en: string
    }
    aliases: string[]
}

export const BRAND_MARKET_OPTIONS: BrandMarketOption[] = [
    {
        value: "all",
        label: { pt: "Todas as lojas", en: "All stores" },
        aliases: ["Todas as lojas", "All stores", "Vários", "Varios", "Various", "Multilojas", "Multi-store"],
    },
    {
        value: "continente",
        label: { pt: "Continente", en: "Continente" },
        aliases: ["Continente"],
    },
    {
        value: "pingo_doce",
        label: { pt: "Pingo Doce", en: "Pingo Doce" },
        aliases: ["Pingo Doce", "Pingo-Doce"],
    },
    {
        value: "mercadona",
        label: { pt: "Mercadona", en: "Mercadona" },
        aliases: ["Mercadona"],
    },
    {
        value: "lidl",
        label: { pt: "Lidl", en: "Lidl" },
        aliases: ["Lidl"],
    },
    {
        value: "auchan",
        label: { pt: "Auchan", en: "Auchan" },
        aliases: ["Auchan"],
    },
    {
        value: "intermarche",
        label: { pt: "Intermarché", en: "Intermarché" },
        aliases: ["Intermarché", "Intermarche"],
    },
    {
        value: "minipreco",
        label: { pt: "Minipreço", en: "Minipreço" },
        aliases: ["Minipreço", "Minipreco"],
    },
    {
        value: "aldi",
        label: { pt: "Aldi", en: "Aldi" },
        aliases: ["Aldi"],
    },
]

function normalizeText(value: string) {
    return value.trim().toLocaleLowerCase("pt-PT")
}

export function getBrandMarketLabel(value: BrandMarketValue, locale: string) {
    const option = BRAND_MARKET_OPTIONS.find((item) => item.value === value) || BRAND_MARKET_OPTIONS[0]
    return locale.startsWith("pt") ? option.label.pt : option.label.en
}

export function normalizeBrandMarketSelection(values?: BrandMarketSelection): BrandMarketSelection {
    const unique = Array.from(new Set(values || []))
    if (unique.length === 0) return ["all"]
    if (unique.includes("all") && unique.length > 1) {
        return unique.filter((value) => value !== "all")
    }
    return unique
}

export function toggleBrandMarketSelection(
    currentValues: BrandMarketSelection,
    selectedValue: BrandMarketValue
): BrandMarketSelection {
    if (selectedValue === "all") return ["all"]
    const base = currentValues.filter((value) => value !== "all")
    if (base.includes(selectedValue)) {
        const next = base.filter((value) => value !== selectedValue)
        return next.length > 0 ? next : ["all"]
    }
    return [...base, selectedValue]
}

export function getBrandMarketSelectionLabel(selection: BrandMarketSelection, locale: string) {
    const normalizedSelection = normalizeBrandMarketSelection(selection)
    if (normalizedSelection.includes("all")) return getBrandMarketLabel("all", locale)
    return normalizedSelection.map((value) => getBrandMarketLabel(value, locale)).join(", ")
}

function findBrandMarketByAlias(alias: string) {
    const normalizedAlias = normalizeText(alias)
    return BRAND_MARKET_OPTIONS.find((option) =>
        option.aliases.some((knownAlias) => normalizeText(knownAlias) === normalizedAlias)
    )?.value
}

export function detectBrandMarketsFromNames(names?: Record<string, string>): BrandMarketSelection {
    const values = Object.values(names || {}).filter(Boolean)
    for (const rawName of values) {
        const separatorIndex = rawName.lastIndexOf(" - ")
        if (separatorIndex < 0) continue
        const suffix = rawName.slice(separatorIndex + 3)
        const parts = suffix.split(",").map((part) => part.trim()).filter(Boolean)
        const detected = parts
            .map((part) => findBrandMarketByAlias(part))
            .filter((part): part is BrandMarketValue => Boolean(part))
        if (detected.length > 0) {
            return normalizeBrandMarketSelection(detected)
        }
    }
    return ["all"]
}

export function removeBrandMarketSuffix(rawName: string) {
    const result = rawName.trim()
    if (!result) return result
    const separatorIndex = result.lastIndexOf(" - ")
    if (separatorIndex < 0) return result
    const suffix = result.slice(separatorIndex + 3)
    const parts = suffix.split(",").map((part) => part.trim()).filter(Boolean)
    const hasOnlyKnownMarkets = parts.length > 0 && parts.every((part) => Boolean(findBrandMarketByAlias(part)))
    if (!hasOnlyKnownMarkets) return result
    return result.slice(0, separatorIndex).trim()
}

export function sanitizeBrandLocalizedNames(names: Record<string, string>): Record<string, string> {
    return Object.entries(names || {}).reduce<Record<string, string>>((acc, [language, value]) => {
        if (!value?.trim()) return acc
        acc[language] = removeBrandMarketSuffix(value)
        return acc
    }, {})
}
