import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function generateAccountNumber() {
  return Array.from({ length: 4 }, () =>
    Math.floor(1000 + Math.random() * 9000)
  ).join(' ')
}

const SEED_TRANSACTIONS = (accountId) => [
  { account_id: accountId, type: 'credit',       amount: 4500.00, currency: 'USD', description: 'Salary — Acme Corp',          status: 'completed', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { account_id: accountId, type: 'debit',        amount:   29.99, currency: 'USD', description: 'Netflix Subscription',         status: 'completed', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { account_id: accountId, type: 'transfer',     amount:  850.00, currency: 'USD', description: "Rent payment",                recipient_name: 'James Wilson',    status: 'completed', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { account_id: accountId, type: 'btc_buy',      amount:  500.00, currency: 'USD', description: 'Bitcoin purchase',             status: 'completed', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { account_id: accountId, type: 'credit',       amount: 1240.00, currency: 'USD', description: 'Freelance — Design project',   status: 'completed', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { account_id: accountId, type: 'debit',        amount:   89.50, currency: 'USD', description: 'Amazon.com',                   status: 'completed', created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { account_id: accountId, type: 'bill_payment', amount:  120.00, currency: 'USD', description: 'Electricity bill',             status: 'completed', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { account_id: accountId, type: 'debit',        amount:   45.20, currency: 'USD', description: 'Uber Eats',                    status: 'completed', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { account_id: accountId, type: 'transfer',     amount:  200.00, currency: 'USD', description: 'Transfer to Sarah',           recipient_name: 'Sarah Johnson',   status: 'completed', created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
  { account_id: accountId, type: 'credit',       amount:  350.00, currency: 'USD', description: 'Refund — Apple Store',         status: 'completed', created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
  { account_id: accountId, type: 'debit',        amount:   15.99, currency: 'USD', description: 'Spotify Premium',              status: 'completed', created_at: new Date(Date.now() - 8 * 86400000).toISOString() },
  { account_id: accountId, type: 'bill_payment', amount:   80.00, currency: 'USD', description: 'Internet bill — AT&T',         status: 'completed', created_at: new Date(Date.now() - 9 * 86400000).toISOString() },
]

export function useAccount() {
  const { user } = useAuth()
  const [account, setAccount]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  const fetchOrCreate = useCallback(async () => {
    if (!user) return
    setLoading(true)

    // Try to fetch existing account — use limit(1) to avoid error when duplicates exist
    const { data: existing } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)

    if (existing && existing.length > 0) {
      setAccount(existing[0])
      setLoading(false)
      return
    }

    // Create new account + seed transactions
    const { data: created, error: createErr } = await supabase
      .from('accounts')
      .insert({
        user_id:        user.id,
        account_number: generateAccountNumber(),
        type:           'personal',
        currency:       'USD',
        balance:        5989.32,
      })
      .select()
      .single()

    if (createErr) { setError(createErr.message); setLoading(false); return }

    // Seed demo transactions
    await supabase.from('transactions').insert(SEED_TRANSACTIONS(created.id))
    setAccount(created)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchOrCreate() }, [fetchOrCreate])

  const refresh = () => fetchOrCreate()
  return { account, loading, error, refresh }
}
