import { useState } from 'react'
import { Dumbbell, LayoutDashboard, Utensils, TrendingUp, User, LogOut, Crown, QrCode, Smartphone, X } from 'lucide-react'

export default function Layout({ children, activeTab, setActiveTab, isPremium, onSignOut }) {
  const [showQR, setShowQR] = useState(false)
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://fitnessdean.app'
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(currentUrl)}`

  const navItems = [
    { id: 'HOME', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'WORKOUT', label: 'Workout Logger', icon: Dumbbell },
    { id: 'EXERCISES', label: 'Exercise Catalog', icon: Dumbbell },
    { id: 'NUTRITION', label: 'Nutrition & Macros', icon: Utensils },
    { id: 'PROGRESS', label: 'Analytics & PRs', icon: TrendingUp },
    { id: 'PROFILE', label: 'Profile & Targets', icon: User },
  ]

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div>
              <h1 className="text-xl font-black italic tracking-wider text-yellow-400 uppercase">
                FITNESS DEAN
              </h1>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                PORTAL v1.0
              </p>
            </div>
            {isPremium ? (
              <span className="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1 shadow-md shadow-yellow-400/20">
                <Crown className="w-3 h-3" /> PRO
              </span>
            ) : (
              <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                FREE
              </span>
            )}
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                    isActive
                      ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/10'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-zinc-900 space-y-2">
          <button
            onClick={() => setShowQR(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 transition-all border border-yellow-400/20 uppercase"
          >
            <QrCode className="w-4 h-4" />
            Scan QR for Mobile
          </button>

          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-all uppercase"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>

      {/* Mobile QR Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full space-y-5 text-center relative">
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center">
              <div className="p-3 bg-yellow-400/10 rounded-2xl border border-yellow-400/30 text-yellow-400">
                <Smartphone className="w-8 h-8" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black italic uppercase text-white">OPEN ON IOS / MOBILE</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Scan this QR code with your iPhone camera to open the app instantly.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-xl">
              <img src={qrApiUrl} alt="App Mobile QR Code" className="w-48 h-48 mx-auto" />
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-left text-[11px] text-zinc-400 space-y-1">
              <p className="font-bold text-yellow-400 uppercase">iOS Home Screen Tip:</p>
              <p>In Safari on iOS, tap the <span className="text-white font-bold">Share Button</span> and choose <span className="text-white font-bold">'Add to Home Screen'</span> to use it like a native iPhone app!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}