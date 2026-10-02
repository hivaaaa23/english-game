import React, { useState, useEffect, useRef } from 'react';
import vocabRawData from '../data/vocab.json';
import { GameButton } from '../components/GameButton';
import {
  Check,
  Lock,
  Play,
  Sparkles,
  BookOpen,
  ArrowRight,
  Award,
  ChevronDown,
  Volume2,
  X,
  Compass,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { sounds } from '../lib/sound';
import {
  getVocabProgress,
  completeVocabNode,
  setCurrentVocabNode,
} from '../lib/progress';

interface VocabWord {
  word: string;
  meaning: string;
  partOfSpeech: string;
  example: string;
  exampleFa?: string;
}

interface VocabNode {
  id: string;
  title: string;
  titleFa: string;
  description: string;
  xp: number;
  words: VocabWord[];
}

interface VocabSection {
  id: string;
  title: string;
  titleFa: string;
  nodes: VocabNode[];
}

interface VocabChapter {
  id: string;
  name: string;
  nameFa: string;
  description: string;
  sections: VocabSection[];
}

interface VocabBook {
  id: string;
  name: string;
  nameFa: string;
  level: string;
  chapters: VocabChapter[];
}

interface VocabMapProps {
  onEarnXp?: (amount: number) => void;
}

// Organic winding path X offsets from center (in px)
const X_OFFSETS = [0, 48, 64, 24, -36, -54];
const ROW_HEIGHT = 104;

export const VocabMap: React.FC<VocabMapProps> = ({ onEarnXp }) => {
  const [selectedBookId, setSelectedBookId] = useState<string>('elementary');
  const [isBookSelectorOpen, setIsBookSelectorOpen] = useState<boolean>(false);
  const [completedNodes, setCompletedNodes] = useState<string[]>([]);
  const [currentNodeId, setCurrentNodeIdState] = useState<string>('v-1');
  const [selectedNode, setSelectedNode] = useState<VocabNode | null>(null);
  const [activeLesson, setActiveLesson] = useState<VocabNode | null>(null);
  const [isLockedNoticeOpen, setIsLockedNoticeOpen] = useState<boolean>(false);
  const [lessonCompletedInView, setLessonCompletedInView] = useState<boolean>(false);

  const currentNodeRef = useRef<HTMLDivElement | null>(null);

  // Current active book and chapter
  const books: VocabBook[] = vocabRawData.books as VocabBook[];
  const currentBook = books.find((b) => b.id === selectedBookId) || books[0];
  const currentChapter = currentBook.chapters[0] || {
    id: 'ch-people',
    name: 'People',
    nameFa: 'افراد و هویت',
    description: 'واژگان توصیف افراد و روابط اجتماعی',
    sections: [],
  };

  // Flatten all nodes across sections of the active chapter
  const allNodes: VocabNode[] = currentChapter.sections.flatMap((s) => s.nodes);

  // Load progress from localStorage on mount
  useEffect(() => {
    const prog = getVocabProgress();
    setCompletedNodes(prog.completedNodes);

    if (prog.currentNodeId && allNodes.some((n) => n.id === prog.currentNodeId)) {
      setCurrentNodeIdState(prog.currentNodeId);
    } else {
      const firstIncomplete = allNodes.find((n) => !prog.completedNodes.includes(n.id));
      const fallbackId = firstIncomplete ? firstIncomplete.id : allNodes[0]?.id || 'v-1';
      setCurrentNodeIdState(fallbackId);
      setCurrentVocabNode(fallbackId);
    }
  }, [selectedBookId]);

  // Smooth scroll to current node when page loads or currentNodeId changes
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
  const getNodeState = (nodeId: string) => {
    const isCompleted = completedNodes.includes(nodeId);
    if (isCompleted) return 'completed';

    const nodeIndex = allNodes.findIndex((n) => n.id === nodeId);
    const isUnlocked =
      nodeIndex === 0 || completedNodes.includes(allNodes[nodeIndex - 1]?.id);

    if (isUnlocked) {
      if (nodeId === currentNodeId) {
        return 'current';
      }
      const firstIncomplete = allNodes.find((n) => !completedNodes.includes(n.id));
      if (firstIncomplete?.id === nodeId) {
        return 'current';
      }
      return 'unlocked';
    }

    return 'locked';
  };

  const handleNodeClick = (node: VocabNode) => {
    const state = getNodeState(node.id);
    sounds.playTap();

    if (state === 'locked') {
      setSelectedNode(node);
      setIsLockedNoticeOpen(true);
      return;
    }

    setIsLockedNoticeOpen(false);
    setSelectedNode(node);
  };

  const handleStartLesson = (node: VocabNode) => {
    sounds.playTap();
    setSelectedNode(null);
    setActiveLesson(node);
    setLessonCompletedInView(completedNodes.includes(node.id));
  };

  const handleFinishLesson = () => {
    if (!activeLesson) return;

    const nodeIndex = allNodes.findIndex((n) => n.id === activeLesson.id);
    const nextNode = allNodes[nodeIndex + 1];
    const nextId = nextNode ? nextNode.id : activeLesson.id;

    // Save progress to localStorage through progress.js
    const updated = completeVocabNode(activeLesson.id, nextId);
    setCompletedNodes(updated.completedVocabNodes);
    setCurrentNodeIdState(nextId);

    // Award XP
    if (onEarnXp && !completedNodes.includes(activeLesson.id)) {
      onEarnXp(activeLesson.xp);
    }
    sounds.playWin();
    setLessonCompletedInView(true);

    setTimeout(() => {
      setActiveLesson(null);
    }, 600);
  };

  // If Lesson Placeholder View is open
  if (activeLesson) {
    const isAlreadyDone = completedNodes.includes(activeLesson.id);

    return (
      <div className="pb-24 pt-3 px-4 max-w-md mx-auto min-h-[85vh] flex flex-col justify-between">
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
                درس واژگان • {currentChapter.name}
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
                  {currentBook.name} • {currentChapter.name}
                </span>
                <h1 className="text-xl font-black text-[#1D2B33] font-en mt-0.5">
                  {activeLesson.title}
                </h1>
                <p className="text-sm font-semibold text-[#6B7C85] mt-1 leading-relaxed">
                  {activeLesson.description}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#DDF3EC] border border-[#BEE3D7] flex items-center justify-center text-[#1F9A8A] shadow-xs">
                <Compass className="w-6 h-6 stroke-[2.2]" />
              </div>
            </div>

            {/* Word List for this Node */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-black text-[#1D2B33]">
                  واژگان این درس ({activeLesson.words.length} کلمه)
                </span>
                <span className="text-[11px] font-bold text-[#1F9A8A]">
                  English Vocabulary
                </span>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {activeLesson.words.map((w, wIdx) => (
                  <div
                    key={wIdx}
                    className="p-3 bg-[#F6FAF8] rounded-2xl border border-[#E4EEE9] flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-en font-black text-sm text-[#12746B]">
                          {w.word}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E5F3EE] text-[#1F9A8A] border border-[#C6E5DA]">
                          {w.partOfSpeech}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#1D2B33]">
                        {w.meaning}
                      </span>
                    </div>

                    <p className="font-en text-xs text-[#6B7C85] dir-ltr text-left mt-0.5">
                      “{w.example}”
                    </p>
                    {w.exampleFa && (
                      <p className="text-[11px] text-[#84969F]">
                        «{w.exampleFa}»
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Placeholder Notice */}
            <div className="p-3 bg-[#EAF7F3] rounded-2xl border border-[#C6EADA] text-center">
              <span className="text-xs font-bold text-[#12746B] flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#1F9A8A]" />
                محیط تمرین تعاملی این لغات در گام بعدی کامل خواهد شد
              </span>
              <p className="text-[11px] text-[#6B7C85] mt-1">
                می‌توانید با دکمه زیر درس را ثبت و امتیاز آن را دریافت کنید.
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
      {/* Book & Chapter Header Card */}
      <div className="game-card p-4 mb-6 bg-white border border-[#E4EEE9] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          {/* Small Book Selector */}
          <div className="relative">
            <button
              onClick={() => {
                sounds.playTap();
                setIsBookSelectorOpen(!isBookSelectorOpen);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#DDF3EC] hover:bg-[#D0EFE5] text-[#12746B] rounded-xl text-xs font-black border border-[#BEE3D7] transition-colors active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>کتاب: {currentBook.name}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Book Picker Dropdown */}
            {isBookSelectorOpen && (
              <div className="absolute top-10 right-0 z-40 w-52 bg-white rounded-2xl shadow-xl border border-[#E4EEE9] p-2 space-y-1 animate-pop-in">
                <span className="text-[10px] font-bold text-[#6B7C85] px-2 block py-1">
                  انتخاب کتاب واژگان:
                </span>
                {books.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      sounds.playTap();
                      setSelectedBookId(b.id);
                      setIsBookSelectorOpen(false);
                    }}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                      b.id === selectedBookId
                        ? 'bg-[#1F9A8A] text-white'
                        : 'hover:bg-[#F6FAF8] text-[#1D2B33]'
                    }`}
                  >
                    <span>{b.nameFa}</span>
                    {b.chapters.length === 0 && (
                      <span className="text-[9px] bg-[#E4EEE9] text-[#6B7C85] px-1.5 py-0.5 rounded-sm">
                        بزودی
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Overall Chapter Progress Badge */}
          <span className="text-xs font-black bg-[#DDF3EC] text-[#12746B] px-3 py-1 rounded-xl border border-[#BEE3D7]">
            {completedNodes.filter((id) => allNodes.some((n) => n.id === id)).length} /{' '}
            {allNodes.length} درس
          </span>
        </div>

        {/* Chapter Title & Description */}
        <div className="flex items-center gap-3 pt-1 border-t border-[#F0F5F3]">
          <span className="w-10 h-10 rounded-2xl bg-[#1F9A8A] flex items-center justify-center text-white font-black text-sm shadow-xs">
            <Compass className="w-5 h-5 text-white" />
          </span>
          <div>
            <span className="text-[10px] font-bold text-[#6B7C85] uppercase tracking-wider block">
              فصل: {currentChapter.name}
            </span>
            <h1 className="text-base font-black text-[#1D2B33] leading-tight">
              {currentChapter.nameFa}
            </h1>
          </div>
        </div>
      </div>

      {/* Sections Vertical List */}
      <div className="space-y-10">
        {currentChapter.sections.map((section, sectionIdx) => {
          // Calculate path points for SVG line
          const points = section.nodes.map((node, idx) => {
            const xOffset = X_OFFSETS[idx % X_OFFSETS.length];
            return {
              id: node.id,
              cx: 160 + xOffset,
              cy: 50 + idx * ROW_HEIGHT,
            };
          });

          const totalHeight = section.nodes.length * ROW_HEIGHT;

          // Generate smooth cubic bezier SVG curve
          let pathD = `M ${points[0].cx} ${points[0].cy}`;
          for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const midY = (p1.cy + p2.cy) / 2;
            pathD += ` C ${p1.cx} ${midY}, ${p2.cx} ${midY}, ${p2.cx} ${p2.cy}`;
          }

          // Count completed in this section
          const completedInSection = section.nodes.filter((n) =>
            completedNodes.includes(n.id)
          ).length;

          return (
            <div key={section.id} className="relative">
              {/* Section Divider & Header Card */}
              <div className="game-card p-3.5 mb-6 bg-white border border-[#E4EEE9] shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-[#DDF3EC] border border-[#BEE3D7] flex items-center justify-center text-[#12746B] font-black text-xs">
                      {sectionIdx + 1}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold text-[#6B7C85] block">
                        {section.title}
                      </span>
                      <h3 className="text-sm font-black text-[#1D2B33]">
                        {section.titleFa}
                      </h3>
                    </div>
                  </div>

                  <span className="text-[11px] font-black bg-[#F6FAF8] text-[#12746B] px-2.5 py-1 rounded-lg border border-[#E4EEE9]">
                    {completedInSection} / {section.nodes.length}
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
                  <path
                    d={pathD}
                    stroke="#BEE3D7"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={pathD}
                    stroke="#97D0BE"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="6 8"
                  />
                </svg>

                {/* Nodes along path */}
                {section.nodes.map((node, idx) => {
                  const state = getNodeState(node.id);
                  const isCurrent = state === 'current';
                  const isCompleted = state === 'completed';
                  const isLocked = state === 'locked';
                  const xOffset = X_OFFSETS[idx % X_OFFSETS.length];

                  return (
                    <div
                      key={node.id}
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

                        {/* Interactive Node Button */}
                        <button
                          type="button"
                          onClick={() => handleNodeClick(node)}
                          aria-label={node.titleFa}
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

                        {/* Small lesson label under node */}
                        <span className="text-[11px] font-bold text-[#1D2B33] mt-2 max-w-[110px] text-center line-clamp-1">
                          {node.titleFa}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Divider between sections */}
              {sectionIdx < currentChapter.sections.length - 1 && (
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
                  این درس لغات هنوز قفل است! برای باز کردن آن، لطفاً ابتدا درس‌های قبلی مسیر را تکمیل کنید.
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
                    {selectedNode.words.length} واژه کلیدی
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

                {/* Words Preview Chips */}
                <div className="mt-3 p-2.5 bg-[#F6FAF8] rounded-xl border border-[#E4EEE9]">
                  <span className="text-[10px] font-bold text-[#12746B] block mb-1.5">
                    پیش‌نمایش کلمات:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.words.slice(0, 5).map((w, idx) => (
                      <span
                        key={idx}
                        className="font-en text-[11px] font-bold bg-white text-[#1D2B33] px-2 py-0.5 rounded-md border border-[#E4EEE9]"
                      >
                        {w.word}
                      </span>
                    ))}
                    {selectedNode.words.length > 5 && (
                      <span className="text-[10px] font-bold text-[#6B7C85] px-1 py-0.5">
                        +{selectedNode.words.length - 5} بیشتر
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <GameButton
                    variant="teal"
                    size="lg"
                    className="w-full text-sm font-black"
                    onClick={() => handleStartLesson(selectedNode)}
                  >
                    <span className="flex items-center gap-1.5">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                      شروع درس واژگان (Start)
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
