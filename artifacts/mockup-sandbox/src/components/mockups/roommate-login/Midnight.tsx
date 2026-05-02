import React from 'react';
import { Home, ShoppingCart, MessageCircle, Settings, CheckCircle2, RefreshCw, List, MoonStar, User } from 'lucide-react';
import './_group.css';

export function Midnight() {
  return (
    <div className="font-midnight bg-midnight-base text-gray-200 min-h-screen w-full max-w-[390px] mx-auto relative overflow-hidden flex flex-col items-center custom-scrollbar">
      {/* Background glow */}
      <div className="glow-effect top-[5%] left-1/2 -translate-x-1/2"></div>
      
      {/* Login Screen (Full Height) */}
      <div className="w-full min-h-[844px] flex flex-col justify-center items-center px-6 relative z-10">
        <div className="glass-card w-full p-8 rounded-3xl flex flex-col items-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="flex flex-col items-center space-y-3 text-center z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#121826] to-gray-900 border border-white/10 flex items-center justify-center shadow-lg mb-2 relative">
              <MoonStar className="w-8 h-8 text-midnight-gold relative z-10" />
            </div>
            <h1 className="text-3xl font-medium tracking-tight text-white">Tasker</h1>
            <p className="text-sm text-gray-400">Night owls run the house.</p>
          </div>

          <div className="w-full space-y-4 z-10">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-midnight-gold opacity-80" />
              <span className="text-sm text-gray-300">Smart task rotation</span>
            </div>
            <div className="flex items-center gap-3">
              <List className="w-5 h-5 text-midnight-gold opacity-80" />
              <span className="text-sm text-gray-300">Shared shopping list</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-midnight-gold opacity-80" />
              <span className="text-sm text-gray-300">Real-time sync</span>
            </div>
          </div>

          <button className="w-full bg-white text-gray-900 rounded-xl py-3.5 px-4 flex items-center justify-center gap-3 font-medium hover:bg-gray-100 transition-colors mt-4 z-10 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        </div>
        
        <div className="absolute bottom-12 text-gray-500 text-xs flex flex-col items-center">
          <span>Scroll to explore</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-gray-500 to-transparent mt-2"></div>
        </div>
      </div>

      {/* Dashboard Preview (Below the fold) */}
      <div className="w-full flex-1 px-6 pb-28 pt-8 relative z-10 bg-midnight-base">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">The Nocturnals</h2>
            <p className="text-sm text-gray-400 mt-1">3 members • 4 tasks left</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden flex items-center justify-center bg-[#121826]">
             <User className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="space-y-4">
          {/* Overdue Task */}
          <div className="glass-card rounded-2xl p-4 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
            <div className="pl-3 flex-1">
              <h3 className="font-medium text-white mb-1">Take out recycling</h3>
              <p className="text-xs text-red-400">Overdue by 1 day</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 backdrop-blur-md">
                Alex
              </div>
            </div>
          </div>

          {/* Today Task */}
          <div className="glass-card rounded-2xl p-4 flex items-center justify-between relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-midnight-gold shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
            <div className="pl-3 flex-1">
              <h3 className="font-medium text-white mb-1">Wipe down counters</h3>
              <p className="text-xs text-midnight-gold">Due today</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 backdrop-blur-md">
                You
              </div>
            </div>
          </div>

          {/* Upcoming Task */}
          <div className="glass-card rounded-2xl p-4 flex items-center justify-between relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            <div className="pl-3 flex-1">
              <h3 className="font-medium text-white mb-1">Vacuum living room</h3>
              <p className="text-xs text-gray-400">Due in 2 days</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 backdrop-blur-md">
                Sam
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] h-20 glass-card !border-x-0 !border-b-0 border-t border-white/10 rounded-t-3xl flex items-center justify-around px-2 z-20 pb-4 pt-2">
        <button className="flex flex-col items-center justify-center w-16 h-full gap-1">
          <Home className="w-5 h-5 text-midnight-gold drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
          <span className="text-[10px] text-midnight-gold font-medium">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center w-16 h-full gap-1 opacity-50 hover:opacity-100 transition-opacity">
          <ShoppingCart className="w-5 h-5 text-gray-400" />
          <span className="text-[10px] text-gray-400 font-medium">Shop</span>
        </button>
        <button className="flex flex-col items-center justify-center w-16 h-full gap-1 opacity-50 hover:opacity-100 transition-opacity">
          <MessageCircle className="w-5 h-5 text-gray-400" />
          <span className="text-[10px] text-gray-400 font-medium">Chat</span>
        </button>
        <button className="flex flex-col items-center justify-center w-16 h-full gap-1 opacity-50 hover:opacity-100 transition-opacity">
          <Settings className="w-5 h-5 text-gray-400" />
          <span className="text-[10px] text-gray-400 font-medium">Settings</span>
        </button>
      </div>

    </div>
  );
}
