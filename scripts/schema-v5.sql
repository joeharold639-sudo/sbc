-- Phase B: Transfer OTP verification
-- Run in Supabase SQL editor

CREATE TABLE IF NOT EXISTS transfer_otps (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        REFERENCES auth.users NOT NULL,
  code          char(6)     NOT NULL,
  transfer_data jsonb       NOT NULL,
  expires_at    timestamptz NOT NULL DEFAULT now() + interval '10 minutes',
  used_at       timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transfer_otps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own otps"
  ON transfer_otps FOR SELECT
  USING (auth.uid() = user_id);

-- Auto-clean expired OTPs older than 1 hour (keep table lean)
CREATE OR REPLACE FUNCTION purge_old_otps() RETURNS void
  LANGUAGE sql SECURITY DEFINER AS $$
    DELETE FROM transfer_otps
    WHERE expires_at < now() - interval '1 hour';
  $$;
