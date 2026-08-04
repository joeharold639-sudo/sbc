import { useEffect, useState, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useAdmin() {
  const { user, profile } = useAuth()
  const [profiles,     setProfiles]     = useState([])
  const [accounts,     setAccounts]     = useState([])
  const [transactions, setTransactions] = useState([])
  const [auditLog,     setAuditLog]     = useState([])
  const [loading,      setLoading]      = useState(true)

  const load = useCallback(async () => {
    if (!user || !profile?.is_admin) { setLoading(false); return }
    setLoading(true)

    const [{ data: p }, { data: a }, { data: t }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('accounts').select('*').order('created_at', { ascending: false }),
      supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(300),
    ])

    setProfiles(p ?? [])
    setAccounts(a ?? [])
    setTransactions(t ?? [])

    // Fetch audit log separately — table may not exist yet if schema-v3 not applied
    const { data: al } = await supabase
      .from('admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    setAuditLog(al ?? [])

    setLoading(false)
  }, [user, profile?.is_admin])

  useEffect(() => { load() }, [load])

  const accountByUserId = useMemo(() =>
    Object.fromEntries(accounts.map(a => [a.user_id, a])), [accounts])

  const profileByAccountId = useMemo(() => {
    const accountToUser = Object.fromEntries(accounts.map(a => [a.id, a.user_id]))
    const profileById   = Object.fromEntries(profiles.map(p => [p.id, p]))
    return Object.fromEntries(accounts.map(a => [a.id, profileById[accountToUser[a.id]]]))
  }, [accounts, profiles])

  const profileById = useMemo(() =>
    Object.fromEntries(profiles.map(p => [p.id, p])), [profiles])

  const stats = useMemo(() => ({
    totalUsers:        profiles.length,
    totalBalance:      accounts.reduce((s, a) => s + (a.balance || 0), 0),
    totalTransactions: transactions.length,
    totalVolume:       transactions.reduce((s, t) => s + (t.amount || 0), 0),
  }), [profiles, accounts, transactions])

  return {
    profiles, accounts, transactions, auditLog,
    stats, accountByUserId, profileByAccountId, profileById,
    loading, refresh: load,
  }
}
