import React from 'react';
import { GameButton } from './GameButton';
import { Sparkles, Flame, Heart } from 'lucide-react';
import { sounds } from '../lib/sound';

interface SplashScreenProps {
  onStart: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  const handleStart = () => {
    sounds.playWin();
    onStart();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#FBF8EE] via-[#DDF3EC]/40 to-[#FBF8EE] flex flex-col items-center justify-between p-6 overflow-hidden select-none">
      {/* Background ambient decorative shapes */}
      <div className="absolute top-10 left-6 w-32 h-32 bg-[#DDF3EC] rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-20 right-6 w-40 h-40 bg-[#1F9A8A]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Badges */}
      <div className="relative z-10 w-full max-w-sm flex items-center justify-between pt-2">
        <div className="hud-chip bg-white border border-[#E4EEE9]">
          <Flame className="w-4 h-4 fill-[#F2C14E] text-[#F2C14E]" />
          <span className="text-xs font-black text-[#1D2B33]">ماجراجویی روزانه</span>
        </div>

        <div className="hud-chip bg-white border border-[#E4EEE9]">
          <Heart className="w-4 h-4 fill-[#E5584F] text-[#E5584F]" />
          <span className="text-xs font-black text-[#1D2B33]">۵ جان کامل</span>
        </div>
      </div>

      {/* Center Clean Teal Leaf Icon & Brand */}
      <div className="relative z-10 my-auto flex flex-col items-center text-center">
        <div className="relative w-32 h-32 flex items-center justify-center mb-3">
          <div className="w-24 h-24 rounded-3xl bg-[#DDF3EC] border border-[#BEE3D7] flex items-center justify-center shadow-md animate-bounce-slight">
            <svg viewBox="0 0 48 48" className="w-14 h-14" fill="none">
              <path d="M34 14C22 14 14 22 14 34C26 34 34 26 34 14Z" fill="#1F9A8A" />
              <path d="M14 34C22 26 26 22 34 14" stroke="#DDF3EC" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Game Title */}
        <div className="mt-1">
          <div className="inline-block bg-[#DDF3EC] text-[#12746B] border border-[#BEE3D7] px-3.5 py-1 rounded-xl text-xs font-black mb-2 shadow-xs">
            آموزش بازی‌محور انگلیسی
          </div>
          <h1 className="text-3xl font-black text-[#1D2B33] tracking-tight">
            زبان‌گیم • ZabanGame
          </h1>
          <p className="text-xs font-medium text-[#6B7C85] mt-1.5 max-w-xs mx-auto leading-relaxed">
            آموزش جذاب، آرامش‌بخش و تعاملی زبان انگلیسی ویژه فارسی‌زبانان
          </p>
        </div>
      </div>

      {/* Bottom Start Button & Details */}
      <div className="relative z-10 w-full max-w-sm pb-4 space-y-3">
        <GameButton
          variant="teal"
          size="lg"
          fullWidth
          soundType="none"
          onClick={handleStart}
          className="text-lg flex items-center justify-center gap-2"
        >
          <Sparkles className="w-6 h-6 stroke-[2.5]" />
          <span>بزن بریم بازی کنیم!</span>
        </GameButton>

        <p className="text-[11px] text-center text-[#6B7C85] font-medium">
          بدون نیاز به ثبت‌نام • ذخیره خودکار در مرورگر
        </p>
      </div>
    </div>
  );
};
