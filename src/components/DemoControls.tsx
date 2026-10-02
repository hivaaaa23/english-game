import React, { useState } from 'react';
import { Sparkles, HeartCrack, Heart, X, Play, Image as ImageIcon } from 'lucide-react';
import { GameButton } from './GameButton';
import { sounds } from '../lib/sound';

interface DemoControlsProps {
  onAddXp: () => void;
  onLoseHeart: () => void;
  onRefillHearts: () => void;
  onTriggerWin: () => void;
  onOpenSplash: () => void;
}

export const DemoControls: React.FC<DemoControlsProps> = ({
  onAddXp,
  onLoseHeart,
  onRefillHearts,
  onTriggerWin,
  onOpenSplash,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 left-3 z-50">
      {!isOpen ? (
        <button
          onClick={() => {
            sounds.playTap();
            setIsOpen(true);
          }}
          className="btn-3d btn-mint py-2 px-3 text-xs flex items-center gap-1.5 shadow-[0_3px_0_#A8D9CA] border border-[#BEE3D7] animate-bounce-slight"
          title="جعبه‌ابزار تست انیمیشن‌ها و گیم‌پلی"
        >
          <Sparkles className="w-4 h-4 text-[#1F9A8A]" />
          <span className="font-black text-[#12746B]">تست بازی</span>
        </button>
      ) : (
        <div className="bg-white border border-[#E4EEE9] rounded-3xl p-4 shadow-xl w-64 animate-pop-in">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E4EEE9]">
            <span className="text-xs font-black text-[#1D2B33] flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-[#1F9A8A] fill-[#1F9A8A]" />
              جعبه‌ابزار تست بازی
            </span>
            <button
              onClick={() => {
                sounds.playTap();
                setIsOpen(false);
              }}
              className="w-6 h-6 rounded-lg bg-[#DDF3EC] border border-[#BEE3D7] flex items-center justify-center hover:bg-[#cbf0e4] transition-colors"
            >
              <X className="w-3.5 h-3.5 text-[#12746B]" />
            </button>
          </div>

          <div className="space-y-2">
            {/* Splash Screen Preview */}
            <GameButton
              variant="white"
              size="sm"
              fullWidth
              soundType="none"
              onClick={() => {
                setIsOpen(false);
                onOpenSplash();
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 text-xs text-[#1D2B33]"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#1F9A8A]" />
              <span>مشاهده صفحه خوش‌آمدگویی</span>
            </GameButton>

            <div className="h-[1px] bg-[#E4EEE9] my-1" />

            {/* +10 XP Button */}
            <GameButton
              variant="mint"
              size="sm"
              fullWidth
              soundType="none"
              onClick={onAddXp}
              className="flex items-center justify-center gap-1.5 py-2 text-[#12746B]"
            >
              <Sparkles className="w-4 h-4 text-[#F2C14E]" />
              <span>افزایش ۱۰ امتیاز (+10 XP)</span>
            </GameButton>

            {/* Lose Heart Button */}
            <GameButton
              variant="coral"
              size="sm"
              fullWidth
              soundType="none"
              onClick={onLoseHeart}
              className="flex items-center justify-center gap-1.5 py-2"
            >
              <HeartCrack className="w-4 h-4 text-white" />
              <span>کم کردن ۱ جان (-1 Heart)</span>
            </GameButton>

            {/* Refill Hearts & Trigger Celebration */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <GameButton
                variant="green"
                size="sm"
                soundType="none"
                onClick={onRefillHearts}
                className="py-1.5 px-2 text-[11px] flex items-center justify-center gap-1"
              >
                <Heart className="w-3.5 h-3.5 fill-white" />
                <span>پر کردن جان</span>
              </GameButton>

              <GameButton
                variant="mint"
                size="sm"
                soundType="none"
                onClick={onTriggerWin}
                className="py-1.5 px-2 text-[11px] flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#1F9A8A]" />
                <span>جشن پیروزی</span>
              </GameButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
