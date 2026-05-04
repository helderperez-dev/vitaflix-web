alter type public.subscription_status_enum add value if not exists 'incomplete_expired';
alter type public.subscription_status_enum add value if not exists 'paused';
alter type public.subscription_status_enum add value if not exists 'unpaid';

alter table public.users
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_customer_created_at timestamptz;

create unique index if not exists users_stripe_customer_id_idx
  on public.users (stripe_customer_id)
  where stripe_customer_id is not null;

alter table public.subscriptions
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_price_id text,
  add column if not exists stripe_product_id text,
  add column if not exists stripe_latest_invoice_id text,
  add column if not exists stripe_default_payment_method_id text,
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists canceled_at timestamptz,
  add column if not exists trial_start timestamptz,
  add column if not exists trial_end timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists subscriptions_user_status_idx
  on public.subscriptions (user_id, status, created_at desc);

create index if not exists subscriptions_stripe_customer_id_idx
  on public.subscriptions (stripe_customer_id);

create table if not exists public.billing_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  email text,
  name text,
  phone text,
  default_payment_method_id text,
  invoice_settings jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_customers_user_id_idx
  on public.billing_customers (user_id);

create table if not exists public.billing_payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_payment_method_id text not null unique,
  type text not null,
  is_default boolean not null default false,
  allow_redisplay text,
  brand text,
  last4 text,
  exp_month integer,
  exp_year integer,
  fingerprint text,
  country text,
  funding text,
  wallet text,
  billing_name text,
  billing_email text,
  billing_phone text,
  metadata jsonb not null default '{}'::jsonb,
  card jsonb not null default '{}'::jsonb,
  raw jsonb not null default '{}'::jsonb,
  detached_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_payment_methods_user_id_idx
  on public.billing_payment_methods (user_id, created_at desc);

create index if not exists billing_payment_methods_customer_idx
  on public.billing_payment_methods (stripe_customer_id, is_default desc, created_at desc);

create table if not exists public.billing_invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  stripe_invoice_id text not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  invoice_number text,
  status text not null,
  billing_reason text,
  collection_method text,
  currency text not null default 'eur',
  subtotal integer not null default 0,
  total integer not null default 0,
  amount_due integer not null default 0,
  amount_paid integer not null default 0,
  amount_remaining integer not null default 0,
  discount_total integer not null default 0,
  attempted boolean not null default false,
  attempt_count integer not null default 0,
  hosted_invoice_url text,
  invoice_pdf text,
  period_start timestamptz,
  period_end timestamptz,
  due_date timestamptz,
  paid_at timestamptz,
  stripe_coupon_id text,
  discounts jsonb not null default '[]'::jsonb,
  lines jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_invoices_user_id_idx
  on public.billing_invoices (user_id, created_at desc);

create index if not exists billing_invoices_subscription_idx
  on public.billing_invoices (subscription_id, created_at desc);

create index if not exists billing_invoices_customer_idx
  on public.billing_invoices (stripe_customer_id, created_at desc);

alter table public.transactions
  add column if not exists user_id uuid references public.users(id) on delete cascade,
  add column if not exists invoice_id uuid references public.billing_invoices(id) on delete set null,
  add column if not exists provider text not null default 'stripe',
  add column if not exists stripe_invoice_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists stripe_charge_id text,
  add column if not exists transaction_type text not null default 'subscription',
  add column if not exists description text,
  add column if not exists payment_method_type text,
  add column if not exists payment_method_brand text,
  add column if not exists payment_method_last4 text,
  add column if not exists raw jsonb not null default '{}'::jsonb;

update public.transactions as t
set user_id = s.user_id
from public.subscriptions as s
where t.subscription_id = s.id
  and t.user_id is null;

alter table public.transactions
  alter column subscription_id drop not null;

create index if not exists transactions_user_id_idx
  on public.transactions (user_id, created_at desc);

create index if not exists transactions_invoice_id_idx
  on public.transactions (invoice_id, created_at desc);

create index if not exists transactions_payment_intent_idx
  on public.transactions (stripe_payment_intent_id);

alter table public.billing_customers enable row level security;
alter table public.billing_payment_methods enable row level security;
alter table public.billing_invoices enable row level security;

create policy "Users can read own billing customers"
  on public.billing_customers
  for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Admins can manage billing customers"
  on public.billing_customers
  for all
  using (public.is_admin());

create policy "Users can read own billing payment methods"
  on public.billing_payment_methods
  for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Admins can manage billing payment methods"
  on public.billing_payment_methods
  for all
  using (public.is_admin());

create policy "Users can read own billing invoices"
  on public.billing_invoices
  for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Admins can manage billing invoices"
  on public.billing_invoices
  for all
  using (public.is_admin());

create policy "Users can read own transactions"
  on public.transactions
  for select
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.subscriptions as s
      where s.id = subscription_id
        and s.user_id = auth.uid()
    )
    or public.is_admin()
  );
