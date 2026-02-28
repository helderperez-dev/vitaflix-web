# CODING_GUIDELINES.md: Development Standards

This document defines mandatory coding practices for the Vitaflix repository. These rules ensure code quality, maintainability, and consistency across all contributors and AI agents.

## 1. Language & Typing
- **TypeScript Only**: All new files must be `.ts` or `.tsx`. No modern JavaScript (`.js`/`.jsx`) is allowed.
- **No `any`**: The use of `any` is strictly forbidden. Use `unknown` or define explicit interfaces/types.
- **Strict Compliance**: Ensure `strict` mode is enabled in `tsconfig.json`.

## 2. Internationalization (i18n)
- **Content Storage**: All user-facing strings for recipes, products, and instructions must use the JSON format: `{ "pt": "...", "en": "..." }`.
- **UI Localization**: Use standard i18n libraries for UI components; never hardcode strings in the source code.

## 3. Error Handling & Async
- **Explicit Errors**: Functions must either return a Result-type object or throw specific, typed errors. Never swallow exceptions with empty `catch` blocks.
- **Async Safety**: Use `async/await` exclusively. Avoid raw `.then()`/.`catch()` chains.
- **Wrappers**: Use try/catch blocks in all top-level API handlers and UI event listeners to prevent silent crashes.

## 4. Naming Conventions
- **Files**: Use `kebab-case` for all file names (e.g., `meal-plan-service.ts`).
- **Components**: Use `PascalCase` for React components.
- **Functions/Variables**: Use `camelCase`.
- **Constants**: Use `UPPER_SNAKE_CASE` for global or module-level constants.

## 5. Styling (Web)
- **Tailwind CSS**: Must use Tailwind for all styling. Custom CSS files are forbidden unless for third-party library overrides.
- **Utility First**: Avoid inline styles; use Tailwind utility classes or established design tokens.

## 6. Validation
- **Mandatory Zod**: Every API entry point and form submission must be validated using a Zod schema. 
- **Type Inference**: Use `z.infer<typeof schema>` to generate TypeScript types from Zod schemas to ensure sync.
