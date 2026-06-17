import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function generateBtcAddress() {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  return 'bc1q' + Array.from({ length: 38 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function useBtcWallet() {
  const { user } = useAuth()
  const [wallet, setWallet]   = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchOrCreate = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data: existing } = await supabase
      .from('btc_wallets').select('*').eq('user_id', user.id).single()

    if (existing) { setWallet(existing); setLoading(false); return }

    const { data: created } = await supabase
      .from('btc_wallets')
      .insert({ user_id: user.id, address: generateBtcAddress(), balance_btc: 0 })
      .select().single()
    setWallet(created)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchOrCreate() }, [fetchOrCreate])

  return { wallet, loading, refresh: fetchOrCreate }
}
