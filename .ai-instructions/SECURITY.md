# SECURITY.md: Security Guardrails

This document defines non-negotiable security constraints for the Vitaflix platform. Security is a first-class citizen and must never be compromised for speed or convenience.

## 1. Data Access & Authorization
- **Supabase RLS**: You must enable Row-Level Security (RLS) on every database table. No table should be accessible without a matching policy.
- **User Isolation**: All queries must explicitly filter by `user_id` to prevent cross-tenant data leaks, even if RLS is present.
- **Admin Gating**: The `/admin` route and all administrative API calls must be protected by Role-Based Access Control (RBAC).

## 2. Secrets Management
- **Zero Tolerance**: Never hardcode API keys, database URLs, or secrets in the repository.
- **Environment Variables**: Use `.env` files for local development and secure environment secrets for production (Vercel/Supabase).
- **Template Files**: Only `.env.example` files may be committed to the repository.

## 3. Data Protection
- **Input Sanitization**: All user inputs must be sanitized and validated via Zod before being processed or stored.
- **Output Encoding**: Encode all user-generated content before rendering in the UI to prevent XSS attacks.
- **Sensitive Data**: Never log passwords, PII (Personally Identifiable Information), or payment details (e.g., full credit card numbers).

## 4. Logging & Monitoring
- **Purposeful Logs**: Log auth failures, payment errors, and critical state transitions.
- **No Leakage**: Ensure logs do not contain session tokens, JWTs, or sensitive payload data.

## 5. Payment Security
- **Stripe/PayPal Integration**: Use official SDKs only. Never implement custom payment processing logic.
- **Webhook Validation**: You must verify the signature of all incoming webhooks from Stripe/PayPal before taking action (e.g., updating subscription status).
