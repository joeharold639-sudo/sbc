import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTransactions(accountId) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading]           = useState(true)

  const fetch = useCallback(async () => {
    if (!accountId) return
    setLoading(true)
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .limit(50)
    setTransactions(data ?? [])
    setLoading(false)
  }, [accountId])

  useEffect(() => { fetch() }, [fetch])

  // Real-time subscription
  useEffect(() => {
    if (!accountId) return
    const channel = supabase
      .channel(`transactions:${accountId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
        filter: `account_id=eq.${accountId}`,
      }, (payload) => {
        setTransactions(prev => [payload.new, ...prev])
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [accountId])

  return { transactions, loading, refetch: fetch }
}
