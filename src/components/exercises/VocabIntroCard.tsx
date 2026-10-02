import React from 'react';
import { Volume2, Sparkles, BookOpen, Layers } from 'lucide-react';
import { GameButton } from '../GameButton';
import { sounds } from '../../lib/sound';
import { playEnglishAudio } from '../../lib/progress';

export interface VocabWordItem {
  word: string;
  meaning: string;
  partOfSpeech: string;
  example: string;
  exampleFa?: string;
}

export interface VocabIntroCardProps {
  lessonTitle: string;
  lessonTitleFa: string;
  words: VocabWordItem[];
  onStartExercises: () => void;
}

export const VocabIntroCard: React.FC<VocabIntroCardProps> = ({
  lessonTitle,
  lessonTitleFa,
  words,
  onStartExercises,
}) => {
  const handlePronounce = (wordText: string) => {
    sounds.playTap();
    playEnglishAudio(wordText);
  };

  return (
    <div className="w-full space-y-4 pb-6">
      {/* Header Banner */}
      <div className="p-4 bg-white rounded-3xl border border-[#E4EEE9] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#DDF3EC] border border-[#BEE3D7] flex items-center justify-center text-[#12746B] shadow-xs">
            <Layers className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#6B7C85] uppercase tracking-wider block">
              کارت‌های آموزشی لغات ({words.length} واژه)
            </span>
            <h1 className="text-base font-black text-[#1D2B33]">{lessonTitleFa}</h1>
            <span className="font-en text-xs font-bold text-[#1F9A8A] block">
              {lessonTitle}
            </span>
          </div>
        </div>
      </div>

      <div className="px-1 text-xs text-[#6B7C85] font-semibold">
        ابتدا کلمات را به همراه تلفظ و کاربرد مرور کنید، سپس وارد تمرین‌ها شوید:
      </div>

      {/* Word Learning Cards List */}
      <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
        {words.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 bg-white rounded-2xl border border-[#E4EEE9] shadow-xs flex flex-col gap-1.5 transition-all hover:border-[#BEE3D7]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-en font-black text-base text-[#12746B]">
                  {item.word}
                </span>
                <button
                  type="button"
                  onClick={() => handlePronounce(item.word)}
                  className="w-7 h-7 rounded-lg bg-[#EAF7F3] text-[#1F9A8A] flex items-center justify-center hover:bg-[#D4EFE6] active:scale-95 transition-transform"
                  aria-label={`تلفظ ${item.word}`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F6FAF8] text-[#6B7C85] border border-[#E4EEE9]">
                  {item.partOfSpeech}
                </span>
              </div>

              <span className="text-sm font-black text-[#1D2B33]">
                {item.meaning}
              </span>
            </div>

            <p className="font-en text-xs font-bold text-[#1F9A8A] dir-ltr text-left">
              “{item.example}”
            </p>
            {item.exampleFa && (
              <p className="text-[11px] text-[#6B7C85] font-medium text-right">
                «{item.exampleFa}»
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Start Exercises Button */}
      <div className="pt-2">
        <GameButton
          variant="teal"
          size="lg"
          className="w-full text-base"
          onClick={() => {
            sounds.playTap();
            onStartExercises();
          }}
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            شروع تمرین‌های لغات ({words.length} سوال)
          </span>
        </GameButton>
      </div>
    </div>
  );
};
