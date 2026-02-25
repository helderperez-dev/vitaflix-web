# Vitaflix: The Content-First Nutritional Engine

Vitaflix is a modern, cross-platform "Netflix for Recipes" platform designed to solve nutritional decision fatigue through caloric precision and high-quality curated content.

## 🚀 The Product (The "Wedge")

Traditional recipe apps provide generic information. Vitaflix differentiates itself through **Caloric Versatility (MealOptions)**: every recipe is available in multiple precise caloric versions (200, 300, 400, and 500 kcal). The recipe adapts to the user's specific daily target, not the other way around.

### Core Value Pillars
- **The "Netflix" Experience**: High-engagement UI focused on browsing premium recipe content.
- **Automated Ecosystem**: Seamless flow from recipe selection to Meal Plan updates and automated Shopping List generation.
- **Precision Nutrition**: Integrated onboarding capturing physical data (BMR/TMB) to personalize the content feed instantly.

## 🛠 Technology Stack

Vitaflix is built with a unified **TypeScript-first stack** for maximum cross-platform consistency:

- **Web App & Admin Panel**: [Next.js](https://nextjs.org/) (App Router)
- **Mobile Apps**: [React Native](https://reactnative.dev/) (Android + iOS)
- **Backend & Data**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **Validation**: [Zod](https://zod.dev/) (Shared schemas for all layers)
- **Styling**: Tailwind CSS (Web)
- **Payments**: Stripe (Primary Factory Implementation)

## 📂 Project Structure

- `/.docs`: Comprehensive documentation for product context, features, and domain models.
- `/.ai-instructions`: Mandatory development guardrails for both Humans and AI Agents.
- `/vitaflix-flows`: Detailed technical maps for all key user and administrative journeys.
- `libs/shared`: (Planned) Shared Zod schemas and cross-platform utility libraries.

## 🏗 Architectural Principles

1. **Shared Schemas**: All data structures are defined by shared Zod schemas to ensure absolute consistency between the Mobile App, Web Admin, and Database.
2. **Mobile-Balanced API**: Domain-level logic is shared or encapsulated, ensuring the Mobile experience is robust and independent of the Web frontend.
3. **Provider Pattern for Payments**: All payment integrations (Stripe, PayPal) use a Factory interface to allow for future modularity.
4. **Localization First**: All user-facing content (names, instructions) is stored in JSON format to support Portuguese (PT) and English (EN) natively.

## 🛡 Development Guardrails

All development in this repository **must** adhere to the mandatory guardrails defined in `/.ai-instructions/`:

- **[AI_INSTRUCTIONS.md](./.ai-instructions/AI_INSTRUCTIONS.md)**: Mandatory LLM behavior and safety rules.
- **[ARCHITECTURE.md](./.ai-instructions/ARCHITECTURE.md)**: Structural boundaries and dependency rules.
- **[CODING_GUIDELINES.md](./.ai-instructions/CODING_GUIDELINES.md)**: Language, naming, and error handling standards.
- **[SECURITY.md](./.ai-instructions/SECURITY.md)**: Data protection and RLS requirements.
- **[TESTING.md](./.ai-instructions/TESTING.md)**: Testing expectations for the "Nutritional Engine."

## 📈 Roadmap (2026)

Evolution from a content platform into a **Data-Driven Nutritional Companion**, leveraging AI for semantic recommendations and real-time habit tracking.
