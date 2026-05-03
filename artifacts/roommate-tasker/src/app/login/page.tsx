import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { Home, RotateCw, ShoppingCart, RefreshCcw, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
    const { user, loading, signInWithGoogle } = useAuth();
    const [, navigate] = useLocation();

    useEffect(() => {
        if (!loading && user) navigate('/');
    }, [user, loading]);

    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: '#fdfbf7', fontFamily: "'DM Sans', sans-serif" }}
            >
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-[#e07a5f] rounded-3xl flex items-center justify-center shadow-lg animate-pulse">
                        <Home className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                    <p className="text-[#8a7a73] font-medium">Loading…</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative w-full min-h-screen overflow-x-hidden"
            style={{ backgroundColor: '#fdfbf7', color: '#4a3f39', fontFamily: "'DM Sans', sans-serif" }}
        >
            <style dangerouslySetInnerHTML={{ __html: `
                .warm-shadow {
                    box-shadow: 0 12px 35px -5px rgba(138,122,115,0.12), 0 6px 15px -4px rgba(138,122,115,0.08);
                }
                .warm-nav-shadow {
                    box-shadow: 0 -8px 30px rgba(138,122,115,0.08);
                }
            ` }} />

            {/* ── Login section ── */}
            <div className="flex flex-col min-h-screen px-6 py-12 relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-[-10%] right-[-20%] w-[300px] h-[300px] bg-[#f2e7de] rounded-full blur-3xl opacity-60 pointer-events-none" />
                <div className="absolute bottom-[10%] left-[-20%] w-[250px] h-[250px] bg-[#f5e3d7] rounded-full blur-3xl opacity-60 pointer-events-none" />

                <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-sm mx-auto mt-10">
                    {/* App icon */}
                    <div
                        className="w-20 h-20 bg-[#e07a5f] rounded-3xl flex items-center justify-center mb-8 shadow-lg"
                        style={{ transform: 'rotate(3deg)' }}
                    >
                        <Home className="w-10 h-10 text-white" strokeWidth={2.5} style={{ transform: 'rotate(-3deg)' }} />
                    </div>

                    <h1 className="text-4xl font-bold tracking-tight mb-3 text-[#3d312b]">Roommate</h1>
                    <p className="text-[#8a7a73] text-lg mb-12 text-center max-w-[260px]">
                        Your shared home, perfectly in sync.
                    </p>

                    {/* Card */}
                    <div className="w-full bg-white rounded-[32px] p-8 warm-shadow mb-12 border border-[#f5ece7]">
                        <ul className="space-y-5 mb-8">
                            <li className="flex items-center gap-4 text-[#5c4f48]">
                                <div className="w-10 h-10 rounded-full bg-[#fdf2ee] flex items-center justify-center flex-shrink-0">
                                    <RotateCw className="w-5 h-5 text-[#e07a5f]" />
                                </div>
                                <span className="font-medium text-[15px]">Fair task rotation</span>
                            </li>
                            <li className="flex items-center gap-4 text-[#5c4f48]">
                                <div className="w-10 h-10 rounded-full bg-[#fdf2ee] flex items-center justify-center flex-shrink-0">
                                    <ShoppingCart className="w-5 h-5 text-[#e07a5f]" />
                                </div>
                                <span className="font-medium text-[15px]">Shared shopping list</span>
                            </li>
                            <li className="flex items-center gap-4 text-[#5c4f48]">
                                <div className="w-10 h-10 rounded-full bg-[#fdf2ee] flex items-center justify-center flex-shrink-0">
                                    <RefreshCcw className="w-5 h-5 text-[#e07a5f]" />
                                </div>
                                <span className="font-medium text-[15px]">Real-time sync</span>
                            </li>
                        </ul>

                        <button
                            onClick={signInWithGoogle}
                            className="w-full h-14 rounded-2xl bg-white border-2 border-[#e8dfda] text-[#4a3f39] hover:bg-[#faf7f5] hover:border-[#dfd5ce] flex items-center justify-center gap-3 font-semibold text-base shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>
                    </div>
                </div>

                {/* "Peek inside" scroll nudge */}
                <div className="flex justify-center pb-4 opacity-60">
                    <div className="flex flex-col items-center gap-2 animate-bounce">
                        <span className="text-xs font-medium text-[#8a7a73] tracking-widest uppercase">Peek inside</span>
                        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-[#e07a5f] to-transparent" />
                    </div>
                </div>
            </div>

            {/* ── Dashboard preview (decorative marketing section) ── */}
            <div className="px-5 pb-24 pt-8 bg-[#fbf6f2] rounded-t-[40px] warm-nav-shadow relative z-20">
                <div className="max-w-sm mx-auto">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-[#8a7a73] font-medium mb-1">Welcome to</h2>
                            <h3 className="text-3xl font-bold text-[#3d312b]">The Treehouse</h3>
                        </div>
                        <div className="flex -space-x-2">
                            <img src="https://i.pravatar.cc/150?u=1" className="w-10 h-10 rounded-full border-2 border-[#fbf6f2]" alt="Roommate" />
                            <img src="https://i.pravatar.cc/150?u=2" className="w-10 h-10 rounded-full border-2 border-[#fbf6f2]" alt="Roommate" />
                            <div className="w-10 h-10 rounded-full border-2 border-[#fbf6f2] bg-[#f0e6e0] flex items-center justify-center text-[#8a7a73] text-sm font-bold">+1</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-[#5c4f48] text-lg mb-2">Today's Tasks</h4>

                        {/* Overdue */}
                        <div className="bg-white rounded-2xl p-4 flex gap-4 items-center warm-shadow border-l-4 border-l-[#d35a50] border-y border-r border-[#f5ece7]">
                            <div className="w-12 h-12 rounded-xl bg-[#fdf2ee] flex items-center justify-center flex-shrink-0 text-[#d35a50]">
                                <RotateCw className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h5 className="font-bold text-[#3d312b] mb-1">Take out recycling</h5>
                                <div className="flex gap-2 items-center">
                                    <span className="text-xs font-bold text-[#d35a50] bg-[#fae8e5] px-2 py-0.5 rounded-md">Overdue</span>
                                    <span className="text-xs text-[#8a7a73]">Since yesterday</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <img src="https://i.pravatar.cc/150?u=1" className="w-8 h-8 rounded-full mb-1" alt="Alex" />
                                <span className="text-[10px] font-bold text-[#8a7a73]">Alex</span>
                            </div>
                        </div>

                        {/* Today */}
                        <div className="bg-white rounded-2xl p-4 flex gap-4 items-center warm-shadow border-l-4 border-l-[#eab308] border-y border-r border-[#f5ece7]">
                            <div className="w-12 h-12 rounded-xl bg-[#fffbf0] flex items-center justify-center flex-shrink-0 text-[#eab308]">
                                <RefreshCcw className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h5 className="font-bold text-[#3d312b] mb-1">Clean kitchen counters</h5>
                                <div className="flex gap-2 items-center">
                                    <span className="text-xs font-bold text-[#eab308] bg-[#fff8db] px-2 py-0.5 rounded-md">Today</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <img src="https://i.pravatar.cc/150?u=2" className="w-8 h-8 rounded-full mb-1" alt="Jordan" />
                                <span className="text-[10px] font-bold text-[#8a7a73]">Jordan</span>
                            </div>
                        </div>

                        {/* Upcoming */}
                        <div className="bg-white rounded-2xl p-4 flex gap-4 items-center warm-shadow border-l-4 border-l-[#5ba878] border-y border-r border-[#f5ece7] opacity-80">
                            <div className="w-12 h-12 rounded-xl bg-[#eff7f2] flex items-center justify-center flex-shrink-0 text-[#5ba878]">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h5 className="font-bold text-[#3d312b] mb-1">Vacuum living room</h5>
                                <div className="flex gap-2 items-center">
                                    <span className="text-xs font-bold text-[#5ba878] bg-[#e6f4ea] px-2 py-0.5 rounded-md">Upcoming</span>
                                    <span className="text-xs text-[#8a7a73]">Tomorrow</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-[#f0e6e0] flex items-center justify-center text-[#8a7a73] font-bold text-xs mb-1">Me</div>
                                <span className="text-[10px] font-bold text-[#8a7a73]">You</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
