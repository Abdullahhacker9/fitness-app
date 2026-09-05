import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function PromoCode({ userEmail, onComplete }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // -------------------------------------------------------------
  // 🔑 CHANGE YOUR PROMO CODES HERE WHENEVER YOU WANT!
  // You can add one or multiple valid promo codes in this array.
  // -------------------------------------------------------------
  const VALID_PROMO_CODES = ['DEANVIP2026', 'GYMGAINS', 'DEAN50']

  const handleRedeem = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const formattedCode = code.trim().toUpperCase()

    if (VALID_PROMO_CODES.includes(formattedCode)) {
      // Save user as active premium in Supabase
      const { error } = await supabase
        .from('premium_users')
        .upsert({ email: userEmail, status: 'active' })

      if (error) {
        setErrorMsg('Database error: ' + error.message)
      } else {
        alert('⚡ PROMO CODE ACCEPTED! VIP ACCESS UNLOCKED.')
        onComplete(true) // Set as premium
      }
    } else {
      setErrorMsg('Invalid Promo Code. Please try again or skip.')
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 text-zinc-100">
      <div className="w-full max-w-md rounded-2xl border-2 border-yellow-500/30 bg-zinc-950 p-8 text-center shadow-2xl">
        <div className="inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-yellow-400 mb-4">
          ⚡ VIP MEMBER ACCESS
        </div>

        <h2 className="text-3xl font-black text-yellow-400 italic">ENTER PROMO CODE</h2>
        <p className="mt-2 text-xs text-zinc-400">
          Got an exclusive Fitness Dean promo code? Enter it below to unlock Premium Access.
        </p>

        <form onSubmit={handleRedeem} className="mt-6 space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. DEANVIP2026"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-center text-lg font-black tracking-widest text-yellow-400 uppercase placeholder-zinc-600 outline-none focus:border-yellow-400"
            required
          />

          {errorMsg && <p className="text-xs font-bold text-red-500">{errorMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-yellow-400 py-3.5 text-sm font-black uppercase text-black shadow-lg hover:bg-yellow-300 disabled:opacity-50"
          >
            {loading ? 'Verifying Code...' : 'REDEEM PROMO CODE'}
          </button>
        </form>

        {/* Skip button for non-paying users */}
        <button
          type="button"
          onClick={() => onComplete(false)}
          className="mt-4 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider"
        >
          Skip for now (Continue as Standard Member)
        </button>
      </div>
    </div>
  )
}