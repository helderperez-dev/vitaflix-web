# FEATURES.md: Vitaflix Core Features

This document details the primary features of the Vitaflix platform, providing functional descriptions for developers and AI agents.

## 1. Ingredient & Product Management
- **Description**: A comprehensive database of individual food items used to build recipes.
- **Key Capabilities**:
    - **Nutritional Data**: Storage of Kcal, Protein, Carbohydrates, and Fat per 100g/ml.
    - **Multilingual Support**: JSON-based naming for Portuguese (PT) and English (EN).
    - **Tagging System**: Free-form categorization (e.g., 'dairy', 'poultry', 'spices').
    - **Public/Private Toggle**: Control visibility of specific ingredients across the app.

## 2. Recipe Catalog (Netflix Experience)
- **Description**: A high-quality, browsable library of meals with detailed preparation guides.
- **Key Capabilities**:
    - **Smart Filtering**: Filter by meal type (Breakfast, Lunch, etc.), satiety levels, and cook time.
    - **Dietary Restrictions**: Specific tags for Vegan, Lactose-Free, Meat, Fish, and Seafood.
    - **Dynamic Preparation Mode**: Step-by-step instructions with support for multilingual JSON.
    - **Review System**: User-generated ratings and comments (Admin-moderated).

## 3. Caloric Variations (MealOptions)
- **Description**: The platform's unique "Wedge" – providing the same recipe in different caloric versions.
- **Key Capabilities**:
    - **Multi-Kcal Versions**: Ability to select a base recipe and view it in 200, 300, 400, or 500 kcal versions.
    - **Ingredient Precision**: Automatic calculation of ingredient quantities based on the selected calorie target.
    - **Smart Replacements**: Suggest alternative ingredients within a recipe (e.g., swapping rice for quinoa).

## 4. Personalized Meal Planning
- **Description**: A daily/weekly organizer for users to schedule their nutrition.
- **Key Capabilities**:
    - **Plan Matrix**: Select specific recipes for designated meal slots.
    - **Caloric Alignment**: Suggestions based on the user's TMB (BMR) and daily goals.
    - **Automatic Reset**: Option to reset or loop plans every week.

## 5. Smart Shopping List
- **Description**: An automated tool to manage grocery shopping based on selected plans.
- **Key Capabilities**:
    - **Auto-Population**: Directly import ingredients from the active Meal Plan.
    - **Category Grouping**: Automatic sorting into grocery sections (e.g., 'Dairy', 'Vegetables').
    - **Manual Entries**: Add custom items not present in the recipe database.
    - **Cross-Platform Sync**: Real-time sync between Web and Mobile devices.

## 6. Integrated User Onboarding
- **Description**: A guided flow during registration to personalize the user's nutritional profile.
- **Key Capabilities**:
    - **Biometric Inputs**: Gender, age, height, and current weight.
    - **Goal Definition**: Choice between Lose Weight, Gain Muscle, or Maintain.
    - **Calculated Targets**: Instant BMR/TMB calculation and daily calorie goal assignment.

## 7. Subscription & Paywall System
- **Description**: Secure management of premium access and recurring payments.
- **Key Capabilities**:
    - **Multi-Gateway Support**: Integrated with Stripe and PayPal.
    - **Plan Tiers**: Management of Monthly, Quarterly, and Annual subscriptions.
    - **Access Control**: Gated content (Recipes, Plans) based on active subscription status.

## 8. Admin Dashboard (BI)
- **Description**: A central command center for the founder to monitor platform performance.
- **Key Capabilities**:
    - **User Management**: Searchable list of all clients with subscription and login history.
    - **Financial Metrics**: Tracking of MRR (Monthly Recurring Revenue), renewals, and churn.
    - **Usage Analytics**: Monitoring of most popular recipes, used filters, and platform activity (iOS/Android/Web).
