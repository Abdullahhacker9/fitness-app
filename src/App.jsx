import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import PromoCode from './components/PromoCode'
import WorkoutLogger from './components/WorkoutLogger'
import ProfileTargets from './components/ProfileTargets'

export default function App() {
  const [session, setSession] = useState(null)
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('workouts')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) checkPremiumStatus(session.user.email)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) checkPremiumStatus(session.user.email)
      else {
        setIsPremium(false)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkPremiumStatus = async (email) => {
    setLoading(true)
    const { data } = await supabase
      .from('premium_users')
      .select('status')
      .eq('email', email)
      .maybeSingle()

    setIsPremium(data?.status === 'active')
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-yellow-400 font-black tracking-widest uppercase">
        Loading...
      </div>
    )
  }

  // GATE 1: Sign in / Sign up
  if (!session) {
    return <Auth />
  }

  // GATE 2: Promo code lock screen (Features remain inaccessible if skipped)
  if (!isPremium) {
    return (
      <PromoCode
        userEmail={session.user.email}
        onComplete={(unlocked) => {
          if (unlocked) {
            setIsPremium(true)
          } else {
            alert('🔒 Features are locked. Enter a valid promo code to unlock.')
          }
        }}
        onSignOut={() => supabase.auth.signOut()}
      />
    )
  }

  // GATE 3: Unlocked App Dashboard
  return (
    <div className="flex min-h-screen bg-black text-zinc-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-black text-yellow-400 italic">FITNESS DEAN</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">PORTAL V1.0</p>

          <nav className="mt-8 space-y-2">
            <button
              onClick={() => setActiveTab('workouts')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === 'workouts'
                  ? 'bg-yellow-400 text-black shadow-lg'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              🏋️ Workout Logger
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === 'profile'
                  ? 'bg-yellow-400 text-black shadow-lg'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              👤 Profile & Targets
            </button>
          </nav>
        </div>

        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full py-3 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all uppercase tracking-wider"
        >
          Sign Out
        </button>
      </aside>

      {/* Main Feature Content */}
      <main className="flex-1 p-8">
        {activeTab === 'workouts' && <WorkoutLogger session={session} />}
        {activeTab === 'profile' && <ProfileTargets session={session} />}
      </main>
    </div>
  )
}