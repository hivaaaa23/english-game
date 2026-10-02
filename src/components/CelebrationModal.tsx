import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { GameButton } from './GameButton';
import { sounds } from '../lib/sound';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  xpEarned?: number;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  title = 'آفرین! مرحله رو فتح کردی!',
  subtitle = 'یک گام بزرگ به سمت تسلط بر زبان انگلیسی برداشتی',
  xpEarned = 25,
}) => {
  useEffect(() => {
    if (isOpen) {
      sounds.playWin();

      // Confetti using calm, fresh palette: teal, green, gold, mint, purple
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1F9A8A', '#3DAA6D', '#F2C14E', '#DDF3EC', '#7B63D9'],
      });

      const timeout = setTimeout(() => {
        confetti({
          particleCount: 45,
          angle: 60,
          spread: 50,
          origin: { x: 0 },
          colors: ['#1F9A8A', '#3DAA6D', '#F2C14E'],
        });
        confetti({
          particleCount: 45,
          angle: 120,
          spread: 50,
          origin: { x: 1 },
          colors: ['#1F9A8A', '#3DAA6D', '#F2C14E'],
        });
      }, 250);

      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2B33]/50 backdrop-blur-xs animate-pop-in">
      <div className="w-full max-w-sm bg-white border border-[#E4EEE9] rounded-3xl p-6 shadow-2xl text-center relative overflow-hidden">
        
        {/* Soft mint ambient glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#DDF3EC] rounded-full blur-2xl pointer-events-none" />

        {/* Clean Teal Leaf Badge */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-[#DDF3EC] border border-[#BEE3D7] flex items-center justify-center mb-3 shadow-sm animate-bounce-slight">
          <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
            <path d="M34 14C22 14 14 22 14 34C26 34 34 26 34 14Z" fill="#1F9A8A" />
            <path d="M14 34C22 26 26 22 34 14" stroke="#DDF3EC" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Content */}
        <h2 className="text-lg font-black text-[#1D2B33] mb-1">
          {title}
        </h2>
        <p className="text-xs font-medium text-[#6B7C85] leading-relaxed px-2 mb-4">
          {subtitle}
        </p>

        {/* XP Reward Card (Mint with Gold star) */}
        <div className="bg-[#DDF3EC] border border-[#BEE3D7] rounded-2xl p-3 flex items-center justify-around mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#BEE3D7] flex items-center justify-center shadow-xs">
              <Star className="w-5 h-5 fill-[#F2C14E] text-[#F2C14E]" />
            </div>
            <div className="text-right">
              <div className="text-[11px] font-bold text-[#6B7C85]">پاداش این درس</div>
              <div className="font-en text-lg font-black text-[#12746B] leading-none mt-0.5">
                +{xpEarned} XP
              </div>
            </div>
          </div>

          <div className="w-[1.5px] h-8 bg-[#1F9A8A]/20" />

          <div className="flex items-center gap-1.5 text-[#3DAA6D]">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            <span className="text-xs font-black text-[#1D2B33]">ثبت شد!</span>
          </div>
        </div>

        {/* Continue Button */}
        <GameButton
          variant="teal"
          size="lg"
          fullWidth
          soundType="tap"
          onClick={onClose}
          className="flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>ادامه ماجراجویی</span>
        </GameButton>

      </div>
    </div>
  );
};
