import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Scale, Plus, Trophy, Activity } from 'lucide-react'

export default function Progress({ session }) {
  const [weight, setWeight] = useState('')
  const [chest, setChest] = useState('')
  const [waist, setWaist] = useState('')
  const [arms, setArms] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [history, setHistory] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchMeasurements()
  }, [])

  const fetchMeasurements = async () => {
    if (!session?.user?.id) return
    const { data, error } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching measurements:', error)
      return
    }

    const logs = data || []
    setHistory([...logs].reverse())

    // Format for Recharts
    const formatted = logs.map((item) => ({
      date: new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      weight: item.weight_kg,
      bodyFat: item.body_fat_percentage,
    }))
    setChartData(formatted)
  }

  const handleAddMeasurement = async (e) => {
    e.preventDefault()
    if (!weight) return
    setLoading(true)

    const newRecord = {
      user_id: session.user.id,
      weight_kg: parseFloat(weight),
      chest_cm: chest ? parseFloat(chest) : null,
      waist_cm: waist ? parseFloat(waist) : null,
      arms_cm: arms ? parseFloat(arms) : null,
      body_fat_percentage: bodyFat ? parseFloat(bodyFat) : null,
    }

    const { error } = await supabase.from('body_measurements').insert([newRecord])

    if (error) {
      alert('Error saving metrics: ' + error.message)
    } else {
      setWeight('')
      setChest('')
      setWaist('')
      setArms('')
      setBodyFat('')
      fetchMeasurements()
    }
    setLoading(false)
  }

  const latestWeight = history[0]?.weight_kg || '--'
  const startWeight = history[history.length - 1]?.weight_kg || '--'
  const totalDiff = (typeof latestWeight === 'number' && typeof startWeight === 'number')
    ? (latestWeight - startWeight).toFixed(1)
    : '--'

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <span className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
          METRICS & ANALYTICS
        </span>
        <h1 className="text-3xl font-black italic text-white uppercase mt-2 tracking-wide">
          PROGRESS & BODY TRACKING
        </h1>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase mb-2">
            <span>Current Weight</span>
            <Scale className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-3xl font-black text-white">{latestWeight} <span className="text-xs text-zinc-500 font-bold">kg</span></div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase mb-2">
            <span>Starting Weight</span>
            <Activity className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-3xl font-black text-white">{startWeight} <span className="text-xs text-zinc-500 font-bold">kg</span></div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-bold uppercase mb-2">
            <span>Total Change</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{totalDiff > 0 ? `+${totalDiff}` : totalDiff} <span className="text-xs font-bold">kg</span></div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm uppercase text-white tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" /> Weight Progression Chart
          </h2>
        </div>

        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-zinc-600 text-sm font-medium">
            Log your first weight entry below to generate progress charts.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 12 }} />
                <YAxis stroke="#71717a" domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#facc15', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="weight" stroke="#facc15" strokeWidth={3} dot={{ fill: '#facc15', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logger Form */}
        <div className="lg:col-span-1 bg-zinc-950 border border-zinc-800 rounded-3xl p-6 h-fit space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-4">
            <Scale className="w-5 h-5 text-yellow-400" />
            <h2 className="font-bold text-sm uppercase text-white tracking-wider">Log Measurement</h2>
          </div>

          <form onSubmit={handleAddMeasurement} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Weight (kg) *</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="e.g. 74.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-yellow-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Chest (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 102"
                  value={chest}
                  onChange={(e) => setChest(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Waist (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 82"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Arms (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 38"
                  value={arms}
                  onChange={(e) => setArms(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1">Body Fat %</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 15"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
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
              {loading ? 'Saving...' : 'Record Metrics'}
            </button>
          </form>
        </div>

        {/* Metric History Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Recorded History</h2>

          {history.length === 0 ? (
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-12 text-center space-y-3">
              <Scale className="w-10 h-10 text-zinc-700 mx-auto" />
              <p className="text-zinc-500 text-sm font-medium">No progress records logged yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white">{item.weight_kg} kg</span>
                      <span className="text-[10px] text-zinc-500">
                        ({new Date(item.created_at).toLocaleDateString()})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      {item.chest_cm && <span>Chest: {item.chest_cm}cm</span>}
                      {item.waist_cm && <span>Waist: {item.waist_cm}cm</span>}
                      {item.arms_cm && <span>Arms: {item.arms_cm}cm</span>}
                      {item.body_fat_percentage && <span className="text-yellow-400">Fat: {item.body_fat_percentage}%</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}