import { loadProgress, saveProgress, UserProgress } from './storage';
import { sounds } from './sound';

export interface ProgressDelta {
  xpDelta: number;
  heartDelta: number;
  streakDelta: number;
}

const HEART_REFILL_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Checks and calculates passive heart regeneration (1 heart every 30 minutes)
 */
export function checkHeartRefill(current?: UserProgress): UserProgress {
  const prog = current || loadProgress();
  if (prog.hearts >= prog.maxHearts) {
    if (prog.lastHeartRefillTime !== Date.now()) {
      const updated: UserProgress = { ...prog, lastHeartRefillTime: Date.now() };
      saveProgress(updated);
      return updated;
    }
    return prog;
  }

  const now = Date.now();
  const lastRefill = prog.lastHeartRefillTime || now;
  const elapsed = now - lastRefill;

  if (elapsed >= HEART_REFILL_INTERVAL_MS) {
    const heartsToAdd = Math.floor(elapsed / HEART_REFILL_INTERVAL_MS);
    const newHearts = Math.min(prog.maxHearts, prog.hearts + heartsToAdd);
    const newRefillTime = lastRefill + heartsToAdd * HEART_REFILL_INTERVAL_MS;

    const updated: UserProgress = {
      ...prog,
      hearts: newHearts,
      lastHeartRefillTime: newHearts >= prog.maxHearts ? now : newRefillTime,
    };
    saveProgress(updated);
    return updated;
  }

  return prog;
}

/**
 * Increment XP with sound and bounds
 */
export function addXp(amount: number = 10): { newProgress: UserProgress; xpAdded: number } {
  const current = loadProgress();
  const nextXp = Math.max(0, current.xp + amount);
  const nextLeagueScore = Math.max(0, current.leagueScore + amount);
  const updated: UserProgress = {
    ...current,
    xp: nextXp,
    leagueScore: nextLeagueScore,
  };
  saveProgress(updated);
  sounds.playXpGain();
  return { newProgress: updated, xpAdded: amount };
}

/**
 * Decrement heart with sound and bounds
 */
export function loseHeart(amount: number = 1): { newProgress: UserProgress; heartLost: boolean } {
  const current = loadProgress();
  if (current.hearts <= 0) {
    return { newProgress: current, heartLost: false };
  }
  const nextHearts = Math.max(0, current.hearts - amount);
  const updated: UserProgress = {
    ...current,
    hearts: nextHearts,
    lastHeartRefillTime: current.hearts === current.maxHearts ? Date.now() : current.lastHeartRefillTime,
  };
  saveProgress(updated);
  sounds.playHeartLost();
  return { newProgress: updated, heartLost: true };
}

/**
 * Refill hearts to max (e.g., from practice or store)
 */
export function refillHearts(): UserProgress {
  const current = loadProgress();
  const updated: UserProgress = {
    ...current,
    hearts: current.maxHearts,
    lastHeartRefillTime: Date.now(),
  };
  saveProgress(updated);
  sounds.playCorrect();
  return updated;
}

/**
 * Streak increase: Increases once per day when the user finishes at least one lesson
 */
export function recordLessonCompletion(xpEarned: number = 15): {
  newProgress: UserProgress;
  streakIncreased: boolean;
  newStreak: number;
} {
  const current = checkHeartRefill(loadProgress());
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let newStreak = current.streak;
  let streakIncreased = false;

  if (current.lastActiveDay !== today) {
    if (current.lastActiveDay === yesterday) {
      newStreak = current.streak + 1;
    } else {
      newStreak = current.streak === 0 ? 1 : Math.max(1, current.streak + 1);
    }
    streakIncreased = true;
  }

  const nextXp = current.xp + xpEarned;
  const nextLeagueScore = current.leagueScore + xpEarned;

  const updated: UserProgress = {
    ...current,
    xp: nextXp,
    leagueScore: nextLeagueScore,
    streak: newStreak,
    lastActiveDay: today,
  };

  saveProgress(updated);
  return { newProgress: updated, streakIncreased, newStreak };
}

/**
 * Check and advance streak passively
 */
export function checkStreak(current: UserProgress): UserProgress {
  const withHearts = checkHeartRefill(current);
  const today = new Date().toISOString().slice(0, 10);
  if (withHearts.lastActiveDay === today) {
    return withHearts;
  }
  
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let newStreak = withHearts.streak;
  if (withHearts.lastActiveDay === yesterday) {
    // Streak kept intact for today
  } else if (!withHearts.lastActiveDay) {
    newStreak = 1;
  }

  const updated: UserProgress = {
    ...withHearts,
    streak: newStreak,
  };
  saveProgress(updated);
  return updated;
}

/**
 * Grammar progress accessors and mutators
 */
export function getGrammarProgress(): { completedNodes: string[]; currentNodeId: string } {
  const current = checkHeartRefill(loadProgress());
  return {
    completedNodes: current.completedGrammarNodes || [],
    currentNodeId: current.currentGrammarNode || 'g-1',
  };
}

export function completeGrammarNode(nodeId: string, nextNodeId?: string): UserProgress {
  const current = checkHeartRefill(loadProgress());
  const alreadyCompleted = current.completedGrammarNodes.includes(nodeId);
  const nextCompleted = alreadyCompleted
    ? current.completedGrammarNodes
    : [...current.completedGrammarNodes, nodeId];

  const updated: UserProgress = {
    ...current,
    completedGrammarNodes: nextCompleted,
    currentGrammarNode: nextNodeId || (alreadyCompleted ? current.currentGrammarNode : (nextNodeId || nodeId)),
  };
  saveProgress(updated);
  return updated;
}

export function setCurrentGrammarNode(nodeId: string): UserProgress {
  const current = loadProgress();
  const updated: UserProgress = {
    ...current,
    currentGrammarNode: nodeId,
  };
  saveProgress(updated);
  return updated;
}

/**
 * Vocab progress accessors and mutators
 */
export function getVocabProgress(): { completedNodes: string[]; currentNodeId: string } {
  const current = checkHeartRefill(loadProgress());
  return {
    completedNodes: current.completedVocabNodes || [],
    currentNodeId: current.currentVocabNode || 'v-1',
  };
}

export function completeVocabNode(nodeId: string, nextNodeId?: string): UserProgress {
  const current = checkHeartRefill(loadProgress());
  const alreadyCompleted = current.completedVocabNodes.includes(nodeId);
  const nextCompleted = alreadyCompleted
    ? current.completedVocabNodes
    : [...current.completedVocabNodes, nodeId];

  const updated: UserProgress = {
    ...current,
    completedVocabNodes: nextCompleted,
    currentVocabNode: nextNodeId || (alreadyCompleted ? current.currentVocabNode : (nextNodeId || nodeId)),
  };
  saveProgress(updated);
  return updated;
}

export function setCurrentVocabNode(nodeId: string): UserProgress {
  const current = loadProgress();
  const updated: UserProgress = {
    ...current,
    currentVocabNode: nodeId,
  };
  saveProgress(updated);
  return updated;
}

/**
 * Browser Speech Synthesis for Listening and Word pronunciation
 */
export function playEnglishAudio(text: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.88;
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('US')));
    if (enVoice) utterance.voice = enVoice;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis error', e);
  }
}
