import React, { useState, useEffect } from 'react';
import { sounds } from '../../lib/sound';
import { playEnglishAudio } from '../../lib/progress';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

export interface ListeningExerciseProps {
  prompt: string;
  audioText: string;
  options: string[];
  selectedOption: number | null;
  onSelectOption: (index: number) => void;
  isChecked?: boolean;
  correctAnswerIndex?: number;
}

export const ListeningExercise: React.FC<ListeningExerciseProps> = ({
  prompt,
  audioText,
  options,
  selectedOption,
  onSelectOption,
  isChecked = false,
  correctAnswerIndex,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const letters = ['A', 'B', 'C', 'D'];

  const playSound = () => {
    sounds.playTap();
    setIsPlaying(true);
    playEnglishAudio(audioText);
    setTimeout(() => setIsPlaying(false), 1400);
  };

  // Play audio automatically once when question loads
  useEffect(() => {
    const timer = setTimeout(() => {
      playSound();
    }, 350);
    return () => clearTimeout(timer);
  }, [audioText]);

  const handleSelect = (idx: number) => {
    if (isChecked) return;
    sounds.playTap();
    onSelectOption(idx);
  };

  return (
    <div className="w-full space-y-4">
      {/* Exercise Prompt */}
      <div className="p-4 bg-white rounded-3xl border border-[#E4EEE9] shadow-xs">
        <span className="text-[11px] font-bold text-[#1F9A8A] block mb-1">
          تمرین شنیداری • Listening Exercise
        </span>
        <h2 className="text-base font-black text-[#1D2B33] leading-relaxed">
          {prompt}
        </h2>
      </div>

      {/* Big Audio Play Button Card */}
      <div className="p-6 bg-white rounded-3xl border border-[#E4EEE9] shadow-xs flex flex-col items-center justify-center gap-3">
        <button
          type="button"
          onClick={playSound}
          className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-200 select-none ${
            isPlaying
              ? 'bg-[#12746B] text-white shadow-[0_6px_0_#0D504A] scale-105 ring-4 ring-[#1F9A8A]/30'
              : 'bg-[#1F9A8A] text-white shadow-[0_6px_0_#12746B] hover:brightness-105 active:translate-y-1 active:shadow-[0_2px_0_#12746B]'
          }`}
        >
          <Volume2 className={`w-9 h-9 ${isPlaying ? 'animate-bounce-slight' : ''}`} />
        </button>

        <span className="text-xs font-bold text-[#6B7C85]">
          {isPlaying ? 'در حال پخش صوت...' : 'برای شنیدن مجدد ضربه بزنید'}
        </span>
      </div>

      {/* 4 Options */}
      <div className="space-y-2.5">
        {options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = isChecked && idx === correctAnswerIndex;
          const isWrongSelected = isChecked && isSelected && idx !== correctAnswerIndex;

          let cardStyle =
            'bg-white border-[#E4EEE9] text-[#1D2B33] shadow-xs hover:border-[#BEE3D7]';

          if (isCorrect) {
            cardStyle = 'bg-[#E8F8F0] border-2 border-[#2F8856] text-[#12746B] shadow-xs';
          } else if (isWrongSelected) {
            cardStyle = 'bg-[#FDF2F2] border-2 border-[#E5584F] text-[#BA3F37] shadow-xs';
          } else if (isSelected) {
            cardStyle = 'bg-[#EAF7F3] border-2 border-[#1F9A8A] text-[#12746B] shadow-sm';
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isChecked}
              onClick={() => handleSelect(idx)}
              className={`w-full min-h-[56px] p-3.5 rounded-2xl border flex items-center gap-3 transition-all duration-150 select-none text-right active:scale-[0.98] ${cardStyle}`}
            >
              <span
                className={`w-8 h-8 rounded-xl font-en font-black text-xs flex items-center justify-center shrink-0 transition-colors ${
                  isCorrect
                    ? 'bg-[#3DAA6D] text-white'
                    : isWrongSelected
                    ? 'bg-[#E5584F] text-white'
                    : isSelected
                    ? 'bg-[#1F9A8A] text-white'
                    : 'bg-[#F6FAF8] text-[#6B7C85] border border-[#E4EEE9]'
                }`}
              >
                {letters[idx]}
              </span>

              <span className="font-en text-sm font-bold flex-1 text-left dir-ltr">
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
