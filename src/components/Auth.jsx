import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      alert(error.message)
    } else if (isSignUp) {
      alert('Account created successfully! You can now log in.')
      setIsSignUp(false)
    }
    
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-black p-4 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        
        {/* Gym Brand Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-yellow-400">
            ⚡ FITNESS DEAN GYM
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-yellow-400 italic">
            {isSignUp ? 'JOIN THE GYM' : 'NO EXCUSES. JUST GAINS.'}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {isSignUp
              ? 'Create your official account to log workouts and track progress.'
              : 'Sign in to access your workouts and manage your membership.'}
          </p>
        </div>

        {/* Auth Form Container */}
        <div className="rounded-2xl border-2 border-yellow-500/20 bg-zinc-950 p-8 shadow-2xl shadow-yellow-500/5">
          
          {/* Professional Tab Switcher */}
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-zinc-900 p-1">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`rounded-md py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                !isSignUp
                  ? 'bg-yellow-400 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`rounded-md py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                isSignUp
                  ? 'bg-yellow-400 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-yellow-400">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="athlete@fitnessdean.com"
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 outline-none transition-all focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-yellow-400">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 outline-none transition-all focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-yellow-400 py-3.5 text-base font-black uppercase text-black shadow-lg shadow-yellow-400/20 transition-all hover:bg-yellow-300 active:scale-[0.99] disabled:opacity-50"
            >
              {loading
                ? 'Processing...'
                : isSignUp
                ? 'Create Account'
                : 'Enter Fitness Dean Gym'}
            </button>
          </form>

          {/* Direct Switch Link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-zinc-400 hover:text-yellow-400 transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Create Account"}
            </button>
          </div>

          {/* Fitness Dean Info Box */}
          <div className="mt-6 border-t border-zinc-800/80 pt-5">
            <div className="rounded-lg bg-zinc-900/80 p-3 text-center border border-zinc-800">
              <p className="text-xs text-zinc-400">
                <strong className="text-yellow-400">Fitness Dean Perks:</strong> 24/7 Access • Heavy Iron • Personal Coaching
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}