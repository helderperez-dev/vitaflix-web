# ARCHITECTURE.md: Architectural Guardrails

This document defines the structural boundaries and dependency rules for the Vitaflix ecosystem. All development must adhere to these constraints to maintain cross-platform compatibility and system integrity.

## 1. Core Stack Constraints
- **Backend/Data**: Must use **Supabase** (PostgreSQL, Auth, Storage, Edge Functions).
- **Web/Admin**: Must use **Next.js** (App Router).
- **Mobile**: Must use **React Native**.
- **Language**: Must use **TypeScript** for all layers.

## 2. Dependency & Boundary Rules
- **Cross-Platform Logic**: All nutritional calculations (Macros, Kcal targets, BMR) must reside in a **shared utility library** used by both Next.js and React Native.
- **Data Validation**: You must use **Zod** for all data validation. Schemas must be shared via the `libs/` or `packages/` directory to ensure consistency between frontend and backend.
- **API Sovereignty**: Frontend clients must not implement complex business logic. Use Next.js API Routes to encapsulate sensitive rules (e.g., subscription gating, payment processing).
- **Forbidden Dependencies**: Never introduce platform-specific libraries (e.g., `fs`, `path`) into shared logic or mobile components.

## 3. Layer Responsibilities
- **Frontend (Web/Mobile)**: Responsibility is limited to UI rendering, user interaction, and basic state management. No raw SQL or direct DB manipulation from the client.
- **API Layer**: Responsible for enforcing business rules, multi-step transactions, and communicating with external providers (Stripe/PayPal).
- **Database (Supabase)**: Source of truth for all persistent state. Schema changes must be reflected in `vitaflix.sql`.

## 4. Folder Ownership
- `libs/shared`: Contains Zod schemas, types, and universal utility functions.
- `apps/admin`: Next.js application for internal management.
- `apps/mobile`: React Native codebase for end-users.
- `supabase/`: Contains migrations, RLS policies, and functions.

## 5. Architectural Integrity
- **One Source of Truth**: All multilingual strings (names, preparation steps) must be stored as JSON objects in the database.
- **Decoupling**: Modules must communicate via clearly defined interfaces. Circular dependencies between layers are strictly forbidden.
