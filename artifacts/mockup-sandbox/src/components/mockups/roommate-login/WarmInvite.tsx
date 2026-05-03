import React, { useState } from 'react';
import { Home, ChevronDown, Repeat, ShoppingCart, RefreshCw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function WarmInvite() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex justify-center bg-neutral-100 min-h-screen p-4 font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .font-dm-sans { font-family: 'DM Sans', sans-serif; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        @keyframes expandDown {
          from { opacity: 0; max-height: 0; transform: translateY(-10px); }
          to { opacity: 1; max-height: 200px; transform: translateY(0); }
        }
        .animate-expand {
          animation: expandDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          overflow: hidden;
        }
      `}} />

      {/* Mobile Device Mockup Container */}
      <div 
        className="relative w-[390px] h-[844px] overflow-hidden shadow-2xl rounded-[40px] flex flex-col font-dm-sans"
        style={{ 
          backgroundColor: '#fdfbf7',
          color: '#3d312b'
        }}
      >
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8 z-10 relative">
          
          {/* Identity */}
          <div className="flex flex-col items-center text-center space-y-6 mb-16 w-full animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div 
              className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: '#e07a5f' }}
            >
              <Home className="w-12 h-12 text-white" strokeWidth={2} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-[42px] leading-tight font-bold tracking-tight text-[#3d312b]">
                Roommate
              </h1>
              <p className="text-[#3d312b]/60 text-lg font-medium">
                Peaceful co-living, simplified.
              </p>
            </div>
          </div>

          {/* Action */}
          <div className="w-full space-y-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Button 
              className="w-full h-14 rounded-2xl text-lg font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 border-0"
              style={{ 
                backgroundColor: '#3d312b', 
                color: '#fdfbf7' 
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            {/* Subtle "What is this?" Section */}
            <div className="flex flex-col items-center w-full">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 text-sm font-medium text-[#3d312b]/50 hover:text-[#3d312b]/80 transition-colors py-2 px-3 rounded-full"
              >
                <Info className="w-4 h-4" />
                <span>What is this?</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="mt-4 w-full flex flex-wrap justify-center gap-2 animate-expand">
                  <div className="flex items-center gap-1.5 bg-[#3d312b]/5 px-3 py-1.5 rounded-full border border-[#3d312b]/10">
                    <Repeat className="w-3.5 h-3.5 text-[#e07a5f]" />
                    <span className="text-xs font-medium text-[#3d312b]/80">Fair task rotation</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#3d312b]/5 px-3 py-1.5 rounded-full border border-[#3d312b]/10">
                    <ShoppingCart className="w-3.5 h-3.5 text-[#e07a5f]" />
                    <span className="text-xs font-medium text-[#3d312b]/80">Shared groceries</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#3d312b]/5 px-3 py-1.5 rounded-full border border-[#3d312b]/10">
                    <RefreshCw className="w-3.5 h-3.5 text-[#e07a5f]" />
                    <span className="text-xs font-medium text-[#3d312b]/80">Real-time sync</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pb-8 pt-4 w-full flex justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-xs font-medium text-[#3d312b]/40 tracking-wide uppercase">
            Made for roommates
          </p>
        </div>
        
      </div>
    </div>
  );
}
