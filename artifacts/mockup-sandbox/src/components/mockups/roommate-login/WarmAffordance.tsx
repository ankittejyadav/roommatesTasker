import React from 'react';
import { Home, ShoppingBag, MessageCircle, Settings, CheckCircle2, RotateCw, ShoppingCart, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function WarmAffordance() {
  return (
    <div className="relative w-full max-w-[390px] mx-auto min-h-[100dvh] overflow-x-hidden bg-[#Fdfbf7] text-[#4a3f39]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
        
        .warm-shadow {
          box-shadow: 0 12px 35px -5px rgba(138, 122, 115, 0.12), 0 6px 15px -4px rgba(138, 122, 115, 0.08);
        }
        
        .warm-nav-shadow {
          box-shadow: 0 -8px 30px rgba(138, 122, 115, 0.08);
        }

        .cta-shadow {
          box-shadow: 0 8px 20px -4px rgba(61, 49, 43, 0.4);
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
          
          <h1 className="text-4xl font-bold tracking-tight mb-3 text-[#3d312b]">Roommate</h1>
          <p className="text-[#8a7a73] text-lg mb-12 text-center max-w-[260px]">
            Your shared home, perfectly in sync.
          </p>

          <div className="w-full bg-white rounded-[32px] p-8 warm-shadow mb-12 border border-[#f5ece7]">
            {/* Compressed Feature List */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <div className="flex items-center gap-1.5 bg-[#fdf2ee] text-[#c05c3e] px-3 py-1.5 rounded-full text-xs font-bold border border-[#f5d9cf]">
                <RotateCw className="w-3.5 h-3.5" />
                Rotation
              </div>
              <div className="flex items-center gap-1.5 bg-[#fdf2ee] text-[#c05c3e] px-3 py-1.5 rounded-full text-xs font-bold border border-[#f5d9cf]">
                <ShoppingCart className="w-3.5 h-3.5" />
                Shopping
              </div>
              <div className="flex items-center gap-1.5 bg-[#fdf2ee] text-[#c05c3e] px-3 py-1.5 rounded-full text-xs font-bold border border-[#f5d9cf]">
                <RefreshCcw className="w-3.5 h-3.5" />
                Sync
              </div>
            </div>

            {/* High-Contrast Filled CTA */}
            <Button className="w-full h-14 rounded-2xl bg-[#3d312b] text-white hover:bg-[#2a221d] flex items-center justify-center gap-3 font-bold text-[17px] cta-shadow transition-transform active:scale-[0.98]">
              <svg viewBox="0 0 24 24" className="w-5 h-5 bg-white rounded-full p-[2px]">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>
          </div>
        </div>
        
        {/* Explicit scroll affordance */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
          <button className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-[#f5ece7] warm-shadow animate-bounce hover:bg-white transition-colors">
            <span className="text-sm font-bold text-[#e07a5f]">Preview the app</span>
            <div className="w-5 h-5 rounded-full bg-[#fdf2ee] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e07a5f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M19 12l-7 7-7-7"/>
              </svg>
            </div>
          </button>
        </div>
      </div>

      {/* Dashboard Preview Section */}
      <div className="px-5 pb-32 pt-8 bg-[#fbf6f2] rounded-t-[40px] warm-nav-shadow relative z-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-[#8a7a73] font-medium mb-1">Welcome to</h2>
            <h3 className="text-3xl font-bold text-[#3d312b]">The Treehouse</h3>
          </div>
          <div className="flex -space-x-2">
            <img src="https://i.pravatar.cc/150?u=1" className="w-10 h-10 rounded-full border-2 border-[#fbf6f2]" alt="Roommate 1" />
            <img src="https://i.pravatar.cc/150?u=2" className="w-10 h-10 rounded-full border-2 border-[#fbf6f2]" alt="Roommate 2" />
            <div className="w-10 h-10 rounded-full border-2 border-[#fbf6f2] bg-[#f0e6e0] flex items-center justify-center text-[#8a7a73] text-sm font-bold">
              +1
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-[#5c4f48] text-lg mb-2">Today's Tasks</h4>
          
          {/* Overdue Task (Red) */}
          <div className="bg-white rounded-2xl p-4 flex gap-3 items-center warm-shadow border-l-4 border-l-[#d35a50] border-y border-r border-[#f5ece7]">
            <div className="w-12 h-12 rounded-xl bg-[#fdf2ee] flex items-center justify-center flex-shrink-0 text-[#d35a50]">
              <RotateCw className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-[#3d312b] mb-1 truncate">Take out recycling</h5>
              <div className="flex gap-2 items-center flex-wrap">
                <span className="text-xs font-bold text-[#d35a50] bg-[#fae8e5] px-2 py-0.5 rounded-md">Overdue</span>
                <span className="text-xs text-[#8a7a73]">Since yesterday</span>
              </div>
            </div>
            <button className="h-10 px-4 bg-[#f8f5f2] hover:bg-[#e07a5f] text-[#3d312b] hover:text-white rounded-xl font-bold text-sm transition-colors border border-[#e8dfda] hover:border-[#e07a5f] flex-shrink-0 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Done
            </button>
          </div>

          {/* Today Task (Amber) */}
          <div className="bg-white rounded-2xl p-4 flex gap-3 items-center warm-shadow border-l-4 border-l-[#eab308] border-y border-r border-[#f5ece7]">
            <div className="w-12 h-12 rounded-xl bg-[#fffbf0] flex items-center justify-center flex-shrink-0 text-[#eab308]">
              <RefreshCcw className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-[#3d312b] mb-1 truncate">Clean counters</h5>
              <div className="flex gap-2 items-center">
                <span className="text-xs font-bold text-[#eab308] bg-[#fff8db] px-2 py-0.5 rounded-md">Today</span>
              </div>
            </div>
            <button className="h-10 px-4 bg-[#f8f5f2] hover:bg-[#e07a5f] text-[#3d312b] hover:text-white rounded-xl font-bold text-sm transition-colors border border-[#e8dfda] hover:border-[#e07a5f] flex-shrink-0 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Done
            </button>
          </div>

          {/* Upcoming Task (Green) */}
          <div className="bg-white rounded-2xl p-4 flex gap-3 items-center warm-shadow border-l-4 border-l-[#5ba878] border-y border-r border-[#f5ece7]">
            <div className="w-12 h-12 rounded-xl bg-[#eff7f2] flex items-center justify-center flex-shrink-0 text-[#5ba878]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-[#3d312b] mb-1 truncate">Vacuum living room</h5>
              <div className="flex gap-2 items-center">
                <span className="text-xs font-bold text-[#5ba878] bg-[#e6f4ea] px-2 py-0.5 rounded-md">Upcoming</span>
              </div>
            </div>
            <button className="h-10 px-4 bg-[#f8f5f2] hover:bg-[#e07a5f] text-[#3d312b] hover:text-white rounded-xl font-bold text-sm transition-colors border border-[#e8dfda] hover:border-[#e07a5f] flex-shrink-0 flex items-center gap-1.5 opacity-50 cursor-not-allowed">
              <CheckCircle2 className="w-4 h-4" />
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Nav - With Filled Active Pill */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 px-6">
        <div className="bg-white p-2 rounded-full flex items-center justify-between w-full max-w-[342px] warm-nav-shadow border border-[#f5ece7]">
          <button className="flex items-center gap-2 bg-[#fdf2ee] text-[#c05c3e] px-5 py-2.5 rounded-full transition-colors font-bold">
            <Home className="w-5 h-5" strokeWidth={2.5} />
            <span className="text-sm">Home</span>
          </button>
          <button className="flex flex-col items-center justify-center w-[60px] h-[44px] text-[#b5a59c] hover:text-[#8a7a73] transition-colors rounded-full hover:bg-[#fbf6f2]">
            <ShoppingBag className="w-6 h-6" strokeWidth={2} />
          </button>
          <button className="flex flex-col items-center justify-center w-[60px] h-[44px] text-[#b5a59c] hover:text-[#8a7a73] transition-colors rounded-full hover:bg-[#fbf6f2] relative">
            <div className="absolute top-1.5 right-3 w-2.5 h-2.5 bg-[#e07a5f] rounded-full border-2 border-white" />
            <MessageCircle className="w-6 h-6" strokeWidth={2} />
          </button>
          <button className="flex flex-col items-center justify-center w-[60px] h-[44px] text-[#b5a59c] hover:text-[#8a7a73] transition-colors rounded-full hover:bg-[#fbf6f2]">
            <Settings className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
