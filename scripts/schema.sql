-- Syntax Trust Bank — full schema
-- Run this once in the Supabase SQL Editor

-- profiles
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  email        text,
  is_admin     boolean not null default false,
  kyc_status   text not null default 'pending',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- accounts
create table if not exists public.accounts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  account_number text not null,
  type           text not null default 'personal',
  currency       text not null default 'USD',
  balance        numeric(18,2) not null default 0,
  created_at     timestamptz not null default now()
);

-- transactions
create table if not exists public.transactions (
  id             uuid primary key default gen_random_uuid(),
  account_id     uuid not null references public.accounts(id) on delete cascade,
  type           text not null,
  amount         numeric(18,2) not null,
  currency       text not null default 'USD',
  description    text,
  status         text not null default 'completed',
  recipient_name text,
  created_at     timestamptz not null default now()
);

-- cards
create table if not exists public.cards (
  id                 uuid primary key default gen_random_uuid(),
  account_id         uuid not null references public.accounts(id) on delete cascade,
  user_id            uuid not null references auth.users(id) on delete cascade,
  card_number_last4  text not null,
  card_type          text not null default 'virtual',
  network            text not null default 'visa',
  expiry_month       int not null,
  expiry_year        int not null,
  is_frozen          boolean not null default false,
  spending_limit     numeric(18,2),
  created_at         timestamptz not null default now()
);

-- btc_wallets
create table if not exists public.btc_wallets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  address     text not null,
  balance_btc numeric(18,8) not null default 0,
  created_at  timestamptz not null default now()
);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles     enable row level security;
alter table public.accounts     enable row level security;
alter table public.transactions enable row level security;
alter table public.cards        enable row level security;
alter table public.btc_wallets  enable row level security;

-- profiles: users see own row; admins see all
create policy "own profile" on public.profiles for all using (auth.uid() = id);
create policy "admin all profiles" on public.profiles for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- accounts
create policy "own account" on public.accounts for all using (auth.uid() = user_id);
create policy "admin all accounts" on public.accounts for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- transactions
create policy "own transactions" on public.transactions for all using (
  exists (select 1 from public.accounts where id = account_id and user_id = auth.uid())
);
create policy "admin all transactions" on public.transactions for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- cards
create policy "own cards" on public.cards for all using (auth.uid() = user_id);
create policy "admin all cards" on public.cards for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- btc_wallets
create policy "own wallet" on public.btc_wallets for all using (auth.uid() = user_id);
create policy "admin all wallets" on public.btc_wallets for all using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);
