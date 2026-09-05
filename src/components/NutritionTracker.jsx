import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Utensils, Plus, Trash2, Droplet, Flame, PieChart } from 'lucide-react'

export default function NutritionTracker({ session }) {
  const [foodName, setFoodName] = useState('')
  const [mealType, setMealType] = useState('Breakfast')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [meals, setMeals] = useState([])
  const [waterTotal, setWaterTotal] = useState(0)
  const [waterTarget, setWaterTarget] = useState(3000)
  const [calorieTarget, setCalorieTarget] = useState(2000)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProfileTargets()
    fetchTodayData()
  }, [])

  const fetchProfileTargets = async () => {
    if (!session?.user?.id) return
    const { data } = await supabase
      .from('profiles')
      .select('daily_calorie_target, daily_water_target_ml')
      .eq('id', session.user.id)
      .single()

    if (data) {
      if (data.daily_calorie_target) setCalorieTarget(data.daily_calorie_target)
      if (data.daily_water_target_ml) setWaterTarget(data.daily_water_target_ml)
    }
  }

  const fetchTodayData = async () => {
    if (!session?.user?.id) return
    const today = new Date().toISOString().split('T')[0]

    // Fetch meals
    const { data: mealData } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('created_at', `${today}T00:00:00`)
      .order('created_at', { ascending: false })

    setMeals(mealData || [])

    // Fetch water
    const { data: waterData } = await supabase
      .from('water_logs')
      .select('amount_ml')
      .eq('user_id', session.user.id)
      .gte('created_at', `${today}T00:00:00`)

    const totalWater = (waterData || []).reduce((acc, curr) => acc + Number(curr.amount_ml), 0)
    setWaterTotal(totalWater)
  }

  const handleAddMeal = async (e) => {
    e.preventDefault()
    if (!foodName || !calories) return
    setLoading(true)

    const newMeal = {
      user_id: session.user.id,
      meal_type: mealType,
      food_name: foodName.trim(),
      calories: parseFloat(calories),
      protein_g: parseFloat(protein) || 0,
      carbs_g: parseFloat(carbs) || 0,
      fat_g: parseFloat(fat) || 0,
    }

    const { error } = await supabase.from('nutrition_logs').insert([newMeal])

    if (error) {
      alert('Error saving meal: ' + error.message)
    } else {
      setFoodName('')
      setCalories('')
      setProtein('')
      setCarbs('')
      setFat('')
      fetchTodayData()
    }
    setLoading(false)
  }

  const handleAddWater = async (amount) => {
    const { error } = await supabase.from('water_logs').insert([
      { user_id: session.user.id, amount_ml: amount }
    ])
    if (!error) fetchTodayData()
  }

  const handleDeleteMeal = async (id) => {
    const { error } = await supabase.from('nutrition_logs').delete().eq('id', id)
    if (!error) fetchTodayData()
  }

  const totalCalories = meals.reduce((acc, m) => acc + Number(m.calories), 0)
  const totalProtein = meals.reduce((acc, m) => acc + Number(m.protein_g), 0)
  const totalCarbs = meals.reduce((acc, m) => acc + Number(m.carbs_g), 0)
  const totalFat = meals.reduce((acc, m) => acc + Number(m.fat_g), 0)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <span className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
          MACROS & HYDRATION
        </span>
        <h1 className="text-3xl font-black italic text-white uppercase mt-2 tracking-wide">
          NUTRITION TRACKER
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase mb-2">
            <span>Calories</span>
            <Flame className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalCalories} <span className="text-xs text-zinc-500 font-bold">/ {calorieTarget} kcal</span></div>
          <div className="w-full bg-zinc-900 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-yellow-400 h-full transition-all"
              style={{ width: `${Math.min(100, (totalCalories / calorieTarget) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase mb-2">
            <span>Protein</span>
            <PieChart className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalProtein}g</div>
          <span className="text-[11px] text-zinc-500">Muscle Repair</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase mb-2">
            <span>Carbs</span>
            <PieChart className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalCarbs}g</div>
          <span className="text-[11px] text-zinc-500">Energy Fuel</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase mb-2">
            <span>Fats</span>
            <PieChart className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalFat}g</div>
          <span className="text-[11px] text-zinc-500">Hormone Balance</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Meal Logger Form */}
        <div className="lg:col-span-1 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 h-fit space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-4">
            <Utensils className="w-5 h-5 text-yellow-400" />
            <h2 className="font-bold text-sm uppercase text-white tracking-wider">Log Meal</h2>
          </div>

          <form onSubmit={handleAddMeal} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Meal Category</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white outline-none focus:border-yellow-400"
              >
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Dinner</option>
                <option>Snack</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Food Item</label>
              <input
                type="text"
                required
                placeholder="e.g. Chicken Breast & Rice"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-yellow-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Calories</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 450"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Protein (g)</label>
                <input
                  type="number"
                  placeholder="e.g. 40"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Carbs (g)</label>
                <input
                  type="number"
                  placeholder="e.g. 50"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Fat (g)</label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
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
              {loading ? 'Saving...' : 'Add Meal'}
            </button>
          </form>

          {/* Quick Hydration Widget */}
          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-white flex items-center gap-2">
                <Droplet className="w-4 h-4 text-cyan-400" /> Hydration Tracker
              </span>
              <span className="text-xs text-cyan-400 font-bold">{waterTotal} / {waterTarget} ml</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAddWater(250)}
                className="py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-cyan-300 transition-all"
              >
                + 250 ml Glass
              </button>
              <button
                onClick={() => handleAddWater(500)}
                className="py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-cyan-300 transition-all"
              >
                + 500 ml Bottle
              </button>
            </div>
          </div>
        </div>

        {/* Today's Meals Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Today's Meal Logs</h2>

          {meals.length === 0 ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-12 text-center space-y-3">
              <Utensils className="w-10 h-10 text-zinc-700 mx-auto" />
              <p className="text-zinc-500 text-sm font-medium">No meals logged for today yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {meals.map((m) => (
                <div
                  key={m.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded font-black uppercase border border-yellow-400/20">
                        {m.meal_type}
                      </span>
                      <h3 className="font-black text-sm text-white uppercase">{m.food_name}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <span className="font-bold text-yellow-400">{m.calories} kcal</span>
                      <span>•</span>
                      <span>P: {m.protein_g}g</span>
                      <span>•</span>
                      <span>C: {m.carbs_g}g</span>
                      <span>•</span>
                      <span>F: {m.fat_g}g</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteMeal(m.id)}
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