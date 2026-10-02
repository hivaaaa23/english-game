import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Heart,
  Star,
  Flame,
  Award,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';
import { sounds } from '../lib/sound';
import { GameButton } from '../components/GameButton';
import {
  loseHeart,
  addXp,
  recordLessonCompletion,
  completeGrammarNode,
  completeVocabNode,
  loadProgress,
} from '../lib/progress';

import { MultipleChoice } from '../components/exercises/MultipleChoice';
import { FillInTheBlank } from '../components/exercises/FillInTheBlank';
import { WordOrder } from '../components/exercises/WordOrder';
import { MatchPairs, PairItem } from '../components/exercises/MatchPairs';
import { ListeningExercise } from '../components/exercises/ListeningExercise';
import { TheoryCard, TheoryData } from '../components/exercises/TheoryCard';
import { VocabIntroCard, VocabWordItem } from '../components/exercises/VocabIntroCard';

export interface QuestionData {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'word_order' | 'match_pairs' | 'listening';
  prompt: string;
  promptFa?: string;
  options?: string[];
  answerIndex?: number;
  sentence?: string;
  acceptedAnswers?: string[];
  hint?: string;
  words?: string[];
  correctOrder?: string[];
  pairs?: PairItem[];
  audioText?: string;
  explanation?: string;
}

export interface LessonProps {
  lessonData: {
    id: string;
    title: string;
    titleFa: string;
    description: string;
    level?: string;
    xp: number;
    theory?: TheoryData;
    words?: VocabWordItem[];
    questions?: QuestionData[];
    keyRule?: string;
    sampleSentence?: string;
  };
  type: 'grammar' | 'vocab';
  nextNodeId?: string;
  onFinishLesson: () => void;
  onClose: () => void;
  onNavigateToFlashcards?: () => void;
}

