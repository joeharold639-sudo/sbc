import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useAdmin() {
  const { user, profile } = useAuth()
  const [profiles, setProfiles]         = useState([])
  const [accounts, setAccounts]         = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    if (!user || !profile?.is_admin) { setLoading(false); return }

    async function load() {
      setLoading(true)
      const [{ data: p }, { data: a }, { data: t }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('accounts').select('*').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(300),
      ])
      setProfiles(p ?? [])
      setAccounts(a ?? [])
      setTransactions(t ?? [])
      setLoading(false)
    }
    load()
  }, [user, profile?.is_admin])

  const accountByUserId = useMemo(() =>
    Object.fromEntries(accounts.map(a => [a.user_id, a])), [accounts])

  const profileByAccountId = useMemo(() => {
    const accountToUser = Object.fromEntries(accounts.map(a => [a.id, a.user_id]))
    const profileById   = Object.fromEntries(profiles.map(p => [p.id, p]))
    return Object.fromEntries(
      accounts.map(a => [a.id, profileById[accountToUser[a.id]]])
    )
  }, [accounts, profiles])

  const stats = useMemo(() => ({
    totalUsers:        profiles.length,
    totalBalance:      accounts.reduce((s, a) => s + (a.balance || 0), 0),
    totalTransactions: transactions.length,
    totalVolume:       transactions.reduce((s, t) => s + (t.amount || 0), 0),
  }), [profiles, accounts, transactions])

  return { profiles, accounts, transactions, stats, accountByUserId, profileByAccountId, loading }
}
