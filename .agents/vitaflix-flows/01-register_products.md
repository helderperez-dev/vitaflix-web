# Flow 1: Register Products (Ingredients)

## Description
Registration of individual ingredients (food products) with mandatory nutritional data. This registry serves as the fundamental building block for creating recipes and caloric variations. "Tags" function as identifiers or free categories, without the need for a separate category table.

## Tables and Relationships

```text
Main Table: Products (Id PK)
├── Picture (bigint) → Reference for product image storage
├── BrandPicture (bigint) → Reference for specific brand image
└── IsPublic (boolean) → Defines if the ingredient is available to all users

Relationships:
- No Foreign Keys (FKs) for categories (Tag is a free varchar field).
- Tag Examples: "extra-ham", "salmon", "greek-yogurt", "seasoning".
- Mandatory Data: Name (multilingual JSON), Kcal (Integer), Tag (Varchar).
```

## Mermaid Diagram (Sequential Flow)

```mermaid
flowchart TD
    A[Start: Admin accesses /admin/products/new] --> B[Form:<br/>• Name JSON pt/en<br/>• Brand<br/>• Kcal **mandatory**<br/>• Protein/Carbs/Fat<br/>• Tag **mandatory** e.g. 'ham'<br/>• Photos + Description JSON]
    B --> C{Validations?}
    C -->|Error| D[Display UI Errors:<br/>Kcal and Tag are required<br/>Validate unique Name/Tag]
    D --> B
    C -->|OK| E[POST /api/products<br/>Data sanitization and<br/>multilingual JSON formatting]
    E --> F[Persistence in Supabase<br/>Products.insert]
    F --> G[Return Product ID<br/>Redirect to List]
    G --> H[End: Success Notification via Toast]
    
    style A fill:#e1f5fe
    style H fill:#c8e6c9
    style D fill:#ffcdd2
```

## AI Codegen Specifications

```text
• Frontend (Web): Next.js + React Hook Form + Zod for schema validation.
• Backend (API): Next.js API Routes with direct Supabase client integration.
• Field Validations:
  - Kcal: Integer > 0 (mandatory).
  - Tag: Unique string, lowercase, slug format (no spaces or special characters).
  - Name: Mandatory JSON structure { "pt": "Nome em Português", "en": "Name in English" }.
• Interface (UI): Quick creation modal or full form page with real-time macro preview.
• Mobile (React Native): Reuse of Zod validation schema (shared logic) to ensure cross-platform consistency.
• Extra Functionality: Autocomplete on the Tag field based on existing tags in the database to avoid semantic duplication.
```