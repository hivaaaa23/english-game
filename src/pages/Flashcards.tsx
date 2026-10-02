import React, { useState } from 'react';
import flashcardsData from '../data/flashcards.json';
import { GameButton } from '../components/GameButton';
import { Volume2, RotateCcw, Check } from 'lucide-react';
import { sounds } from '../lib/sound';

interface FlashcardsProps {
  onEarnXp: (amount: number) => void;
}

export const Flashcards: React.FC<FlashcardsProps> = ({ onEarnXp }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);

  const card = flashcardsData[currentIndex] || flashcardsData[0];

  const handleFlip = () => {
    sounds.playTap();
    setIsFlipped(!isFlipped);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playTap();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(card.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNext = (isKnown: boolean) => {
    if (isKnown) {
      sounds.playCorrect();
      onEarnXp(10);
      setKnownCount((prev) => prev + 1);
    } else {
      sounds.playTap();
    }

    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcardsData.length);
  };

  return (
    <div className="pb-24 pt-2 px-4 max-w-md mx-auto">
      {/* Header Banner */}
      <div className="game-card p-4 mb-4 bg-white border border-[#E4EEE9]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#DDF3EC] border border-[#BEE3D7] flex items-center justify-center text-sm font-black shadow-xs">
              🗂️
            </span>
            <div>
              <h1 className="text-sm font-black text-[#1D2B33]">
                جعبه فلش‌کارت هوشمند
              </h1>
              <span className="text-[10px] font-bold text-[#6B7C85] block">
                کارت {currentIndex + 1} از {flashcardsData.length}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-[#DDF3EC] px-2.5 py-1 rounded-xl border border-[#BEE3D7] text-xs font-black text-[#12746B]">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{knownCount} آموخته شده</span>
          </div>
        </div>

        {/* Progress Bar in Teal */}
        <div className="w-full bg-[#E4EEE9] h-2 rounded-full mt-3 overflow-hidden">
          <div
            className="h-full bg-[#1F9A8A] transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / flashcardsData.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Balanced layout spacing where character stood */}
      <div className="h-3" />

      {/* Soft Card Flip Container */}
      <div className="my-4">
        <div
          onClick={handleFlip}
          className={`w-full min-h-[260px] rounded-3xl border border-[#E4EEE9] shadow-md cursor-pointer transition-all duration-300 select-none p-6 flex flex-col justify-between ${
            isFlipped ? 'bg-[#DDF3EC]/40' : 'bg-white'
          }`}
        >
          {/* Top card strip */}
          <div className="flex items-center justify-between">
            {/* Soft purple accent for vocab tags */}
            <span className="font-en text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-[#7B63D9]/10 text-[#7B63D9] border border-[#7B63D9]/25">
              {card.partOfSpeech}
            </span>
            <span className="text-[11px] font-medium text-[#6B7C85]">
              برای چرخش ضربه بزنید ↻
            </span>
          </div>

          {/* Card Body */}
          {!isFlipped ? (
            /* FRONT: English */
            <div className="text-center my-6">
              <h2 className="font-en text-4xl font-black text-[#1D2B33] tracking-tight mb-2">
                {card.word}
              </h2>
              <div className="flex items-center justify-center gap-2">
                <span className="font-en text-sm text-[#6B7C85] font-semibold tracking-wider">
                  {card.ipa}
                </span>
                <button
                  onClick={handleSpeak}
                  className="w-8 h-8 rounded-full bg-[#DDF3EC] border border-[#BEE3D7] flex items-center justify-center hover:bg-[#cbf0e4] active:translate-y-0.5 shadow-xs transition-all"
                  title="تلفظ صوتی کلمه"
                >
                  <Volume2 className="w-4 h-4 text-[#1F9A8A]" />
                </button>
              </div>
              <span className="inline-block mt-4 text-xs font-bold text-[#7B63D9] bg-[#7B63D9]/10 px-3 py-1 rounded-full border border-[#7B63D9]/20">
                دسته‌بندی: {card.category}
              </span>
            </div>
          ) : (
            /* BACK: Persian translation and example */
            <div className="text-center my-4 animate-pop-in">
              <span className="text-xs font-bold text-[#1F9A8A] block mb-1">
                معنی و مفهوم فارسی:
              </span>
              <h2 className="text-2xl font-black text-[#1D2B33] mb-3">
                {card.meaningFa}
              </h2>

              <div className="bg-white border border-[#E4EEE9] rounded-2xl p-3 text-right shadow-xs">
                <p className="font-en text-xs font-bold text-[#1D2B33] mb-1">
                  &ldquo;{card.exampleEn}&rdquo;
                </p>
                <p className="text-xs font-medium text-[#6B7C85]">
                  «{card.exampleFa}»
                </p>
              </div>
            </div>
          )}

          {/* Bottom hint */}
          <div className="text-center text-[11px] font-medium text-[#6B7C85]">
            {isFlipped ? 'روی دکمه‌های زیر تصمیم بگیر' : 'می‌تونی معنیش رو حدس بزنی؟'}
          </div>
        </div>
      </div>

      {/* Decision Chunky Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <GameButton
          variant="mint"
          size="lg"
          onClick={() => handleNext(false)}
          className="flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4 text-[#12746B]" />
          <span>نیاز به مرور</span>
        </GameButton>

        <GameButton
          variant="teal"
          size="lg"
          onClick={() => handleNext(true)}
          className="flex items-center justify-center gap-1.5"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>بلدم! (+10 XP)</span>
        </GameButton>
      </div>
    </div>
  );
};
