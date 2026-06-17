import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useCards(accountId) {
  const { user } = useAuth()
  const [cards, setCards]     = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('cards').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setCards(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  async function issueCard(accountId) {
    const last4 = String(Math.floor(1000 + Math.random() * 9000))
    const now   = new Date()
    const { data, error } = await supabase.from('cards').insert({
      account_id:       accountId,
      user_id:          user.id,
      card_number_last4: last4,
      card_type:        'virtual',
      network:          'visa',
      expiry_month:     now.getMonth() + 1,
      expiry_year:      now.getFullYear() + 4,
      is_frozen:        false,
    }).select().single()
    if (!error) setCards(prev => [data, ...prev])
    return { data, error }
  }

  async function toggleFreeze(cardId, frozen) {
    const { data } = await supabase.from('cards')
      .update({ is_frozen: frozen }).eq('id', cardId).select().single()
    setCards(prev => prev.map(c => c.id === cardId ? data : c))
  }

  async function setLimit(cardId, limit) {
    const { data } = await supabase.from('cards')
      .update({ spending_limit: limit }).eq('id', cardId).select().single()
    setCards(prev => prev.map(c => c.id === cardId ? data : c))
  }

  return { cards, loading, issueCard, toggleFreeze, setLimit, refresh: fetch }
}
