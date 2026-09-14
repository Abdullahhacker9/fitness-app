import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

// SVG Icons for clean zero-dependency rendering
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Workouts: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Catalog: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Nutrition: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  ),
  Analytics: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Profile: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  // --- WORKOUT LOGGER STATE ---
  const [exercise, setExercise] = useState('Barbell Bench Press')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [loggedWorkouts, setLoggedWorkouts] = useState([
    { id: 1, exercise: 'Barbell Back Squat', weight: '120', reps: '5', date: 'Today' },
    { id: 2, exercise: 'Incline Dumbbell Press', weight: '32', reps: '8', date: 'Yesterday' },
  ])

  // --- CATALOG STATE ---
  const [searchQuery, setSearchQuery] = useState('')

  // --- NUTRITION STATE ---
  const [mealName, setMealName] = useState('')
  const [mealCals, setMealCals] = useState('')
  const [mealProtein, setMealProtein] = useState('')
  const [meals, setMeals] = useState([
    { name: 'Oatmeal & Whey Protein', cals: 450, protein: 35 },
    { name: 'Chicken Breast & Rice', cals: 650, protein: 55 }
  ])

  // --- PROFILE STATE ---
  const [profile, setProfile] = useState({
    name: 'Athlete',
    weight: '78',
    targetWeight: '82',
    cals: '2800',
    water: '3.5'
  })
  const [profileSaved, setProfileSaved] = useState(false)

  const EXERCISES = [
    { name: 'Barbell Bench Press', category: 'Chest', equipment: 'Barbell' },
    { name: 'Incline Dumbbell Press', category: 'Chest', equipment: 'Dumbbell' },
    { name: 'Barbell Back Squat', category: 'Legs', equipment: 'Barbell' },
    { name: 'Romanian Deadlift', category: 'Legs', equipment: 'Barbell' },
    { name: 'Overhead Press', category: 'Shoulders', equipment: 'Barbell' },
    { name: 'Lat Pulldown', category: 'Back', equipment: 'Cable' },
    { name: 'Dumbbell Bicep Curl', category: 'Arms', equipment: 'Dumbbell' },
    { name: 'Tricep Pushdown', category: 'Arms', equipment: 'Cable' },
  ]

  const NAVIGATION_TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
    { id: 'workouts', label: 'Workouts', icon: Icons.Workouts },
    { id: 'catalog', label: 'Catalog', icon: Icons.Catalog },
    { id: 'nutrition', label: 'Macros', icon: Icons.Nutrition },
    { id: 'analytics', label: 'PRs', icon: Icons.Analytics },
    { id: 'profile', label: 'Profile', icon: Icons.Profile },
  ]

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    }).catch(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAddWorkout = (e) => {
    e.preventDefault()
    if (!weight || !reps) return
    setLoggedWorkouts([{ id: Date.now(), exercise, weight, reps, date: 'Just now' }, ...loggedWorkouts])
    setWeight('')
    setReps('')
  }

  const handleAddMeal = (e) => {
    e.preventDefault()
    if (!mealName || !mealCals) return
    setMeals([...meals, { name: mealName, cals: parseInt(mealCals), protein: parseInt(mealProtein) || 0 }])
    setMealName('')
    setMealCals('')
    setMealProtein('')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-yellow-400 font-black tracking-widest uppercase text-sm animate-pulse">
        LOADING FITNESS DEN...
      </div>
    )
  }

  const filteredExercises = EXERCISES.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalCalsLogged = meals.reduce((acc, m) => acc + m.cals, 0)
  const totalProteinLogged = meals.reduce((acc, m) => acc + m.protein, 0)

  return (
    <div className="flex min-h-screen bg-black text-zinc-100 font-sans">
      
      {/* DESKTOP SIDEBAR (Hidden on Mobile) */}
      <aside className="hidden md:flex w-64 border-r border-zinc-800/80 p-6 flex-col justify-between shrink-0 bg-zinc-950/40 backdrop-blur-md">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-yellow-400 italic tracking-wider">FITNESS DEN</h1>
            <span className="rounded bg-yellow-400/20 border border-yellow-400/40 px-2 py-0.5 text-[10px] font-black text-yellow-400 uppercase">
              PRO
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">ATHLETE PORTAL</p>

          <nav className="mt-8 space-y-2">
            {NAVIGATION_TABS.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                    active
                      ? 'bg-yellow-400 text-black font-black shadow-lg shadow-yellow-400/20'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <Icon />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full py-2.5 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all uppercase tracking-wider"
        >
          SIGN OUT
        </button>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-28 md:pb-8 max-w-5xl mx-auto w-full">
        
        {/* MOBILE HEADER (Shown only on mobile) */}
        <div className="md:hidden flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
          <div>
            <h1 className="text-lg font-black text-yellow-400 italic">FITNESS DEN</h1>
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest">ATHLETE PORTAL</p>
          </div>
          <span className="rounded bg-yellow-400/10 border border-yellow-400/30 px-2.5 py-1 text-[10px] font-black text-yellow-400 uppercase">
            PRO ACCESS
          </span>
        </div>

        {/* 1. DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-zinc-900/90 to-zinc-950 p-5 md:p-6 shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none"></div>
              <span className="text-[10px] font-black uppercase text-yellow-400 tracking-widest bg-yellow-400/10 border border-yellow-400/30 px-2.5 py-1 rounded-full">
                ⚡ VIP DASHBOARD
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white italic mt-3 uppercase">
                WELCOME BACK, {profile.name.toUpperCase()}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Account: {session?.user?.email || 'Logged In'}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              <div
                onClick={() => setActiveTab('workouts')}
                className="cursor-pointer rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 hover:border-yellow-400/40 transition-all active:scale-95"
              >
                <div className="text-yellow-400 font-black text-xs uppercase tracking-wider mb-1">Logged Sets</div>
                <div className="text-3xl font-black text-white">{loggedWorkouts.length}</div>
                <p className="text-[11px] text-zinc-500 mt-1">Active workout volume</p>
              </div>

              <div
                onClick={() => setActiveTab('nutrition')}
                className="cursor-pointer rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 hover:border-yellow-400/40 transition-all active:scale-95"
              >
                <div className="text-yellow-400 font-black text-xs uppercase tracking-wider mb-1">Calorie Intake</div>
                <div className="text-3xl font-black text-white">{totalCalsLogged} <span className="text-sm font-normal text-zinc-400">/ {profile.cals}</span></div>
                <p className="text-[11px] text-zinc-500 mt-1">Daily goal progress</p>
              </div>

              <div
                onClick={() => setActiveTab('profile')}
                className="cursor-pointer rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 hover:border-yellow-400/40 transition-all active:scale-95"
              >
                <div className="text-yellow-400 font-black text-xs uppercase tracking-wider mb-1">Current Weight</div>
                <div className="text-3xl font-black text-white">{profile.weight} <span className="text-sm font-normal text-zinc-400">kg</span></div>
                <p className="text-[11px] text-zinc-500 mt-1">Target: {profile.targetWeight} kg</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. WORKOUT LOGGER */}
        {activeTab === 'workouts' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 md:p-6 shadow-xl">
              <h2 className="text-xl font-black italic text-yellow-400 mb-1">WORKOUT LOGGER</h2>
              <p className="text-xs text-zinc-400 mb-5">Track your sets, weights, and repetitions.</p>

              <form onSubmit={handleAddWorkout} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Exercise</label>
                  <select
                    value={exercise}
                    onChange={(e) => setExercise(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-yellow-400 transition-colors"
                  >
                    {EXERCISES.map((ex, idx) => (
                      <option key={idx} value={ex.name}>{ex.name} ({ex.category})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Weight (kg)</label>
                    <input
                      type="number"
                      placeholder="80"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-yellow-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Reps</label>
                    <input
                      type="number"
                      placeholder="10"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-yellow-400 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-yellow-400 py-3.5 text-xs font-black uppercase text-black hover:bg-yellow-300 active:scale-[0.99] transition-all shadow-lg shadow-yellow-400/10"
                >
                  + LOG SET NOW
                </button>
              </form>
            </div>

            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 md:p-6 shadow-xl">
              <h3 className="text-xs font-black italic text-zinc-400 uppercase tracking-wider mb-4">LOGGED WORKOUT HISTORY</h3>
              <div className="space-y-2.5">
                {loggedWorkouts.map((item) => (
                  <div key={item.id} className="flex justify-between items-center rounded-xl border border-zinc-900 bg-zinc-900/40 p-3.5">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-100">{item.exercise}</h4>
                      <p className="text-[11px] text-zinc-500">{item.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-yellow-400 font-mono font-bold text-sm">{item.weight} kg</span>
                      <span className="text-zinc-400 text-xs ml-2">× {item.reps}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. EXERCISE CATALOG */}
        {activeTab === 'catalog' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 md:p-6 shadow-xl">
              <h2 className="text-xl font-black italic text-yellow-400 mb-2">EXERCISE CATALOG</h2>
              <input
                type="text"
                placeholder="Search exercise or muscle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-yellow-400 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredExercises.map((ex, idx) => (
                <div key={idx} className="rounded-xl border border-zinc-800/80 bg-zinc-950 p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-zinc-100 text-sm">{ex.name}</h3>
                    <p className="text-[11px] text-zinc-500">{ex.equipment}</p>
                  </div>
                  <span className="rounded-full bg-yellow-400/10 border border-yellow-400/30 px-2.5 py-0.5 text-[10px] font-bold text-yellow-400 uppercase">
                    {ex.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. NUTRITION & MACROS */}
        {activeTab === 'nutrition' && (
          <div className="space-y-5 max-w-2xl mx-auto">
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 md:p-6 shadow-xl">
              <h2 className="text-xl font-black italic text-yellow-400 mb-1">NUTRITION & MACROS</h2>
              <p className="text-xs text-zinc-400 mb-5">Keep calories and protein intake on target.</p>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-center">
                  <div className="text-xl md:text-2xl font-black text-yellow-400">{totalCalsLogged} / {profile.cals}</div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Calories (kcal)</div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-center">
                  <div className="text-xl md:text-2xl font-black text-yellow-400">{totalProteinLogged}g</div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Protein Logged</div>
                </div>
              </div>

              <form onSubmit={handleAddMeal} className="space-y-3 border-t border-zinc-800/80 pt-4">
                <input
                  type="text"
                  placeholder="Meal Name (e.g. Eggs & Oats)"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-yellow-400 transition-colors"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Calories (kcal)"
                    value={mealCals}
                    onChange={(e) => setMealCals(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-yellow-400 transition-colors"
                  />
                  <input
                    type="number"
                    placeholder="Protein (g)"
                    value={mealProtein}
                    onChange={(e) => setMealProtein(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-yellow-400 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-yellow-400 py-3.5 text-xs font-black uppercase text-black hover:bg-yellow-300 transition-colors"
                >
                  + LOG MEAL
                </button>
              </form>
            </div>

            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 shadow-xl">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">TODAY'S MEALS</h3>
              <div className="space-y-2">
                {meals.map((m, i) => (
                  <div key={i} className="flex justify-between items-center rounded-xl border border-zinc-900 bg-zinc-900/40 p-3 text-xs">
                    <span className="font-bold text-zinc-200">{m.name}</span>
                    <span className="text-yellow-400 font-mono">{m.cals} kcal | {m.protein}g P</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. ANALYTICS & PRs */}
        {activeTab === 'analytics' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 md:p-6 shadow-xl">
              <h2 className="text-xl font-black italic text-yellow-400 mb-1">PERSONAL RECORDS (PRs)</h2>
              <p className="text-xs text-zinc-400 mb-5">Your peak lifts and strength milestones.</p>

              <div className="space-y-3">
                {[
                  { name: 'Barbell Bench Press', weight: '100 kg', reps: '5 reps' },
                  { name: 'Barbell Back Squat', weight: '140 kg', reps: '3 reps' },
                  { name: 'Romanian Deadlift', weight: '160 kg', reps: '6 reps' },
                  { name: 'Overhead Press', weight: '70 kg', reps: '5 reps' },
                ].map((pr, idx) => (
                  <div key={idx} className="rounded-xl border border-zinc-900 bg-zinc-900/40 p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-100">{pr.name}</h4>
                      <p className="text-[11px] text-zinc-500">{pr.reps}</p>
                    </div>
                    <span className="text-sm font-mono text-yellow-400 font-bold">{pr.weight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. PROFILE & TARGETS */}
        {activeTab === 'profile' && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950 p-5 md:p-6 shadow-xl">
              <h2 className="text-xl font-black italic text-yellow-400 mb-1">PROFILE & TARGETS</h2>
              <p className="text-xs text-zinc-400 mb-5">Manage your metrics and target goals.</p>

              {profileSaved && (
                <div className="mb-4 p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-bold">
                  ✅ Goals updated successfully!
                </div>
              )}

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Athlete Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-yellow-400 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Current Weight (kg)</label>
                    <input
                      type="number"
                      value={profile.weight}
                      onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-yellow-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Target Weight (kg)</label>
                    <input
                      type="number"
                      value={profile.targetWeight}
                      onChange={(e) => setProfile({ ...profile, targetWeight: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-yellow-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Daily Calorie Target</label>
                    <input
                      type="number"
                      value={profile.cals}
                      onChange={(e) => setProfile({ ...profile, cals: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-yellow-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Water Goal (Liters)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={profile.water}
                      onChange={(e) => setProfile({ ...profile, water: e.target.value })}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-yellow-400 transition-colors"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setProfileSaved(true)
                    setTimeout(() => setProfileSaved(false), 3000)
                  }}
                  className="w-full rounded-xl bg-yellow-400 py-3.5 text-xs font-black uppercase text-black hover:bg-yellow-300 transition-colors mt-2"
                >
                  SAVE TARGETS
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR (Visible only on mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-2 flex justify-around items-center z-50">
        {NAVIGATION_TABS.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                active ? 'text-yellow-400 scale-105' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon />
              <span className="text-[9px] font-bold uppercase mt-1 tracking-wider">{tab.label}</span>
            </button>
          )
        })}
      </nav>

    </div>
  )
}