# USER_FLOWS.md: Vitaflix Core Journey

This document maps the primary user journeys within Vitaflix, from initial registration to recurring meal planning and administrative management.

**IMPORTANT**: For each flow there is detailed information in the folder `./vitaflix-flows/`

## 1. Onboarding & Personalization Flow
Goal: Create an account and establish a personalized nutritional baseline.

```mermaid
flowchart TD
    A[Start: Sign Up] --> B[Enter Email/Password]
    B --> C[Enter Biometric Data:
    • Gender, Birthday
    • Height, Weight]
    C --> D[Select Objective:
    • Lose, Maintain, Gain]
    D --> E[Calculation Engine:
    • Compute BMR / TMB
    • Assign Daily Kcal Target]
    E --> F[Home Screen:
    • Content Personalized by Target]
```

## 2. Recipe Discovery & Selection (The "Netflix" Wedge)
Goal: Browse and select recipes that fit the user's specific caloric needs.

```mermaid
flowchart TD
    A[Home Screen] --> B[Browse by Category:
    • Breakfast, Lunch, etc.]
    B --> C[Apply Filters:
    • Restrictions: Vegan, Meat...
    • Search by Product Tag]
    C --> D[Select Recipe:
    • View Base Instructions]
    D --> E[Select Caloric Variation:
    • 200, 300, 400, 500 kcal]
    E --> F[Action:
    • Add to Meal Plan
    • Add to Shopping List]
```

## 3. Weekly Meal Planning Flow
Goal: Organize nutrition for the week using the plan matrix.

```mermaid
flowchart TD
    A[Meal Plan Dashboard] --> B[Select Day/Slot:
    • Monday / Dinner]
    B --> C[Search Recipes]
    C --> D[Pick Recommended Variation:
    • Based on Slot Kcal Target]
    D --> E[Update Plan Matrix]
    E --> F[Generate Cumulative Shopping List]
```

## 4. Shopping List Flow
Goal: Aggregate all ingredients needed for the selected meals.

```mermaid
flowchart TD
    A[Shopping List Screen] --> B{Source of items?}
    B -->|Automatic| C[Pull from Active Meal Plan]
    B -->|Manual| D[Add Custom Item]
    C --> E[Group by Category:
    • Dairy, Meat, Veggies]
    E --> F[Interactive Checklist:
    • Cross off items while shopping]
```

## 5. Subscription & Paywall Flow
Goal: Convert free/onboarded users into paying subscribers.

```mermaid
flowchart TD
    A[Gated Content Alert] --> B[Pricing Table:
    • Monthly, Quarterly, Annual]
    B --> C[Select Provider:
    • Stripe or PayPal]
    C --> D[Checkout Process]
    D --> E[Webhook confirmation]
    E --> F[Unlock Premium Features]
```

## 6. Admin Content Management Flow (Bruno)
Goal: Maintain the product and recipe database.

```mermaid
flowchart TD
    A[Admin Dashboard] --> B[Register Product:
    • Define Macros/Tag]
    B --> C[Create Base Recipe:
    • Steps & Restrictions]
    C --> D[Create MealOptions:
    • Link Products + Quantities
    • Verify Total Macros]
    D --> E[Publish to Users]
```

## 7. Business Performance Monitoring (BI)
Goal: Track financial and engagement health.

```mermaid
flowchart TD
    A[Admin Dashboard] --> B[User Search & Sorting]
    B --> C[Revenue Metrics:
    • MRR, New vs Renewals]
    C --> D[Engagement Logs:
    • Platform usage: Web/iOS/Android
    • Most clicked Recipes]
```
