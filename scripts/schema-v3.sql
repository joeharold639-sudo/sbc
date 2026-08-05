-- schema-v3.sql — Run in Supabase SQL Editor after schema-v2.sql
-- Phase 2: Admin audit log, account status, and atomic RPC functions

-- ── 1. Account status column ──────────────────────────────────────────────────
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

ALTER TABLE public.accounts
  DROP CONSTRAINT IF EXISTS accounts_status_check;

ALTER TABLE public.accounts
  ADD CONSTRAINT accounts_status_check CHECK (status IN ('active', 'frozen', 'closed'));


-- ── 2. Admin audit log table ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id          uuid        NOT NULL REFERENCES auth.users(id),
  action            text        NOT NULL,
  target_user_id    uuid        REFERENCES auth.users(id),
  target_account_id uuid        REFERENCES public.accounts(id),
  amount            numeric(18,2),
  reason            text,
  metadata          jsonb,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can insert entries
DO $$ BEGIN
  CREATE POLICY "admin insert audit"
    ON public.admin_audit_log FOR INSERT
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Admins can read all entries
DO $$ BEGIN
  CREATE POLICY "admin read audit"
    ON public.admin_audit_log FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- No UPDATE or DELETE policies = audit log is append-only


-- ── 3. RPC: admin_credit ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_credit(
  p_account_id uuid,
  p_amount     numeric,
  p_reason     text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id    uuid    := auth.uid();
  v_new_balance numeric;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_admin_id AND is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  UPDATE public.accounts
    SET balance = balance + p_amount
    WHERE id = p_account_id
    RETURNING balance INTO v_new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found';
  END IF;

  INSERT INTO public.transactions (account_id, type, amount, currency, description, status)
    VALUES (p_account_id, 'credit', p_amount, 'USD', p_reason, 'completed');

  INSERT INTO public.admin_audit_log (admin_id, action, target_account_id, amount, reason)
    VALUES (v_admin_id, 'credit', p_account_id, p_amount, p_reason);

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;


-- ── 4. RPC: admin_debit ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_debit(
  p_account_id uuid,
  p_amount     numeric,
  p_reason     text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id    uuid    := auth.uid();
  v_new_balance numeric;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_admin_id AND is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  UPDATE public.accounts
    SET balance = balance - p_amount
    WHERE id = p_account_id AND balance >= p_amount
    RETURNING balance INTO v_new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient balance or account not found';
  END IF;

  INSERT INTO public.transactions (account_id, type, amount, currency, description, status)
    VALUES (p_account_id, 'debit', p_amount, 'USD', p_reason, 'completed');

  INSERT INTO public.admin_audit_log (admin_id, action, target_account_id, amount, reason)
    VALUES (v_admin_id, 'debit', p_account_id, p_amount, p_reason);

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;


-- ── 5. RPC: admin_freeze ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_freeze(
  p_account_id uuid,
  p_reason     text DEFAULT 'Admin action'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_admin_id AND is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  UPDATE public.accounts SET status = 'frozen' WHERE id = p_account_id;
  UPDATE public.cards    SET is_frozen = true   WHERE account_id = p_account_id;

  INSERT INTO public.admin_audit_log (admin_id, action, target_account_id, reason)
    VALUES (v_admin_id, 'freeze', p_account_id, p_reason);
END;
$$;


-- ── 6. RPC: admin_unfreeze ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_unfreeze(
  p_account_id uuid,
  p_reason     text DEFAULT 'Admin action'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_admin_id AND is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  UPDATE public.accounts SET status = 'active' WHERE id = p_account_id;
  UPDATE public.cards    SET is_frozen = false  WHERE account_id = p_account_id;

  INSERT INTO public.admin_audit_log (admin_id, action, target_account_id, reason)
    VALUES (v_admin_id, 'unfreeze', p_account_id, p_reason);
END;
$$;