// Generate high quality fallback questions for nodes without explicit JSON questions
function generateFallbackQuestions(
  type: 'grammar' | 'vocab',
  title: string,
  words?: VocabWordItem[]
): QuestionData[] {
  if (type === 'vocab' && words && words.length >= 4) {
    const w = words;
    return [
      {
        id: 'q-f-1',
        type: 'match_pairs',
        prompt: `کلمات درس ${title} را با معنی آن‌ها جفت کنید:`,
        pairs: w.slice(0, 4).map((item) => ({ en: item.word, fa: item.meaning })),
        explanation: 'کلمات کلیدی این درس.',
      },
      {
        id: 'q-f-2',
        type: 'multiple_choice',
        prompt: `معنی کلمه انگلیسی "${w[0].word}" چیست؟`,
        options: [w[0].meaning, w[1].meaning, w[2].meaning, w[3].meaning],
        answerIndex: 0,
        explanation: `کلمه ${w[0].word} به معنی ${w[0].meaning} است.`,
      },
      {
        id: 'q-f-3',
        type: 'listening',
        prompt: 'به تلفظ گوش دهید و گزینه درست را انتخاب کنید:',
        audioText: w[0].word,
        options: [w[0].word, w[1].word, w[2].word, w[3].word],
        answerIndex: 0,
        explanation: `تلفظ کلمه ${w[0].word}.`,
      },
      {
        id: 'q-f-4',
        type: 'fill_blank',
        prompt: `کلمه انگلیسی معادل «${w[1].meaning}» را تایپ کنید:`,
        sentence: `The word is ___ .`,
        acceptedAnswers: [w[1].word.toLowerCase()],
        hint: `با حرف ${w[1].word.charAt(0)} شروع می‌شود.`,
        explanation: `${w[1].word} یعنی ${w[1].meaning}.`,
      },
      {
        id: 'q-f-5',
        type: 'word_order',
        prompt: 'کلمات را مرتب کنید:',
        promptFa: w[0].exampleFa || `مثال کاربردی برای ${w[0].meaning}`,
        words: [...w[0].example.split(' '), 'extra'],
        correctOrder: w[0].example.split(' '),
        explanation: `جمله صحیح: ${w[0].example}`,
      },
      {
        id: 'q-f-6',
        type: 'multiple_choice',
        prompt: `کدام کلمه انگلیسی به معنی «${w[2].meaning}» است؟`,
        options: [w[2].word, w[0].word, w[1].word, w[3].word],
        answerIndex: 0,
        explanation: `${w[2].word} = ${w[2].meaning}`,
      },
      {
        id: 'q-f-7',
        type: 'listening',
        prompt: 'به جمله صوتی گوش دهید و آن را انتخاب کنید:',
        audioText: w[1].example,
        options: [
          w[1].example,
          `I practice ${w[0].word} every day.`,
          `She likes ${w[2].word} very much.`,
          `They have modern ${w[3].word}.`,
        ],
        answerIndex: 0,
        explanation: w[1].example,
      },
      {
        id: 'q-f-8',
        type: 'match_pairs',
        prompt: 'جفت‌های بعدی را به هم متصل کنید:',
        pairs: w.slice(4, 8).map((item) => ({ en: item.word, fa: item.meaning })),
        explanation: 'بخش دوم واژگان درس.',
      },
    ];
  }

  // Grammar fallback
  return [
    {
      id: 'q-fg-1',
      type: 'multiple_choice',
      prompt: `کدام جمله از لحاظ کاربرد گرامری ${title} صحیح است؟`,
      options: [
        'I practice English every day.',
        'I practices English every day.',
        'I practicing English every day.',
        'I is practice English daily.',
      ],
      answerIndex: 0,
      explanation: 'فرم درست فعل با ضمیر I.',
    },
    {
      id: 'q-fg-2',
      type: 'fill_blank',
      prompt: 'شکل صحیح فعل را داخل پرانتز کامل کنید:',
      sentence: 'She ___ (study) hard every day.',
      acceptedAnswers: ['studies', 'study'],
      hint: 'برای She پسوند es یا ies اضافه می‌شود.',
      explanation: 'در سوم شخص مفرد: She studies.',
    },
    {
      id: 'q-fg-3',
      type: 'listening',
      prompt: 'به تلفظ گوش دهید و گزینه منطبق را پیدا کنید:',
      audioText: 'Practice makes progress.',
      options: [
        'Practice makes progress.',
        'Grammar needs constant study.',
        'Language is learned step by step.',
        'Focus on daily English.',
      ],
      answerIndex: 0,
      explanation: 'جمله صوتی: Practice makes progress.',
    },
    {
      id: 'q-fg-4',
      type: 'word_order',
      prompt: 'کلمات را به ترتیب صحیح بچینید:',
      promptFa: 'آن‌ها با هم درس می‌خوانند.',
      words: ['They', 'study', 'together', 'every', 'evening', 'studies'],
      correctOrder: ['They', 'study', 'together', 'every', 'evening'],
      explanation: 'ترتیب درست: فاعل + فعل + قید.',
    },
    {
      id: 'q-fg-5',
      type: 'match_pairs',
      prompt: 'ضمایر و افعال کمکی را جفت کنید:',
      pairs: [
        { en: 'I / You / We / They', fa: 'do / don\'t' },
        { en: 'He / She / It', fa: 'does / doesn\'t' },
        { en: 'Continuous', fa: 'am / is / are + ing' },
        { en: 'Past', fa: 'was / were' },
      ],
      explanation: 'تطابق فاعل و فعل کمکی.',
    },
    {
      id: 'q-fg-6',
      type: 'multiple_choice',
      prompt: 'برای سؤالی کردن جمله از کدام فعل کمکی استفاده می‌شود؟',
      options: ['Do / Does', 'Did only', 'Have only', 'Will only'],
      answerIndex: 0,
      explanation: 'در زمان حال ساده از Do و Does استفاده می‌شود.',
    },
    {
      id: 'q-fg-7',
      type: 'fill_blank',
      prompt: 'جای خالی را با فعل کمکی مناسب پر کنید:',
      sentence: 'Where ___ you live?',
      acceptedAnswers: ['do'],
      hint: 'برای ضمیر you از do استفاده می‌شود.',
      explanation: 'سؤال: Where do you live?',
    },
    {
      id: 'q-fg-8',
      type: 'listening',
      prompt: 'به جمله گوش دهید و آن را انتخاب کنید:',
      audioText: 'English grammar is easy when you practice daily.',
      options: [
        'English grammar is easy when you practice daily.',
        'Learning rules needs hard memorization.',
        'Vocabulary is important for speaking.',
        'Practice makes language speaking natural.',
      ],
      answerIndex: 0,
      explanation: 'صوت: English grammar is easy when you practice daily.',
    },
  ];
}

