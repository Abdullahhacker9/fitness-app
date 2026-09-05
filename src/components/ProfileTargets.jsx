import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function ProfileTargets({ session }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [fullName, setFullName] = useState('')
  const [weight, setWeight] = useState('')
  const [targetWeight, setTargetWeight] = useState('')
  const [dailyCalories, setDailyCalories] = useState('')
  const [dailyWater, setDailyWater] = useState('')

  useEffect(() => {
    getProfile()
  }, [])

  const getProfile = async () => {
    try {
      setLoading(true)
      const { user } = session

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setFullName(data.full_name || '')
        setWeight(data.weight || '')
        setTargetWeight(data.target_weight || '')
        setDailyCalories(data.daily_calories || '')
        setDailyWater(data.daily_water || '')
      }
    } catch (err) {
      console.error('Error fetching profile:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const { user } = session

      const updates = {
        id: user.id,
        full_name: fullName,
        weight: parseFloat(weight) || null,
        target_weight: parseFloat(targetWeight) || null,
        daily_calories: parseInt(dailyCalories) || null,
        daily_water: parseFloat(dailyWater) || null,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) throw error
      setMessage('✅ Profile & targets updated successfully!')
    } catch (err) {
      setMessage('❌ Update failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-yellow-400 font-bold uppercase tracking-wider">
        Loading profile details...
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
        <h2 className="text-xl font-black italic text-yellow-400 mb-1">
          ATHLETE PROFILE & TARGETS
        </h2>
        <p className="text-xs text-zinc-400 mb-6">
          Set your body metrics and daily goals to calculate progress across the app.
        </p>

        {message && (
          <div className="mb-4 rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-xs font-bold text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Account Email
            </label>
            <input
              type="text"
              value={session.user.email}
              disabled
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-xs text-zinc-500 cursor-not-allowed outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Abdullah"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-yellow-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Current Weight (kg / lbs)
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="75"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Target Weight (kg / lbs)
              </label>
              <input
                type="number"
                step="0.1"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="80"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Daily Calorie Target (kcal)
              </label>
              <input
                type="number"
                value={dailyCalories}
                onChange={(e) => setDailyCalories(e.target.value)}
                placeholder="2500"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Daily Water Target (Liters)
              </label>
              <input
                type="number"
                step="0.1"
                value={dailyWater}
                onChange={(e) => setDailyWater(e.target.value)}
                placeholder="3.5"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-yellow-400 py-3 text-xs font-black uppercase text-black hover:bg-yellow-300 transition-colors disabled:opacity-50 mt-4"
          >
            {saving ? 'Saving Changes...' : 'SAVE PROFILE TARGETS'}
          </button>
        </form>
      </div>
    </div>
  )
}