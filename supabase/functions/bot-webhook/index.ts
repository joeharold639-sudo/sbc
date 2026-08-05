// Syntax Trust Bank — Telegram Admin Bot
// Deploy: supabase functions deploy bot-webhook
// Register webhook: see scripts/setup-telegram-bot.md

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── Config ────────────────────────────────────────────────────────────────────
const BOT_TOKEN      = Deno.env.get('TELEGRAM_BOT_TOKEN') ?? ''
const WEBHOOK_SECRET = Deno.env.get('TELEGRAM_WEBHOOK_SECRET') ?? ''
const ADMIN_IDS      = (Deno.env.get('ADMIN_TELEGRAM_IDS') ?? '')
  .split(',').map(s => s.trim()).filter(Boolean)

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// ── Telegram API helpers ──────────────────────────────────────────────────────
async function tgCall(method: string, body: Record<string, unknown>) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
}

async function reply(chatId: number, text: string) {
  await tgCall('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML' })
}

function esc(s: string | null | undefined): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ── DB helpers ────────────────────────────────────────────────────────────────
async function getUserByEmail(email: string) {
  const { data: { users }, error } = await supabase.auth.admin.listUsers()
  if (error) return null
  return users.find(u => u.email?.toLowerCase() === email.toLowerCase()) ?? null
}

async function getAccountByUserId(userId: string) {
  const { data } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
  return data?.[0] ?? null
}

async function getProfileByUserId(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data ?? null
}

async function logAudit(action: string, adminTgId: string, meta: Record<string, unknown>) {
  await supabase.from('admin_audit_log').insert({
    admin_id:  (Deno.env.get('BOT_ADMIN_UUID') ?? '00000000-0000-0000-0000-000000000000'),
    action:    `bot:${action}`,
    metadata:  { telegram_user_id: adminTgId, ...meta },
  })
}

// ── Command handlers ──────────────────────────────────────────────────────────

async function cmdHelp(chatId: number) {
  await reply(chatId, `<b>Syntax Trust Bank — Admin Bot</b>

<b>Balance</b>
/credit &lt;email&gt; &lt;amount&gt; &lt;reason&gt;
/debit &lt;email&gt; &lt;amount&gt; &lt;reason&gt;

<b>Accounts</b>
/freeze &lt;email&gt;
/unfreeze &lt;email&gt;
/user &lt;email&gt;
/txns &lt;email&gt; [limit]

<b>Platform</b>
/stats
/help

<i>All actions are logged in the audit trail.</i>`)
}

async function cmdStats(chatId: number, adminTgId: string) {
  const [
    { count: userCount },
    { data: balanceData },
    { count: txCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('accounts').select('balance'),
    supabase.from('transactions').select('*', { count: 'exact', head: true }),
  ])

  const totalBalance = (balanceData ?? []).reduce((s, a) => s + Number(a.balance), 0)

  await reply(chatId, `<b>Platform Stats</b>

👥 Total Users: <code>${userCount ?? 0}</code>
💰 Total Balance: <code>$${fmt(totalBalance)}</code>
📋 Transactions: <code>${txCount ?? 0}</code>`)

  await logAudit('stats', adminTgId, {})
}

async function cmdUser(chatId: number, args: string[], adminTgId: string) {
  const email = args[0]
  if (!email) return reply(chatId, '❌ Usage: /user &lt;email&gt;')

  const authUser = await getUserByEmail(email)
  if (!authUser) return reply(chatId, `❌ No user found with email <code>${esc(email)}</code>`)

  const [profile, account] = await Promise.all([
    getProfileByUserId(authUser.id),
    getAccountByUserId(authUser.id),
  ])

  const { data: recentTxns } = await supabase
    .from('transactions')
    .select('type,amount,description,created_at')
    .eq('account_id', account?.id ?? '')
    .order('created_at', { ascending: false })
    .limit(3)

  const txLines = (recentTxns ?? [])
    .map(t => `  ${t.type === 'credit' ? '▲' : '▼'} $${fmt(Number(t.amount))} — ${esc(t.description)}`)
    .join('\n')

  await reply(chatId, `<b>User: ${esc(profile?.full_name ?? 'Unknown')}</b>
📧 ${esc(email)}
🪪 KYC: <code>${esc(profile?.kyc_status)}</code>
🏦 Account: <code>${esc(account?.account_number)}</code>
💰 Balance: <code>$${fmt(Number(account?.balance ?? 0))}</code>
🔒 Status: <code>${esc(account?.status ?? 'active')}</code>
📅 Joined: ${new Date(authUser.created_at).toLocaleDateString()}

<b>Last 3 transactions:</b>
${txLines || '  No transactions yet'}`)

  await logAudit('user_lookup', adminTgId, { target_email: email })
}

