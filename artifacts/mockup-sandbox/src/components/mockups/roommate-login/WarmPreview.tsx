import React from 'react';
import { Home, Trash2, CheckCircle2, Circle, Clock, MessageSquare, Settings, CheckSquare, ShoppingCart } from 'lucide-react';

export function WarmPreview() {
  return (
    <div className="relative w-[390px] h-[844px] bg-[#fdfbf7] overflow-hidden rounded-[40px] border-[8px] border-black shadow-2xl font-['DM_Sans',sans-serif]">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}} />
      
      {/* Background Dashboard Layer */}
      <div className="absolute inset-0 bg-[#fdfbf7] flex flex-col pt-12 pb-24 px-6 z-0" style={{ filter: 'blur(8px)' }}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#3d312b]">The Treehouse</h1>
            <p className="text-sm font-medium text-[#e07a5f]">3 roommates</p>
          </div>
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#f4a261] border-2 border-[#fdfbf7] flex items-center justify-center text-xs text-white font-bold">A</div>
            <div className="w-8 h-8 rounded-full bg-[#2a9d8f] border-2 border-[#fdfbf7] flex items-center justify-center text-xs text-white font-bold">J</div>
            <div className="w-8 h-8 rounded-full bg-[#e76f51] border-2 border-[#fdfbf7] flex items-center justify-center text-xs text-white font-bold">M</div>
          </div>
        </div>

        <h2 className="text-lg font-bold text-[#3d312b] mb-4">Your Tasks</h2>
        
        <div className="space-y-4">
          {/* Overdue Task */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-100 flex items-start gap-4">
            <div className="mt-1"><Circle className="w-6 h-6 text-red-300" /></div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#3d312b]">Take out recycling</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">Overdue</span>
              </div>
            </div>
          </div>

          {/* Today Task */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100 flex items-start gap-4">
            <div className="mt-1"><Circle className="w-6 h-6 text-amber-300" /></div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#3d312b]">Clean kitchen counters</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">Today</span>
              </div>
            </div>
          </div>

          {/* Upcoming Task */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#fdfbf7] flex items-start gap-4">
            <div className="mt-1"><Circle className="w-6 h-6 text-emerald-300" /></div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#3d312b]">Vacuum living room</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Tomorrow</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav Background */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-white/80 border-t border-black/5 flex justify-around items-center px-6 pb-4 pt-2 z-0" style={{ filter: 'blur(8px)' }}>
        <div className="flex flex-col items-center gap-1 text-[#e07a5f]">
          <Home className="w-6 h-6" />
        </div>
        <div className="flex flex-col items-center gap-1 text-black/30">
          <CheckSquare className="w-6 h-6" />
        </div>
        <div className="flex flex-col items-center gap-1 text-black/30">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <div className="flex flex-col items-center gap-1 text-black/30">
          <Settings className="w-6 h-6" />
        </div>
      </div>

      {/* Dim Overlay */}
      <div className="absolute inset-0 bg-[#3d312b]/40 z-10"></div>

      {/* Foreground Login Card */}
      <div className="absolute inset-0 flex items-center justify-center px-6 z-20">
        <div className="w-full bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-[0_16px_40px_-12px_rgba(61,49,43,0.3)] border border-white/50 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#e07a5f] rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <Home className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-[#3d312b] tracking-tight mb-2">Roommate</h1>
          <p className="text-sm text-[#3d312b]/70 font-medium mb-8">Harmonious living, simplified.</p>

          <button className="w-full h-12 bg-white text-[#3d312b] font-semibold rounded-xl flex items-center justify-center gap-3 border border-black/10 shadow-sm hover:bg-gray-50 transition-colors active:scale-[0.98]">
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.549L20.0303 3.125C17.9503 1.19 15.2353 0 12.0003 0C7.31028 0 3.25528 2.69 1.25028 6.609L5.32028 9.769C6.27528 6.87 9.06528 4.75 12.0003 4.75Z" fill="#EA4335"/>
              <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L20.18 21.28C22.57 19.08 23.49 15.96 23.49 12.275Z" fill="#4285F4"/>
              <path d="M5.26498 14.294C5.02498 13.564 4.88498 12.794 4.88498 12.004C4.88498 11.214 5.01998 10.444 5.25998 9.714L1.17998 6.534C0.429983 8.044 0 9.964 0 12.004C0 14.044 0.434983 15.964 1.17998 17.474L5.26498 14.294Z" fill="#FBBC05"/>
              <path d="M12.0004 24.001C15.2404 24.001 17.9654 22.936 19.9454 21.096L15.8654 17.916C14.7954 18.636 13.4854 19.051 12.0004 19.051C9.03039 19.051 6.22039 16.896 5.25039 13.971L1.17039 17.151C3.17539 21.121 7.28039 24.001 12.0004 24.001Z" fill="#34A853"/>
            </svg>
            Continue with Google
          </button>
          
          <div className="mt-6 text-xs font-medium text-[#3d312b]/60">
            You're one step away from your home
          </div>
        </div>
      </div>
    </div>
  );
}