export const Lesson: React.FC<LessonProps> = ({
  lessonData,
  type,
  nextNodeId,
  onFinishLesson,
  onClose,
  onNavigateToFlashcards,
}) => {
  // Questions list (8-10 questions)
  const questions: QuestionData[] =
    lessonData.questions && lessonData.questions.length >= 8
      ? lessonData.questions
      : generateFallbackQuestions(type, lessonData.title, lessonData.words);

  // States
  const [inIntroPhase, setInIntroPhase] = useState<boolean>(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [hearts, setHearts] = useState<number>(5);
  const [xpGainedInLesson, setXpGainedInLesson] = useState<number>(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);

  // Modals & Panels
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [isOutOfHearts, setIsOutOfHearts] = useState<boolean>(false);
  const [heartShake, setHeartShake] = useState<boolean>(false);
  const [floatingXp, setFloatingXp] = useState<boolean>(false);

  // Current Question Answering State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [typedValue, setTypedValue] = useState<string>('');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isMatchPairsDone, setIsMatchPairsDone] = useState<boolean>(false);

  // Bottom Sliding Check State
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  // Final Results Screen
  const [isLessonFinished, setIsLessonFinished] = useState<boolean>(false);
  const [finalStreak, setFinalStreak] = useState<number>(4);

  // Load current hearts on mount
  useEffect(() => {
    const currentProg = loadProgress();
    setHearts(currentProg.hearts);
    setFinalStreak(currentProg.streak);
  }, []);

  const currentQ = questions[currentQuestionIndex];
  const progressPercent = Math.round(
    ((currentQuestionIndex + (isAnswerChecked && isAnswerCorrect ? 1 : 0)) /
      questions.length) *
      100
  );

  // Reset inputs when switching questions
  const resetQuestionInputs = () => {
    setSelectedOption(null);
    setTypedValue('');
    setSelectedWords([]);
    setIsMatchPairsDone(false);
    setIsAnswerChecked(false);
    setIsAnswerCorrect(null);
  };

  // Determine if Check button should be active
  const isAnswerProvided = () => {
    if (!currentQ) return false;
    switch (currentQ.type) {
      case 'multiple_choice':
      case 'listening':
        return selectedOption !== null;
      case 'fill_blank':
        return typedValue.trim().length > 0;
      case 'word_order':
        return selectedWords.length > 0;
      case 'match_pairs':
        return isMatchPairsDone;
      default:
        return false;
    }
  };

  // Handle checking user's answer
  const handleCheckAnswer = () => {
    if (!currentQ || isAnswerChecked) return;

    let correct = false;

    switch (currentQ.type) {
      case 'multiple_choice':
      case 'listening':
        correct = selectedOption === currentQ.answerIndex;
        break;
      case 'fill_blank': {
        const cleanTyped = typedValue.trim().toLowerCase();
        correct =
          Boolean(currentQ.acceptedAnswers?.some((ans) => ans.toLowerCase() === cleanTyped));
        break;
      }
      case 'word_order': {
        if (!currentQ.correctOrder) break;
        correct =
          selectedWords.length === currentQ.correctOrder.length &&
          selectedWords.every((w, i) => w === currentQ.correctOrder![i]);
        break;
      }
      case 'match_pairs':
        correct = isMatchPairsDone;
        break;
    }

    setIsAnswerChecked(true);
    setIsAnswerCorrect(correct);

    if (correct) {
      sounds.playCorrect();
      setCorrectAnswersCount((prev) => prev + 1);
      setXpGainedInLesson((prev) => prev + 10);
      addXp(10);
      setFloatingXp(true);
      setTimeout(() => setFloatingXp(false), 1200);
    } else {
      sounds.playWrong();
      const heartResult = loseHeart(1);
      setHearts(heartResult.newProgress.hearts);
      setHeartShake(true);
      setTimeout(() => setHeartShake(false), 600);

      if (heartResult.newProgress.hearts <= 0) {
        setTimeout(() => {
          setIsOutOfHearts(true);
        }, 600);
      }
    }
  };

  // Handle continuing to the next question or results
  const handleContinue = () => {
    sounds.playTap();

    if (hearts <= 0) {
      setIsOutOfHearts(true);
      return;
    }

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      resetQuestionInputs();
    } else {
      // Lesson Complete!
      handleFinishAllQuestions();
    }
  };

  // Finish Lesson
  const handleFinishAllQuestions = () => {
    sounds.playWin();
    const finalXpEarned = lessonData.xp || 15;
    setXpGainedInLesson((prev) => prev + finalXpEarned);

    // Save progress, streak, and unlocked node in localStorage through progress.js
    const { newStreak } = recordLessonCompletion(finalXpEarned);
    setFinalStreak(newStreak);

    if (type === 'grammar') {
      completeGrammarNode(lessonData.id, nextNodeId);
    } else {
      completeVocabNode(lessonData.id, nextNodeId);
    }

    setIsLessonFinished(true);

    // Launch celebratory confetti
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1F9A8A', '#3DAA6D', '#F2C14E', '#DDF3EC', '#7B63D9'],
    });
  };

  // Close with confirmation
  const handleCloseClick = () => {
    sounds.playTap();
    setShowExitConfirm(true);
  };

  const handleConfirmExit = () => {
    sounds.playTap();
    setShowExitConfirm(false);
    onClose();
  };

  // OUT OF HEARTS MODAL
  if (isOutOfHearts) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-pop-in">
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-[#E4EEE9] shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#FDF2F2] border border-[#FADBD8] flex items-center justify-center text-[#E5584F] shadow-xs">
            <Heart className="w-9 h-9 fill-[#E5584F] animate-heart-crack" />
          </div>

          <div>
            <h2 className="text-xl font-black text-[#1D2B33]">قلب‌های شما تمام شد!</h2>
            <p className="text-xs text-[#6B7C85] mt-2 leading-relaxed">
              برای ادامه درس نیاز به قلب دارید. قلب‌ها هر ۳۰ دقیقه ۱ عدد به طور خودکار بازیابی می‌شوند.
            </p>
          </div>

          <div className="p-3 bg-[#EAF7F3] rounded-2xl border border-[#C6EADA] text-right space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#12746B]">
              <Sparkles className="w-4 h-4 text-[#1F9A8A]" />
              <span>چطور قلب سریع‌تر بگیرم؟</span>
            </div>
            <p className="text-[11px] text-[#6B7C85] leading-relaxed">
              می‌توانید با مرور و پاسخ به کارت‌ها در بخش فلش‌کارت، قلب‌های خود را کامل بازیابی کنید!
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {onNavigateToFlashcards && (
              <GameButton
                variant="teal"
                size="lg"
                className="w-full text-sm font-black"
                onClick={() => {
                  sounds.playTap();
                  onNavigateToFlashcards();
                }}
              >
                تمرین در فلش‌کارت و بازیابی قلب
              </GameButton>
            )}

            <button
              onClick={() => {
                sounds.playTap();
                onClose();
              }}
              className="w-full py-2.5 text-xs font-bold text-[#6B7C85] hover:text-[#1D2B33]"
            >
              بازگشت به نقشه
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LESSON FINISHED RESULT SCREEN
  if (isLessonFinished) {
    const accuracy = Math.round((correctAnswersCount / questions.length) * 100);

    return (
      <div className="min-h-screen bg-[#FBF8EE] p-5 flex flex-col justify-between max-w-md mx-auto">
        <div className="pt-8 text-center space-y-4">
          {/* Trophy Badge */}
          <div className="w-24 h-24 mx-auto rounded-3xl bg-[#DDF3EC] border-2 border-[#BEE3D7] flex items-center justify-center text-[#1F9A8A] shadow-lg animate-bounce-slight">
            <Award className="w-14 h-14 stroke-[2.2] text-[#12746B]" />
          </div>

          <div>
            <span className="text-xs font-bold text-[#1F9A8A] uppercase tracking-wider block">
              درس با موفقیت به پایان رسید
            </span>
            <h1 className="text-2xl font-black text-[#1D2B33] mt-1">
              آفرین! گام بزرگی برداشتی
            </h1>
            <p className="text-xs text-[#6B7C85] mt-1 font-en">
              {lessonData.title} • {lessonData.titleFa}
            </p>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-3 gap-2.5 pt-4">
            {/* Total XP Earned */}
            <div className="p-3 bg-white rounded-2xl border border-[#E4EEE9] shadow-xs text-center">
              <span className="w-7 h-7 mx-auto mb-1 rounded-xl bg-[#FFF6D9] text-[#C79810] flex items-center justify-center">
                <Star className="w-4 h-4 fill-current" />
              </span>
              <span className="text-[10px] font-bold text-[#6B7C85] block">امتیاز XP</span>
              <span className="font-en text-base font-black text-[#1D2B33]">
                +{xpGainedInLesson}
              </span>
            </div>

            {/* Accuracy */}
            <div className="p-3 bg-white rounded-2xl border border-[#E4EEE9] shadow-xs text-center">
              <span className="w-7 h-7 mx-auto mb-1 rounded-xl bg-[#E8F8F0] text-[#2F8856] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold text-[#6B7C85] block">میزان دقت</span>
              <span className="font-en text-base font-black text-[#1D2B33]">
                {accuracy}%
              </span>
            </div>

            {/* Streak */}
            <div className="p-3 bg-white rounded-2xl border border-[#E4EEE9] shadow-xs text-center">
              <span className="w-7 h-7 mx-auto mb-1 rounded-xl bg-[#FFF1ED] text-[#E5584F] flex items-center justify-center">
                <Flame className="w-4 h-4 fill-current text-[#E5584F]" />
              </span>
              <span className="text-[10px] font-bold text-[#6B7C85] block">زنجیره</span>
              <span className="font-en text-base font-black text-[#1D2B33]">
                {finalStreak} روز
              </span>
            </div>
          </div>

          {/* Next Node Unlocked Notice */}
          <div className="p-4 bg-white rounded-3xl border border-[#D7EBE4] shadow-xs flex items-center gap-3 text-right">
            <span className="w-10 h-10 rounded-2xl bg-[#1F9A8A] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h4 className="text-xs font-black text-[#12746B]">
                گره بعدی در نقشه باز شد!
              </h4>
              <p className="text-[11px] text-[#6B7C85] mt-0.5">
                پیشرفت شما در حافظه دستگاه ذخیره شد و می‌توانید مسیر یادگیری را ادامه دهید.
              </p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="pb-6 pt-4">
          <GameButton
            variant="teal"
            size="lg"
            className="w-full text-base font-black"
            onClick={() => {
              sounds.playTap();
              onFinishLesson();
            }}
          >
            ادامه و بازگشت به نقشه (Continue)
          </GameButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8EE] flex flex-col justify-between max-w-md mx-auto relative select-none">
      {/* Floating +10 XP Indicator */}
      {floatingXp && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none float-xp-indicator text-lg">
          +10 XP
        </div>
      )}

      {/* Top Bar: Close (X), Progress Bar, Hearts */}
      <div className="p-4 pb-2 flex items-center justify-between gap-3 relative z-10">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleCloseClick}
          className="w-10 h-10 rounded-2xl bg-white border border-[#E4EEE9] flex items-center justify-center text-[#6B7C85] hover:text-[#1D2B33] active:scale-95 transition-transform shadow-xs"
          aria-label="خروج از درس"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Bar in Teal */}
        <div className="flex-1 h-3.5 bg-[#E4EEE9] rounded-full overflow-hidden p-0.5 border border-[#D5E4DE]">
          <div
            className="h-full bg-[#1F9A8A] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${inIntroPhase ? 5 : Math.max(8, progressPercent)}%` }}
          />
        </div>

        {/* Hearts Indicator */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-2xl border border-[#E4EEE9] shadow-xs ${
            heartShake ? 'animate-heart-shake bg-[#FDF2F2] border-[#E5584F]' : ''
          }`}
        >
          <Heart className="w-4 h-4 fill-[#E5584F] text-[#E5584F]" />
          <span className="font-en text-sm font-black text-[#1D2B33]">
            {hearts}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-4 py-2 overflow-y-auto">
        {inIntroPhase ? (
          /* Step 0: Intro Card Phase (Theory for Grammar, Learning Cards for Vocab) */
          type === 'grammar' ? (
            <TheoryCard
              lessonTitle={lessonData.title}
              lessonTitleFa={lessonData.titleFa}
              level={lessonData.level}
              theory={
                lessonData.theory || {
                  rule: lessonData.description,
                  examples: [
                    {
                      en: lessonData.sampleSentence || 'I practice every day.',
                      fa: 'من هر روز تمرین می‌کنم.',
                    },
                  ],
                  tip: lessonData.keyRule || 'نکته: تمرین مستمر باعث ماندگاری آموخته‌ها می‌شود.',
                }
              }
              onStartExercises={() => setInIntroPhase(false)}
            />
          ) : (
            <VocabIntroCard
              lessonTitle={lessonData.title}
              lessonTitleFa={lessonData.titleFa}
              words={
                lessonData.words || [
                  {
                    word: 'practice',
                    meaning: 'تمرین کردن',
                    partOfSpeech: 'verb',
                    example: 'Practice makes progress.',
                  },
                ]
              }
              onStartExercises={() => setInIntroPhase(false)}
            />
          )
        ) : (
          /* Questions Phase (1 to N) */
          <div className="py-2">
            {currentQ.type === 'multiple_choice' && (
              <MultipleChoice
                prompt={currentQ.prompt}
                options={currentQ.options || []}
                selectedOption={selectedOption}
                onSelectOption={setSelectedOption}
                isChecked={isAnswerChecked}
                correctAnswerIndex={currentQ.answerIndex}
              />
            )}

            {currentQ.type === 'fill_blank' && (
              <FillInTheBlank
                prompt={currentQ.prompt}
                sentence={currentQ.sentence || '___'}
                value={typedValue}
                onChange={setTypedValue}
                hint={currentQ.hint}
                isChecked={isAnswerChecked}
                isCorrect={isAnswerCorrect ?? false}
                correctAnswer={currentQ.acceptedAnswers?.[0]}
              />
            )}

            {currentQ.type === 'word_order' && (
              <WordOrder
                prompt={currentQ.prompt}
                promptFa={currentQ.promptFa}
                availableWords={currentQ.words || []}
                selectedWords={selectedWords}
                onSelectWord={(word) => setSelectedWords((prev) => [...prev, word])}
                onRemoveWord={(idx) =>
                  setSelectedWords((prev) => prev.filter((_, i) => i !== idx))
                }
                isChecked={isAnswerChecked}
                isCorrect={isAnswerCorrect ?? false}
              />
            )}

            {currentQ.type === 'match_pairs' && (
              <MatchPairs
                prompt={currentQ.prompt}
                pairs={currentQ.pairs || []}
                onComplete={(isDone) => setIsMatchPairsDone(isDone)}
                isChecked={isAnswerChecked}
              />
            )}

            {currentQ.type === 'listening' && (
              <ListeningExercise
                prompt={currentQ.prompt}
                audioText={currentQ.audioText || ''}
                options={currentQ.options || []}
                selectedOption={selectedOption}
                onSelectOption={setSelectedOption}
                isChecked={isAnswerChecked}
                correctAnswerIndex={currentQ.answerIndex}
              />
            )}
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Area (Hidden in intro phase) */}
      {!inIntroPhase && (
        <div className="relative">
          {/* Default Bottom Bar with Check Button */}
          {!isAnswerChecked && (
            <div className="p-4 bg-white/90 backdrop-blur-md border-t border-[#E4EEE9]">
              <GameButton
                variant={isAnswerProvided() ? 'teal' : 'white'}
                size="lg"
                disabled={!isAnswerProvided()}
                className={`w-full text-base font-black transition-all ${
                  !isAnswerProvided() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handleCheckAnswer}
              >
                بررسی (Check)
              </GameButton>
            </div>
          )}

          {/* Sliding Bottom Feedback Panel */}
          {isAnswerChecked && (
            <div
              className={`p-5 border-t-2 transition-all duration-300 animate-pop-in ${
                isAnswerCorrect
                  ? 'bg-[#E8F8F0] border-[#2F8856] text-[#12746B]'
                  : 'bg-[#FDF2F2] border-[#E5584F] text-[#BA3F37]'
              }`}
            >
              <div className="flex items-start gap-3 mb-3.5">
                <span
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white ${
                    isAnswerCorrect ? 'bg-[#3DAA6D]' : 'bg-[#E5584F]'
                  }`}
                >
                  {isAnswerCorrect ? (
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  ) : (
                    <AlertCircle className="w-6 h-6 stroke-[2.5]" />
                  )}
                </span>

                <div className="flex-1">
                  <h3 className="text-base font-black">
                    {isAnswerCorrect ? 'آفرین! پاسخ درست است 🎉' : 'پاسخ نادرست'}
                  </h3>

                  {!isAnswerCorrect && currentQ.explanation && (
                    <p className="text-xs mt-1 text-[#BA3F37] font-medium leading-relaxed">
                      {currentQ.explanation}
                    </p>
                  )}

                  {!isAnswerCorrect && currentQ.type === 'fill_blank' && (
                    <p className="text-xs font-bold font-en text-[#1D2B33] mt-1 dir-ltr text-left">
                      پاسخ صحیح: {currentQ.acceptedAnswers?.[0]}
                    </p>
                  )}

                  {!isAnswerCorrect && currentQ.type === 'word_order' && currentQ.correctOrder && (
                    <p className="text-xs font-bold font-en text-[#1D2B33] mt-1 dir-ltr text-left">
                      جمله صحیح: {currentQ.correctOrder.join(' ')}
                    </p>
                  )}

                  {!isAnswerCorrect &&
                    (currentQ.type === 'multiple_choice' || currentQ.type === 'listening') &&
                    currentQ.options &&
                    currentQ.answerIndex !== undefined && (
                      <p className="text-xs font-bold font-en text-[#1D2B33] mt-1 dir-ltr text-left">
                        گزینه صحیح: {currentQ.options[currentQ.answerIndex]}
                      </p>
                    )}
                </div>
              </div>

              {/* Continue Button in sliding panel */}
              <GameButton
                variant={isAnswerCorrect ? 'green' : 'coral'}
                size="lg"
                className="w-full text-base font-black"
                onClick={handleContinue}
              >
                ادامه (Continue)
              </GameButton>
            </div>
          )}
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-pop-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-[#E4EEE9] shadow-2xl text-center space-y-3">
            <h3 className="text-base font-black text-[#1D2B33]">
              آیا مطمئنی می‌خواهی درس را ترک کنی؟
            </h3>
            <p className="text-xs text-[#6B7C85] leading-relaxed">
              اگر اکنون خارج شوی، پیشرفت این درس ذخیره نمی‌شود و باید تمرین‌ها را از ابتدا انجام دهی.
            </p>

            <div className="pt-2 space-y-2">
              <GameButton
                variant="teal"
                size="md"
                className="w-full"
                onClick={() => {
                  sounds.playTap();
                  setShowExitConfirm(false);
                }}
              >
                ادامه دادن به یادگیری
              </GameButton>

              <button
                type="button"
                onClick={handleConfirmExit}
                className="w-full py-2.5 text-xs font-bold text-[#E5584F] hover:underline"
              >
                خروج از درس
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
