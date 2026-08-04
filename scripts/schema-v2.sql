-- schema-v2.sql — Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Phase 1 security & constraint fixes

-- ── 1. Fix RLS: prevent users from self-escalating to admin ──────────────────
-- The old "own profile FOR ALL" policy allowed users to UPDATE is_admin on themselves.
-- Replace it with separate SELECT and UPDATE policies.

DROP POLICY IF EXISTS "own profile" ON public.profiles;

-- Users can read their own profile row
CREATE POLICY "own profile select"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile BUT cannot change is_admin, kyc_status, or email
CREATE POLICY "own profile update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND is_admin  = (SELECT is_admin  FROM public.profiles WHERE id = auth.uid())
    AND kyc_status = (SELECT kyc_status FROM public.profiles WHERE id = auth.uid())
    AND email      = (SELECT email      FROM public.profiles WHERE id = auth.uid())
  );


-- ── 2. Unique account numbers ─────────────────────────────────────────────────
ALTER TABLE public.accounts
  ADD CONSTRAINT IF NOT EXISTS accounts_account_number_unique UNIQUE (account_number);


-- ── 3. Transaction amount must be positive ────────────────────────────────────
ALTER TABLE public.transactions
  ADD CONSTRAINT IF NOT EXISTS transactions_amount_positive CHECK (amount > 0);


-- ── 4. Account balance must be non-negative ───────────────────────────────────
ALTER TABLE public.accounts
  ADD CONSTRAINT IF NOT EXISTS accounts_balance_non_negative CHECK (balance >= 0);
