import React, { useState, useEffect, useRef } from 'react';
import grammarSections from '../data/grammar.json';
import { GameButton } from '../components/GameButton';
import {
  Check,
  Lock,
  Play,
  Sparkles,
  BookOpen,
  ArrowRight,
  Award,
  ChevronLeft,
  X,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { sounds } from '../lib/sound';
import {
  getGrammarProgress,
  completeGrammarNode,
  setCurrentGrammarNode,
} from '../lib/progress';
import { Lesson } from './Lesson';

interface GrammarLesson {
  id: string;
  title: string;
  titleFa: string;
  description: string;
  descriptionEn?: string;
  level: string;
  xp: number;
  keyRule?: string;
  sampleSentence?: string;
  sampleSentenceFa?: string;
}

interface GrammarSection {
  id: string;
  title: string;
  titleFa: string;
  description: string;
  lessons: GrammarLesson[];
}

interface GrammarMapProps {
  onEarnXp?: (amount: number) => void;
  onLoseHeart?: () => void;
  hearts?: number;
}

// Organic winding path X offsets from center (in px)
const X_OFFSETS = [0, 48, 64, 24, -36, -54];
const ROW_HEIGHT = 104;

export const GrammarMap: React.FC<GrammarMapProps> = ({
  onEarnXp,
  onLoseHeart,
  hearts = 5,
}) => {
  const [completedNodes, setCompletedNodes] = useState<string[]>([]);
  const [currentNodeId, setCurrentNodeIdState] = useState<string>('g-1');
  const [selectedNode, setSelectedNode] = useState<GrammarLesson | null>(null);
  const [activeLesson, setActiveLesson] = useState<GrammarLesson | null>(null);
  const [isLockedNoticeOpen, setIsLockedNoticeOpen] = useState(false);
  const [lessonCompletedInView, setLessonCompletedInView] = useState(false);

  const currentNodeRef = useRef<HTMLDivElement | null>(null);

  // Flatten all lessons across sections to determine unlocking sequence
  const allLessons: GrammarLesson[] = grammarSections.flatMap((s) => s.lessons);

  // Load progress from localStorage through progress.js on mount
  useEffect(() => {
    const prog = getGrammarProgress();
    setCompletedNodes(prog.completedNodes);

    // If current node is valid, use it; otherwise compute first unlocked incomplete node
    if (prog.currentNodeId && allLessons.some((l) => l.id === prog.currentNodeId)) {
      setCurrentNodeIdState(prog.currentNodeId);
    } else {
      const firstIncomplete = allLessons.find((l) => !prog.completedNodes.includes(l.id));
      const fallbackId = firstIncomplete ? firstIncomplete.id : allLessons[0]?.id || 'g-1';
      setCurrentNodeIdState(fallbackId);
      setCurrentGrammarNode(fallbackId);
    }
  }, []);

  // Smooth scroll to current node when page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentNodeRef.current) {
        currentNodeRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [currentNodeId]);

  // Check state of a specific node
  const getNodeState = (lessonId: string) => {
    const isCompleted = completedNodes.includes(lessonId);
    if (isCompleted) return 'completed';

    const lessonIndex = allLessons.findIndex((l) => l.id === lessonId);
    const isUnlocked =
      lessonIndex === 0 || completedNodes.includes(allLessons[lessonIndex - 1]?.id);

    if (isUnlocked) {
      if (lessonId === currentNodeId) {
        return 'current';
      }
      // If none set as current, first incomplete unlocked is current
      const firstIncomplete = allLessons.find((l) => !completedNodes.includes(l.id));
      if (firstIncomplete?.id === lessonId) {
        return 'current';
      }
      return 'unlocked';
    }

    return 'locked';
  };

  const handleNodeClick = (lesson: GrammarLesson) => {
    const state = getNodeState(lesson.id);
    sounds.playTap();

    if (state === 'locked') {
      setSelectedNode(lesson);
      setIsLockedNoticeOpen(true);
      return;
    }

    setIsLockedNoticeOpen(false);
    setSelectedNode(lesson);
  };

  const handleStartLesson = (lesson: GrammarLesson) => {
    sounds.playTap();
    setSelectedNode(null);
    setActiveLesson(lesson);
    setLessonCompletedInView(completedNodes.includes(lesson.id));
  };

  const handleFinishLesson = () => {
    if (!activeLesson) return;

    const lessonIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
    const nextLesson = allLessons[lessonIndex + 1];
    const nextId = nextLesson ? nextLesson.id : activeLesson.id;

    // Save progress to localStorage through progress.js
    const updated = completeGrammarNode(activeLesson.id, nextId);
    setCompletedNodes(updated.completedGrammarNodes);
    setCurrentNodeIdState(nextId);

    // Award XP
    if (onEarnXp && !completedNodes.includes(activeLesson.id)) {
      onEarnXp(activeLesson.xp);
    }
    sounds.playWin();
    setLessonCompletedInView(true);

    // Return to map after celebratory pause
    setTimeout(() => {
      setActiveLesson(null);
    }, 600);
  };

  // If Lesson Placeholder Page is open
  if (activeLesson) {
    const isAlreadyDone = completedNodes.includes(activeLesson.id);

    return (
      <div className="pb-24 pt-3 px-4 max-w-md mx-auto min-h-[80vh] flex flex-col justify-between">
        <div>
          {/* Top Bar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                sounds.playTap();
                setActiveLesson(null);
              }}
              className="w-10 h-10 rounded-2xl bg-white border border-[#E4EEE9] flex items-center justify-center text-[#1D2B33] shadow-xs active:scale-95 transition-transform"
            >
              <ArrowRight className="w-5 h-5 text-[#1D2B33]" />
            </button>
            <div className="text-center">
              <span className="text-[11px] font-bold text-[#6B7C85] block uppercase tracking-wider">
                صفحه درس گرامر
              </span>
              <h2 className="text-base font-black text-[#1D2B33]">{activeLesson.titleFa}</h2>
            </div>
            <span className="text-xs font-black bg-[#DDF3EC] text-[#12746B] px-3 py-1.5 rounded-xl border border-[#BEE3D7]">
              +{activeLesson.xp} XP
            </span>
          </div>

          {/* Lesson Main Card */}
          <div className="game-card p-5 bg-white border border-[#E4EEE9] space-y-4 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-en text-xs font-black text-[#1F9A8A] block">
                  {activeLesson.level}
                </span>
                <h1 className="text-xl font-black text-[#1D2B33] font-en mt-0.5">
                  {activeLesson.title}
                </h1>
                <p className="text-sm font-semibold text-[#6B7C85] mt-1 leading-relaxed">
                  {activeLesson.description}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#DDF3EC] border border-[#BEE3D7] flex items-center justify-center text-[#1F9A8A] shadow-xs">
                <BookOpen className="w-6 h-6 stroke-[2.2]" />
              </div>
            </div>

            {/* Grammar Key Rule Box */}
            {activeLesson.keyRule && (
              <div className="p-3.5 bg-[#F6FAF8] rounded-2xl border border-[#D7EBE4]">
                <span className="text-[11px] font-bold text-[#12746B] block mb-1">
                  قاعده طلایی (Key Grammar Formula):
                </span>
                <p className="font-en font-black text-sm text-[#1D2B33] dir-ltr text-left">
                  {activeLesson.keyRule}
                </p>
              </div>
            )}

            {/* Sample Sentence */}
            {activeLesson.sampleSentence && (
              <div className="p-3.5 bg-white rounded-2xl border border-[#E4EEE9]">
                <span className="text-[11px] font-bold text-[#6B7C85] block mb-1">
                  مثال کاربردی (Example):
                </span>
                <p className="font-en font-bold text-sm text-[#1F9A8A] dir-ltr text-left">
                  “{activeLesson.sampleSentence}”
                </p>
                {activeLesson.sampleSentenceFa && (
                  <p className="text-xs text-[#6B7C85] mt-1 font-medium">
                    «{activeLesson.sampleSentenceFa}»
                  </p>
                )}
              </div>
            )}

            {/* Placeholder Notice */}
            <div className="p-3 bg-[#EAF7F3] rounded-2xl border border-[#C6EADA] text-center">
              <span className="text-xs font-bold text-[#12746B] flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#1F9A8A]" />
                محیط تعاملی تمرین‌ها در گام بعدی بارگذاری می‌شود
              </span>
              <p className="text-[11px] text-[#6B7C85] mt-1">
                می‌توانید همین حالا درس را تکمیل کنید تا گره بعدی در نقشه باز شود.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4">
          <GameButton
            variant={lessonCompletedInView || isAlreadyDone ? 'green' : 'teal'}
            size="lg"
            className="w-full text-base"
            onClick={handleFinishLesson}
          >
            {lessonCompletedInView || isAlreadyDone ? (
              <span className="flex items-center gap-2">
                <Check className="w-5 h-5 stroke-[3]" />
                درس قبلاً تکمیل شده • بازگشت به نقشه
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                تکمیل درس و دریافت {activeLesson.xp} امتیاز XP
              </span>
            )}
          </GameButton>

          <button
            onClick={() => {
              sounds.playTap();
              setActiveLesson(null);
            }}
            className="w-full py-2.5 text-xs font-bold text-[#6B7C85] hover:text-[#1D2B33] transition-colors"
          >
            بازگشت به نقشه بدون ذخیره
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 pt-2 px-4 max-w-md mx-auto">
      {/* Sections Vertical List */}
      <div className="space-y-10">
        {(grammarSections as GrammarSection[]).map((section, sectionIdx) => {
          // Calculate path points for SVG line
          const points = section.lessons.map((lesson, idx) => {
            const xOffset = X_OFFSETS[idx % X_OFFSETS.length];
            return {
              id: lesson.id,
              cx: 160 + xOffset,
              cy: 50 + idx * ROW_HEIGHT,
            };
          });

          const totalHeight = section.lessons.length * ROW_HEIGHT;

          // Generate smooth cubic bezier SVG curve
          let pathD = `M ${points[0].cx} ${points[0].cy}`;
          for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const midY = (p1.cy + p2.cy) / 2;
            pathD += ` C ${p1.cx} ${midY}, ${p2.cx} ${midY}, ${p2.cx} ${p2.cy}`;
          }

          // Count completed in this section
          const completedInSection = section.lessons.filter((l) =>
            completedNodes.includes(l.id)
          ).length;

          return (
            <div key={section.id} className="relative">
              {/* Section Title Card */}
              <div className="game-card p-4 mb-6 bg-white border border-[#E4EEE9] shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-[#1F9A8A] flex items-center justify-center text-white font-black text-sm shadow-xs">
                      {sectionIdx + 1}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold text-[#6B7C85] uppercase tracking-wider block">
                        {section.title}
                      </span>
                      <h2 className="text-base font-black text-[#1D2B33] leading-tight">
                        {section.titleFa}
                      </h2>
                    </div>
                  </div>

                  <span className="text-xs font-black bg-[#DDF3EC] text-[#12746B] px-3 py-1 rounded-xl border border-[#BEE3D7]">
                    {completedInSection} / {section.lessons.length}
                  </span>
                </div>
              </div>

              {/* Winding Curvy Adventure Path */}
              <div
                className="relative mx-auto w-[320px]"
                style={{ height: `${totalHeight}px` }}
              >
                {/* SVG Connecting Path Line */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox={`0 0 320 ${totalHeight}`}
                  fill="none"
                >
                  {/* Thick Base Path Line */}
                  <path
                    d={pathD}
                    stroke="#BEE3D7"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Inner dashed nature accent line */}
                  <path
                    d={pathD}
                    stroke="#97D0BE"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="6 8"
                  />
                </svg>

                {/* Lesson Nodes Rendered along path */}
                {section.lessons.map((lesson, idx) => {
                  const state = getNodeState(lesson.id);
                  const isCurrent = state === 'current';
                  const isCompleted = state === 'completed';
                  const isLocked = state === 'locked';
                  const xOffset = X_OFFSETS[idx % X_OFFSETS.length];

                  return (
                    <div
                      key={lesson.id}
                      style={{
                        top: `${idx * ROW_HEIGHT}px`,
                        height: `${ROW_HEIGHT}px`,
                      }}
                      className="absolute inset-x-0 flex items-center justify-center"
                    >
                      <div
                        style={{
                          transform: `translateX(${xOffset}px)`,
                        }}
                        ref={isCurrent ? currentNodeRef : undefined}
                        className="relative flex flex-col items-center"
                      >
                        {/* Floating "Start" bubble above current node */}
                        {isCurrent && (
                          <div className="absolute -top-9 px-3.5 py-1 bg-[#12746B] text-white text-xs font-black rounded-full shadow-lg animate-bounce-slight flex items-center gap-1.5 z-20 whitespace-nowrap">
                            <span>شروع</span>
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                            {/* Downward triangle pointer */}
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-[#12746B]" />
                          </div>
                        )}

                        {/* Interactive Lesson Node Button */}
                        <button
                          type="button"
                          onClick={() => handleNodeClick(lesson)}
                          aria-label={lesson.titleFa}
                          className={`
                            relative transition-transform duration-100 select-none
                            active:scale-90 focus:outline-none flex items-center justify-center
                            ${
                              isCompleted
                                ? 'w-18 h-18 rounded-3xl bg-[#3DAA6D] text-white border-2 border-[#2F8856] shadow-[0_5px_0_#2F8856] hover:brightness-105 active:translate-y-1 active:shadow-[0_1px_0_#2F8856]'
                                : isCurrent
                                ? 'w-20 h-20 rounded-3xl bg-[#1F9A8A] text-white border-2 border-[#12746B] shadow-[0_6px_0_#12746B] animate-breathe-gentle ring-4 ring-[#1F9A8A]/25 active:translate-y-1 active:shadow-[0_2px_0_#12746B]'
                                : 'w-18 h-18 rounded-3xl bg-[#E4EEE9] text-[#7B908A] border-2 border-[#CCD8D3] shadow-[0_4px_0_#CCD8D3] active:translate-y-1 active:shadow-[0_1px_0_#CCD8D3]'
                            }
                          `}
                        >
                          {/* Inner Node Icon */}
                          {isCompleted && (
                            <Check className="w-8 h-8 stroke-[3.2] text-white drop-shadow-xs" />
                          )}
                          {isCurrent && (
                            <Play className="w-8 h-8 fill-white text-white drop-shadow-xs ml-0.5" />
                          )}
                          {isLocked && (
                            <Lock className="w-7 h-7 text-[#7B908A]" />
                          )}
                        </button>

                        {/* Small lesson title label under node */}
                        <span className="text-[11px] font-bold text-[#1D2B33] mt-2 max-w-[110px] text-center line-clamp-1">
                          {lesson.titleFa}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Thin Divider Line between sections */}
              {sectionIdx < grammarSections.length - 1 && (
                <div className="mt-8 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#DDF3EC]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1F9A8A]/30" />
                  <div className="h-px flex-1 bg-[#DDF3EC]" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Node Details Popup Modal */}
      {selectedNode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-pop-in"
          onClick={() => setSelectedNode(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-5 border border-[#E4EEE9] shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                sounds.playTap();
                setSelectedNode(null);
              }}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[#F5F8F7] flex items-center justify-center text-[#6B7C85] hover:text-[#1D2B33]"
            >
              <X className="w-4 h-4" />
            </button>

            {isLockedNoticeOpen ? (
              /* Locked Node State Modal */
              <div className="text-center py-3">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#E4EEE9] flex items-center justify-center text-[#7B908A]">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-[#1D2B33]">{selectedNode.titleFa}</h3>
                <span className="font-en text-xs font-bold text-[#6B7C85] block mt-0.5">
                  {selectedNode.title}
                </span>
                <p className="text-sm text-[#6B7C85] mt-3 leading-relaxed">
                  این درس هنوز قفل است! برای باز کردن آن، لطفاً ابتدا درس‌های قبلی مسیر را تکمیل کنید.
                </p>
                <div className="mt-5">
                  <GameButton
                    variant="mint"
                    size="md"
                    className="w-full"
                    onClick={() => {
                      sounds.playTap();
                      setSelectedNode(null);
                    }}
                  >
                    متوجه شدم
                  </GameButton>
                </div>
              </div>
            ) : (
              /* Unlocked / Completed Lesson Modal */
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold bg-[#DDF3EC] text-[#12746B] px-2.5 py-0.5 rounded-full border border-[#BEE3D7]">
                    {selectedNode.level}
                  </span>
                  <span className="text-[10px] font-bold text-[#6B7C85]">
                    +{selectedNode.xp} XP
                  </span>
                </div>

                <h3 className="text-lg font-black text-[#1D2B33] leading-tight">
                  {selectedNode.titleFa}
                </h3>
                <span className="font-en text-xs font-bold text-[#1F9A8A] block mt-0.5">
                  {selectedNode.title}
                </span>

                <p className="text-xs text-[#6B7C85] mt-2.5 leading-relaxed">
                  {selectedNode.description}
                </p>

                {selectedNode.sampleSentence && (
                  <div className="mt-3 p-2.5 bg-[#F6FAF8] rounded-xl border border-[#E4EEE9]">
                    <span className="text-[10px] font-bold text-[#12746B] block mb-0.5">
                      نمونه:
                    </span>
                    <p className="font-en text-xs font-semibold text-[#1D2B33] dir-ltr text-left">
                      {selectedNode.sampleSentence}
                    </p>
                  </div>
                )}

                <div className="mt-5 space-y-2">
                  <GameButton
                    variant="teal"
                    size="lg"
                    className="w-full text-sm font-black"
                    onClick={() => handleStartLesson(selectedNode)}
                  >
                    <span className="flex items-center gap-1.5">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                      شروع درس (Start)
                    </span>
                  </GameButton>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
