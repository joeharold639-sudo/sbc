import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://oetuizloaslvjmdjyinx.supabase.co'
// Get service role key from: Supabase Dashboard → Project Settings → API → service_role
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY || ''

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

function accountNumber() {
  return Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000)).join(' ')
}

function seedTx(accountId) {
  return [
    { account_id: accountId, type: 'credit',       amount: 4500.00,   currency: 'USD', description: 'Salary — Acme Corp',         status: 'completed', created_at: new Date(Date.now() - 1*86400000).toISOString() },
    { account_id: accountId, type: 'debit',        amount:   29.99,   currency: 'USD', description: 'Netflix Subscription',        status: 'completed', created_at: new Date(Date.now() - 1*86400000).toISOString() },
    { account_id: accountId, type: 'transfer',     amount:  850.00,   currency: 'USD', description: 'Rent payment',               recipient_name: 'James Wilson',  status: 'completed', created_at: new Date(Date.now() - 2*86400000).toISOString() },
    { account_id: accountId, type: 'credit',       amount: 1240.00,   currency: 'USD', description: 'Freelance — Design project',  status: 'completed', created_at: new Date(Date.now() - 3*86400000).toISOString() },
    { account_id: accountId, type: 'debit',        amount:   89.50,   currency: 'USD', description: 'Amazon.com',                  status: 'completed', created_at: new Date(Date.now() - 4*86400000).toISOString() },
    { account_id: accountId, type: 'bill_payment', amount:  120.00,   currency: 'USD', description: 'Electricity bill',            status: 'completed', created_at: new Date(Date.now() - 5*86400000).toISOString() },
    { account_id: accountId, type: 'credit',       amount:  350.00,   currency: 'USD', description: 'Refund — Apple Store',        status: 'completed', created_at: new Date(Date.now() - 7*86400000).toISOString() },
  ]
}

async function createUser({ email, password, fullName, isAdmin, balance }) {
  console.log(`\n→ Processing ${email}…`)

  // 1. Create or fetch auth user
  let userId
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })
  if (authErr) {
    if (!authErr.message.includes('already been registered')) {
      console.error('  Auth error:', authErr.message); return
    }
    // User exists — look them up
    const { data: list } = await supabase.auth.admin.listUsers()
    const found = list?.users?.find(u => u.email === email)
    if (!found) { console.error('  Could not find existing user'); return }
    userId = found.id
    console.log(`  Auth user found: ${userId}`)
  } else {
    userId = authData.user.id
    console.log(`  Auth user created: ${userId}`)
  }

  // 2. Upsert profile (no email column — it's set by the trigger)
  const { error: profileErr } = await supabase.from('profiles').upsert({
    id:         userId,
    full_name:  fullName,
    is_admin:   isAdmin ?? false,
    updated_at: new Date().toISOString(),
  })
  if (profileErr) console.error('  Profile error:', profileErr.message)
  else console.log(`  Profile upserted  (is_admin: ${isAdmin ?? false})`)

  // 3. Create account
  const { data: acct, error: acctErr } = await supabase.from('accounts').insert({
    user_id:        userId,
    account_number: accountNumber(),
    type:           'personal',
    currency:       'USD',
    balance,
  }).select().single()
  if (acctErr) { console.error('  Account error:', acctErr.message); return }
  console.log(`  Account created   (balance: $${balance.toLocaleString()})`)

  // 4. Seed transactions
  const { error: txErr } = await supabase.from('transactions').insert(seedTx(acct.id))
  if (txErr) console.error('  Transactions error:', txErr.message)
  else console.log(`  Transactions seeded`)

  return { userId, accountId: acct.id }
}

const USERS = [
  {
    email:    'sammycrypto25@gmail.com',
    password: 'Adm!n$Synx2026#Kx',
    fullName: 'Sammy Crypto',
    isAdmin:  true,
    balance:  25000.00,
  },
  {
    email:    'nestor25lewis@gmail.com',
    password: 'N3st0r@Trust$826Lw',
    fullName: 'Nestor Lewis',
    isAdmin:  false,
    balance:  396142.00,
  },
]

console.log('=== Syntax Trust Bank — User Seeder ===')
for (const u of USERS) await createUser(u)
console.log('\n✓ Done.')
console.log('\nCredentials:')
for (const u of USERS) console.log(`  ${u.email}  /  ${u.password}  (admin: ${u.isAdmin})`)
