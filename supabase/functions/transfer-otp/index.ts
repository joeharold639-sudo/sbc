// Transfer OTP — send & verify 6-digit codes via email before any transfer
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)
const RESEND_KEY = Deno.env.get('RESEND_API_KEY') ?? ''

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

async function sendEmail(to: string, code: string, amount: string, recipient: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Syntax Trust Bank <noreply@syntaxcrest.com>',
      to: [to],
      subject: `${code} — your transfer verification code`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#fff">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:32px">
            <div style="width:36px;height:36px;background:#4f7fff;border-radius:10px;display:flex;align-items:center;justify-content:center">
              <span style="color:#fff;font-size:18px;font-weight:800">S</span>
            </div>
            <span style="font-weight:700;font-size:16px;color:#111">Syntax Trust Bank</span>
          </div>
          <h2 style="font-size:22px;font-weight:800;color:#111;margin:0 0 8px">Verify your transfer</h2>
          <p style="color:#555;font-size:15px;margin:0 0 28px;line-height:1.5">
            You requested to send <strong>$${amount}</strong> to <strong>${recipient}</strong>.
            Enter the code below to confirm.
          </p>
          <div style="background:#f4f6fb;border-radius:14px;padding:28px;text-align:center;margin-bottom:28px">
            <p style="font-size:13px;color:#888;margin:0 0 10px;letter-spacing:0.05em;text-transform:uppercase">Verification code</p>
            <span style="font-size:40px;font-weight:900;letter-spacing:0.25em;color:#111;font-family:monospace">${code}</span>
          </div>
          <p style="color:#999;font-size:13px;line-height:1.6;margin:0">
            This code expires in <strong>10 minutes</strong>. If you did not request this transfer, you can safely ignore this email.
          </p>
        </div>
      `,
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    console.error('Resend error:', res.status, body)
  }
}

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, content-type',
  }
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  // Auth
  const authHeader = req.headers.get('Authorization') ?? ''
  const { data: { user }, error: authErr } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  )
  if (authErr || !user) return json({ error: 'Unauthorized' }, 401)

  const { action, ...body } = await req.json()

  // ── SEND ──────────────────────────────────────────────────────────────────
  if (action === 'send') {
    const { transfer_data } = body as { transfer_data: Record<string, string> }

    // Invalidate any existing unused OTPs for this user
    await supabase.from('transfer_otps')
      .update({ used_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('used_at', null)

    const code = generateCode()
    const { data: otp, error } = await supabase.from('transfer_otps').insert({
      user_id:       user.id,
      code,
      transfer_data,
      expires_at:    new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    }).select().single()

    if (error) return json({ error: error.message }, 400)

    await sendEmail(user.email!, code, transfer_data.amount, transfer_data.recipientName)

    return json({ otp_id: otp.id })
  }

  // ── VERIFY ────────────────────────────────────────────────────────────────
  if (action === 'verify') {
    const { otp_id, code } = body as { otp_id: string; code: string }

    const { data: otp } = await supabase.from('transfer_otps')
      .select('*')
      .eq('id', otp_id)
      .eq('user_id', user.id)
      .is('used_at', null)
      .single()

    if (!otp)                              return json({ error: 'Invalid or expired code.' }, 400)
    if (new Date(otp.expires_at) < new Date()) return json({ error: 'Code has expired. Request a new one.' }, 400)
    if (otp.code !== code)                 return json({ error: 'Incorrect code. Try again.' }, 400)

    // Mark as used
    await supabase.from('transfer_otps').update({ used_at: new Date().toISOString() }).eq('id', otp_id)

    // Execute transfer
    const td     = otp.transfer_data as Record<string, string>
    const amount = parseFloat(td.amount)

    const { data: account } = await supabase.from('accounts')
      .select('*').eq('user_id', user.id).limit(1).single()

    if (!account)                    return json({ error: 'Account not found.' }, 400)
    if (account.status === 'frozen') return json({ error: 'Your account is frozen. Contact support.' }, 400)
    if (account.balance < amount)    return json({ error: 'Insufficient balance.' }, 400)

    const { error: txErr } = await supabase.from('transactions').insert({
      account_id:        account.id,
      type:              'transfer',
      amount,
      currency:          td.fromCcy,
      description:       td.note || `Transfer to ${td.recipientName}`,
      recipient_name:    td.recipientName,
      recipient_account: td.recipientAccount,
      status:            'completed',
    })
    if (txErr) return json({ error: txErr.message }, 400)

    const newBalance = account.balance - amount
    await supabase.from('accounts').update({ balance: newBalance }).eq('id', account.id)

    return json({ success: true, new_balance: newBalance })
  }

  return json({ error: 'Unknown action' }, 400)
})
