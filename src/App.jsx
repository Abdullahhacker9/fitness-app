import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoginView, setIsLoginView] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Dashboard state
  const [activeTab, setActiveTab] = useState('workouts')
  const [exercise, setExercise] = useState('Barbell Bench Press (Chest)')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [loggedWorkouts, setLoggedWorkouts] = useState([
    { id: 1, exercise: 'Barbell Squat', weight: '120', reps: '5', date: 'Today' },
    { id: 2, exercise: 'Incline Dumbbell Press', weight: '32', reps: '8', date: 'Yesterday' }
  ])

  const EXERCISES = [
    'Barbell Bench Press (Chest)',
    'Incline Dumbbell Press (Chest)',
    'Barbell Squat (Legs)',
    'Romanian Deadlift (Legs)',
    'Overhead Press (Shoulders)',
    'Lat Pulldown (Back)',
  ]

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAuth = async (e) => {
    e.preventDefault()
    setAuthError('')
    let error;
    
    if (isLoginView) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      error = signInError
    } else {
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      error = signUpError
    }

    if (error) setAuthError(error.message)
  }

  const handleAddWorkout = (e) => {
    e.preventDefault()
    if (!weight || !reps) return
    setLoggedWorkouts([{ id: Date.now(), exercise, weight, reps, date: 'Just now' }, ...loggedWorkouts])
    setWeight('')
    setReps('')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#FFC107',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        fontWeight: '900',
        letterSpacing: '2px'
      }}>
        LOADING FITNESS DEAN...
      </div>
    )
  }

  // ========================================================
  // 1. LOGIN / SIGNUP PAGE
  // ========================================================
  if (!session) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>
          
          {/* Badge */}
          <div style={{ display: 'inline-block', marginBottom: '16px' }}>
            <span style={{
              backgroundColor: 'rgba(255, 193, 7, 0.08)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              color: '#FFC107',
              fontSize: '11px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              padding: '6px 16px',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              ⚡ FITNESS DEAN GYM
            </span>
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: '36px',
            fontWeight: '900',
            color: '#FFC107',
            fontStyle: 'italic',
            textTransform: 'uppercase',
            lineHeight: '1.1',
            marginBottom: '12px',
            letterSpacing: '0.5px'
          }}>
            NO EXCUSES. JUST<br />GAINS.
          </h1>

          {/* Subtitle */}
          <p style={{
            color: '#a1a1aa',
            fontSize: '14px',
            marginBottom: '28px'
          }}>
            Sign in to access your workouts and manage your membership.
          </p>

          {/* Main Card */}
          <div style={{
            backgroundColor: '#0c0c0e',
            border: '1px solid #27272a',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            textAlign: 'left'
          }}>
            
            {/* Toggle Switch */}
            <div style={{
              display: 'flex',
              backgroundColor: '#18181b',
              borderRadius: '8px',
              padding: '4px',
              marginBottom: '24px'
            }}>
              <button
                type="button"
                onClick={() => setIsLoginView(true)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  fontSize: '11px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: isLoginView ? '#FFC107' : 'transparent',
                  color: isLoginView ? '#000000' : '#71717a'
                }}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => setIsLoginView(false)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  fontSize: '11px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: !isLoginView ? '#FFC107' : 'transparent',
                  color: !isLoginView ? '#000000' : '#71717a'
                }}
              >
                CREATE ACCOUNT
              </button>
            </div>

            <form onSubmit={handleAuth}>
              {authError && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: 'rgba(127, 29, 29, 0.4)',
                  border: '1px solid #7f1d1d',
                  borderRadius: '8px',
                  color: '#f87171',
                  fontSize: '12px',
                  fontWeight: '700',
                  marginBottom: '16px'
                }}>
                  {authError}
                </div>
              )}

              {/* Email Input */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: '800',
                  color: '#FFC107',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  marginBottom: '8px'
                }}>
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@fitnessdean.com"
                  style={{
                    width: '100%',
                    backgroundColor: '#141416',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    fontSize: '14px',
                    color: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Password Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: '800',
                  color: '#FFC107',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  marginBottom: '8px'
                }}>
                  PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      backgroundColor: '#141416',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      padding: '12px 42px 12px 14px',
                      fontSize: '14px',
                      color: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#71717a',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '0'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  backgroundColor: '#FFC107',
                  color: '#000000',
                  fontWeight: '900',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  padding: '14px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(255, 193, 7, 0.25)',
                  marginTop: '6px'
                }}
              >
                ENTER FITNESS DEAN GYM
              </button>
            </form>

            {/* Toggle Link */}
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setIsLoginView(!isLoginView)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#71717a',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {isLoginView ? "Don't have an account? Create Account" : "Already have an account? Sign In"}
              </button>
            </div>

            {/* Perks Box */}
            <div style={{
              marginTop: '20px',
              padding: '10px 14px',
              backgroundColor: '#121215',
              border: '1px solid #27272a',
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '11px'
            }}>
              <span style={{ color: '#FFC107', fontWeight: '800' }}>Fitness Dean Perks: </span>
              <span style={{ color: '#a1a1aa' }}>24/7 Access • Heavy Iron • Personal Coaching</span>
            </div>

          </div>
        </div>
      </div>
    )
  }

  // ========================================================
  // 2. RESPONSIVE DASHBOARD (MOBILE & DESKTOP COMPATIBLE)
  // ========================================================
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* CSS Styles injected for responsive layout without Tailwind */}
      <style>{`
        .app-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .mobile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background-color: #050505;
          border-bottom: 1px solid #1f1f23;
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .app-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 260px;
          background-color: #050505;
          border-right: 1px solid #1f1f23;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          z-index: 50;
          transform: translateX(-100%);
          transition: transform 0.3s ease-in-out;
          box-sizing: border-box;
        }
        .app-sidebar.open {
          transform: translateX(0);
        }
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          z-index: 45;
        }
        .main-content {
          flex: 1;
          padding: 20px;
          box-sizing: border-box;
          width: 100%;
        }
        .input-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        
        /* Desktop styles (768px and above) */
        @media (min-width: 768px) {
          .app-container {
            flex-direction: row !important;
          }
          .mobile-header {
            display: none !important;
          }
          .app-sidebar {
            position: static !important;
            transform: none !important;
            flex-shrink: 0;
          }
          .sidebar-overlay {
            display: none !important;
          }
          .main-content {
            padding: 32px !important;
          }
          .input-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>

      {/* MOBILE TOP HEADER BAR */}
      <header className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '16px', fontWeight: '900', color: '#FFC107', fontStyle: 'italic', textTransform: 'uppercase', margin: 0 }}>
            FITNESS DEAN
          </h1>
          <span style={{
            backgroundColor: 'rgba(255, 193, 7, 0.15)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            padding: '2px 6px',
            fontSize: '9px',
            fontWeight: '900',
            color: '#FFC107',
            borderRadius: '4px'
          }}>PRO</span>
        </div>

        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: '#FFC107',
            fontSize: '22px',
            cursor: 'pointer',
            padding: '4px 8px'
          }}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* MOBILE BACKDROP OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      <div className="app-container">
        {/* SIDEBAR DRAWER */}
        <aside className={`app-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: '900', color: '#FFC107', fontStyle: 'italic', textTransform: 'uppercase', margin: 0 }}>
                FITNESS DEAN
              </h1>
              <span style={{
                backgroundColor: 'rgba(255, 193, 7, 0.15)',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                padding: '2px 6px',
                fontSize: '9px',
                fontWeight: '900',
                color: '#FFC107',
                borderRadius: '4px'
              }}>PRO</span>
            </div>
            <p style={{ fontSize: '10px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '4px', marginBottom: '32px' }}>
              PORTAL V1.0
            </p>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { id: 'dashboard', label: 'DASHBOARD' },
                { id: 'workouts', label: 'WORKOUT LOGGER' },
                { id: 'catalog', label: 'EXERCISE CATALOG' },
                { id: 'nutrition', label: 'NUTRITION & MACROS' },
                { id: 'analytics', label: 'ANALYTICS & PRS' },
                { id: 'profile', label: 'PROFILE & TARGETS' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setIsMobileMenuOpen(false) // Close menu on tab click
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: activeTab === tab.id ? '#FFC107' : 'transparent',
                    color: activeTab === tab.id ? '#000000' : '#a1a1aa',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
            <button style={{
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              color: '#FFC107',
              backgroundColor: 'transparent',
              fontSize: '11px',
              fontWeight: '800',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}>
              SCAN QR FOR MOBILE
            </button>
            <button
              onClick={() => supabase.auth.signOut()}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #27272a',
                color: '#71717a',
                backgroundColor: 'transparent',
                fontSize: '11px',
                fontWeight: '800',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              SIGN OUT
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="main-content">
          {activeTab === 'workouts' && (
            <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Workout Form */}
              <div style={{
                backgroundColor: '#0c0c0e',
                border: '1px solid #27272a',
                borderRadius: '16px',
                padding: '20px'
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#FFC107', fontStyle: 'italic', textTransform: 'uppercase', margin: '0 0 4px 0' }}>
                  WORKOUT LOGGER
                </h2>
                <p style={{ fontSize: '12px', color: '#71717a', margin: '0 0 20px 0' }}>
                  Log your weight and reps to build training volume.
                </p>

                <form onSubmit={handleAddWorkout} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                      SELECT EXERCISE
                    </label>
                    <select
                      value={exercise}
                      onChange={(e) => setExercise(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: '#141416',
                        border: '1px solid #27272a',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        fontSize: '13px',
                        color: '#ffffff',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      {EXERCISES.map((ex, idx) => (
                        <option key={idx} value={ex} style={{ backgroundColor: '#141416', color: '#fff' }}>{ex}</option>
                      ))}
                    </select>
                  </div>

                  {/* RESPONSIVE INPUT GRID */}
                  <div className="input-grid">
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                        WEIGHT (KG)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 80"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#141416',
                          border: '1px solid #27272a',
                          borderRadius: '10px',
                          padding: '12px 14px',
                          fontSize: '13px',
                          color: '#ffffff',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                        REPS COMPLETED
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 10"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#141416',
                          border: '1px solid #27272a',
                          borderRadius: '10px',
                          padding: '12px 14px',
                          fontSize: '13px',
                          color: '#ffffff',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      backgroundColor: '#FFC107',
                      color: '#000000',
                      fontWeight: '900',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      padding: '14px',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      marginTop: '8px'
                    }}
                  >
                    + LOG SET NOW
                  </button>
                </form>
              </div>

              {/* Workout History */}
              <div style={{
                backgroundColor: '#0c0c0e',
                border: '1px solid #27272a',
                borderRadius: '16px',
                padding: '20px'
              }}>
                <h3 style={{ fontSize: '13px', fontWeight: '900', color: '#e4e4e7', fontStyle: 'italic', textTransform: 'uppercase', margin: '0 0 16px 0' }}>
                  LOGGED WORKOUT HISTORY
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {loggedWorkouts.map((item) => (
                    <div key={item.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#141416',
                      border: '1px solid #27272a',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{ flex: 1, paddingRight: '12px' }}>
                        <h4 style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#ffffff' }}>{item.exercise}</h4>
                        <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#71717a' }}>{item.date}</p>
                      </div>
                      <div style={{ textAlign: 'right', whitespace: 'nowrap' }}>
                        <span style={{ color: '#FFC107', fontWeight: '900', fontSize: '15px' }}>{item.weight} kg</span>
                        <span style={{ color: '#a1a1aa', fontSize: '12px', marginLeft: '6px' }}>× {item.reps} reps</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {activeTab !== 'workouts' && (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#71717a',
              border: '1px dashed #27272a',
              borderRadius: '16px'
            }}>
              This section is coming soon.
            </div>
          )}
        </main>
      </div>
    </div>
  )
}