import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function App() {
  // --- AUTH STATE ---
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoginView, setIsLoginView] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  // --- APP STATE ---
  const [activeTab, setActiveTab] = useState('workouts')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) // Mobile Menu Toggle
  const [exercise, setExercise] = useState('Barbell Bench Press (Chest)')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [loggedWorkouts, setLoggedWorkouts] = useState([
    { id: 1, exercise: 'Barbell Squat', weight: '120', reps: '5', date: 'Today' },
    { id: 2, exercise: 'Incline Dumbbell Press', weight: '32', reps: '8', date: 'Yesterday' }
  ])

  const EXERCISES = [
    'Barbell Bench Press (Chest)',
    'Incline Dumbbell Press (Chest)',
    'Barbell Squat (Legs)',
    'Romanian Deadlift (Legs)',
    'Overhead Press (Shoulders)',
    'Lat Pulldown (Back)',
  ]

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAuth = async (e) => {
    e.preventDefault()
    setAuthError('')
    let error;
    
    if (isLoginView) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      error = signInError
    } else {
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      error = signUpError
    }

    if (error) setAuthError(error.message)
  }

  const handleAddWorkout = (e) => {
    e.preventDefault()
    if (!weight || !reps) return
    setLoggedWorkouts([{ id: Date.now(), exercise, weight, reps, date: 'Just now' }, ...loggedWorkouts])
    setWeight('')
    setReps('')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-[#FFC107] font-black tracking-widest uppercase">
        LOADING...
      </div>
    )
  }

  // ==========================================
  // 1. RESPONSIVE LOGIN SCREEN
  // ==========================================
  if (!session) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center p-4 md:p-6 font-sans text-zinc-100">
        <div className="w-full max-w-[420px] flex flex-col items-center">
          
          <div className="mb-6 md:mb-8 text-center flex flex-col items-center">
            <span className="rounded-full bg-[#FFC107]/10 border border-[#FFC107]/30 px-3 py-1 text-[10px] md:text-xs font-black text-[#FFC107] uppercase tracking-wider mb-4 md:mb-6 flex items-center gap-2">
              ⚡ FITNESS DEAN GYM
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-[#FFC107] italic uppercase leading-tight mb-3 md:mb-4">
              NO EXCUSES. JUST<br/>GAINS.
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 px-4">Sign in to access your workouts and manage your membership.</p>
          </div>
          
          <div className="w-full p-5 md:p-8 rounded-2xl border border-zinc-800 bg-[#0a0a0a] shadow-2xl">
            {/* Toggle Switch */}
            <div className="flex bg-[#1a1a1a] rounded-lg p-1 mb-6 md:mb-8">
              <button 
                onClick={() => setIsLoginView(true)}
                className={`flex-1 py-2.5 text-[10px] md:text-xs font-bold uppercase rounded-md transition-colors ${isLoginView ? 'bg-[#FFC107] text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                SIGN IN
              </button>
              <button 
                onClick={() => setIsLoginView(false)}
                className={`flex-1 py-2.5 text-[10px] md:text-xs font-bold uppercase rounded-md transition-colors ${!isLoginView ? 'bg-[#FFC107] text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                CREATE ACCOUNT
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4 md:space-y-5">
              {authError && <div className="p-3 rounded bg-red-900/30 border border-red-900 text-red-500 text-xs font-bold">{authError}</div>}
              
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-[#FFC107] uppercase tracking-wider mb-2">EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-[#141414] px-4 py-3 text-sm text-zinc-100 outline-none focus:border-[#FFC107]"
                  placeholder="athlete@fitnessdean.com"
                />
              </div>
              
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-[#FFC107] uppercase tracking-wider mb-2">PASSWORD</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-[#141414] px-4 py-3 text-sm text-zinc-100 outline-none focus:border-[#FFC107]"
                    placeholder="••••••••"
                  />
                  <span className="absolute right-4 top-3 text-zinc-500">👁️</span>
                </div>
              </div>
              
              <button type="submit" className="w-full rounded-lg bg-[#FFC107] py-3.5 md:py-4 text-xs md:text-sm font-black uppercase text-black hover:bg-yellow-400 transition-colors mt-2 md:mt-4 shadow-[0_0_15px_rgba(255,193,7,0.2)]">
                ENTER FITNESS DEAN GYM
              </button>
            </form>

            <div className="mt-5 md:mt-6 text-center">
              <button onClick={() => setIsLoginView(!isLoginView)} className="text-[10px] md:text-xs text-zinc-500 hover:text-zinc-300">
                {isLoginView ? "Don't have an account? Create Account" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================
  // 2. RESPONSIVE DASHBOARD SCREEN
  // ==========================================
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black text-zinc-100 font-sans w-full overflow-hidden">
      
      {/* MOBILE HEADER (Only visible on small screens) */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800/60 bg-[#0a0a0a] sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-black text-[#FFC107] italic uppercase">FITNESS DEAN</h1>
          <span className="rounded bg-[#FFC107]/20 border border-[#FFC107]/40 px-1 py-0.5 text-[8px] font-black text-[#FFC107] uppercase">PRO</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)} 
          className="text-[#FFC107] p-1 focus:outline-none"
        >
          {/* Hamburger Icon */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
      </div>

      {/* MOBILE OVERLAY BACKGROUND */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* SIDEBAR (Slide-in on Mobile, Fixed left on Desktop) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#050505] border-r border-zinc-800/60 p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="flex items-center justify-between md:justify-start gap-3">
            <h1 className="text-xl font-black text-[#FFC107] italic uppercase">FITNESS DEAN</h1>
            <button className="md:hidden text-zinc-500 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
              ✕
            </button>
          </div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 mb-8">PORTAL V1.0</p>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'DASHBOARD' },
              { id: 'workouts', label: 'WORKOUT LOGGER' },
              { id: 'catalog', label: 'EXERCISE CATALOG' },
              { id: 'nutrition', label: 'NUTRITION & MACROS' },
              { id: 'analytics', label: 'ANALYTICS & PRS' },
              { id: 'profile', label: 'PROFILE & TARGETS' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false); // Close menu on click in mobile
                }}
                className={`w-full text-left px-4 py-3.5 rounded-xl font-bold text-[11px] md:text-xs uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#FFC107] text-black shadow-lg shadow-[#FFC107]/10'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-3 mt-8">
          <button className="w-full py-3 rounded-xl border border-[#FFC107]/30 text-[10px] md:text-xs font-bold text-[#FFC107] hover:bg-[#FFC107]/10 transition-colors uppercase tracking-wider">
            SCAN QR FOR MOBILE
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full py-3 rounded-xl border border-zinc-800 text-[10px] md:text-xs font-bold text-zinc-500 hover:bg-zinc-900 hover:text-white transition-colors uppercase tracking-wider"
          >
            SIGN OUT
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-black w-full">
        
        {activeTab === 'workouts' && (
          <div className="w-full max-w-3xl space-y-4 md:space-y-6 mx-auto md:mx-0">
            
            {/* LOGGER FORM */}
            <div className="rounded-2xl border border-zinc-800/60 bg-[#0a0a0a] p-5 md:p-6 shadow-xl">
              <h2 className="text-lg md:text-xl font-black italic text-[#FFC107] uppercase mb-1">WORKOUT LOGGER</h2>
              <p className="text-[11px] md:text-xs text-zinc-400 mb-5 md:mb-6">Log your weight and reps to build training volume.</p>
              
              <form onSubmit={handleAddWorkout} className="space-y-4 md:space-y-5">
                <div>
                  <label className="block text-[10px] md:text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">SELECT EXERCISE</label>
                  <select
                    value={exercise}
                    onChange={(e) => setExercise(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-[#141414] px-3 md:px-4 py-3 md:py-3.5 text-xs md:text-sm text-zinc-100 outline-none focus:border-[#FFC107] appearance-none"
                  >
                    {EXERCISES.map((ex, idx) => (
                      <option key={idx} value={ex}>{ex}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] md:text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">WEIGHT (KG)</label>
                    <input
                      type="number"
                      placeholder="e.g. 80"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-[#141414] px-3 md:px-4 py-3 md:py-3.5 text-xs md:text-sm text-zinc-100 outline-none focus:border-[#FFC107]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] md:text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">REPS COMPLETED</label>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-[#141414] px-3 md:px-4 py-3 md:py-3.5 text-xs md:text-sm text-zinc-100 outline-none focus:border-[#FFC107]"
                    />
                  </div>
                </div>
                
                <button type="submit" className="w-full rounded-xl bg-[#FFC107] py-3.5 md:py-4 text-xs md:text-sm font-black uppercase text-black hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(255,193,7,0.15)] mt-2">
                  + LOG SET NOW
                </button>
              </form>
            </div>

            {/* HISTORY LIST */}
            <div className="rounded-2xl border border-zinc-800/60 bg-[#0a0a0a] p-5 md:p-6 shadow-xl">
              <h3 className="text-[11px] md:text-sm font-black italic text-zinc-300 uppercase tracking-wide mb-4 md:mb-5">LOGGED WORKOUT HISTORY</h3>
              <div className="space-y-3">
                {loggedWorkouts.map((item) => (
                  <div key={item.id} className="flex flex-row justify-between items-center rounded-xl border border-zinc-800/60 bg-[#141414] p-4 md:p-5">
                    <div className="flex-1 pr-2">
                      <h4 className="font-bold text-sm md:text-[15px] text-zinc-100 mb-0.5 md:mb-1 truncate">{item.exercise}</h4>
                      <p className="text-[10px] md:text-xs text-zinc-500">{item.date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[#FFC107] font-black text-base md:text-lg">{item.weight} kg</span>
                      <span className="text-zinc-400 text-xs md:text-sm ml-1 md:ml-2">× {item.reps} reps</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  )
}