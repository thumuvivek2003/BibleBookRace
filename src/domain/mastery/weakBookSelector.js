import { clamp } from '@/utils/array.js';
import { defaultRng } from '@/utils/random.js';
import { accuracyOf, averageTimeOf, evaluateMastery, getMasteryLevel } from './masteryModel.js';

/**
 * Weak-book detection - the heart of the training engine.
 *
 * Instead of asking random questions forever, the app keeps steering practice
 * towards the books that are slow, wrong, or simply never seen, while still
 * revisiting strong books occasionally so they do not decay.
 */

const NEVER_PRACTISED_PRIORITY = 0.8;
const SLOW_REFERENCE_MS = 12000;
const STALE_AFTER_DAYS = 7;
const MIN_PRIORITY = 0.05;

/**
 * @param {object|undefined} stat
 * @param {number} now epoch ms
 * @returns {number} 0..1, higher means "practise this sooner"
 */
export function bookPriority(stat, now = Date.now()) {
  if (!stat || !stat.attempts) return NEVER_PRACTISED_PRIORITY;

  const masteryGap = 1 - getMasteryLevel(evaluateMastery(stat)).rank / 4;
  const inaccuracy = 1 - accuracyOf(stat);
  const slowness = clamp(averageTimeOf(stat) / SLOW_REFERENCE_MS, 0, 1);
  const daysSince = stat.lastPracticedAt
    ? (now - stat.lastPracticedAt) / 86400000
    : STALE_AFTER_DAYS;
  const staleness = clamp(daysSince / STALE_AFTER_DAYS, 0, 1);

  const score = masteryGap * 0.4 + inaccuracy * 0.3 + slowness * 0.2 + staleness * 0.1;
  return clamp(score, MIN_PRIORITY, 1);
}

/**
 * The books that most need work, strongest need first.
 * @param {readonly object[]} books
 * @param {Record<string, object>} bookStats
 * @param {number} count
 */
export function selectWeakBooks(books, bookStats, count = 5, now = Date.now()) {
  return [...books]
    .map((book) => ({ book, priority: bookPriority(bookStats[book.id], now) }))
    .sort((a, b) => b.priority - a.priority || a.book.order - b.book.order)
    .slice(0, count)
    .map((entry) => entry.book);
}

/**
 * A `selectBook` implementation for `createRound` that draws books with a
 * probability proportional to how weak they are.
 *
 * @param {readonly object[]} books pool to draw from
 * @param {Record<string, object>} bookStats
 * @param {import('@/utils/random.js').Rng} [rng]
 */
export function createAdaptiveSelector(books, bookStats, rng = defaultRng, now = Date.now()) {
  return ({ usedBookIds = [] } = {}) => {
    const used = new Set(usedBookIds);
    const pool = books.filter((book) => !used.has(book.id));
    const candidates = pool.length ? pool : books;
    if (!candidates.length) return null;

    const weights = candidates.map((book) => bookPriority(bookStats[book.id], now));
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let ticket = rng() * total;

    for (let index = 0; index < candidates.length; index += 1) {
      ticket -= weights[index];
      if (ticket <= 0) return candidates[index];
    }
    return candidates[candidates.length - 1];
  };
}
