import React from 'react';
import { Home, ShoppingBag, MessageCircle, Settings, CheckCircle2, RotateCw, ShoppingCart, RefreshCcw, AlertTriangle, Clock, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function WarmAccessible() {
  return (
    <div className="relative w-full max-w-[390px] mx-auto min-h-[100dvh] overflow-x-hidden bg-[#Fdfbf7] text-[#4a3f39]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
        
        .warm-shadow {
          box-shadow: 0 12px 35px -5px rgba(107, 92, 84, 0.12), 0 6px 15px -4px rgba(107, 92, 84, 0.08);
        }
        
        .warm-nav-shadow {
          box-shadow: 0 -8px 30px rgba(107, 92, 84, 0.12);
        }

        /* Hide scrollbar */
        .hide-scroll::-webkit-scrollbar {
          display: none;
        }
        .hide-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* Login Section */}
      <div className="flex flex-col min-h-[844px] px-6 py-12 relative overflow-hidden">
        {/* Background decorative blobs */}
        <div className="absolute top-[-10%] right-[-20%] w-[300px] h-[300px] bg-[#f2e7de] rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-20%] w-[250px] h-[250px] bg-[#f5e3d7] rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full mt-10">
          <div className="w-20 h-20 bg-[#e07a5f] rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-lg">
            <Home className="w-10 h-10 text-white -rotate-3" strokeWidth={2.5} />
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-[#3d312b]">Roommate</h1>
          <p className="text-[#6b5c54] text-lg mb-12 text-center max-w-[280px] font-medium leading-relaxed">
            Your shared home, perfectly in sync.
          </p>

          <div className="w-full bg-white rounded-[32px] p-8 warm-shadow mb-12 border border-[#e8dfda]">
            <ul className="space-y-6 mb-10">
              <li className="flex items-center gap-4 text-[#4a3f39]">
                <div className="w-12 h-12 rounded-full bg-[#fdf2ee] flex items-center justify-center flex-shrink-0">
                  <RotateCw className="w-6 h-6 text-[#d35a50]" />
                </div>
                <span className="font-semibold text-[16px]">Fair task rotation</span>
              </li>
              <li className="flex items-center gap-4 text-[#4a3f39]">
                <div className="w-12 h-12 rounded-full bg-[#fdf2ee] flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-6 h-6 text-[#d35a50]" />
                </div>
                <span className="font-semibold text-[16px]">Shared shopping list</span>
              </li>
              <li className="flex items-center gap-4 text-[#4a3f39]">
                <div className="w-12 h-12 rounded-full bg-[#fdf2ee] flex items-center justify-center flex-shrink-0">
                  <RefreshCcw className="w-6 h-6 text-[#d35a50]" />
                </div>
                <span className="font-semibold text-[16px]">Real-time sync</span>
              </li>
            </ul>

            <Button className="w-full h-14 min-h-[56px] rounded-2xl bg-white border-2 border-[#3d312b] text-[#3d312b] hover:bg-[#faf7f5] flex items-center justify-center gap-3 font-bold text-base shadow-sm transition-all focus:ring-4 focus:ring-[#e07a5f] focus:outline-none">
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-0 right-0 flex justify-center opacity-80">
          <div className="flex flex-col items-center gap-3 animate-bounce">
            <span className="text-[13px] font-bold text-[#6b5c54] tracking-widest uppercase">Peek inside</span>
            <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-[#e07a5f] to-transparent" />
          </div>
        </div>
      </div>

      {/* Dashboard Preview Section */}
      <div className="px-5 pb-36 pt-10 bg-[#fbf6f2] rounded-t-[40px] warm-nav-shadow relative z-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-[#6b5c54] font-semibold text-base mb-1">Welcome to</h2>
            <h3 className="text-3xl font-bold text-[#3d312b]">The Treehouse</h3>
          </div>
          <div className="flex -space-x-2">
            <img src="https://i.pravatar.cc/150?u=1" className="w-12 h-12 rounded-full border-2 border-[#fbf6f2]" alt="Roommate 1" />
            <img src="https://i.pravatar.cc/150?u=2" className="w-12 h-12 rounded-full border-2 border-[#fbf6f2]" alt="Roommate 2" />
            <div className="w-12 h-12 rounded-full border-2 border-[#fbf6f2] bg-[#e07a5f] flex items-center justify-center text-white text-base font-bold">
              +1
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <h4 className="font-bold text-[#3d312b] text-xl mb-3">Today's Tasks</h4>
          
          {/* Overdue Task (Red) */}
          <div className="bg-white rounded-2xl p-5 flex gap-4 items-center warm-shadow border-l-[6px] border-l-[#d35a50] border-y border-r border-[#f5ece7]">
            <div className="w-12 h-12 rounded-xl bg-[#fae8e5] flex items-center justify-center flex-shrink-0 text-[#d35a50]">
              <RotateCw className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h5 className="font-bold text-[#3d312b] text-[16px] mb-2">Take out recycling</h5>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="flex items-center gap-1.5 text-[13px] font-bold text-[#b52a1d] bg-[#fae8e5] px-2.5 py-1 rounded-md border border-[#eabeb9]">
                  <AlertTriangle className="w-3.5 h-3.5" strokeWidth={3} />
                  Overdue
                </span>
                <span className="text-[13px] font-medium text-[#6b5c54]">Since yesterday</span>
              </div>
            </div>
            <div className="flex flex-col items-center ml-2">
              <img src="https://i.pravatar.cc/150?u=1" className="w-10 h-10 rounded-full mb-1 border border-[#e8dfda]" alt="Assignee: Alex" />
              <span className="text-[12px] font-bold text-[#6b5c54]">Alex</span>
            </div>
          </div>

          {/* Today Task (Amber) */}
          <div className="bg-white rounded-2xl p-5 flex gap-4 items-center warm-shadow border-l-[6px] border-l-[#d97706] border-y border-r border-[#f5ece7]">
            <div className="w-12 h-12 rounded-xl bg-[#fff8db] flex items-center justify-center flex-shrink-0 text-[#d97706]">
              <RefreshCcw className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h5 className="font-bold text-[#3d312b] text-[16px] mb-2">Clean kitchen counters</h5>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="flex items-center gap-1.5 text-[13px] font-bold text-[#b45309] bg-[#fff8db] px-2.5 py-1 rounded-md border border-[#fde68a]">
                  <Clock className="w-3.5 h-3.5" strokeWidth={3} />
                  Today
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center ml-2">
              <img src="https://i.pravatar.cc/150?u=2" className="w-10 h-10 rounded-full mb-1 border border-[#e8dfda]" alt="Assignee: Jordan" />
              <span className="text-[12px] font-bold text-[#6b5c54]">Jordan</span>
            </div>
          </div>

          {/* Upcoming Task (Green) */}
          <div className="bg-white rounded-2xl p-5 flex gap-4 items-center warm-shadow border-l-[6px] border-l-[#2f854f] border-y border-r border-[#f5ece7]">
            <div className="w-12 h-12 rounded-xl bg-[#e6f4ea] flex items-center justify-center flex-shrink-0 text-[#2f854f]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h5 className="font-bold text-[#3d312b] text-[16px] mb-2">Vacuum living room</h5>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="flex items-center gap-1.5 text-[13px] font-bold text-[#1b6b38] bg-[#e6f4ea] px-2.5 py-1 rounded-md border border-[#bbf7d0]">
                  <CalendarDays className="w-3.5 h-3.5" strokeWidth={3} />
                  Upcoming
                </span>
                <span className="text-[13px] font-medium text-[#6b5c54]">Tomorrow</span>
              </div>
            </div>
            <div className="flex flex-col items-center ml-2">
              <div className="w-10 h-10 rounded-full bg-[#fdf2ee] border border-[#e8dfda] flex items-center justify-center text-[#d35a50] font-bold text-[13px] mb-1">Me</div>
              <span className="text-[12px] font-bold text-[#6b5c54]">You</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 px-4">
        <div className="bg-white px-2 py-3 rounded-[32px] flex items-center justify-between w-full max-w-[360px] warm-nav-shadow border border-[#3d312b]">
          <button className="flex flex-col items-center justify-center min-w-[72px] min-h-[48px] gap-1.5 text-[#d35a50] transition-colors relative focus:outline-none focus:ring-2 focus:ring-[#e07a5f] rounded-xl">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#d35a50] rounded-full" />
            <Home className="w-6 h-6" strokeWidth={2.5} />
            <span className="text-[12px] font-bold">Home</span>
          </button>
          <button className="flex flex-col items-center justify-center min-w-[72px] min-h-[48px] gap-1.5 text-[#6b5c54] hover:text-[#3d312b] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6b5c54] rounded-xl">
            <ShoppingBag className="w-6 h-6" strokeWidth={2.5} />
            <span className="text-[12px] font-bold">Shop</span>
          </button>
          <button className="flex flex-col items-center justify-center min-w-[72px] min-h-[48px] gap-1.5 text-[#6b5c54] hover:text-[#3d312b] transition-colors relative focus:outline-none focus:ring-2 focus:ring-[#6b5c54] rounded-xl">
            <div className="absolute top-0 right-3.5 w-3 h-3 bg-[#d35a50] rounded-full border-2 border-white" />
            <MessageCircle className="w-6 h-6" strokeWidth={2.5} />
            <span className="text-[12px] font-bold">Chat</span>
          </button>
          <button className="flex flex-col items-center justify-center min-w-[72px] min-h-[48px] gap-1.5 text-[#6b5c54] hover:text-[#3d312b] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6b5c54] rounded-xl">
            <Settings className="w-6 h-6" strokeWidth={2.5} />
            <span className="text-[12px] font-bold">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
