import React, { useState } from 'react';
import { sounds } from '../../lib/sound';
import { Lightbulb } from 'lucide-react';

export interface FillInTheBlankProps {
  prompt: string;
  sentence: string;
  value: string;
  onChange: (val: string) => void;
  hint?: string;
  isChecked?: boolean;
  isCorrect?: boolean;
  correctAnswer?: string;
}

export const FillInTheBlank: React.FC<FillInTheBlankProps> = ({
  prompt,
  sentence,
  value,
  onChange,
  hint,
  isChecked = false,
  isCorrect,
  correctAnswer,
}) => {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="w-full space-y-4">
      {/* Exercise Prompt */}
      <div className="p-4 bg-white rounded-3xl border border-[#E4EEE9] shadow-xs">
        <span className="text-[11px] font-bold text-[#1F9A8A] block mb-1">
          تکمیل جای خالی • Fill in the Blank
        </span>
        <h2 className="text-base font-black text-[#1D2B33] leading-relaxed">
          {prompt}
        </h2>
      </div>

      {/* Target Sentence Box */}
      <div className="p-5 bg-white rounded-3xl border border-[#E4EEE9] shadow-xs text-center">
        <p className="font-en text-base font-bold text-[#1D2B33] dir-ltr leading-loose">
          {sentence.split('___').map((part, index, arr) => (
            <React.Fragment key={index}>
              <span>{part}</span>
              {index < arr.length - 1 && (
                <span className="inline-block mx-1.5 px-3 py-0.5 border-b-2 border-[#1F9A8A] font-en font-black text-[#12746B] min-w-[70px] bg-[#EAF7F3] rounded-md">
                  {value.trim() ? value : '...'}
                </span>
              )}
            </React.Fragment>
          ))}
        </p>
      </div>

      {/* Typing Input Box */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            disabled={isChecked}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="پاسخ خود را به انگلیسی تایپ کنید..."
            dir="ltr"
            className={`w-full min-h-[56px] px-4 rounded-2xl border font-en font-bold text-base transition-all outline-none text-left ${
              isChecked
                ? isCorrect
                  ? 'bg-[#E8F8F0] border-2 border-[#2F8856] text-[#12746B]'
                  : 'bg-[#FDF2F2] border-2 border-[#E5584F] text-[#BA3F37]'
                : 'bg-white border-[#E4EEE9] text-[#1D2B33] focus:border-[#1F9A8A] focus:ring-2 focus:ring-[#1F9A8A]/20'
            }`}
          />
        </div>

        {/* Optional Hint Toggle */}
        {hint && (
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setShowHint(!showHint);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F9A8A] hover:underline"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{showHint ? 'پنهان کردن راهنما' : 'راهنمایی'}</span>
            </button>
            {showHint && (
              <span className="text-xs text-[#6B7C85] font-medium bg-[#F6FAF8] px-2.5 py-1 rounded-xl border border-[#E4EEE9]">
                {hint}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
