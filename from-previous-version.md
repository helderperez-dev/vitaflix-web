# Vitaflix Recreation Guide: C#/Vue.js to Modern TypeScript Stack

This document serves as a comprehensive technical guide for an AI Agent to recreate the Vitaflix application using a **Supabase-centric TypeScript stack**.

---

## 1. Project Overview
Vitaflix is a fitness and nutrition platform differentiated by its **"Content-First Nutritional Engine"**.
- **Core Strategy**: The "Wedge" is providing recipes in multiple precise caloric versions (200-500 kcal).
- **Target Architecture**: A unified backend (Supabase) serving two main frontends: a **Next.js Admin Panel** (Web) and a **React Native Mobile App** (for end-users).

---

## 2. Technology Stack Mapping (Updated)

| Component | Legacy Stack (C#/Vue) | Target Stack (Modern) |
| :--- | :--- | :--- |
| **Backend & Data** | ASP.NET Core + Npgsql | **Supabase** (Postgres + Auth + Storage) |
| **Logic Layer** | C# Controllers | **Next.js API Routes** (Edge Functions for specific logic) |
| **Web Frontend** | Vue 3 + PrimeVue | **Next.js (Admin Only)** + Tailwind CSS |
| **Mobile Frontend** | (N/A in legacy) | **React Native** (All user features) |
| **Data Validation** | C# Classes / Pydantic-like | **Shared Zod Schemas** (Core for AI-Assisted Dev) |
| **Authentication** | Custom JWT / Passwordless | **Supabase Auth** (Email + Session) |
| **Real-time** | SignalR | **Supabase Realtime** (Presence & DB Changes) |
| **Payments** | Custom Integrations | **Modular Payment Gateway** (Stripe first) |

---

## 3. Database Schema & Domain Model
The database is PostgreSQL hosted on Supabase.

### Core Entities & Attributes
- **User**: `Email`, `Genre` (Male/Female/Other), `Height`, `Weight`, `Birthday`, `Objective` (Lose, Maintain, Gain), `Tmb` (BMR), `RecommendedKcalIntake`.
- **Product (Ingredient)**: `Name (JSON)`, `Kcal`, `Protein`, `Carbs`, `Fat`, `Tag`, `IsPublic`, `Brand`.
- **Meal (Recipe Base)**: `Name (JSON)`, `MealTypes`, `CookTime`, `PreparationMode (JSON)`, `Satiety`, `Restrictions`, `PublishOn`.
- **MealOption (Caloric Variation)**: `AssociatedMealId`, `Ingredients (JSON Matrix)`, `Kcal`, `IsDefault`, `Macros (Protein, Fat, Carbs)`.
- **MealPlan**: `UserId`, `SelectedMeals (JSON mapping options to daily slots)`.
- **ShoppingList**: `UserId`, `ShoppingCategory`, `ShoppingItem` (Quantity, Checked, Unit).
- **Subscription**: `StripeSubscriptionId`, `PayPalSubscriptionId`, `Status`, `TransactionHistory`.

### Secondary Systems
- **Meal Suggestions**: `SuggestionMappings` for auto-generating plans based on target calories.

> [!IMPORTANT]
> **Data Integrity Rules**:
> 1.  **Localization**: All user-facing content (Names, Descriptions) must use JSON format to support PT/EN.
> 2.  **Calorie Precision**: `MealOption` caloric totals must strictly equal the sum of its ingredients' macros.
> 3.  **Default Constraint**: Only one `IsDefault` per `Meal`.

---

## 4. Key Business Logic Flows

### 4.1. Onboarding & Calculation Engine
Registration must capture biometric data to compute **BMR/TMB** and assign a daily calorie target before the home screen is accessible.

### 4.2. Recipe Discovery (The "Netflix" Wedge)
The UI should prioritize a high-engagement browsing experience. When a recipe is selected, the user **must** choose a caloric variation (200-500 kcal) which then populates the Meal Plan and Shopping List.

### 4.3. Automated Shopping List
Items must be auto-populated from the active Meal Plan, grouped by grocery category (Dairy, Meat, etc.), and synced in real-time between Web and Mobile.

---

## 5. Implementation Strategy

### 5.1 Shared Zod Schemas
Create a shared library (`libs/schemas`) containing Zod definitions for `Product`, `Meal`, `MealOption`, and `MealPlan`. This is the **Source of Truth** for:
- Database RLS policies.
- API Route validation.
- Mobile/Web form validation.

### 5.2 Supabase RLS (Security)
Implement **Row-Level Security** to ensure `MealPlans` and `ShoppingLists` are strictly scoped to the `UserId`.

### 5.3 Modular Payment Gateway
Architecture must decouple business logic from provider-specific code using a **Provider Pattern**:
- **Interface**: `PaymentProvider` (methods: `createSubscription`, `cancelSubscription`, `handleWebhook`).
- **Implementation**: `StripeProvider` (default).
- **Factory**: `PaymentGateway` to resolve the active provider, making it trivial to add PayPal or others later.

### 5.4 Admin Panel (The Command Center)
A dedicated Next.js area strictly for administrative operations:
- **Dashboard**: BI monitoring (MRR, Churn, Active Users).
- **Core Management**: CRUD for `Products`, `Meals`, and `MealOptions`.

---

## 6. Migration Checklist for AI Agent
- [ ] Setup Supabase project and apply `vitaflix.sql`.
- [ ] Initialize Next.js (Web/Admin) and React Native monorepo.
- [ ] Implement the Shared Zod Schemas for all core entities.
- [ ] Port the C# nutritional logic (BMR/TMB) into a shared TypeScript utility.
- [ ] Build the Admin Dashboard for Product/Meal registration.
- [ ] Recreate the "Netflix-style" filterable recipe catalog.
- [ ] Integrate Stripe/PayPal webhooks to update `Subscription` status.
