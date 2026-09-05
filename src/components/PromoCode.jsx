import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function PromoCode({ userEmail, onComplete, onSignOut }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleRedeem = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const formattedCode = code.trim().toUpperCase()

    // Check code in Supabase promo_codes table
    const { data, error } = await supabase
      .from('promo_codes')
      .select('code')
      .eq('code', formattedCode)
      .maybeSingle()

    if (error) {
      setErrorMsg('Database error: ' + error.message)
      setLoading(false)
      return
    }

    if (data) {
      // Save active premium status for this user
      const { error: upgradeError } = await supabase
        .from('premium_users')
        .upsert({ email: userEmail, status: 'active' })

      if (upgradeError) {
        setErrorMsg('Database error: ' + upgradeError.message)
      } else {
        alert('⚡ PROMO CODE ACCEPTED! VIP ACCESS UNLOCKED.')
        onComplete(true)
      }
    } else {
      setErrorMsg('Invalid Promo Code. Features remain locked.')
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 text-zinc-100">
      <div className="w-full max-w-md rounded-2xl border-2 border-yellow-500/30 bg-zinc-950 p-8 text-center shadow-2xl">
        <div className="inline-flex rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-yellow-400 mb-4">
          🔒 PROMO CODE REQUIRED
        </div>

        <h2 className="text-3xl font-black text-yellow-400 italic">UNLOCK ACCESS</h2>
        <p className="mt-2 text-xs text-zinc-400">
          Signed in as <span className="text-white font-bold">{userEmail}</span>.<br />
          Enter a valid VIP promo code to unlock app features.
        </p>

        <form onSubmit={handleRedeem} className="mt-6 space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder=""
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-center text-lg font-black tracking-widest text-yellow-400 uppercase outline-none focus:border-yellow-400"
            required
          />

          {errorMsg && <p className="text-xs font-bold text-red-500">{errorMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-yellow-400 py-3.5 text-sm font-black uppercase text-black shadow-lg hover:bg-yellow-300 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'REDEEM PROMO CODE'}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 border-t border-zinc-800 pt-4">
          {/* Skip keeping features locked */}
          <button
            type="button"
            onClick={() => onComplete(false)}
            className="text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider"
          >
            Skip (Keep features locked)
          </button>

          {/* Go back to Sign In */}
          <button
            type="button"
            onClick={onSignOut}
            className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider"
          >
            ← Back to Sign In / Switch Account
          </button>
        </div>
      </div>
    </div>
  )
}