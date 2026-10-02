import {
  loadProgress,
  saveProgress,
  resetProgress,
  DEFAULT_PROGRESS
} from './storage';
import { sounds } from './sound';

export {
  loadProgress,
  saveProgress,
  resetProgress,
  DEFAULT_PROGRESS
};

const HEART_REFILL_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export function checkHeartRefill(current) {
  const prog = current || loadProgress();
  if (prog.hearts >= prog.maxHearts) {
    return prog;
  }

  const now = Date.now();
  const lastRefill = prog.lastHeartRefillTime || now;
  const elapsed = now - lastRefill;

  if (elapsed >= HEART_REFILL_INTERVAL_MS) {
    const heartsToAdd = Math.floor(elapsed / HEART_REFILL_INTERVAL_MS);
    const newHearts = Math.min(prog.maxHearts, prog.hearts + heartsToAdd);
    const newRefillTime = lastRefill + heartsToAdd * HEART_REFILL_INTERVAL_MS;

    const updated = {
      ...prog,
      hearts: newHearts,
      lastHeartRefillTime: newHearts >= prog.maxHearts ? now : newRefillTime,
    };
    saveProgress(updated);
    return updated;
  }

  return prog;
}

export function addXp(amount = 10) {
  const current = checkHeartRefill(loadProgress());
  const nextXp = Math.max(0, current.xp + amount);
  const nextLeagueScore = Math.max(0, (current.leagueScore || 0) + amount);
  const updated = {
    ...current,
    xp: nextXp,
    leagueScore: nextLeagueScore,
  };
  saveProgress(updated);
  sounds.playXpGain();
  return { newProgress: updated, xpAdded: amount };
}

export function loseHeart(amount = 1) {
  const current = loadProgress();
  if (current.hearts <= 0) {
    return { newProgress: current, heartLost: false };
  }
  const nextHearts = Math.max(0, current.hearts - amount);
  const updated = {
    ...current,
    hearts: nextHearts,
    lastHeartRefillTime: current.hearts === current.maxHearts ? Date.now() : current.lastHeartRefillTime,
  };
  saveProgress(updated);
  sounds.playHeartLost();
  return { newProgress: updated, heartLost: true };
}

export function refillHearts() {
  const current = loadProgress();
  const updated = {
    ...current,
    hearts: current.maxHearts,
    lastHeartRefillTime: Date.now(),
  };
  saveProgress(updated);
  sounds.playCorrect();
  return updated;
}

export function recordLessonCompletion(xpEarned = 15) {
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
  const nextLeagueScore = (current.leagueScore || 0) + xpEarned;

  const updated = {
    ...current,
    xp: nextXp,
    leagueScore: nextLeagueScore,
    streak: newStreak,
    lastActiveDay: today,
  };

  saveProgress(updated);
  return { newProgress: updated, streakIncreased, newStreak };
}

export function checkStreak(current) {
  const withHearts = checkHeartRefill(current);
  const today = new Date().toISOString().slice(0, 10);
  if (withHearts.lastActiveDay === today) {
    return withHearts;
  }
  
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let newStreak = withHearts.streak;
  if (withHearts.lastActiveDay === yesterday) {
    // Keep streak
  } else if (!withHearts.lastActiveDay) {
    newStreak = 1;
  }

  const updated = {
    ...withHearts,
    streak: newStreak,
  };
  saveProgress(updated);
  return updated;
}

export function getGrammarProgress() {
  const current = checkHeartRefill(loadProgress());
  return {
    completedNodes: current.completedGrammarNodes || [],
    currentNodeId: current.currentGrammarNode || 'g-1',
  };
}

export function completeGrammarNode(nodeId, nextNodeId) {
  const current = checkHeartRefill(loadProgress());
  const alreadyCompleted = (current.completedGrammarNodes || []).includes(nodeId);
  const nextCompleted = alreadyCompleted
    ? current.completedGrammarNodes
    : [...(current.completedGrammarNodes || []), nodeId];

  const updated = {
    ...current,
    completedGrammarNodes: nextCompleted,
    currentGrammarNode: nextNodeId || current.currentGrammarNode || nodeId,
  };
  saveProgress(updated);
  return updated;
}

export function setCurrentGrammarNode(nodeId) {
  const current = loadProgress();
  const updated = {
    ...current,
    currentGrammarNode: nodeId,
  };
  saveProgress(updated);
  return updated;
}

export function getVocabProgress() {
  const current = checkHeartRefill(loadProgress());
  return {
    completedNodes: current.completedVocabNodes || [],
    currentNodeId: current.currentVocabNode || 'v-1',
  };
}

export function completeVocabNode(nodeId, nextNodeId) {
  const current = checkHeartRefill(loadProgress());
  const alreadyCompleted = (current.completedVocabNodes || []).includes(nodeId);
  const nextCompleted = alreadyCompleted
    ? current.completedVocabNodes
    : [...(current.completedVocabNodes || []), nodeId];

  const updated = {
    ...current,
    completedVocabNodes: nextCompleted,
    currentVocabNode: nextNodeId || current.currentVocabNode || nodeId,
  };
  saveProgress(updated);
  return updated;
}

export function setCurrentVocabNode(nodeId) {
  const current = loadProgress();
  const updated = {
    ...current,
    currentVocabNode: nodeId,
  };
  saveProgress(updated);
  return updated;
}

export function playEnglishAudio(text) {
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
