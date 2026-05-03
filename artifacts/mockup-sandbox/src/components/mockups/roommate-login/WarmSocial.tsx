import React from "react";
import { ArrowRight, Home, CheckCircle2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WarmSocial() {
  return (
    <div
      className="relative flex flex-col justify-between overflow-hidden shadow-2xl mx-auto"
      style={{
        width: "390px",
        height: "844px",
        backgroundColor: "#fdfbf7",
        fontFamily: "'DM Sans', sans-serif",
        color: "#3d312b",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        
        .avatar-overlap {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }
        
        .avatar-overlap img {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 3px solid #fdfbf7;
          object-fit: cover;
          margin-left: -12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        
        .avatar-overlap img:first-child {
          margin-left: 0;
        }

        .fade-up {
          animation: fadeUp 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(10px);
        }

        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }

        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}} />

      {/* Top Section - Social Proof */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8 text-center">
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 shadow-sm border border-[#e07a5f]/20 mb-8 fade-up">
          <Home size={16} color="#e07a5f" />
          <span className="text-sm font-semibold tracking-tight">The Treehouse</span>
        </div>

        <div className="avatar-overlap fade-up delay-1">
          <img src="https://i.pravatar.cc/150?u=1" alt="Alex" />
          <img src="https://i.pravatar.cc/150?u=2" alt="Jordan" />
          <img src="https://i.pravatar.cc/150?u=3" alt="Sam" />
          <div className="w-[56px] h-[56px] rounded-full border-3 border-[#fdfbf7] bg-[#e07a5f]/10 text-[#e07a5f] font-bold flex items-center justify-center text-sm -ml-[12px] z-10 shadow-sm">
            +1
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-2 fade-up delay-1 leading-tight">
          Alex, Jordan, Sam and 1 more<br />are already here.
        </h1>
        
        <p className="text-[#3d312b]/70 font-medium mb-12 fade-up delay-2 text-base">
          They're waiting for you to join.
        </p>

        {/* Activity Feed */}
        <div className="w-full text-left space-y-4 fade-up delay-3">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/40 border border-[#3d312b]/5">
            <div className="relative">
              <img src="https://i.pravatar.cc/150?u=1" alt="Alex" className="w-8 h-8 rounded-full" />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                <CheckCircle2 size={12} color="#10b981" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">
                <span className="font-bold">Alex</span> completed <span className="text-[#e07a5f]">'Take out recycling'</span>
              </p>
              <p className="text-xs text-[#3d312b]/50 mt-0.5">2h ago</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/40 border border-[#3d312b]/5">
            <div className="relative">
              <img src="https://i.pravatar.cc/150?u=2" alt="Jordan" className="w-8 h-8 rounded-full" />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                <ShoppingCart size={12} color="#3b82f6" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">
                <span className="font-bold">Jordan</span> added <span className="font-semibold">milk</span> to the list
              </p>
              <p className="text-xs text-[#3d312b]/50 mt-0.5">4h ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Auth */}
      <div className="bg-white px-6 py-8 rounded-t-[2.5rem] shadow-[0_-8px_30px_rgba(0,0,0,0.04)] relative z-20">
        <div className="max-w-[300px] mx-auto text-center">
          <div className="inline-flex items-center justify-center gap-1.5 bg-[#e07a5f]/10 text-[#e07a5f] px-3 py-1 rounded-full text-xs font-bold mb-6">
            <span className="text-sm">🏠</span> 4 roommates active this week
          </div>

          <Button 
            className="w-full h-14 rounded-2xl text-[17px] font-bold bg-[#e07a5f] hover:bg-[#d0694e] text-white shadow-[0_8px_20px_rgba(224,122,95,0.25)] hover:shadow-[0_4px_10px_rgba(224,122,95,0.2)] transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2 bg-white rounded-full p-[2px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Join your home <ArrowRight size={20} className="ml-1 opacity-80" />
          </Button>

          <p className="mt-5 text-[13px] font-medium text-[#3d312b]/40">
            Free for all roommates forever.
          </p>
        </div>
      </div>
    </div>
  );
}