async function cmdTxns(chatId: number, args: string[], adminTgId: string) {
  const email = args[0]
  if (!email) return reply(chatId, '❌ Usage: /txns &lt;email&gt; [limit]')
  const limit = Math.min(parseInt(args[1] ?? '5', 10) || 5, 20)

  const authUser = await getUserByEmail(email)
  if (!authUser) return reply(chatId, `❌ No user found: <code>${esc(email)}</code>`)

  const account = await getAccountByUserId(authUser.id)
  if (!account) return reply(chatId, '❌ No account found for this user.')

  const { data: txns } = await supabase
    .from('transactions')
    .select('type,amount,description,status,created_at')
    .eq('account_id', account.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!txns?.length) return reply(chatId, 'No transactions found.')

  const lines = txns.map(t => {
    const sign  = t.type === 'credit' ? '▲' : '▼'
    const date  = new Date(t.created_at).toLocaleDateString()
    return `${sign} <code>$${fmt(Number(t.amount))}</code> ${esc(t.description)} <i>${date}</i>`
  }).join('\n')

  await reply(chatId, `<b>Last ${txns.length} transactions for ${esc(email)}</b>\n\n${lines}`)
  await logAudit('txns_lookup', adminTgId, { target_email: email, limit })
}

async function cmdCredit(chatId: number, args: string[], adminTgId: string) {
  const [email, amountStr, ...reasonParts] = args
  const reason = reasonParts.join(' ')
  const amount = parseFloat(amountStr)

  if (!email || !amount || !reason) {
    return reply(chatId, '❌ Usage: /credit &lt;email&gt; &lt;amount&gt; &lt;reason&gt;\n\nExample:\n<code>/credit user@email.com 500 Salary payment</code>')
  }
  if (isNaN(amount) || amount <= 0) return reply(chatId, '❌ Amount must be a positive number.')

  const authUser = await getUserByEmail(email)
  if (!authUser) return reply(chatId, `❌ No user found: <code>${esc(email)}</code>`)

  const account = await getAccountByUserId(authUser.id)
  if (!account) return reply(chatId, '❌ No account found for this user.')

  const { data, error } = await supabase.rpc('admin_credit', {
    p_account_id: account.id,
    p_amount:     amount,
    p_reason:     reason,
  })

  if (error) return reply(chatId, `❌ Failed: ${esc(error.message)}`)

  const newBalance = Number((data as { new_balance: number })?.new_balance ?? 0)
  await reply(chatId, `✅ <b>Credit successful</b>

👤 ${esc(email)}
💳 +$${fmt(amount)}
📝 ${esc(reason)}
💰 New balance: <code>$${fmt(newBalance)}</code>

Logged in audit trail.`)
}

