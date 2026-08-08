-- Phase B: Loan / Grant application system
-- Run in Supabase SQL editor

CREATE TABLE IF NOT EXISTS applications (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        REFERENCES auth.users NOT NULL,
  account_id   uuid        REFERENCES accounts(id) NOT NULL,
  type         text        NOT NULL CHECK (type IN ('loan', 'grant')),
  amount       numeric(14,2) NOT NULL CHECK (amount > 0),
  purpose      text        NOT NULL,
  details      text,
  status       text        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by  uuid        REFERENCES auth.users,
  review_note  text,
  reviewed_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Users can see their own applications
CREATE POLICY "Users select own applications"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own applications
CREATE POLICY "Users insert own applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can see all applications
CREATE POLICY "Admins select all applications"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admins can update applications (approve/reject)
CREATE POLICY "Admins update applications"
  ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- RPC: approve an application (super_admin only)
CREATE OR REPLACE FUNCTION approve_application(
  p_application_id uuid,
  p_review_note    text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app        applications%ROWTYPE;
  v_profile    profiles%ROWTYPE;
  v_new_bal    numeric;
BEGIN
  -- Must be super_admin
  SELECT * INTO v_profile FROM profiles WHERE id = auth.uid();
  IF v_profile.admin_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super_admin can approve applications';
  END IF;

  -- Lock and fetch application
  SELECT * INTO v_app FROM applications
  WHERE id = p_application_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;
  IF v_app.status != 'pending' THEN
    RAISE EXCEPTION 'Application is already %', v_app.status;
  END IF;

  -- Rate limit: max 50 approvals/hour
  PERFORM check_rate_limit(
    'approve:' || auth.uid()::text, 50, 3600
  );

  -- Credit the account
  UPDATE accounts
  SET balance = balance + v_app.amount,
      updated_at = now()
  WHERE id = v_app.account_id
  RETURNING balance INTO v_new_bal;

  -- Insert transaction record
  INSERT INTO transactions (account_id, type, amount, currency, description, status)
  VALUES (
    v_app.account_id,
    'credit',
    v_app.amount,
    'USD',
    CASE v_app.type WHEN 'loan' THEN 'Loan approved: ' ELSE 'Grant approved: ' END || v_app.purpose,
    'completed'
  );

  -- Update application status
  UPDATE applications SET
    status      = 'approved',
    reviewed_by = auth.uid(),
    review_note = p_review_note,
    reviewed_at = now(),
    updated_at  = now()
  WHERE id = p_application_id;

  -- Audit log
  INSERT INTO admin_audit_log (admin_id, action, metadata)
  VALUES (auth.uid(), 'approve_application', jsonb_build_object(
    'application_id', p_application_id,
    'type', v_app.type,
    'amount', v_app.amount,
    'user_id', v_app.user_id
  ));

  RETURN jsonb_build_object('new_balance', v_new_bal);
END;
$$;

-- RPC: reject an application (any admin)
CREATE OR REPLACE FUNCTION reject_application(
  p_application_id uuid,
  p_review_note    text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_app     applications%ROWTYPE;
  v_profile profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE id = auth.uid();
  IF NOT v_profile.is_admin THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT * INTO v_app FROM applications
  WHERE id = p_application_id FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Application not found'; END IF;
  IF v_app.status != 'pending' THEN
    RAISE EXCEPTION 'Application is already %', v_app.status;
  END IF;

  UPDATE applications SET
    status      = 'rejected',
    reviewed_by = auth.uid(),
    review_note = p_review_note,
    reviewed_at = now(),
    updated_at  = now()
  WHERE id = p_application_id;

  INSERT INTO admin_audit_log (admin_id, action, metadata)
  VALUES (auth.uid(), 'reject_application', jsonb_build_object(
    'application_id', p_application_id,
    'type', v_app.type,
    'amount', v_app.amount,
    'user_id', v_app.user_id
  ));
END;
$$;
