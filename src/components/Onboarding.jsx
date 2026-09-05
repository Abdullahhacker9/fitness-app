import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Onboarding({ session, onComplete }) {
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('male')
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [fitnessLevel, setFitnessLevel] = useState('Beginner')
  const [activityLevel, setActivityLevel] = useState('Moderately Active')
  const [fitnessGoal, setFitnessGoal] = useState('Weight Loss')
  const [equipment, setEquipment] = useState('Dumbbells')
  const [workoutDays, setWorkoutDays] = useState('4')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!session?.user?.id) return
    setLoading(true)

    const parsedWeight = parseFloat(weightKg)
    const parsedHeight = parseFloat(heightCm)
    const parsedAge = parseInt(age, 10)

    // Mifflin-St Jeor BMR Calculation
    let bmr = 10 * parsedWeight + 6.25 * parsedHeight - 5 * parsedAge
    bmr = gender === 'male' ? bmr + 5 : bmr - 161

    // TDEE Activity Multipliers
    const activityMultipliers = {
      'Sedentary': 1.2,
      'Lightly Active': 1.375,
      'Moderately Active': 1.55,
      'Very Active': 1.725,
      'Extremely Active': 1.9,
    }
    const mult = activityMultipliers[activityLevel] || 1.55
    const tdee = bmr * mult

    // Calorie Target Adjustments
    let calorieTarget = tdee
    if (fitnessGoal === 'Weight Loss') calorieTarget -= 500
    else if (fitnessGoal === 'Muscle Gain') calorieTarget += 300

    const profileData = {
      id: session.user.id,
      full_name: fullName,
      age: parsedAge,
      gender,
      height_cm: parsedHeight,
      weight_kg: parsedWeight,
      fitness_level: fitnessLevel,
      activity_level: activityLevel,
      fitness_goal: fitnessGoal,
      equipment,
      workout_days_per_week: parseInt(workoutDays, 10),
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      daily_calorie_target: Math.round(calorieTarget),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('profiles').upsert(profileData)

    if (error) {
      alert('Error saving profile: ' + error.message)
    } else {
      if (onComplete) onComplete()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
            INITIAL SETUP
          </span>
          <h1 className="text-2xl sm:text-3xl font-black italic text-yellow-400 uppercase tracking-wide">
            BUILD YOUR ATHLETE PROFILE
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Enter your physical metrics to calculate your BMR, TDEE, and calorie targets.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Dean Winchester"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-yellow-400"
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
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Age</label>
              <input
                type="number"
                required
                placeholder="e.g. 25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Height (CM)</label>
              <input
                type="number"
                required
                placeholder="e.g. 180"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Weight (KG)</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="e.g. 75"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Fitness Level</label>
              <select
                value={fitnessLevel}
                onChange={(e) => setFitnessLevel(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white outline-none focus:border-yellow-400"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white outline-none focus:border-yellow-400"
              >
                <option>Sedentary</option>
                <option>Lightly Active</option>
                <option>Moderately Active</option>
                <option>Very Active</option>
                <option>Extremely Active</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Fitness Goal</label>
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white outline-none focus:border-yellow-400"
              >
                <option>Weight Loss</option>
                <option>Muscle Gain</option>
                <option>Maintenance</option>
                <option>General Fitness</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Available Equipment</label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white outline-none focus:border-yellow-400"
              >
                <option>No Equipment</option>
                <option>Dumbbells</option>
                <option>Barbell</option>
                <option>Resistance Bands</option>
                <option>Machines</option>
                <option>Full Gym</option>
                <option>Home Gym</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Workout Days / Week</label>
              <select
                value={workoutDays}
                onChange={(e) => setWorkoutDays(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white outline-none focus:border-yellow-400"
              >
                <option value="2">2 Days</option>
                <option value="3">3 Days</option>
                <option value="4">4 Days</option>
                <option value="5">5 Days</option>
                <option value="6">6 Days</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-yellow-400 py-4 text-xs font-black uppercase tracking-wider text-black hover:bg-yellow-300 transition-all shadow-xl shadow-yellow-400/20 disabled:opacity-50"
          >
            {loading ? 'Calculating & Saving...' : 'Complete Setup & Enter Portal'}
          </button>
        </form>
      </div>
    </div>
  )
}