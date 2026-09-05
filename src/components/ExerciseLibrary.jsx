import { useState } from 'react'
import { Search, Filter, Dumbbell, Flame, CheckCircle } from 'lucide-react'

const EXERCISE_DATA = [
  {
    id: '1',
    name: 'Barbell Bench Press',
    target: 'Chest',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: 'Lie on bench, unrack barbell with medium-width grip, lower to mid-chest, press up explosively.'
  },
  {
    id: '2',
    name: 'Incline Dumbbell Press',
    target: 'Chest',
    equipment: 'Dumbbells',
    difficulty: 'Intermediate',
    instructions: 'Set bench to 30-45 degrees, press dumbbells vertically keeping elbows at 45 degrees.'
  },
  {
    id: '3',
    name: 'Barbell Squat',
    target: 'Legs',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: 'Place bar across upper back, squat down keeping knees aligned over toes, drive through heels.'
  },
  {
    id: '4',
    name: 'Romanian Deadlift',
    target: 'Hamstrings',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    instructions: 'Hinge at hips with soft knees, lower bar along shins until hamstring stretch, squeeze glutes to stand.'
  },
  {
    id: '5',
    name: 'Pull-Ups',
    target: 'Back',
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    instructions: 'Overhand grip slightly wider than shoulders, pull chest to bar while squeezing shoulder blades.'
  },
  {
    id: '6',
    name: 'Lat Pulldown',
    target: 'Back',
    equipment: 'Machines',
    difficulty: 'Beginner',
    instructions: 'Grip wide handle, pull down smoothly to upper chest keeping torso slightly leaned back.'
  },
  {
    id: '7',
    name: 'Dumbbell Overhead Press',
    target: 'Shoulders',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    instructions: 'Seated or standing, press dumbbells overhead from shoulder height until arms are fully extended.'
  },
  {
    id: '8',
    name: 'Lateral Raises',
    target: 'Shoulders',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    instructions: 'Raise dumbbells out to sides until parallel with floor with soft bend in elbows.'
  },
  {
    id: '9',
    name: 'Barbell Bicep Curl',
    target: 'Arms',
    equipment: 'Barbell',
    difficulty: 'Beginner',
    instructions: 'Keep elbows tucked into sides, curl bar upward squeezing biceps at top.'
  },
  {
    id: '10',
    name: 'Tricep Rope Pushdown',
    target: 'Arms',
    equipment: 'Machines',
    difficulty: 'Beginner',
    instructions: 'Attach rope to cable pulley, extend arms downward spreading rope ends outward at bottom.'
  },
  {
    id: '11',
    name: 'Hanging Leg Raise',
    target: 'Core',
    equipment: 'Bodyweight',
    difficulty: 'Advanced',
    instructions: 'Hang from pull-up bar, raise legs to 90 degrees using lower abdominals without swinging.'
  },
  {
    id: '12',
    name: 'Push-Ups',
    target: 'Chest',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    instructions: 'Plank position, lower chest to floor keeping elbows at 45 degrees, press up firmly.'
  }
]

export default function ExerciseLibrary() {
  const [search, setSearch] = useState('')
  const [selectedTarget, setSelectedTarget] = useState('All')
  const [selectedEquipment, setSelectedEquipment] = useState('All')

  const filteredExercises = EXERCISE_DATA.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase())
    const matchesTarget = selectedTarget === 'All' || ex.target === selectedTarget
    const matchesEquipment = selectedEquipment === 'All' || ex.equipment === selectedEquipment
    return matchesSearch && matchesTarget && matchesEquipment
  })

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <span className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
          MOVEMENT DIRECTORY
        </span>
        <h1 className="text-3xl font-black italic text-white uppercase mt-2 tracking-wide">
          EXERCISE LIBRARY
        </h1>
      </div>

      {/* Controls / Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-950 p-4 rounded-3xl border border-zinc-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search exercise name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900 text-sm text-white placeholder-zinc-600 outline-none focus:border-yellow-400"
          />
        </div>

        <div>
          <select
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
            className="w-full py-3 px-4 rounded-xl border border-zinc-800 bg-zinc-900 text-sm text-white outline-none focus:border-yellow-400"
          >
            <option value="All">All Muscle Groups</option>
            <option value="Chest">Chest</option>
            <option value="Back">Back</option>
            <option value="Legs">Legs</option>
            <option value="Hamstrings">Hamstrings</option>
            <option value="Shoulders">Shoulders</option>
            <option value="Arms">Arms</option>
            <option value="Core">Core</option>
          </select>
        </div>

        <div>
          <select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            className="w-full py-3 px-4 rounded-xl border border-zinc-800 bg-zinc-900 text-sm text-white outline-none focus:border-yellow-400"
          >
            <option value="All">All Equipment</option>
            <option value="Barbell">Barbell</option>
            <option value="Dumbbells">Dumbbells</option>
            <option value="Bodyweight">Bodyweight</option>
            <option value="Machines">Machines</option>
          </select>
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((ex) => (
          <div
            key={ex.id}
            className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between hover:border-yellow-400/50 transition-all space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-black text-lg text-white uppercase italic">{ex.name}</h3>
                <span className="bg-yellow-400/10 text-yellow-400 text-[10px] font-black px-2 py-1 rounded-md uppercase border border-yellow-400/20 whitespace-nowrap">
                  {ex.target}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold">
                <Dumbbell className="w-3.5 h-3.5 text-zinc-500" />
                <span>{ex.equipment}</span>
                <span>•</span>
                <Flame className="w-3.5 h-3.5 text-yellow-500" />
                <span>{ex.difficulty}</span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed border-t border-zinc-900 pt-3">
                {ex.instructions}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-900">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Standard Technique
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}