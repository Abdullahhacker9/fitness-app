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
  const [activeTab, setActiveTab] = useState('dashboard')

  // Catalog state
  const [searchQuery, setSearchQuery] = useState('')
  
  // Quick exercise library data
  const EXERCISE_LIBRARY = [
    { name: 'Bench Press', category: 'Chest', equipment: 'Barbell' },
    { name: 'Incline Dumbbell Press', category: 'Chest', equipment: 'Dumbbell' },
    { name: 'Squat', category: 'Legs', equipment: 'Barbell' },
    { name: 'Romanian Deadlift', category: 'Legs', equipment: 'Barbell' },
    { name: 'Overhead Press', category: 'Shoulders', equipment: 'Barbell' },
    { name: 'Lateral Raise', category: 'Shoulders', equipment: 'Dumbbell' },
    { name: 'Lat Pulldown', category: 'Back', equipment: 'Cable' },
    { name: 'Barbell Row', category: 'Back', equipment: 'Barbell' },
    { name: 'Bicep Curl', category: 'Arms', equipment: 'Dumbbell' },
    { name: 'Tricep Pushdown', category: 'Arms', equipment: 'Cable' },
  ]

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

  // GATE 2: Promo code lock screen
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

  const filteredExercises = EXERCISE_LIBRARY.filter(
    (ex) =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // GATE 3: Unlocked Dashboard Layout
  return (
    <div className="flex min-h-screen bg-black text-zinc-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-yellow-400 italic">FITNESS DEAN</h1>
            <span className="rounded bg-yellow-400/20 border border-yellow-400/40 px-2 py-0.5 text-[10px] font-black text-yellow-400 uppercase">
              👑 PRO
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">PORTAL V1.0</p>

          <nav className="mt-8 space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-3 ${
                activeTab === 'dashboard'
                  ? 'bg-yellow-400 text-black shadow-lg font-black'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <span>㗊</span> Dashboard
            </button>

            <button
              onClick={() => setActiveTab('workouts')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-3 ${
                activeTab === 'workouts'
                  ? 'bg-yellow-400 text-black shadow-lg font-black'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <span>🏋️</span> Workout Logger
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-3 ${
                activeTab === 'catalog'
                  ? 'bg-yellow-400 text-black shadow-lg font-black'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <span>📖</span> Exercise Catalog
            </button>

            <button
              onClick={() => setActiveTab('nutrition')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-3 ${
                activeTab === 'nutrition'
                  ? 'bg-yellow-400 text-black shadow-lg font-black'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <span>🍴</span> Nutrition & Macros
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-3 ${
                activeTab === 'analytics'
                  ? 'bg-yellow-400 text-black shadow-lg font-black'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <span>📈</span> Analytics & PRs
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-3 ${
                activeTab === 'profile'
                  ? 'bg-yellow-400 text-black shadow-lg font-black'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <span>👤</span> Profile & Targets
            </button>
          </nav>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => alert('Scan QR Code feature enabled for mobile PWA session sync.')}
            className="w-full py-2.5 rounded-xl border border-yellow-500/30 bg-yellow-500/5 text-xs font-bold text-yellow-400 hover:bg-yellow-500/10 transition-all uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <span>📱</span> Scan QR for Mobile
          </button>

          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full py-2.5 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <span>↪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* 1. DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 max-w-4xl">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
              <span className="text-xs font-black uppercase text-yellow-400 tracking-wider">
                ⚡ VIP STATUS ACTIVE
              </span>
              <h2 className="text-3xl font-black text-white italic mt-1">
                WELCOME BACK, ATHLETE
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Logged in as {session.user.email}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setActiveTab('workouts')}
                className="cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-950 p-5 hover:border-yellow-400/50 transition-all"
              >
                <div className="text-2xl mb-2">🏋️</div>
                <h3 className="font-bold text-zinc-100 uppercase text-sm">Workout Logger</h3>
                <p className="text-xs text-zinc-500 mt-1">Record sets, reps, and weights</p>
              </div>

              <div
                onClick={() => setActiveTab('catalog')}
                className="cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-950 p-5 hover:border-yellow-400/50 transition-all"
              >
                <div className="text-2xl mb-2">📖</div>
                <h3 className="font-bold text-zinc-100 uppercase text-sm">Exercise Catalog</h3>
                <p className="text-xs text-zinc-500 mt-1">Browse exercise technique guides</p>
              </div>

              <div
                onClick={() => setActiveTab('profile')}
                className="cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-950 p-5 hover:border-yellow-400/50 transition-all"
              >
                <div className="text-2xl mb-2">👤</div>
                <h3 className="font-bold text-zinc-100 uppercase text-sm">Profile Goals</h3>
                <p className="text-xs text-zinc-500 mt-1">Update weight & calorie targets</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. WORKOUT LOGGER */}
        {activeTab === 'workouts' && <WorkoutLogger session={session} />}

        {/* 3. EXERCISE CATALOG */}
        {activeTab === 'catalog' && (
          <div className="space-y-6 max-w-4xl">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
              <h2 className="text-xl font-black italic text-yellow-400 mb-2">EXERCISE CATALOG</h2>
              <input
                type="text"
                placeholder="Search exercise or muscle group..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-yellow-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExercises.map((ex, idx) => (
                <div key={idx} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-zinc-100">{ex.name}</h3>
                    <p className="text-xs text-zinc-500">{ex.equipment}</p>
                  </div>
                  <span className="rounded-full bg-yellow-400/10 border border-yellow-400/30 px-3 py-1 text-[10px] font-bold text-yellow-400 uppercase">
                    {ex.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. NUTRITION & MACROS */}
        {activeTab === 'nutrition' && (
          <div className="max-w-2xl space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
              <h2 className="text-xl font-black italic text-yellow-400 mb-1">NUTRITION & MACROS</h2>
              <p className="text-xs text-zinc-400 mb-6">Track daily calories and macro totals.</p>

              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="text-xl font-black text-yellow-400">0</div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Calories</div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="text-xl font-black text-yellow-400">0g</div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Protein</div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="text-xl font-black text-yellow-400">0g</div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Carbs</div>
                </div>
              </div>

              <button
                onClick={() => alert('Quick calorie log feature ready.')}
                className="w-full rounded-lg bg-yellow-400 py-3 text-xs font-black uppercase text-black hover:bg-yellow-300 transition-colors"
              >
                + LOG MEAL
              </button>
            </div>
          </div>
        )}

        {/* 5. ANALYTICS & PRS */}
        {activeTab === 'analytics' && (
          <div className="max-w-2xl space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
              <h2 className="text-xl font-black italic text-yellow-400 mb-1">PERSONAL RECORDS (PRs)</h2>
              <p className="text-xs text-zinc-400 mb-6">Your highest recorded weights automatically populate here.</p>

              <div className="space-y-3">
                <div className="rounded-xl border border-zinc-900 bg-zinc-900/50 p-4 flex justify-between items-center">
                  <span className="font-bold text-sm">Bench Press</span>
                  <span className="text-xs font-mono text-yellow-400 font-bold">100 kg</span>
                </div>
                <div className="rounded-xl border border-zinc-900 bg-zinc-900/50 p-4 flex justify-between items-center">
                  <span className="font-bold text-sm">Squat</span>
                  <span className="text-xs font-mono text-yellow-400 font-bold">140 kg</span>
                </div>
                <div className="rounded-xl border border-zinc-900 bg-zinc-900/50 p-4 flex justify-between items-center">
                  <span className="font-bold text-sm">Deadlift</span>
                  <span className="text-xs font-mono text-yellow-400 font-bold">180 kg</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. PROFILE & TARGETS */}
        {activeTab === 'profile' && <ProfileTargets session={session} />}
      </main>
    </div>
  )
}