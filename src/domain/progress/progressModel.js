import { toDayKey } from '@/utils/format.js';
import { clamp } from '@/utils/array.js';
import { createBookStat } from '@/domain/mastery/masteryModel.js';

/**
 * The progress document and the pure reducers that evolve it.
 *
 * Every function here is `(progress, event) -> newProgress`. No React, no
 * localStorage, no Date.now() hidden inside - callers pass `at`/`dayKey`, which
 * keeps the whole model deterministic and testable.
 */

export const PROGRESS_VERSION = 2;
const RECENT_ATTEMPTS_KEPT = 120;

export function createEmptyProgress(at = Date.now()) {
  return {
    version: PROGRESS_VERSION,
    createdAt: at,
    updatedAt: at,
    bookStats: {},
    gameStats: {},
    quests: {},
    daily: { dayKey: toDayKey(new Date(at)), practiceMs: 0, questionsAnswered: 0 },
    streak: { current: 0, longest: 0, lastDayKey: null },
    totals: {
      attempts: 0,
      correct: 0,
      timeMs: 0,
      roundsCompleted: 0,
      questsCompleted: 0,
    },
    recentAttempts: [],
  };
}

/** Rolls the daily counters over at midnight and keeps the streak honest. */
export function startDay(progress, dayKey = toDayKey()) {
  if (progress.daily.dayKey === dayKey) return progress;
  return {
    ...progress,
    daily: { dayKey, practiceMs: 0, questionsAnswered: 0 },
  };
}

/**
 * @param {object} progress
 * @param {{ bookId: string, gameId: string, correct: boolean, timeMs: number, at?: number }} attempt
 */
export function recordAttempt(progress, attempt) {
  const at = attempt.at ?? Date.now();
  const base = startDay(progress, toDayKey(new Date(at)));
  const previous = base.bookStats[attempt.bookId] ?? createBookStat();
  const timeMs = Math.max(0, attempt.timeMs ?? 0);

  const stat = {
    attempts: previous.attempts + 1,
    correct: previous.correct + (attempt.correct ? 1 : 0),
    totalTimeMs: previous.totalTimeMs + (attempt.correct ? timeMs : 0),
    bestTimeMs:
      attempt.correct && timeMs > 0
        ? Math.min(previous.bestTimeMs ?? Number.POSITIVE_INFINITY, timeMs)
        : previous.bestTimeMs,
    lastPracticedAt: at,
  };

  return {
    ...base,
    updatedAt: at,
    bookStats: { ...base.bookStats, [attempt.bookId]: stat },
    daily: { ...base.daily, questionsAnswered: base.daily.questionsAnswered + 1 },
    totals: {
      ...base.totals,
      attempts: base.totals.attempts + 1,
      correct: base.totals.correct + (attempt.correct ? 1 : 0),
      timeMs: base.totals.timeMs + timeMs,
    },
    recentAttempts: [
      { ...attempt, at, timeMs },
      ...base.recentAttempts,
    ].slice(0, RECENT_ATTEMPTS_KEPT),
  };
}

/** Practice minutes feed the "Today's goal" card. */
export function recordPracticeTime(progress, ms, at = Date.now()) {
  const base = startDay(progress, toDayKey(new Date(at)));
  return {
    ...base,
    updatedAt: at,
    daily: { ...base.daily, practiceMs: base.daily.practiceMs + Math.max(0, ms) },
  };
}

/**
 * Streak rules: practising today extends yesterday's streak, repeats keep it,
 * and a missed day resets it to 1.
 */
export function registerActiveDay(progress, dayKey = toDayKey()) {
  const { streak } = progress;
  if (streak.lastDayKey === dayKey) return progress;

  const yesterday = toDayKey(new Date(new Date(`${dayKey}T00:00:00`).getTime() - 86400000));
  const current = streak.lastDayKey === yesterday ? streak.current + 1 : 1;

  return {
    ...startDay(progress, dayKey),
    streak: {
      current,
      longest: Math.max(streak.longest, current),
      lastDayKey: dayKey,
    },
  };
}

/**
 * @param {object} progress
 * @param {{ gameId: string, accuracy: number, at?: number }} result
 */
export function completeRound(progress, { gameId, accuracy, at = Date.now() }) {
  const previous = progress.gameStats[gameId] ?? { rounds: 0, bestAccuracy: 0, lastPlayedAt: null };
  const withDay = registerActiveDay(progress, toDayKey(new Date(at)));

  return {
    ...withDay,
    updatedAt: at,
    gameStats: {
      ...withDay.gameStats,
      [gameId]: {
        rounds: previous.rounds + 1,
        bestAccuracy: Math.max(previous.bestAccuracy, clamp(accuracy, 0, 1)),
        lastPlayedAt: at,
      },
    },
    totals: { ...withDay.totals, roundsCompleted: withDay.totals.roundsCompleted + 1 },
  };
}

/**
 * @param {object} progress
 * @param {{ questId: string, accuracy: number, totalTimeMs: number, at?: number }} result
 */
export function completeQuest(progress, { questId, accuracy, totalTimeMs, at = Date.now() }) {
  const previous = progress.quests[questId] ?? {
    completions: 0,
    bestAccuracy: 0,
    bestTimeMs: null,
    lastCompletedAt: null,
  };
  const withDay = registerActiveDay(progress, toDayKey(new Date(at)));

  return {
    ...withDay,
    updatedAt: at,
    quests: {
      ...withDay.quests,
      [questId]: {
        completions: previous.completions + 1,
        bestAccuracy: Math.max(previous.bestAccuracy, clamp(accuracy, 0, 1)),
        bestTimeMs: Math.min(previous.bestTimeMs ?? Number.POSITIVE_INFINITY, totalTimeMs),
        lastCompletedAt: at,
      },
    },
    totals: { ...withDay.totals, questsCompleted: withDay.totals.questsCompleted + 1 },
  };
}

export function resetProgress(at = Date.now()) {
  return createEmptyProgress(at);
}

/**
 * Upgrades a document written by an older version of the app.
 *
 * Each step is a small pure function, applied in order. Book mastery is the
 * part a learner actually earned over weeks, so a rename must never be an
 * excuse to throw it away - only genuinely unreadable documents start fresh.
 */
const MIGRATIONS = {
  // v1 -> v2: training levels became individual games. Per-game round counts
  // are cheap to rebuild, book mastery is not, so the stats keyed by the old
  // level ids are dropped and everything else is carried across.
  1: ({ levelStats: _levelStats, ...rest }) => ({ ...rest, version: 2, gameStats: {} }),
};

export function migrateProgress(stored) {
  if (!stored || typeof stored !== 'object' || typeof stored.version !== 'number') {
    return createEmptyProgress();
  }

  let document = stored;
  while (document.version < PROGRESS_VERSION) {
    const step = MIGRATIONS[document.version];
    if (!step) return createEmptyProgress();
    document = step(document);
  }

  // Fill in any field added since the document was written.
  return { ...createEmptyProgress(document.createdAt ?? Date.now()), ...document };
}
