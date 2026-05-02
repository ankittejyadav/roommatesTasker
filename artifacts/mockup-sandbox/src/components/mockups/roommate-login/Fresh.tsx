import React from "react";
import { CheckCircle2, Home, ShoppingBag, MessageSquare, Settings, Check } from "lucide-react";
import "./_group.css";

export function Fresh() {
  return (
    <div className="flex justify-center bg-gray-100 min-h-screen p-4">
      {/* Mobile Frame Constraint */}
      <div className="w-[390px] bg-white h-[844px] overflow-y-auto fresh-container fresh-scroll relative shadow-2xl rounded-[40px] border-[8px] border-gray-900 overflow-hidden flex flex-col">
        
        {/* Top Section: Login (Full Height) */}
        <div className="min-h-[828px] flex flex-col px-8 py-12 relative shrink-0">
          <div className="flex-1 flex flex-col justify-center">
            {/* Logo area */}
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-8 shadow-[0_8px_16px_rgba(79,70,229,0.2)]">
              <CheckCircle2 className="text-white w-7 h-7" strokeWidth={2.5} />
            </div>

            {/* Typography-driven header */}
            <h1 className="text-[40px] leading-[1.1] font-extrabold tracking-tight mb-4 text-slate-900">
              Chore<br />
              Management,<br />
              <span className="text-indigo-600">Perfected.</span>
            </h1>
            
            <p className="text-slate-500 text-lg mb-10 font-medium tracking-tight">
              The smartest way to run your shared home.
            </p>

            {/* Feature List */}
            <div className="space-y-5 mb-12">
              {[
                "Automated task rotation",
                "Shared shopping list",
                "Real-time household sync"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-indigo-600" strokeWidth={3} />
                  </div>
                  <span className="text-slate-700 font-semibold tracking-tight">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button className="w-full bg-white border border-slate-200 hover:bg-slate-50 transition-colors h-14 rounded-2xl flex items-center justify-center gap-3 font-semibold text-slate-900 text-[15px] shadow-sm mt-auto mb-12">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.86 16.79 15.69 17.57V20.34H19.26C21.35 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C14.97 23 17.46 22.02 19.26 20.34L15.69 17.57C14.71 18.23 13.46 18.63 12 18.63C9.17 18.63 6.78 16.72 5.91 14.15H2.22V17.01C4.02 20.59 7.71 23 12 23Z" fill="#34A853"/>
                <path d="M5.91 14.15C5.69 13.49 5.56 12.77 5.56 12C5.56 11.23 5.69 10.51 5.91 9.85V6.99H2.22C1.47 8.48 1.05 10.19 1.05 12C1.05 13.81 1.47 15.52 2.22 17.01L5.91 14.15Z" fill="#FBBC05"/>
                <path d="M12 5.38C13.62 5.38 15.07 5.93 16.22 7.02L19.34 3.9C17.45 2.14 14.97 1.05 12 1.05C7.71 1.05 4.02 3.41 2.22 6.99L5.91 9.85C6.78 7.28 9.17 5.38 12 5.38Z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <div className="flex flex-col items-center opacity-40 animate-bounce">
              <span className="text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-500">Scroll to preview</span>
              <div className="w-4 h-4 border-b-2 border-r-2 border-slate-500 transform rotate-45 translate-y-[-2px]"></div>
            </div>
          </div>
        </div>

        {/* Dashboard Preview Section (Scrolls up) */}
        <div className="min-h-[828px] bg-white pt-16 pb-24 px-6 relative shrink-0">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Your Home</p>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">The Greenhouse</h2>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm overflow-hidden">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=f1f5f9" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 tracking-tight flex items-center gap-2">
              Your Tasks <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] ml-1">2</span>
            </h3>
            
            <div className="space-y-3">
              {/* Overdue Task */}
              <div className="relative group bg-slate-50 rounded-2xl p-5 flex items-start gap-4 transition-all">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-red-500 rounded-r-full"></div>
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 mt-0.5 shrink-0"></div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-[15px] mb-1 leading-tight">Take out recycling</h4>
                  <p className="text-red-500 text-xs font-semibold mb-3">Overdue by 1 day</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                      <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=e2e8f0" alt="Alex" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">Alex</span>
                  </div>
                </div>
              </div>

              {/* Today Task */}
              <div className="relative group bg-slate-50 rounded-2xl p-5 flex items-start gap-4 transition-all">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-amber-400 rounded-r-full"></div>
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 mt-0.5 shrink-0"></div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-[15px] mb-1 leading-tight">Wipe kitchen counters</h4>
                  <p className="text-slate-500 text-xs font-medium mb-3">Due today</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                      <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Sam&backgroundColor=e2e8f0" alt="Sam" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">Sam</span>
                  </div>
                </div>
              </div>
              
              {/* Upcoming Task */}
              <div className="relative group bg-slate-50 rounded-2xl p-5 flex items-start gap-4 transition-all opacity-60">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-emerald-500 rounded-r-full"></div>
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 mt-0.5 shrink-0"></div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-[15px] mb-1 leading-tight">Vacuum living room</h4>
                  <p className="text-slate-500 text-xs font-medium mb-3">Tomorrow</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                      <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Taylor&backgroundColor=e2e8f0" alt="Taylor" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">Taylor</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Nav Mockup */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-t border-slate-100 flex items-center justify-around px-2 pb-2">
            <button className="flex flex-col items-center gap-1 w-16 text-indigo-600">
              <Home size={22} strokeWidth={2.5} />
              <span className="text-[10px] font-bold">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1 w-16 text-slate-400 hover:text-slate-900 transition-colors">
              <ShoppingBag size={22} strokeWidth={2} />
              <span className="text-[10px] font-medium">Shop</span>
            </button>
            <button className="flex flex-col items-center gap-1 w-16 text-slate-400 hover:text-slate-900 transition-colors">
              <MessageSquare size={22} strokeWidth={2} />
              <span className="text-[10px] font-medium">Chat</span>
            </button>
            <button className="flex flex-col items-center gap-1 w-16 text-slate-400 hover:text-slate-900 transition-colors">
              <Settings size={22} strokeWidth={2} />
              <span className="text-[10px] font-medium">Settings</span>
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
