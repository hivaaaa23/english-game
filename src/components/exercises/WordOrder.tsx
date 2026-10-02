import React from 'react';
import { sounds } from '../../lib/sound';

export interface WordOrderProps {
  prompt: string;
  promptFa?: string;
  availableWords: string[];
  selectedWords: string[];
  onSelectWord: (word: string, indexInAvailable: number) => void;
  onRemoveWord: (indexInSelected: number) => void;
  isChecked?: boolean;
  isCorrect?: boolean;
}

export const WordOrder: React.FC<WordOrderProps> = ({
  prompt,
  promptFa,
  availableWords,
  selectedWords,
  onSelectWord,
  onRemoveWord,
  isChecked = false,
  isCorrect,
}) => {
  // Track which index from availableWords was used
  // To handle duplicate words accurately, we keep availableWords as list with used tracking
  return (
    <div className="w-full space-y-4">
      {/* Exercise Prompt */}
      <div className="p-4 bg-white rounded-3xl border border-[#E4EEE9] shadow-xs">
        <span className="text-[11px] font-bold text-[#1F9A8A] block mb-1">
          مرتب‌سازی کلمات • Word Order
        </span>
        <h2 className="text-base font-black text-[#1D2B33] leading-relaxed">
          {prompt}
        </h2>
        {promptFa && (
          <p className="text-sm font-bold text-[#12746B] mt-1.5 p-2 bg-[#EAF7F3] rounded-xl border border-[#CDEAE0]">
            «{promptFa}»
          </p>
        )}
      </div>

      {/* Selected Words Tray (Sentence Construction Area) */}
      <div
        className={`min-h-[96px] p-3.5 rounded-3xl border-2 border-dashed flex flex-wrap items-center gap-2 transition-all dir-ltr ${
          isChecked
            ? isCorrect
              ? 'bg-[#E8F8F0] border-[#2F8856]'
              : 'bg-[#FDF2F2] border-[#E5584F]'
            : selectedWords.length > 0
            ? 'bg-white border-[#1F9A8A]/50 shadow-xs'
            : 'bg-[#FBF8EE] border-[#CCD8D3]'
        }`}
      >
        {selectedWords.length === 0 ? (
          <div className="w-full text-center text-xs font-semibold text-[#8B9EA7] py-4 select-none dir-rtl">
            برای ساختن جمله روی کلمات زیر ضربه بزنید...
          </div>
        ) : (
          selectedWords.map((word, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isChecked}
              onClick={() => {
                if (isChecked) return;
                sounds.playTap();
                onRemoveWord(idx);
              }}
              className="px-3.5 py-2.5 rounded-xl font-en font-black text-sm bg-white border border-[#1F9A8A] text-[#12746B] shadow-[0_3px_0_#12746B] active:translate-y-0.5 active:shadow-[0_1px_0_#12746B] transition-transform select-none hover:bg-[#F2FAF7]"
            >
              {word}
            </button>
          ))
        )}
      </div>

      {/* Available Word Bank */}
      <div className="p-3 bg-white rounded-3xl border border-[#E4EEE9] shadow-xs">
        <span className="text-[10px] font-bold text-[#6B7C85] block mb-2 px-1">
          بانک کلمات (لمس کنید):
        </span>
        <div className="flex flex-wrap gap-2.5 dir-ltr justify-center min-h-[64px] items-center">
          {availableWords.map((word, idx) => {
            // Count occurrences in selectedWords vs availableWords
            const occurrencesInAvailable = availableWords
              .slice(0, idx + 1)
              .filter((w) => w === word).length;
            const occurrencesInSelected = selectedWords.filter(
              (w) => w === word
            ).length;
            const isUsed = occurrencesInAvailable <= occurrencesInSelected;

            return (
              <button
                key={idx}
                type="button"
                disabled={isUsed || isChecked}
                onClick={() => {
                  if (isUsed || isChecked) return;
                  sounds.playTap();
                  onSelectWord(word, idx);
                }}
                className={`px-4 py-2.5 rounded-xl font-en font-bold text-sm transition-all duration-150 select-none ${
                  isUsed
                    ? 'bg-[#E5ECE9] text-transparent border border-transparent shadow-none cursor-default opacity-40'
                    : 'bg-[#F6FAF8] text-[#1D2B33] border border-[#D5E6E0] shadow-[0_3px_0_#BCCEC8] active:translate-y-0.5 active:shadow-[0_1px_0_#BCCEC8] hover:border-[#1F9A8A]'
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
