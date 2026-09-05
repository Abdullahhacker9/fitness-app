import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import PromoCode from './components/PromoCode'

export default function App() {
  const [session, setSession] = useState(null)
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('workouts')

  // --- WORKOUT LOGGER STATE ---
  const [exercise, setExercise] = useState('Bench Press')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [loggedWorkouts, setLoggedWorkouts] = useState([
    { id: 1, exercise: 'Barbell Squat', weight: '120', reps: '5', date: 'Today' },
    { id: 2, exercise: 'Incline Dumbbell Press', weight: '32', reps: '8', date: 'Yesterday' }
  ])

  // --- CATALOG STATE ---
  const [searchQuery, setSearchQuery] = useState('')

  // --- NUTRITION STATE ---
  const [mealName, setMealName] = useState('')
  const [mealCals, setMealCals] = useState('')
  const [mealProtein, setMealProtein] = useState('')
  const [meals, setMeals] = useState([
    { name: 'Oatmeal & Whey', cals: 450, protein: 35 },
    { name: 'Chicken & Rice', cals: 650, protein: 50 }
  ])

  // --- PROFILE TARGETS STATE ---
  const [profile, setProfile] = useState({
    name: 'Abdullah',
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

  const handleAddWorkout = (e) => {
    e.preventDefault()
    if (!weight || !reps) return
    const newLog = {
      id: Date.now(),
      exercise,
      weight,
      reps,
      date: 'Just now'
    }
    setLoggedWorkouts([newLog, ...loggedWorkouts])
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
      <div className="flex min-h-screen items-center justify-center bg-black text-yellow-400 font-black tracking-widest uppercase">
        Loading...
      </div>
    )
  }

  if (!session) return <Auth />

  if (!isPremium) {
    return (
      <PromoCode
        userEmail={session.user.email}
        onComplete={(unlocked) => {
          if (unlocked) setIsPremium(true)
          else alert('🔒 Enter a valid promo code to unlock access.')
        }}
        onSignOut={() => supabase.auth.signOut()}
      />
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
    <div className="flex min-h-screen bg-black text-zinc-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-yellow-400 italic">FITNESS DEAN</h1>
            <span className="rounded bg-yellow-400/20 border border-yellow-400/40 px-2 py-0.5 text-[10px] font-black text-yellow-400 uppercase">
              PRO
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">PORTAL V1.0</p>

          <nav className="mt-8 space-y-1.5">
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
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                  activeTab === tab.id
                    ? 'bg-yellow-400 text-black font-black shadow-lg'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => alert('Mobile PWA Sync Active!')}
            className="w-full py-2.5 rounded-xl border border-yellow-500/30 bg-yellow-500/5 text-xs font-bold text-yellow-400 hover:bg-yellow-500/10 transition-all uppercase tracking-wider"
          >
            SCAN QR FOR MOBILE
          </button>

          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full py-2.5 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all uppercase tracking-wider"
          >
            SIGN OUT
          </button>
        </div>
      </aside>

      {/* Main Content Window */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 max-w-4xl">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
              <span className="text-xs font-black uppercase text-yellow-400 tracking-wider">
                ⚡ VIP ATHLETE ACCESS
              </span>
              <h2 className="text-3xl font-black text-white italic mt-1 uppercase">
                WELCOME BACK, {profile.name.toUpperCase()}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Logged in as {session.user.email}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="text-yellow-400 font-black text-xs uppercase mb-1">Workouts Completed</div>
                <div className="text-3xl font-black">{loggedWorkouts.length}</div>
                <p className="text-xs text-zinc-500 mt-1">Total logged sets</p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="text-yellow-400 font-black text-xs uppercase mb-1">Today's Calories</div>
                <div className="text-3xl font-black">{totalCalsLogged} kcal</div>
                <p className="text-xs text-zinc-500 mt-1">Target: {profile.cals} kcal</p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <div className="text-yellow-400 font-black text-xs uppercase mb-1">Current Weight</div>
                <div className="text-3xl font-black">{profile.weight} kg</div>
                <p className="text-xs text-zinc-500 mt-1">Goal: {profile.targetWeight} kg</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WORKOUT LOGGER */}
        {activeTab === 'workouts' && (
          <div className="max-w-3xl space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
              <h2 className="text-xl font-black italic text-yellow-400 mb-1">WORKOUT LOGGER</h2>
              <p className="text-xs text-zinc-400 mb-6">Log your weight and reps to build training volume.</p>

              <form onSubmit={handleAddWorkout} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Select Exercise</label>
                  <select
                    value={exercise}
                    onChange={(e) => setExercise(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                  >
                    {EXERCISES.map((ex, idx) => (
                      <option key={idx} value={ex.name}>{ex.name} ({ex.category})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 80"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Reps Completed</label>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-yellow-400 py-3 text-xs font-black uppercase text-black hover:bg-yellow-300 transition-colors"
                >
                  + LOG SET NOW
                </button>
              </form>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
              <h3 className="text-sm font-black italic text-zinc-300 uppercase mb-4">LOGGED WORKOUT HISTORY</h3>
              <div className="space-y-3">
                {loggedWorkouts.map((item) => (
                  <div key={item.id} className="flex justify-between items-center rounded-xl border border-zinc-900 bg-zinc-900/50 p-4">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-100">{item.exercise}</h4>
                      <p className="text-xs text-zinc-500">{item.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-yellow-400 font-mono font-bold text-sm">{item.weight} kg</span>
                      <span className="text-zinc-400 text-xs ml-2">× {item.reps} reps</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EXERCISE CATALOG */}
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

        {/* TAB 4: NUTRITION & MACROS */}
        {activeTab === 'nutrition' && (
          <div className="max-w-2xl space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
              <h2 className="text-xl font-black italic text-yellow-400 mb-1">NUTRITION & MACROS</h2>
              <p className="text-xs text-zinc-400 mb-6">Log meals and keep your daily totals on target.</p>

              <div className="grid grid-cols-2 gap-4 text-center mb-6">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="text-2xl font-black text-yellow-400">{totalCalsLogged} / {profile.cals}</div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Calories (kcal)</div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="text-2xl font-black text-yellow-400">{totalProteinLogged}g</div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Protein Logged</div>
                </div>
              </div>

              <form onSubmit={handleAddMeal} className="space-y-3 border-t border-zinc-800 pt-4">
                <input
                  type="text"
                  placeholder="Meal Name (e.g. Chicken Rice)"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Calories (kcal)"
                    value={mealCals}
                    onChange={(e) => setMealCals(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                  />
                  <input
                    type="number"
                    placeholder="Protein (g)"
                    value={mealProtein}
                    onChange={(e) => setMealProtein(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-yellow-400 py-3 text-xs font-black uppercase text-black hover:bg-yellow-300 transition-colors"
                >
                  + LOG MEAL
                </button>
              </form>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">TODAY'S MEALS</h3>
              <div className="space-y-2">
                {meals.map((m, i) => (
                  <div key={i} className="flex justify-between items-center rounded-lg border border-zinc-900 bg-zinc-900/40 p-3 text-xs">
                    <span className="font-bold text-zinc-200">{m.name}</span>
                    <span className="text-yellow-400 font-mono">{m.cals} kcal | {m.protein}g protein</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ANALYTICS & PRS */}
        {activeTab === 'analytics' && (
          <div className="max-w-2xl space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
              <h2 className="text-xl font-black italic text-yellow-400 mb-1">ANALYTICS & PRs</h2>
              <p className="text-xs text-zinc-400 mb-6">Highest tracked personal records across your workouts.</p>

              <div className="space-y-3">
                {[
                  { name: 'Barbell Bench Press', weight: '100 kg', reps: '5 reps' },
                  { name: 'Barbell Back Squat', weight: '140 kg', reps: '3 reps' },
                  { name: 'Romanian Deadlift', weight: '160 kg', reps: '6 reps' },
                  { name: 'Overhead Press', weight: '70 kg', reps: '5 reps' },
                ].map((pr, idx) => (
                  <div key={idx} className="rounded-xl border border-zinc-900 bg-zinc-900/50 p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm">{pr.name}</h4>
                      <p className="text-xs text-zinc-500">{pr.reps}</p>
                    </div>
                    <span className="text-sm font-mono text-yellow-400 font-bold">{pr.weight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PROFILE & TARGETS */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
              <h2 className="text-xl font-black italic text-yellow-400 mb-1">PROFILE & TARGETS</h2>
              <p className="text-xs text-zinc-400 mb-6">Manage your daily intake goals and metrics.</p>

              {profileSaved && (
                <div className="mb-4 p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-bold">
                  ✅ Goals updated successfully!
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Athlete Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Current Weight (kg)</label>
                    <input
                      type="number"
                      value={profile.weight}
                      onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Target Weight (kg)</label>
                    <input
                      type="number"
                      value={profile.targetWeight}
                      onChange={(e) => setProfile({ ...profile, targetWeight: e.target.value })}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Daily Calorie Target</label>
                    <input
                      type="number"
                      value={profile.cals}
                      onChange={(e) => setProfile({ ...profile, cals: e.target.value })}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Water Goal (Liters)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={profile.water}
                      onChange={(e) => setProfile({ ...profile, water: e.target.value })}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setProfileSaved(true)
                    setTimeout(() => setProfileSaved(false), 3000)
                  }}
                  className="w-full rounded-lg bg-yellow-400 py-3 text-xs font-black uppercase text-black hover:bg-yellow-300 transition-colors mt-4"
                >
                  SAVE TARGETS
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}