import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const messagesDir = path.join(root, "messages");
const srcDir = path.join(root, "src");
const defaultLocale = "en";

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function flattenKeys(value, prefix = "", output = {}) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return output;
    }

    for (const [key, nested] of Object.entries(value)) {
        const full = prefix ? `${prefix}.${key}` : key;
        if (nested && typeof nested === "object" && !Array.isArray(nested)) {
            flattenKeys(nested, full, output);
        } else {
            output[full] = nested;
        }
    }

    return output;
}

function listCodeFiles(dirPath) {
    const found = [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name.startsWith(".")) continue;
        const full = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            found.push(...listCodeFiles(full));
            continue;
        }
        if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
            found.push(full);
        }
    }
    return found;
}

function collectTranslationCalls(source) {
    const aliases = new Map();
    const hookPattern = /const\s+(\w+)\s*=\s*useTranslations\(\s*["'`]([^"'`]+)["'`]\s*\)/g;
    const serverPattern = /const\s+(\w+)\s*=\s*(?:await\s+)?getTranslations\(\s*["'`]([^"'`]+)["'`]\s*\)/g;

    for (const match of source.matchAll(hookPattern)) {
        aliases.set(match[1], match[2]);
    }
    for (const match of source.matchAll(serverPattern)) {
        aliases.set(match[1], match[2]);
    }

    const calls = [];
    for (const [alias, namespace] of aliases.entries()) {
        const callPattern = new RegExp(`\\b${alias}\\(\\s*["'\`]([^"'\`]+)["'\`]`, "g");
        for (const match of source.matchAll(callPattern)) {
            const key = match[1];
            if (key.includes("${")) continue;
            if (!/^[\w.-]+$/.test(key)) continue;
            calls.push({
                namespace,
                key,
            });
        }
    }

    return calls;
}

const localeFiles = fs
    .readdirSync(messagesDir)
    .filter((name) => name.endsWith(".json"))
    .sort();

const locales = localeFiles.map((name) => name.replace(".json", ""));
if (!locales.includes(defaultLocale)) {
    console.error(`Missing default locale file: ${defaultLocale}.json`);
    process.exit(1);
}

const messagesByLocale = Object.fromEntries(
    locales.map((locale) => [locale, readJson(path.join(messagesDir, `${locale}.json`))])
);
const flatByLocale = Object.fromEntries(
    locales.map((locale) => [locale, flattenKeys(messagesByLocale[locale])])
);
const baseKeys = new Set(Object.keys(flatByLocale[defaultLocale]));

const structureIssues = [];
for (const locale of locales) {
    if (locale === defaultLocale) continue;
    const localeKeys = new Set(Object.keys(flatByLocale[locale]));
    const missing = [...baseKeys].filter((key) => !localeKeys.has(key));
    const extra = [...localeKeys].filter((key) => !baseKeys.has(key));
    if (missing.length || extra.length) {
        structureIssues.push({ locale, missing, extra });
    }
}

const files = listCodeFiles(srcDir);
const missingInBase = [];
const missingPerLocale = Object.fromEntries(locales.map((locale) => [locale, new Set()]));

for (const filePath of files) {
    const source = fs.readFileSync(filePath, "utf8");
    const calls = collectTranslationCalls(source);
    for (const { namespace, key } of calls) {
        const fullKey = `${namespace}.${key}`;
        if (!baseKeys.has(fullKey)) {
            missingInBase.push({
                file: path.relative(root, filePath),
                key: fullKey,
            });
        }
        for (const locale of locales) {
            if (!(fullKey in flatByLocale[locale])) {
                missingPerLocale[locale].add(fullKey);
            }
        }
    }
}

const usedIssues = locales
    .map((locale) => ({
        locale,
        missing: [...missingPerLocale[locale]].sort(),
    }))
    .filter((entry) => entry.missing.length > 0);

console.log("Translation audit summary");
console.log(`Locales: ${locales.join(", ")}`);
console.log(`Scanned files: ${files.length}`);
console.log(`Base key count (${defaultLocale}): ${baseKeys.size}`);

if (structureIssues.length === 0) {
    console.log("Locale structure: OK");
} else {
    console.log("Locale structure: issues found");
    for (const issue of structureIssues) {
        console.log(`- ${issue.locale}: missing=${issue.missing.length}, extra=${issue.extra.length}`);
    }
}

if (missingInBase.length === 0) {
    console.log("Used keys in base locale: OK");
} else {
    console.log(`Used keys missing in ${defaultLocale}: ${missingInBase.length}`);
    for (const item of missingInBase.slice(0, 40)) {
        console.log(`  ${item.key}  (${item.file})`);
    }
}

if (usedIssues.length === 0) {
    console.log("Used keys per locale: OK");
} else {
    console.log("Used keys per locale: issues found");
    for (const issue of usedIssues) {
        console.log(`- ${issue.locale}: missing used keys=${issue.missing.length}`);
        for (const key of issue.missing.slice(0, 40)) {
            console.log(`  ${key}`);
        }
    }
}

const hasIssues = structureIssues.length > 0 || missingInBase.length > 0 || usedIssues.length > 0;
process.exit(hasIssues ? 1 : 0);
