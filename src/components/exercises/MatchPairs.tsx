import React, { useState, useEffect } from 'react';
import { sounds } from '../../lib/sound';
import { Check } from 'lucide-react';

export interface PairItem {
  en: string;
  fa: string;
}

export interface MatchPairsProps {
  prompt: string;
  pairs: PairItem[];
  onComplete: (isAllMatched: boolean) => void;
  isChecked?: boolean;
}

export const MatchPairs: React.FC<MatchPairsProps> = ({
  prompt,
  pairs,
  onComplete,
  isChecked = false,
}) => {
  // Shuffle English and Persian items independently once
  const [shuffledEn, setShuffledEn] = useState<string[]>([]);
  const [shuffledFa, setShuffledFa] = useState<string[]>([]);

  const [selectedEn, setSelectedEn] = useState<string | null>(null);
  const [selectedFa, setSelectedFa] = useState<string | null>(null);

  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); // list of matched en keys
  const [wrongPair, setWrongPair] = useState<{ en: string; fa: string } | null>(null);

  useEffect(() => {
    // Deterministic or playful shuffle
    const enList = pairs.map((p) => p.en).sort(() => Math.random() - 0.5);
    const faList = pairs.map((p) => p.fa).sort(() => Math.random() - 0.5);
    setShuffledEn(enList);
    setShuffledFa(faList);
    setMatchedPairs([]);
    setSelectedEn(null);
    setSelectedFa(null);
  }, [pairs]);

  // Check matching when both are selected
  useEffect(() => {
    if (!selectedEn || !selectedFa) return;

    const pair = pairs.find((p) => p.en === selectedEn && p.fa === selectedFa);
    if (pair) {
      // Correct match!
      sounds.playCorrect();
      const nextMatched = [...matchedPairs, selectedEn];
      setMatchedPairs(nextMatched);
      setSelectedEn(null);
      setSelectedFa(null);

      if (nextMatched.length === pairs.length) {
        onComplete(true);
      }
    } else {
      // Wrong match
      sounds.playWrong();
      setWrongPair({ en: selectedEn, fa: selectedFa });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedEn(null);
        setSelectedFa(null);
      }, 550);
    }
  }, [selectedEn, selectedFa]);

  const handleEnClick = (word: string) => {
    if (matchedPairs.includes(word) || wrongPair || isChecked) return;
    sounds.playTap();
    setSelectedEn(selectedEn === word ? null : word);
  };

  const handleFaClick = (meaning: string) => {
    // Find if meaning belongs to an already matched pair
    const isMatched = pairs.some(
      (p) => p.fa === meaning && matchedPairs.includes(p.en)
    );
    if (isMatched || wrongPair || isChecked) return;
    sounds.playTap();
    setSelectedFa(selectedFa === meaning ? null : meaning);
  };

  return (
    <div className="w-full space-y-4">
      {/* Exercise Prompt */}
      <div className="p-4 bg-white rounded-3xl border border-[#E4EEE9] shadow-xs">
        <span className="text-[11px] font-bold text-[#1F9A8A] block mb-1">
          جفت‌سازی کلمات • Match Pairs
        </span>
        <h2 className="text-base font-black text-[#1D2B33] leading-relaxed">
          {prompt}
        </h2>
        <span className="text-xs text-[#6B7C85] mt-1 block">
          {matchedPairs.length} از {pairs.length} جفت متصل شده
        </span>
      </div>

      {/* Two Columns: English (Left/LTR) and Persian (Right/RTL) */}
      <div className="grid grid-cols-2 gap-3">
        {/* English Column */}
        <div className="space-y-2">
          {shuffledEn.map((enWord) => {
            const isMatched = matchedPairs.includes(enWord);
            const isSelected = selectedEn === enWord;
            const isWrong = wrongPair?.en === enWord;

            return (
              <button
                key={enWord}
                type="button"
                disabled={isMatched || isChecked}
                onClick={() => handleEnClick(enWord)}
                className={`w-full min-h-[54px] p-3 rounded-2xl border font-en font-bold text-sm text-left transition-all duration-150 flex items-center justify-between select-none active:scale-[0.98] ${
                  isMatched
                    ? 'bg-[#E8F8F0] border-2 border-[#2F8856] text-[#12746B] opacity-90'
                    : isWrong
                    ? 'bg-[#FDF2F2] border-2 border-[#E5584F] text-[#BA3F37] animate-heart-shake'
                    : isSelected
                    ? 'bg-[#EAF7F3] border-2 border-[#1F9A8A] text-[#12746B] shadow-sm'
                    : 'bg-white border-[#E4EEE9] text-[#1D2B33] shadow-xs hover:border-[#BEE3D7]'
                }`}
              >
                <span>{enWord}</span>
                {isMatched && <Check className="w-4 h-4 stroke-[3] text-[#3DAA6D]" />}
              </button>
            );
          })}
        </div>

        {/* Persian Column */}
        <div className="space-y-2">
          {shuffledFa.map((faMeaning) => {
            const matchedPairItem = pairs.find((p) => p.fa === faMeaning);
            const isMatched =
              matchedPairItem && matchedPairs.includes(matchedPairItem.en);
            const isSelected = selectedFa === faMeaning;
            const isWrong = wrongPair?.fa === faMeaning;

            return (
              <button
                key={faMeaning}
                type="button"
                disabled={Boolean(isMatched) || isChecked}
                onClick={() => handleFaClick(faMeaning)}
                className={`w-full min-h-[54px] p-3 rounded-2xl border font-bold text-sm text-right transition-all duration-150 flex items-center justify-between select-none active:scale-[0.98] ${
                  isMatched
                    ? 'bg-[#E8F8F0] border-2 border-[#2F8856] text-[#12746B] opacity-90'
                    : isWrong
                    ? 'bg-[#FDF2F2] border-2 border-[#E5584F] text-[#BA3F37] animate-heart-shake'
                    : isSelected
                    ? 'bg-[#EAF7F3] border-2 border-[#1F9A8A] text-[#12746B] shadow-sm'
                    : 'bg-white border-[#E4EEE9] text-[#1D2B33] shadow-xs hover:border-[#BEE3D7]'
                }`}
              >
                <span>{faMeaning}</span>
                {isMatched && <Check className="w-4 h-4 stroke-[3] text-[#3DAA6D]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
