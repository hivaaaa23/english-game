import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { BottomNav, NavTabId } from './components/BottomNav';
import { BackgroundParticles } from './components/BackgroundParticles';
import { CelebrationModal } from './components/CelebrationModal';
import { DemoControls } from './components/DemoControls';
import { SplashScreen } from './components/SplashScreen';
import { GrammarMap } from './pages/GrammarMap';
import { VocabMap } from './pages/VocabMap';
import { Flashcards } from './pages/Flashcards';
import { League } from './pages/League';
import {
  loadProgress,
  saveProgress,
  UserProgress,
  DEFAULT_PROGRESS,
} from './lib/storage';
import { addXp, loseHeart, refillHearts, checkStreak } from './lib/progress';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [activeTab, setActiveTab] = useState<NavTabId>('grammar');
  const [recentXpGained, setRecentXpGained] = useState<number | null>(null);
  const [heartLostTrigger, setHeartLostTrigger] = useState(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [showSplash, setShowSplash] = useState<boolean>(false);

  const [celebrationDetails, setCelebrationDetails] = useState({
    title: 'آفرین! یک گام به جلو رفتی!',
    subtitle: 'امتیازهای جدید به کارنامه زبانی‌ات اضافه شد',
    xpEarned: 15,
  });

  // Initialize progress from localStorage
  useEffect(() => {
    const loaded = loadProgress();
    const withStreak = checkStreak(loaded);
    setProgress(withStreak);

    // Show splash screen on first visit of session
    const hasSeenSplash = sessionStorage.getItem('zabangame_splash_seen');
    if (!hasSeenSplash) {
      setShowSplash(true);
    }
  }, []);

  // Earn XP handler
  const handleEarnXp = (amount: number = 10, celebrationTitle?: string) => {
    const result = addXp(amount);
    setProgress(result.newProgress);
    setRecentXpGained(amount);

    if (celebrationTitle) {
      setCelebrationDetails({
        title: celebrationTitle,
        subtitle: 'پشتکار فوق‌العاده‌ات باعث پیشرفت سریع مکالمه میشه!',
        xpEarned: amount,
      });
      setIsCelebrationOpen(true);
    }
  };

  // Lose Heart handler
  const handleLoseHeart = () => {
    const result = loseHeart(1);
    setProgress(result.newProgress);
    if (result.heartLost) {
      setHeartLostTrigger(true);
      setTimeout(() => setHeartLostTrigger(false), 600);
    }
  };

  // Refill Hearts handler
  const handleRefillHearts = () => {
    const updated = refillHearts();
    setProgress(updated);
  };

  // Trigger win modal
  const handleTriggerCelebration = () => {
    handleEarnXp(25, 'تبریک! فتح قله این هفته 🎉');
  };

  const handleDismissSplash = () => {
    sessionStorage.setItem('zabangame_splash_seen', 'true');
    setShowSplash(false);
  };

  // If Splash Screen active
  if (showSplash) {
    return <SplashScreen onStart={handleDismissSplash} />;
  }

  return (
    <div className="min-h-screen bg-[#F0EFE9] flex justify-center selection:bg-[#1F9A8A] selection:text-white">
      {/* Portrait Phone Container */}
      <main className="w-full max-w-md min-h-screen bg-[#FBF8EE] text-[#1D2B33] relative flex flex-col shadow-2xl sm:border-x sm:border-[#E4EEE9]">
        
        {/* Animated Background Layers */}
        <BackgroundParticles variant={activeTab} />

        {/* Top Bar: Visible on 3 main pages; Hidden on League page per spec */}
        {activeTab !== 'league' && (
          <TopBar
            streak={progress.streak}
            xp={progress.xp}
            hearts={progress.hearts}
            maxHearts={progress.maxHearts}
            recentXpGained={recentXpGained}
            heartLostTrigger={heartLostTrigger}
          />
        )}

        {/* Tab Pages */}
        <div className="flex-1 relative z-10">
          {activeTab === 'grammar' && (
            <GrammarMap
              onEarnXp={(amt) => handleEarnXp(amt, 'درس گرامر با موفقیت کامل شد!')}
              onLoseHeart={handleLoseHeart}
              hearts={progress.hearts}
            />
          )}

          {activeTab === 'vocab' && (
            <VocabMap
              onEarnXp={(amt) => handleEarnXp(amt, 'جزیره لغات تسخیر شد!')}
            />
          )}

          {activeTab === 'flashcards' && (
            <Flashcards
              onEarnXp={(amt) => handleEarnXp(amt)}
            />
          )}

          {activeTab === 'league' && (
            <League
              userXp={progress.leagueScore || progress.xp}
              userStreak={progress.streak}
            />
          )}
        </div>

        {/* Bottom Navigation with 4 chunky tabs */}
        <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Demo Controls: For testing animations & splash */}
        <DemoControls
          onAddXp={() => handleEarnXp(10)}
          onLoseHeart={handleLoseHeart}
          onRefillHearts={handleRefillHearts}
          onTriggerWin={handleTriggerCelebration}
          onOpenSplash={() => setShowSplash(true)}
        />

        {/* Victory Celebration Modal */}
        <CelebrationModal
          isOpen={isCelebrationOpen}
          onClose={() => {
            setIsCelebrationOpen(false);
          }}
          title={celebrationDetails.title}
          subtitle={celebrationDetails.subtitle}
          xpEarned={celebrationDetails.xpEarned}
        />

      </main>
    </div>
  );
}
