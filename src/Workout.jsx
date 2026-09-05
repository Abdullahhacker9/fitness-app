import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Dumbbell, Plus, Trash2, Calendar, CheckCircle2 } from 'lucide-react'

export default function Workout({ session }) {
  const [exercise, setExercise] = useState('')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchWorkouts()
  }, [])

  const fetchWorkouts = async () => {
    if (!session?.user?.id) return
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) console.error('Error fetching workouts:', error)
    else setWorkouts(data || [])
  }

  const handleAddSet = async (e) => {
    e.preventDefault()
    if (!exercise || !weight || !reps) return
    setLoading(true)

    const newSet = {
      user_id: session.user.id,
      exercise: exercise.trim(),
      weight: parseFloat(weight),
      reps: parseInt(reps, 10),
    }

    const { error } = await supabase.from('workouts').insert([newSet])

    if (error) {
      alert('Error adding set: ' + error.message)
    } else {
      setWeight('')
      setReps('')
      fetchWorkouts()
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('workouts').delete().eq('id', id)
    if (!error) fetchWorkouts()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <span className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
            LOG & TRACK
          </span>
          <h1 className="text-3xl font-black italic text-white uppercase mt-2 tracking-wide">
            WORKOUT TRACKER
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Set Logger Form */}
        <div className="lg:col-span-1 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 h-fit space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-4">
            <Dumbbell className="w-5 h-5 text-yellow-400" />
            <h2 className="font-bold text-sm uppercase text-white tracking-wider">Log Exercise Set</h2>
          </div>

          <form onSubmit={handleAddSet} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Exercise Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Bench Press"
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-yellow-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  placeholder="e.g. 80"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Reps</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 10"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-yellow-400 py-3 text-xs font-black uppercase text-black hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {loading ? 'Saving...' : 'Add Set'}
            </button>
          </form>
        </div>

        {/* Workout Log Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Recent Workout History</h2>

          {workouts.length === 0 ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-12 text-center space-y-3">
              <Dumbbell className="w-10 h-10 text-zinc-700 mx-auto" />
              <p className="text-zinc-500 text-sm font-medium">No workout sets logged yet today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workouts.map((w) => (
                <div
                  key={w.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-yellow-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-white uppercase">{w.exercise}</h3>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                        <span className="font-bold text-yellow-400">{w.weight} kg</span>
                        <span>•</span>
                        <span>{w.reps} Reps</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-zinc-500 text-[10px]">
                          <Calendar className="w-3 h-3" />
                          {new Date(w.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(w.id)}
                    className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}