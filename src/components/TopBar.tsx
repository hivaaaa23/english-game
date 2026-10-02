import React, { useEffect, useState } from 'react';
import { Flame, Star, Heart, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../lib/sound';

interface TopBarProps {
  streak: number;
  xp: number;
  hearts: number;
  maxHearts: number;
  recentXpGained?: number | null;
  heartLostTrigger?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  streak,
  xp,
  hearts,
  recentXpGained,
  heartLostTrigger,
}) => {
  const [displayXp, setDisplayXp] = useState(xp);
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [showHeartShake, setShowHeartShake] = useState(false);
  const [floatingXp, setFloatingXp] = useState<number | null>(null);

  // Smooth XP count-up animation
  useEffect(() => {
    if (xp !== displayXp) {
      const step = xp > displayXp ? 1 : -1;
      const timer = setInterval(() => {
        setDisplayXp((prev) => {
          if (prev === xp) {
            clearInterval(timer);
            return prev;
          }
          return prev + step;
        });
      }, 30);
      return () => clearInterval(timer);
    }
  }, [xp, displayXp]);

  // Floating XP indicator
  useEffect(() => {
    if (recentXpGained) {
      setFloatingXp(recentXpGained);
      const timer = setTimeout(() => {
        setFloatingXp(null);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [recentXpGained]);

  // Heart shake animation
  useEffect(() => {
    if (heartLostTrigger) {
      setShowHeartShake(true);
      const timer = setTimeout(() => setShowHeartShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [heartLostTrigger]);

  const handleToggleMute = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      sounds.playTap();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full px-3 py-2.5 bg-white/95 backdrop-blur-md border-b border-[#E4EEE9] shadow-[0_2px_10px_rgba(29,43,51,0.04)]">
      <div className="max-w-md mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        
        {/* Streak HUD (Gold yellow flame) */}
        <div 
          className="hud-chip bg-white border border-[#E4EEE9] hover:bg-[#DDF3EC]/50 transition-colors shadow-xs"
          title="تعداد روزهای متوالی مطالعه"
        >
          <div className="w-5 h-5 flex items-center justify-center text-[#F2C14E] animate-flame">
            <Flame className="w-4 h-4 fill-[#F2C14E] stroke-[#12746B] stroke-[1.5]" />
          </div>
          <span className="font-en text-xs font-black text-[#1D2B33] tracking-tight">
            {streak}
          </span>
          <span className="text-[10px] font-bold text-[#6B7C85]">روز</span>
        </div>

        {/* XP HUD with floating indicator (Gold yellow star) */}
        <div className="relative">
          <div 
            className="hud-chip bg-white border border-[#E4EEE9] hover:bg-[#DDF3EC]/50 transition-colors shadow-xs"
            title="امتیاز تجربه (XP)"
          >
            <div className="w-5 h-5 flex items-center justify-center text-[#F2C14E] animate-bounce-slight">
              <Star className="w-4 h-4 fill-[#F2C14E] stroke-[#12746B] stroke-[1.5]" />
            </div>
            <span className="font-en text-xs font-black text-[#1D2B33] tracking-tight tabular-nums">
              {displayXp}
            </span>
            <span className="font-en text-[10px] font-black text-[#12746B] bg-[#DDF3EC] px-1.5 py-0.5 rounded-md">
              XP
            </span>
          </div>

          {/* Floating +XP badge */}
          {floatingXp !== null && (
            <div className="float-xp-indicator top-0 left-1/2 -translate-x-1/2 text-sm font-black text-[#F2C14E]">
              +{floatingXp} XP!
            </div>
          )}
        </div>

        {/* Hearts HUD (Coral red) */}
        <div 
          className={`hud-chip transition-all duration-200 border ${
            showHeartShake 
              ? 'animate-heart-shake bg-red-50 border-[#E5584F]' 
              : 'bg-white border-[#E4EEE9] hover:bg-[#DDF3EC]/50 shadow-xs'
          }`}
          title="تعداد جان‌ها"
        >
          <div className={`w-5 h-5 flex items-center justify-center ${showHeartShake ? 'animate-heart-crack' : ''}`}>
            <Heart className={`w-4 h-4 ${
              hearts > 0 
                ? 'fill-[#E5584F] stroke-[#E5584F]' 
                : 'fill-stone-300 stroke-stone-400'
            }`} />
          </div>
          <span className="font-en text-xs font-black text-[#1D2B33] tracking-tight">
            {hearts}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Sound toggle button */}
          <button
            onClick={handleToggleMute}
            aria-label={isMuted ? 'فعال‌سازی صدا' : 'قطع صدا'}
            className="min-w-[34px] min-h-[34px] w-8 h-8 rounded-xl border border-[#E4EEE9] bg-white hover:bg-[#DDF3EC]/40 active:translate-y-0.5 flex items-center justify-center transition-all shadow-xs"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-[#6B7C85]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#1F9A8A]" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
