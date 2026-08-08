import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser]                 = useState(null)
  const [profile, setProfile]           = useState(null)
  const [loading, setLoading]           = useState(true)
  const [profileError, setProfileError] = useState(null)
  const [mfaLevel, setMfaLevel]         = useState(null) // 'aal1' | 'aal2'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setMfaLevel(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) setProfileError(error.message)
    setProfile(data ?? null)

    // Check MFA level for admin users
    if (data?.is_admin) {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      setMfaLevel(aal?.currentLevel ?? 'aal1')
    }

    setLoading(false)
  }

  async function signUp({ email, password, fullName }) {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })
  }

  async function signIn({ email, password }) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function signOut() {
    return supabase.auth.signOut()
  }

  async function refreshMfaLevel() {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    setMfaLevel(aal?.currentLevel ?? 'aal1')
    return aal?.currentLevel ?? 'aal1'
  }

  async function updateProfile(updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (!error) setProfile(data)
    return { data, error }
  }

  // True when admin hasn't completed MFA for this session
  const mfaRequired = profile?.is_admin && mfaLevel === 'aal1'

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileError, mfaLevel, mfaRequired, signUp, signIn, signOut, updateProfile, refreshMfaLevel }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
