import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAdminActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function run(fn) {
    setLoading(true)
    setError(null)
    try {
      const result = await fn()
      return result
    } catch (e) {
      setError(e.message)
      return { success: false, error: e.message }
    } finally {
      setLoading(false)
    }
  }

  async function creditAccount(accountId, amount, reason) {
    return run(async () => {
      const { data, error } = await supabase.rpc('admin_credit', {
        p_account_id: accountId,
        p_amount:     amount,
        p_reason:     reason,
      })
      if (error) return { success: false, error: error.message }
      return { success: true, data }
    })
  }

  async function debitAccount(accountId, amount, reason) {
    return run(async () => {
      const { data, error } = await supabase.rpc('admin_debit', {
        p_account_id: accountId,
        p_amount:     amount,
        p_reason:     reason,
      })
      if (error) return { success: false, error: error.message }
      return { success: true, data }
    })
  }

  async function freezeAccount(accountId, reason = 'Admin action') {
    return run(async () => {
      const { error } = await supabase.rpc('admin_freeze', {
        p_account_id: accountId,
        p_reason:     reason,
      })
      if (error) return { success: false, error: error.message }
      return { success: true }
    })
  }

  async function unfreezeAccount(accountId, reason = 'Admin action') {
    return run(async () => {
      const { error } = await supabase.rpc('admin_unfreeze', {
        p_account_id: accountId,
        p_reason:     reason,
      })
      if (error) return { success: false, error: error.message }
      return { success: true }
    })
  }

  return { creditAccount, debitAccount, freezeAccount, unfreezeAccount, loading, error }
}
