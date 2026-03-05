# Notification System

> Vitaflix's multi-channel notification engine for broadcasting messages and triggering automated communications based on user lifecycle events.

---

## Overview

The notification system has three main features, all managed from the **Notifications** admin panel (`/notifications`):

| Feature | Description |
|---|---|
| **Broadcast** | Manually send one-off notifications to all users, a specific group, or an individual |
| **Triggers** | Automated notifications fired by lifecycle events in the codebase |
| **User Groups** | Segment users into named cohorts for targeted broadcasts |

---

## Architecture

```
Admin Panel (UI)
    └── NotificationsWrapper
        ├── BroadcastTab     → sendBroadcastAction()
        ├── TriggersTab      → saveTriggerAction()
        └── GroupsTab        → saveGroupAction() + saveGroupMembersAction()

Codebase Events
    └── triggerAppEvent(action_type, { userId, data? })
            ↓
        Looks up notification_triggers WHERE action_type = ? AND is_active = true
            ↓
        Replaces template variables ({{first_name}}, {{user_email}}, etc.)
            ↓
        Dispatches via channels: app | email | push | sms
            ↓
        Logs result in notifications table (pending → sent | failed)
```

### Supported Channels

| Channel | Provider | Config Env Vars |
|---|---|---|
| `app` | Supabase Realtime (in-app) | _(none required)_ |
| `email` | [Resend](https://resend.com) | `RESEND_API_KEY`, `EMAIL_FROM` |
| `push` | Firebase FCM | `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` |
| `sms` | Twilio | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` |

---

## Trigger System

### How It Works

Triggers link an **action type string** (e.g. `user_signed_up`) to a message template and a set of delivery channels. When any server-side code calls `triggerAppEvent()`, the system:

1. Looks up an active trigger matching that `action_type`
2. Interpolates template variables with real user data
3. Sends the notification via all configured channels
4. Records the result in the `notifications` table

### Firing a Trigger

```typescript
import { triggerAppEvent } from "@/app/actions/notifications"

// Basic usage
await triggerAppEvent("user_signed_up", { userId: "uuid-here" })

// With custom template variables
await triggerAppEvent("meal_plan_assigned", {
    userId: "uuid-here",
    data: {
        plan_name: "Mediterranean Week 1"
    }
})
```

### Built-in Template Variables

These are always available in every trigger template (no `data` required):

| Variable | Resolves To | Example |
|---|---|---|
| `{{first_name}}` | User's first name | `John` |
| `{{user_name}}` | User's display name | `John Doe` |
| `{{user_email}}` | User's email address | `john@example.com` |
| `{{app_name}}` | Application name | `Vitaflix` |
| `{{date}}` | Current date | `Mar 5, 2026` |

Additional variables can be passed via the `data` object and used as `{{variable_name}}` in templates.

---

## Live Triggers

The following triggers are seeded and active in the database:

### 1. Welcome New User
| Field | Value |
|---|---|
| **Action Type** | `user_signed_up` |
| **Channels** | App, Email |
| **Fires When** | A new user is created via `upsertUser()` (no existing `id`) |
| **Subject** | `Welcome to Vitaflix, {{first_name}}! 🎉` |
| **Body** | `Hi {{first_name}}, your account is ready. Start exploring personalized meal plans, track your macros, and achieve your wellness goals. Let's go!` |

**Integration point:** `src/app/actions/users.ts` → `upsertUser()`

---

### 2. Profile Setup Complete
| Field | Value |
|---|---|
| **Action Type** | `profile_complete` |
| **Channels** | App |
| **Fires When** | User saves profile with `extra_data_complete = true` |
| **Subject** | `Your profile is complete, {{first_name}}!` |
| **Body** | `Great job setting up your profile. Based on your data, your daily calorie goal is {{recommended_kcal}} kcal. Check out your personalized meal plans now.` |
| **Custom Vars** | `{{recommended_kcal}}` — user's computed calorie intake |

**Integration point:** `src/app/actions/users.ts` → `upsertUser()`

---

### 3. Subscription Activated
| Field | Value |
|---|---|
| **Action Type** | `subscription_activated` |
| **Channels** | App, Email |
| **Fires When** | Stripe webhook receives `customer.subscription.created` with status `active` |
| **Subject** | `Your Vitaflix subscription is active! 🚀` |
| **Body** | `Hi {{first_name}}, your premium subscription is now active. Enjoy unlimited access to all meal plans, nutrition tracking, and exclusive content. Thank you for joining us!` |

**Integration point:** `src/app/api/webhooks/stripe/route.ts`

---

### 4. Subscription Cancelled
| Field | Value |
|---|---|
| **Action Type** | `subscription_cancelled` |
| **Channels** | App, Email |
| **Fires When** | Stripe webhook receives subscription with status `canceled` |
| **Subject** | `We'll miss you, {{first_name}} 😢` |
| **Body** | `Your Vitaflix subscription has been cancelled. You'll continue to have access until the end of your current billing period. We hope to see you back soon!` |

**Integration point:** `src/app/api/webhooks/stripe/route.ts`

---

### 5. Meal Plan Assigned
| Field | Value |
|---|---|
| **Action Type** | `meal_plan_assigned` |
| **Channels** | App |
| **Fires When** | A meal plan is assigned to a user (manual call required) |
| **Subject** | `New meal plan ready for you, {{first_name}}!` |
| **Body** | `Your personalized meal plan "{{plan_name}}" has been assigned. Open Vitaflix to explore your new recipes and start tracking today.` |
| **Custom Vars** | `{{plan_name}}` — name of the assigned plan |

**Integration point:** Call manually when assigning a meal plan:
```typescript
await triggerAppEvent("meal_plan_assigned", {
    userId,
    data: { plan_name: "Mediterranean Week 1" }
})
```

---

### 6. Inactivity Reminder
| Field | Value |
|---|---|
| **Action Type** | `user_inactive_7d` |
| **Channels** | App, Email |
| **Fires When** | User has not logged in for 7 days (requires cron job) |
| **Subject** | `We miss you, {{first_name}} 👋` |
| **Body** | `It's been a while since you last checked in. Your wellness journey is waiting — log in today to stay on track with your goals.` |

**Integration point:** Set up a Supabase cron job or scheduled Edge Function:
```typescript
// Example: Supabase pg_cron or a scheduled function
const { data: inactiveUsers } = await supabase
    .from("users")
    .select("id")
    .lt("updated_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

for (const user of inactiveUsers) {
    await triggerAppEvent("user_inactive_7d", { userId: user.id })
}
```

---

## Adding a New Trigger

### Step 1 — Create it in the Admin Panel
Go to **Notifications → Triggers → Create Trigger** and fill in:
- **Automation Name** — human-readable label (e.g. "Goal Achieved")
- **Action Event** — the key your code will call (e.g. `goal_achieved`)
- **Channels** — which delivery methods to use
- **Subject / Title Template** — with optional `{{variables}}`
- **Message Body Template** — the full notification text

### Step 2 — Call it from your code
```typescript
await triggerAppEvent("goal_achieved", {
    userId: user.id,
    data: {
        goal_type: "weight_loss",
        target: "75kg"
    }
})
```

That's it. The admin can edit the message content at any time without any code changes.

---

## User Groups

Groups allow you to segment users for targeted broadcasts.

### Managing Groups
- **Create** — Notifications → User Groups → **+** button
- **Edit details** — Click any row in the table
- **Add/remove members** — Open a group → switch to the **Members** tab

### Using a Group in a Broadcast
When creating a broadcast, set **Send to** → select a specific group. Only users in that group will receive the notification.

### Server-Side
Groups are stored in `user_groups` and `user_group_members`. Members can be programmatically managed:

```typescript
import { saveGroupMembersAction, getGroupMembersAction } from "@/app/actions/notifications"

// Read current members
const { members } = await getGroupMembersAction(groupId)

// Replace all members (full sync)
await saveGroupMembersAction(groupId, [...members, newUserId])
```

---

## Database Tables

| Table | Description |
|---|---|
| `notification_triggers` | Registered trigger rules (action_type → template + channels) |
| `notifications` | Log of every notification sent (status: pending / sent / failed) |
| `user_groups` | Named user segments |
| `user_group_members` | Many-to-many: which users belong to which group |

### RLS Policies

All notification tables require `is_admin()` for write operations. The `notifications` table is readable by the owning user (`auth.uid() = user_id`).

---

## Key Files

| File | Purpose |
|---|---|
| `src/app/actions/notifications.ts` | All server actions: broadcast, trigger, group management |
| `src/app/api/webhooks/stripe/route.ts` | Stripe webhook → fires subscription triggers |
| `src/app/actions/users.ts` | User creation/update → fires signup & profile triggers |
| `src/components/notifications/notification-drawer.tsx` | Admin drawer UI for all notification modes |
| `src/components/notifications/notifications-wrapper.tsx` | Tab controller and drawer state manager |
| `src/components/notifications/groups-tab.tsx` | User groups table with row-click to edit |
| `src/lib/notifications.ts` | Low-level senders: Resend, Twilio, Firebase FCM |
