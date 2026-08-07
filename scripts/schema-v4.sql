-- schema-v4.sql — Phase A: Security Hardening
-- Run in Supabase SQL Editor after schema-v3.sql

-- ── 1. Append-only audit log — trigger-enforced at DB level ──────────────────
CREATE OR REPLACE FUNCTION public.tg_audit_log_immutable()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'admin_audit_log is append-only: % is not permitted', TG_OP;
END;
$$;

DROP TRIGGER IF EXISTS audit_log_no_update ON public.admin_audit_log;
CREATE TRIGGER audit_log_no_update
  BEFORE UPDATE ON public.admin_audit_log
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_log_immutable();

DROP TRIGGER IF EXISTS audit_log_no_delete ON public.admin_audit_log;
CREATE TRIGGER audit_log_no_delete
  BEFORE DELETE ON public.admin_audit_log
  FOR EACH ROW EXECUTE FUNCTION public.tg_audit_log_immutable();


-- ── 2. Admin role column ──────────────────────────────────────────────────────
-- super_admin: full access (credit, debit, freeze, unfreeze)
-- support:     read-only (can freeze, cannot credit/debit/unfreeze)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS admin_role text
  CHECK (admin_role IN ('super_admin', 'support'));

-- Promote existing admins to super_admin
UPDATE public.profiles
  SET admin_role = 'super_admin'
  WHERE is_admin = true AND admin_role IS NULL;


-- ── 3. Rate limiting table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key        text        NOT NULL,
  window_end timestamptz NOT NULL,
  hits       integer     NOT NULL DEFAULT 0,
  PRIMARY KEY (key, window_end)
);

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key            text,
  p_max_hits       integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_end timestamptz;
  v_hits       integer;
  v_epoch      bigint;
BEGIN
  -- Fixed-window bucket: floor(now / window) * window
  v_epoch      := EXTRACT(EPOCH FROM now())::bigint;
  v_window_end := to_timestamp(
    (v_epoch / p_window_seconds + 1) * p_window_seconds
  );

  INSERT INTO public.rate_limits (key, window_end, hits)
    VALUES (p_key, v_window_end, 1)
    ON CONFLICT (key, window_end) DO UPDATE
      SET hits = rate_limits.hits + 1
    RETURNING hits INTO v_hits;

  -- Prune expired windows (best-effort)
  DELETE FROM public.rate_limits WHERE window_end < now() - interval '10 minutes';

  RETURN v_hits <= p_max_hits;
END;
$$;


-- ── 4. Balance reconciliation function ───────────────────────────────────────
-- Returns true if account.balance matches sum of completed transactions.
-- Called inside admin_credit / admin_debit after every write.
CREATE OR REPLACE FUNCTION public.verify_balance(p_account_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance    numeric;
  v_ledger_sum numeric;
BEGIN
  SELECT balance INTO v_balance
    FROM public.accounts WHERE id = p_account_id;

  SELECT COALESCE(SUM(
    CASE WHEN type IN ('credit', 'btc_sell') THEN amount ELSE -amount END
  ), 0) INTO v_ledger_sum
    FROM public.transactions
    WHERE account_id = p_account_id AND status = 'completed';

  RETURN ABS(COALESCE(v_balance, 0) - v_ledger_sum) <= 0.01;
END;
$$;


-- ── 5. Updated RPCs with super_admin checks, rate limits, and reconciliation ─

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
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_admin_id AND is_admin = true AND admin_role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: super_admin access required';
  END IF;

  IF NOT public.check_rate_limit('admin_credit:' || v_admin_id, 20, 3600) THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 20 credits per hour';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  IF p_amount > 50000 THEN
    RAISE EXCEPTION 'Single credit cannot exceed $50,000';
  END IF;

  UPDATE public.accounts
    SET balance = balance + p_amount
    WHERE id = p_account_id
    RETURNING balance INTO v_new_balance;

  IF NOT FOUND THEN RAISE EXCEPTION 'Account not found'; END IF;

  INSERT INTO public.transactions (account_id, type, amount, currency, description, status)
    VALUES (p_account_id, 'credit', p_amount, 'USD', p_reason, 'completed');

  INSERT INTO public.admin_audit_log (admin_id, action, target_account_id, amount, reason)
    VALUES (v_admin_id, 'credit', p_account_id, p_amount, p_reason);

  -- Reconciliation check (non-blocking — logs warning in metadata if drift detected)
  IF NOT public.verify_balance(p_account_id) THEN
    UPDATE public.admin_audit_log
      SET metadata = jsonb_build_object('reconciliation_warning', true)
      WHERE admin_id = v_admin_id AND action = 'credit'
        AND target_account_id = p_account_id
        AND created_at > now() - interval '5 seconds';
  END IF;

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;


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
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_admin_id AND is_admin = true AND admin_role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: super_admin access required';
  END IF;

  IF NOT public.check_rate_limit('admin_debit:' || v_admin_id, 20, 3600) THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 20 debits per hour';
  END IF;

  IF p_amount <= 0 THEN RAISE EXCEPTION 'Amount must be positive'; END IF;

  IF p_amount > 50000 THEN
    RAISE EXCEPTION 'Single debit cannot exceed $50,000';
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

  IF NOT public.verify_balance(p_account_id) THEN
    UPDATE public.admin_audit_log
      SET metadata = jsonb_build_object('reconciliation_warning', true)
      WHERE admin_id = v_admin_id AND action = 'debit'
        AND target_account_id = p_account_id
        AND created_at > now() - interval '5 seconds';
  END IF;

  RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;


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
  -- Both super_admin and support can freeze
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = v_admin_id AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Unauthorized: admin access required';
  END IF;

  IF NOT public.check_rate_limit('admin_freeze:' || v_admin_id, 50, 3600) THEN
    RAISE EXCEPTION 'Rate limit exceeded';
  END IF;

  UPDATE public.accounts SET status = 'frozen' WHERE id = p_account_id;
  UPDATE public.cards    SET is_frozen = true   WHERE account_id = p_account_id;

  INSERT INTO public.admin_audit_log (admin_id, action, target_account_id, reason)
    VALUES (v_admin_id, 'freeze', p_account_id, p_reason);
END;
$$;


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
  -- Only super_admin can unfreeze
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_admin_id AND is_admin = true AND admin_role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: super_admin access required to unfreeze';
  END IF;

  IF NOT public.check_rate_limit('admin_unfreeze:' || v_admin_id, 50, 3600) THEN
    RAISE EXCEPTION 'Rate limit exceeded';
  END IF;

  UPDATE public.accounts SET status = 'active' WHERE id = p_account_id;
  UPDATE public.cards    SET is_frozen = false  WHERE account_id = p_account_id;

  INSERT INTO public.admin_audit_log (admin_id, action, target_account_id, reason)
    VALUES (v_admin_id, 'unfreeze', p_account_id, p_reason);
END;
$$;
