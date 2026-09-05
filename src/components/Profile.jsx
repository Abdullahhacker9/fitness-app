import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { User, Settings, Save, Target, ShieldCheck, Crown, PlusCircle } from 'lucide-react'

export default function Profile({ session }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('male')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [goal, setGoal] = useState('maintain')
  const [activityLevel, setActivityLevel] = useState('1.375')
  const [calorieTarget, setCalorieTarget] = useState('')
  const [waterTarget, setWaterTarget] = useState('')
  
  // Premium Admin State
  const [targetEmail, setTargetEmail] = useState('')
  const [granting, setGranting] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    if (!session?.user?.id) return
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (data) {
      setAge(data.age || '')
      setGender(data.gender || 'male')
      setHeight(data.height_cm || '')
      setWeight(data.weight_kg || '')
      setGoal(data.goal || 'maintain')
      setActivityLevel(data.activity_level ? String(data.activity_level) : '1.375')
      setCalorieTarget(data.daily_calorie_target || '')
      setWaterTarget(data.daily_water_target_ml || 3000)
    }
    setLoading(false)
  }

  const handleGrantPremium = async (e) => {
    e.preventDefault()
    if (!targetEmail) return
    setGranting(true)

    const cleanEmail = targetEmail.trim().toLowerCase()

    const { error } = await supabase
      .from('premium_users')
      .upsert({ email: cleanEmail, status: 'active' }, { onConflict: 'email' })

    if (error) {
      alert('Error granting premium: ' + error.message)
    } else {
      alert(`Success! Premium activated for ${cleanEmail}`)
      setTargetEmail('')
    }
    setGranting(false)
  }

  const calculateTargets = (h, w, a, g, act, gl) => {
    const numH = parseFloat(h)
    const numW = parseFloat(w)
    const numA = parseInt(a, 10)
    const numAct = parseFloat(act)

    if (!numH || !numW || !numA) return { bmr: 0, tdee: 0, calories: 2000 }

    let bmr = 10 * numW + 6.25 * numH - 5 * numA
    bmr = g === 'male' ? bmr + 5 : bmr - 161

    const tdee = Math.round(bmr * numAct)
    let targetCals = tdee

    if (gl === 'cut') targetCals = Math.round(tdee - 500)
    else if (gl === 'bulk') targetCals = Math.round(tdee + 400)

    return { bmr: Math.round(bmr), tdee, calories: targetCals }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSaving(true)

    const metrics = calculateTargets(height, weight, age, gender, activityLevel, goal)
    const finalCalorieTarget = calorieTarget ? parseInt(calorieTarget, 10) : metrics.calories

    const updates = {
      id: session.user.id,
      age: parseInt(age, 10),
      gender,
      height_cm: parseFloat(height),
      weight_kg: parseFloat(weight),
      goal,
      activity_level: parseFloat(activityLevel),
      bmr: metrics.bmr,
      tdee: metrics.tdee,
      daily_calorie_target: finalCalorieTarget,
      daily_water_target_ml: parseInt(waterTarget, 10) || 3000,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('profiles').upsert(updates)

    if (error) {
      alert('Error updating profile: ' + error.message)
    } else {
      alert('Profile updated successfully!')
      fetchProfile()
    }
    setSaving(false)
  }

  if (loading) return <div className="p-12 text-center text-yellow-400 font-bold">LOADING PROFILE...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-zinc-800 pb-6 flex items-center justify-between">
        <div>
          <span className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
            ATHLETE ACCOUNT
          </span>
          <h1 className="text-3xl font-black italic text-white uppercase mt-2 tracking-wide">
            PROFILE & SETTINGS
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-2xl text-xs text-zinc-400 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{session?.user?.email}</span>
        </div>
      </div>

      {/* Grant Premium Activation Section */}
      <div className="bg-gradient-to-r from-yellow-500/10 via-zinc-950 to-zinc-950 border border-yellow-400/30 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Crown className="w-5 h-5 text-yellow-400" />
          <h2 className="font-bold text-sm uppercase text-white tracking-wider">Grant Premium Access to Buyers</h2>
        </div>
        <p className="text-xs text-zinc-400">
          When someone buys premium from you, enter their email below to grant them instant access.
        </p>

        <form onSubmit={handleGrantPremium} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            placeholder="buyer@example.com"
            value={targetEmail}
            onChange={(e) => setTargetEmail(e.target.value)}
            className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-yellow-400"
          />
          <button
            type="submit"
            disabled={granting}
            className="rounded-xl bg-yellow-400 px-6 py-3 text-xs font-black uppercase text-black hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            {granting ? 'Activating...' : 'Grant Premium'}
          </button>
        </form>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-8">
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-4">
            <User className="w-5 h-5 text-yellow-400" />
            <h2 className="font-bold text-sm uppercase text-white tracking-wider">Biometric Metrics</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Age</label>
              <input
                type="number"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white outline-none focus:border-yellow-400"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Height (cm)</label>
              <input
                type="number"
                required
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white outline-none focus:border-yellow-400"
              />
            </div>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-4">
            <Target className="w-5 h-5 text-yellow-400" />
            <h2 className="font-bold text-sm uppercase text-white tracking-wider">Goals & Activity Level</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Primary Objective</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white outline-none focus:border-yellow-400"
              >
                <option value="cut">Fat Loss / Cutting (-500 kcal)</option>
                <option value="maintain">Maintenance / Recomp</option>
                <option value="bulk">Muscle Building / Bulking (+400 kcal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Activity Multiplier</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white outline-none focus:border-yellow-400"
              >
                <option value="1.2">Sedentary (Office job, little exercise)</option>
                <option value="1.375">Light Activity (1-3 workouts/week)</option>
                <option value="1.55">Moderate Activity (3-5 workouts/week)</option>
                <option value="1.725">Heavy Activity (6-7 intense workouts/week)</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-2xl bg-yellow-400 py-4 text-sm font-black uppercase text-black hover:bg-yellow-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Profile Settings'}
        </button>
      </form>
    </div>
  )
}