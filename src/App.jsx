import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import Layout from './components/Layout'
import Onboarding from './components/Onboarding'
import Dashboard from './components/Dashboard'
import PromoCode from './components/PromoCode' // Import component

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)
  const [activeTab, setActiveTab] = useState('HOME')
  const [isPremium, setIsPremium] = useState(false)
  const [checkedPromo, setCheckedPromo] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) checkUserProfile(session.user.id, session.user.email)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) checkUserProfile(session.user.id, session.user.email)
      else setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUserProfile = async (userId, userEmail) => {
    setLoading(true)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    setHasProfile(!!profile)

    const { data: premium } = await supabase
      .from('premium_users')
      .select('status')
      .eq('email', userEmail)
      .single()

    setIsPremium(premium?.status === 'active')
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-yellow-400 flex items-center justify-center font-black italic text-xl">
        LOADING FITNESS DEAN...
      </div>
    )
  }

  // 1. Show Auth screen if not logged in
  if (!session) {
    return <Auth />
  }

  // 2. Ask for Promo Code right after login if not already premium
  if (!isPremium && !checkedPromo) {
    return (
      <PromoCode
        userEmail={session.user.email}
        onComplete={(unlocked) => {
          if (unlocked) setIsPremium(true)
          setCheckedPromo(true)
        }}
      />
    )
  }

  // 3. Complete Onboarding if first time
  if (!hasProfile) {
    return (
      <Onboarding
        session={session}
        onComplete={() => checkUserProfile(session.user.id, session.user.email)}
      />
    )
  }

  // 4. Main App
  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isPremium={isPremium}
      onSignOut={() => supabase.auth.signOut()}
    >
      {activeTab === 'HOME' && <Dashboard session={session} />}
      {/* ... Other tabs ... */}
    </Layout>
  )
}