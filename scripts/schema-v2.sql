-- schema-v2.sql — Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Phase 1 security & constraint fixes

-- ── 1. Fix RLS: prevent users from self-escalating to admin ──────────────────
DROP POLICY IF EXISTS "own profile" ON public.profiles;

DO $$ BEGIN
  CREATE POLICY "own profile select"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "own profile update"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
      auth.uid() = id
      AND is_admin   = (SELECT is_admin   FROM public.profiles WHERE id = auth.uid())
      AND kyc_status = (SELECT kyc_status FROM public.profiles WHERE id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 2. Unique account numbers ─────────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE public.accounts
    ADD CONSTRAINT accounts_account_number_unique UNIQUE (account_number);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 3. Transaction amount must be positive ────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE public.transactions
    ADD CONSTRAINT transactions_amount_positive CHECK (amount > 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 4. Account balance must be non-negative ───────────────────────────────────
DO $$ BEGIN
  ALTER TABLE public.accounts
    ADD CONSTRAINT accounts_balance_non_negative CHECK (balance >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
