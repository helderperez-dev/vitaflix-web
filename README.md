# Vitaflix Admin Panel

A Next.js 15 admin panel for the Vitaflix nutritional engine — built with TypeScript, Supabase, Shadcn UI, and Tailwind CSS.

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, RSC) |
| Database | Supabase (PostgreSQL + Realtime) |
| Auth | Supabase Auth + RLS |
| UI | Shadcn UI + Tailwind CSS + Framer Motion |
| Forms | React Hook Form + Zod |
| Email | Resend |
| SMS | Twilio |
| Push | Firebase FCM |
| Payments | Stripe |
| i18n | next-intl (en, es, pt-pt, pt-br) |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=

# SMS (Twilio) — optional
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=

# Push (Firebase) — optional
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

---

## Documentation

Detailed system documentation lives in the [`/docs`](./docs) folder:

| Doc | Description |
|---|---|
| [notifications.md](./docs/notifications.md) | Broadcast, trigger system, user groups, channels, integration guide |

---

## Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── (admin)/          # Admin pages (dashboard, meals, users, notifications…)
│   │   └── (auth)/           # Login page
│   ├── actions/              # Next.js Server Actions (meals, users, notifications…)
│   └── api/
│       └── webhooks/stripe/  # Stripe webhook handler
├── components/
│   ├── notifications/        # Notification system components
│   ├── ui/                   # Shadcn UI primitives
│   └── layout/               # Sidebar, navbar
├── lib/
│   ├── notifications.ts      # Email / SMS / Push senders
│   └── supabase/             # Supabase client (server + client)
└── messages/                 # i18n translation files (en, es, pt-pt, pt-br)
docs/
└── notifications.md          # Notification system documentation
```

---

## Admin Sections

| Section | Route | Description |
|---|---|---|
| Dashboard | `/dashboard` | Metrics overview |
| Products | `/products` | Nutritional ingredients & products |
| Meals | `/meals` | Meal database with variations & prep steps |
| Users | `/users` | User management & roles |
| Notifications | `/notifications` | Broadcasts, triggers, user groups |
| Settings | `/settings` | Locale and system settings |
