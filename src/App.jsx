import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import Layout from './components/Layout'
import Onboarding from './components/Onboarding'
import Dashboard from './components/Dashboard'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)
  const [activeTab, setActiveTab] = useState('HOME')
  const [isPremium, setIsPremium] = useState(false)

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

  if (!session) {
    return <Auth />
  }

  if (!hasProfile) {
    return (
      <Onboarding
        session={session}
        onComplete={() => checkUserProfile(session.user.id, session.user.email)}
      />
    )
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isPremium={isPremium}
      onSignOut={() => supabase.auth.signOut()}
    >
      {activeTab === 'HOME' && <Dashboard session={session} />}
      {activeTab === 'WORKOUT' && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-yellow-400 font-bold uppercase">
          Workout Tracker & Custom Routines Tab (Ready for Step 6)
        </div>
      )}
      {activeTab === 'EXERCISES' && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-yellow-400 font-bold uppercase">
          Complete Exercise Library Tab (Ready for Step 7)
        </div>
      )}
      {activeTab === 'NUTRITION' && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-yellow-400 font-bold uppercase">
          Real-time Calorie & Macro Tracker Tab (Ready for Step 8)
        </div>
      )}
      {activeTab === 'PROGRESS' && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-yellow-400 font-bold uppercase">
          Progress & PR Analytics Tab (Ready for Step 9)
        </div>
      )}
      {activeTab === 'PROFILE' && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-yellow-400 font-bold uppercase">
          Athlete Profile & Settings Tab (Ready for Step 10)
        </div>
      )}
    </Layout>
  )
}