async function cmdDebit(chatId: number, args: string[], adminTgId: string) {
  const [email, amountStr, ...reasonParts] = args
  const reason = reasonParts.join(' ')
  const amount = parseFloat(amountStr)

  if (!email || !amount || !reason) {
    return reply(chatId, '❌ Usage: /debit &lt;email&gt; &lt;amount&gt; &lt;reason&gt;\n\nExample:\n<code>/debit user@email.com 100 Fee reversal</code>')
  }
  if (isNaN(amount) || amount <= 0) return reply(chatId, '❌ Amount must be a positive number.')

  const authUser = await getUserByEmail(email)
  if (!authUser) return reply(chatId, `❌ No user found: <code>${esc(email)}</code>`)

  const account = await getAccountByUserId(authUser.id)
  if (!account) return reply(chatId, '❌ No account found for this user.')

  if (Number(account.balance) < amount) {
    return reply(chatId, `❌ Insufficient balance. Current: <code>$${fmt(Number(account.balance))}</code>`)
  }

  const { data, error } = await supabase.rpc('admin_debit', {
    p_account_id: account.id,
    p_amount:     amount,
    p_reason:     reason,
  })

  if (error) return reply(chatId, `❌ Failed: ${esc(error.message)}`)

  const newBalance = Number((data as { new_balance: number })?.new_balance ?? 0)
  await reply(chatId, `✅ <b>Debit successful</b>

👤 ${esc(email)}
💳 -$${fmt(amount)}
📝 ${esc(reason)}
💰 New balance: <code>$${fmt(newBalance)}</code>

Logged in audit trail.`)
}

async function cmdFreeze(chatId: number, args: string[], adminTgId: string, action: 'freeze' | 'unfreeze') {
  const email = args[0]
  if (!email) return reply(chatId, `❌ Usage: /${action} &lt;email&gt;`)

  const authUser = await getUserByEmail(email)
  if (!authUser) return reply(chatId, `❌ No user found: <code>${esc(email)}</code>`)

  const account = await getAccountByUserId(authUser.id)
  if (!account) return reply(chatId, '❌ No account found for this user.')

  const rpc    = action === 'freeze' ? 'admin_freeze' : 'admin_unfreeze'
  const reason = `${action === 'freeze' ? 'Frozen' : 'Unfrozen'} via Telegram bot by admin ${adminTgId}`
  const { error } = await supabase.rpc(rpc, { p_account_id: account.id, p_reason: reason })

  if (error) return reply(chatId, `❌ Failed: ${esc(error.message)}`)

  const icon = action === 'freeze' ? '🔒' : '🔓'
  await reply(chatId, `${icon} <b>Account ${action === 'freeze' ? 'frozen' : 'unfrozen'}</b>

👤 ${esc(email)}
💰 Balance: <code>$${fmt(Number(account.balance))}</code>

Logged in audit trail.`)
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  // Verify webhook secret
  if (req.headers.get('X-Telegram-Bot-Api-Secret-Token') !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  let update: Record<string, unknown>
  try {
    update = await req.json()
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  const message = update.message as Record<string, unknown> | undefined
  if (!message?.text) return new Response('ok')

  const chatId   = Number((message.chat as Record<string, unknown>)?.id)
  const from     = message.from as Record<string, unknown> | undefined
  const senderId = String(from?.id ?? '')
  const text     = String(message.text ?? '').trim()

  // Auth check
  if (ADMIN_IDS.length > 0 && !ADMIN_IDS.includes(senderId)) {
    await reply(chatId, '⛔ You are not authorized to use this bot.')
    return new Response('ok')
  }

  // Parse command (strip @BotName suffix if present)
  const [rawCmd, ...args] = text.split(/\s+/)
  const cmd = rawCmd.split('@')[0].toLowerCase()

  try {
    switch (cmd) {
      case '/help':                                     await cmdHelp(chatId); break
      case '/stats':                                    await cmdStats(chatId, senderId); break
      case '/user':                                     await cmdUser(chatId, args, senderId); break
      case '/txns':                                     await cmdTxns(chatId, args, senderId); break
      case '/credit':                                   await cmdCredit(chatId, args, senderId); break
      case '/debit':                                    await cmdDebit(chatId, args, senderId); break
      case '/freeze':                                   await cmdFreeze(chatId, args, senderId, 'freeze'); break
      case '/unfreeze':                                 await cmdUnfreezeAlias(chatId, args, senderId); break
      default:
        await reply(chatId, '❓ Unknown command. Type /help for a list of commands.')
    }
  } catch (e) {
    console.error('Bot error:', e)
    await reply(chatId, '⚠️ An unexpected error occurred. Check the edge function logs.')
  }

  return new Response('ok')
})

// Alias to avoid duplicate function names
async function cmdUnfreezeAlias(chatId: number, args: string[], adminTgId: string) {
  return cmdFreeze(chatId, args, adminTgId, 'unfreeze')
}
