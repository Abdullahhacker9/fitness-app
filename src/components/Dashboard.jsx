import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Dashboard({ session }) {
  const [loading, setLoading] = useState(false)
  const [workoutType, setWorkoutType] = useState('Bench Press')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [recentLogs, setRecentLogs] = useState([])

  useEffect(() => {
    fetchWorkouts()
  }, [session])

  const fetchWorkouts = async () => {
    if (!session?.user?.id) return
    setLoading(true)
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching workouts:', error)
    } else {
      setRecentLogs(data || [])
    }
    setLoading(false)
  }

  const handleSignOut = () => {
    supabase.auth.signOut()
  }

  const handleLogWorkout = async (e) => {
    e.preventDefault()
    if (!weight || !reps || !session?.user?.id) return

    setLoading(true)
    const { data, error } = await supabase
      .from('workouts')
      .insert([
        {
          user_id: session.user.id,
          exercise: workoutType,
          weight: parseFloat(weight),
          reps: parseInt(reps, 10),
        },
      ])
      .select()

    if (error) {
      alert(error.message)
    } else if (data && data.length > 0) {
      setRecentLogs([data[0], ...recentLogs])
      setWeight('')
      setReps('')
    }
    setLoading(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Top Navbar */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border-2 border-yellow-500/20 bg-zinc-950 p-6 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-yellow-400 px-2.5 py-0.5 text-xs font-black text-black uppercase">
                MEMBER PORTAL
              </span>
              <span className="text-xs text-zinc-400">Fitness Dean Gym</span>
            </div>
            <h1 className="mt-1 text-2xl font-black text-yellow-400 italic">
              WELCOME BACK, ATHLETE
            </h1>
            <p className="text-xs text-zinc-500">{session?.user?.email}</p>
          </div>

          <button
            onClick={handleSignOut}
            className="self-start sm:self-auto rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-bold uppercase text-zinc-400 hover:border-yellow-500/50 hover:text-yellow-400 transition-all"
          >
            Sign Out
          </button>
        </header>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-xs font-bold uppercase text-zinc-500">Weekly Workouts</p>
            <p className="mt-2 text-3xl font-black text-yellow-400">{recentLogs.length} Sessions</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-xs font-bold uppercase text-zinc-500">Personal Records</p>
            <p className="mt-2 text-3xl font-black text-yellow-400">12 PRs</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-xs font-bold uppercase text-zinc-500">Gym Streak</p>
            <p className="mt-2 text-3xl font-black text-yellow-400">8 Days 🔥</p>
          </div>
        </div>

        {/* Main Content: Logger & Activity Feed */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Quick Logger Form */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-lg font-black uppercase tracking-wider text-yellow-400">
              LOG HEAVY LIFT
            </h2>
            <p className="text-xs text-zinc-500 mb-4">Record your performance for today's session.</p>

            <form onSubmit={handleLogWorkout} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400">Exercise</label>
                <select
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-white outline-none focus:border-yellow-400"
                >
                  <option>Bench Press</option>
                  <option>Squat</option>
                  <option>Deadlift</option>
                  <option>Overhead Press</option>
                  <option>Barbell Row</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400">Weight (KG)</label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-white placeholder-zinc-600 outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400">Reps Completed</label>
                <input
                  type="number"
                  placeholder="e.g. 8"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-white placeholder-zinc-600 outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-yellow-400 py-3 text-xs font-black uppercase text-black hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-400/10 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Log Entry'}
              </button>
            </form>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-lg font-black uppercase tracking-wider text-yellow-400 mb-4">
              RECENT LOGGED SESSIONS
            </h2>

            <div className="space-y-3">
              {recentLogs.length === 0 ? (
                <p className="text-xs text-zinc-500">No workout sessions logged yet. Add one!</p>
              ) : (
                recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-900 bg-zinc-900/50 p-4 transition-all hover:border-zinc-800"
                  >
                    <div>
                      <p className="font-bold text-white">{log.exercise}</p>
                      <p className="text-xs text-zinc-500">{formatDate(log.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-yellow-400">{log.weight} kg</p>
                      <p className="text-xs text-zinc-400">{log.reps} reps</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}