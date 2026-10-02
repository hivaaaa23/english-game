import React from 'react';
import { BookOpen, Lightbulb, Sparkles, CheckCircle2 } from 'lucide-react';
import { GameButton } from '../GameButton';
import { sounds } from '../../lib/sound';

export interface FormTableRow {
  type: string;
  structure: string;
  example: string;
}

export interface ExampleSentence {
  en: string;
  fa: string;
}

export interface TheoryData {
  rule: string;
  formTable?: FormTableRow[];
  examples?: ExampleSentence[];
  tip?: string;
}

export interface TheoryCardProps {
  lessonTitle: string;
  lessonTitleFa: string;
  level?: string;
  theory: TheoryData;
  onStartExercises: () => void;
}

export const TheoryCard: React.FC<TheoryCardProps> = ({
  lessonTitle,
  lessonTitleFa,
  level = 'A1 - Elementary',
  theory,
  onStartExercises,
}) => {
  return (
    <div className="w-full space-y-4 pb-6">
      {/* Header Banner */}
      <div className="p-4 bg-white rounded-3xl border border-[#E4EEE9] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#DDF3EC] border border-[#BEE3D7] flex items-center justify-center text-[#12746B] shadow-xs">
            <BookOpen className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#6B7C85] uppercase tracking-wider block">
              درس‌نامه و قاعده گرامری • {level}
            </span>
            <h1 className="text-base font-black text-[#1D2B33]">{lessonTitleFa}</h1>
            <span className="font-en text-xs font-bold text-[#1F9A8A] block">
              {lessonTitle}
            </span>
          </div>
        </div>
      </div>

      {/* Main Rule Box */}
      <div className="p-4 bg-white rounded-3xl border border-[#E4EEE9] shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1F9A8A]" />
          <h2 className="text-xs font-black text-[#12746B]">قاعده اصلی (Core Concept):</h2>
        </div>
        <p className="text-sm font-semibold text-[#1D2B33] leading-relaxed text-right">
          {theory.rule}
        </p>
      </div>

      {/* Form Table */}
      {theory.formTable && theory.formTable.length > 0 && (
        <div className="p-4 bg-white rounded-3xl border border-[#E4EEE9] shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1F9A8A]" />
            <h2 className="text-xs font-black text-[#12746B]">جدول ساختار جملات (Sentence Forms):</h2>
          </div>

          <div className="space-y-2">
            {theory.formTable.map((row, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#F6FAF8] rounded-2xl border border-[#D7EBE4] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#12746B]">{row.type}</span>
                  <span className="font-en text-xs font-bold text-[#6B7C85] dir-ltr">
                    {row.structure}
                  </span>
                </div>
                <p className="font-en text-xs font-black text-[#1D2B33] dir-ltr text-left">
                  “{row.example}”
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Example Sentences */}
      {theory.examples && theory.examples.length > 0 && (
        <div className="p-4 bg-white rounded-3xl border border-[#E4EEE9] shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1F9A8A]" />
            <h2 className="text-xs font-black text-[#12746B]">مثال‌های کاربردی (Real Examples):</h2>
          </div>

          <div className="space-y-2">
            {theory.examples.map((ex, idx) => (
              <div key={idx} className="p-3 bg-[#F6FAF8] rounded-2xl border border-[#E4EEE9]">
                <p className="font-en font-bold text-sm text-[#1F9A8A] dir-ltr text-left">
                  “{ex.en}”
                </p>
                <p className="text-xs text-[#6B7C85] mt-1 font-medium text-right">
                  «{ex.fa}»
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pro Tip */}
      {theory.tip && (
        <div className="p-3.5 bg-[#FFFDE8] rounded-2xl border border-[#F0E6A5] flex items-start gap-2.5">
          <Lightbulb className="w-5 h-5 text-[#C79810] shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-[#7A610A] leading-relaxed">
            {theory.tip}
          </p>
        </div>
      )}

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
            شروع تمرین‌ها (Start Exercises)
          </span>
        </GameButton>
      </div>
    </div>
  );
};
