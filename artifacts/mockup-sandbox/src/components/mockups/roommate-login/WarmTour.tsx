import React, { useState } from 'react';
import { RotateCw, ShoppingCart, RefreshCw, Home, ChevronLeft, ChevronRight } from 'lucide-react';

export function WarmTour() {
  const [activeScreen, setActiveScreen] = useState(0);

  const screens = [
    {
      id: 'rotation',
      icon: <RotateCw size={48} className="text-[#e07a5f]" />,
      blobColor: 'bg-rose-100/50',
      title: 'Your turns, always fair',
      description: 'No more arguing over whose turn it is. We track the chores, you enjoy the home.',
    },
    {
      id: 'shopping',
      icon: <ShoppingCart size={48} className="text-[#e07a5f]" />,
      blobColor: 'bg-amber-100/50',
      title: 'One list, everyone adds',
      description: 'Shared groceries and supplies. Everyone sees what is needed in real-time.',
    },
    {
      id: 'sync',
      icon: <RefreshCw size={48} className="text-[#e07a5f]" />,
      blobColor: 'bg-emerald-100/50',
      title: 'Always in sync',
      description: 'Instant updates across all devices. Never double-buy supplies again.',
    },
    {
      id: 'signin',
      icon: <Home size={32} className="text-white" />,
      blobColor: 'bg-orange-100/50',
      title: 'Ready to move in?',
      description: 'Join your housemates and start managing your shared home together.',
    },
  ];

  const nextScreen = () => setActiveScreen((p) => Math.min(screens.length - 1, p + 1));
  const prevScreen = () => setActiveScreen((p) => Math.max(0, p - 1));

  return (
    <div 
      className="relative overflow-hidden shadow-2xl rounded-[40px] border-[8px] border-white/50"
      style={{
        width: '390px',
        height: '844px',
        backgroundColor: '#fdfbf7',
        fontFamily: "'DM Sans', sans-serif",
        color: '#3d312b'
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        
        .tour-slide {
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease-out;
        }
      `}} />

      {/* Decorative background blob */}
      <div 
        className={`absolute top-0 left-0 w-full h-[60%] blur-[80px] rounded-full transition-colors duration-700 ${screens[activeScreen].blobColor}`}
        style={{ transform: 'translateY(-20%) scale(1.2)' }}
      />

      {/* Screens Container */}
      <div className="relative w-full h-full flex">
        {screens.map((screen, index) => {
          const isActive = index === activeScreen;
          const isPast = index < activeScreen;
          
          return (
            <div 
              key={screen.id}
              className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center px-8 tour-slide"
              style={{
                transform: `translateX(${(index - activeScreen) * 100}%)`,
                opacity: Math.abs(index - activeScreen) > 0 ? 0 : 1,
                pointerEvents: isActive ? 'auto' : 'none'
              }}
            >
              {index < 3 ? (
                <>
                  <div className="w-[120px] h-[120px] rounded-full bg-white shadow-xl shadow-[#e07a5f]/10 flex items-center justify-center mb-10 transform transition-transform duration-500 hover:scale-105">
                    {screen.icon}
                  </div>
                  <h2 className="text-[32px] font-bold text-center leading-tight mb-4 tracking-tight">
                    {screen.title}
                  </h2>
                  <p className="text-[17px] text-[#3d312b]/70 text-center leading-relaxed max-w-[280px]">
                    {screen.description}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-[80px] h-[80px] rounded-[24px] bg-[#e07a5f] shadow-xl shadow-[#e07a5f]/20 flex items-center justify-center mb-6">
                    {screen.icon}
                  </div>
                  <h1 className="text-xl font-bold tracking-tight mb-10 text-[#e07a5f]">Roommate</h1>
                  
                  <h2 className="text-[32px] font-bold text-center leading-tight mb-4 tracking-tight">
                    {screen.title}
                  </h2>
                  <p className="text-[17px] text-[#3d312b]/70 text-center leading-relaxed max-w-[280px] mb-12">
                    {screen.description}
                  </p>

                  <button className="w-full h-14 bg-white rounded-2xl flex items-center justify-center gap-3 font-semibold text-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100 active:scale-[0.98] transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                  
                  <p className="mt-6 text-sm text-[#3d312b]/50 text-center">
                    By continuing, you agree to our Terms & Privacy Policy
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Layer */}
      <div className="absolute inset-x-0 bottom-12 flex flex-col items-center gap-8 z-10">
        
        {/* Next/Start Button */}
        {activeScreen < 3 && (
          <button 
            onClick={nextScreen}
            className="w-[280px] h-14 bg-[#e07a5f] text-white rounded-2xl font-bold text-[17px] shadow-lg shadow-[#e07a5f]/30 active:scale-[0.98] transition-all hover:bg-[#d46d52]"
          >
            {activeScreen === 2 ? 'Get Started' : 'Continue'}
          </button>
        )}

        {/* Dots */}
        <div className="flex gap-2.5 items-center">
          {screens.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveScreen(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === activeScreen 
                  ? 'w-6 h-2 bg-[#e07a5f]' 
                  : 'w-2 h-2 bg-[#e07a5f]/20 hover:bg-[#e07a5f]/40'
              }`}
              aria-label={`Go to screen ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Side Arrows for larger screens / desktop testing */}
      <button 
        onClick={prevScreen}
        disabled={activeScreen === 0}
        className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/50 backdrop-blur flex items-center justify-center text-[#3d312b] transition-all ${activeScreen === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:bg-white'}`}
      >
        <ChevronLeft size={24} />
      </button>

      <button 
        onClick={nextScreen}
        disabled={activeScreen === 3}
        className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/50 backdrop-blur flex items-center justify-center text-[#3d312b] transition-all ${activeScreen === 3 ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:bg-white'}`}
      >
        <ChevronRight size={24} />
      </button>

    </div>
  );
}
