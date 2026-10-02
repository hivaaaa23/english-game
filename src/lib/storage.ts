/**
 * Simple, reliable localStorage manager
 */

export interface UserProgress {
  xp: number;
  hearts: number;
  maxHearts: number;
  streak: number;
  lastActiveDay: string;
  completedGrammarNodes: string[];
  completedVocabNodes: string[];
  currentGrammarNode: string;
  currentVocabNode: string;
  lastHeartRefillTime: number;
  reviewedFlashcards: Record<string, 'known' | 'learning'>;
  leagueScore: number;
}

const STORAGE_KEY = 'zabangame_user_progress_v1';

export const DEFAULT_PROGRESS: UserProgress = {
  xp: 140,
  hearts: 5,
  maxHearts: 5,
  streak: 4,
  lastActiveDay: new Date().toISOString().slice(0, 10),
  completedGrammarNodes: ['g-1', 'g-2'],
  completedVocabNodes: ['v-1'],
  currentGrammarNode: 'g-3',
  currentVocabNode: 'v-2',
  lastHeartRefillTime: Date.now(),
  reviewedFlashcards: {},
  leagueScore: 420,
};

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      lastHeartRefillTime: parsed.lastHeartRefillTime || Date.now(),
    };
  } catch (e) {
    console.warn('Failed to load progress from localStorage', e);
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(data: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save progress to localStorage', e);
  }
}

export function resetProgress(): UserProgress {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return DEFAULT_PROGRESS;
}
