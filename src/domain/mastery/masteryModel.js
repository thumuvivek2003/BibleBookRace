import { average, clamp } from '@/utils/array.js';

/**
 * Mastery is the app's progression system - not XP, not badges.
 * "Do you know this book, and can your hand reach it quickly?"
 */

export const MASTERY = Object.freeze({
  NOT_YET: 'not-yet',
  LEARNING: 'learning',
  FAMILIAR: 'familiar',
  FAST: 'fast',
  AUTOMATIC: 'automatic',
});

/** Ordered weakest -> strongest. `tone` maps onto the theme colour tokens. */
export const masteryLevels = Object.freeze([
  { id: MASTERY.NOT_YET, rank: 0, tone: 'ink-subtle', emoji: '⚪' },
  { id: MASTERY.LEARNING, rank: 1, tone: 'danger', emoji: '🔴' },
  { id: MASTERY.FAMILIAR, rank: 2, tone: 'warning', emoji: '🟡' },
  { id: MASTERY.FAST, rank: 3, tone: 'success', emoji: '🟢' },
  { id: MASTERY.AUTOMATIC, rank: 4, tone: 'info', emoji: '🔵' },
]);

const masteryById = new Map(masteryLevels.map((level) => [level.id, level]));

export function getMasteryLevel(id) {
  return masteryById.get(id) ?? masteryById.get(MASTERY.NOT_YET);
}

/** An empty per-book record. */
export function createBookStat() {
  return {
    attempts: 0,
    correct: 0,
    totalTimeMs: 0,
    bestTimeMs: null,
    lastPracticedAt: null,
  };
}

export function accuracyOf(stat) {
  if (!stat || !stat.attempts) return 0;
  return stat.correct / stat.attempts;
}

export function averageTimeOf(stat) {
  if (!stat || !stat.correct) return 0;
  return stat.totalTimeMs / stat.correct;
}

/**
 * Thresholds are deliberately generous at the bottom (a child should reach
 * "Learning" quickly) and strict at the top (automatic means automatic).
 */
const THRESHOLDS = Object.freeze({
  minAttempts: 3,
  familiar: { accuracy: 0.6 },
  fast: { accuracy: 0.8, averageTimeMs: 9000 },
  automatic: { accuracy: 0.9, averageTimeMs: 5500, attempts: 6 },
});

/**
 * @param {ReturnType<typeof createBookStat>} stat
 * @returns {string} a MASTERY id
 */
export function evaluateMastery(stat) {
  if (!stat || stat.attempts === 0) return MASTERY.NOT_YET;
  if (stat.attempts < THRESHOLDS.minAttempts) return MASTERY.LEARNING;

  const accuracy = accuracyOf(stat);
  const averageTime = averageTimeOf(stat);

  if (
    accuracy >= THRESHOLDS.automatic.accuracy &&
    averageTime > 0 &&
    averageTime <= THRESHOLDS.automatic.averageTimeMs &&
    stat.attempts >= THRESHOLDS.automatic.attempts
  ) {
    return MASTERY.AUTOMATIC;
  }
  if (
    accuracy >= THRESHOLDS.fast.accuracy &&
    averageTime > 0 &&
    averageTime <= THRESHOLDS.fast.averageTimeMs
  ) {
    return MASTERY.FAST;
  }
  if (accuracy >= THRESHOLDS.familiar.accuracy) return MASTERY.FAMILIAR;
  return MASTERY.LEARNING;
}

/** 0..1 - how far this book has travelled towards "automatic". */
export function masteryRatio(stat) {
  const level = getMasteryLevel(evaluateMastery(stat));
  return clamp(level.rank / 4, 0, 1);
}

/** Overall readiness across every book, for the progress ring. */
export function overallMastery(bookStats, totalBooks) {
  const ratios = Object.values(bookStats).map((stat) => masteryRatio(stat));
  const padded = [...ratios, ...Array(Math.max(0, totalBooks - ratios.length)).fill(0)];
  return average(padded);
}

/** How many books sit at each mastery level (unpractised books count as "not yet"). */
export function masteryDistribution(bookStats, totalBooks) {
  const counts = Object.fromEntries(masteryLevels.map((level) => [level.id, 0]));
  Object.values(bookStats).forEach((stat) => {
    counts[evaluateMastery(stat)] += 1;
  });
  const seen = Object.keys(bookStats).length;
  counts[MASTERY.NOT_YET] += Math.max(0, totalBooks - seen);
  return counts;
}
