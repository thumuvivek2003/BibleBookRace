import { quests } from '@/data/quests.js';
import { getAllBooks, getBookById, getBooksInSection } from '@/domain/books/bookRepository.js';
import { selectWeakBooks } from '@/domain/mastery/weakBookSelector.js';
import { getBooksPractisedCount } from '@/domain/progress/progressSelectors.js';
import { average } from '@/utils/array.js';
import { defaultRng, pickMany } from '@/utils/random.js';

/** Quest rules: which quests are open, what books they contain, how they score. */

export function getQuests() {
  return quests;
}

export function getQuest(questId) {
  return quests.find((quest) => quest.id === questId) ?? null;
}

/**
 * @returns {{ unlocked: boolean, requirement: object|null }}
 */
export function getQuestAvailability(quest, progress) {
  if (!quest.unlock) return { unlocked: true, requirement: null };

  if (typeof quest.unlock.booksPractised === 'number') {
    const practised = getBooksPractisedCount(progress);
    return {
      unlocked: practised >= quest.unlock.booksPractised,
      requirement: { kind: 'booksPractised', need: quest.unlock.booksPractised, have: practised },
    };
  }
  if (typeof quest.unlock.questsCompleted === 'number') {
    const done = progress.totals.questsCompleted;
    return {
      unlocked: done >= quest.unlock.questsCompleted,
      requirement: { kind: 'questsCompleted', need: quest.unlock.questsCompleted, have: done },
    };
  }
  return { unlocked: true, requirement: null };
}

/**
 * Resolves a quest into the concrete list of books to find.
 * Fixed quests always give the same run; generated ones are built fresh, which
 * is what makes "Random Bible Run" replayable.
 */
export function buildQuestBooks(quest, { progress, rng = defaultRng, now = Date.now() } = {}) {
  if (quest.bookIds) return quest.bookIds.map(getBookById).filter(Boolean);

  const { kind, size = 5, sectionId } = quest.generator ?? {};
  switch (kind) {
    case 'section':
      return pickMany(getBooksInSection(sectionId), size, rng);
    case 'weak':
      return selectWeakBooks(getAllBooks(), progress?.bookStats ?? {}, size, now);
    case 'random':
    default:
      return pickMany(getAllBooks(), size, rng);
  }
}

/** Preview list shown on the quest card before starting. */
export function previewQuestBooks(quest, { progress, rng, now } = {}) {
  return buildQuestBooks(quest, { progress, rng, now });
}

const STAR_RULES = Object.freeze([
  { stars: 3, accuracy: 1, averageTimeMs: 12000 },
  { stars: 2, accuracy: 0.8, averageTimeMs: 20000 },
  { stars: 1, accuracy: 0.5, averageTimeMs: Number.POSITIVE_INFINITY },
]);

/**
 * @param {{ bookId: string, correct: boolean, timeMs: number }[]} results
 */
export function scoreQuest(results) {
  const total = results.length;
  const correct = results.filter((result) => result.correct).length;
  const accuracy = total ? correct / total : 0;
  const totalTimeMs = results.reduce((sum, result) => sum + (result.timeMs ?? 0), 0);
  const averageTimeMs = average(results.map((result) => result.timeMs ?? 0));
  const bestStreak = longestStreak(results);

  const rule = STAR_RULES.find(
    (candidate) => accuracy >= candidate.accuracy && averageTimeMs <= candidate.averageTimeMs,
  );

  return {
    total,
    correct,
    accuracy,
    totalTimeMs,
    averageTimeMs,
    bestStreak,
    stars: rule?.stars ?? 0,
  };
}

function longestStreak(results) {
  let best = 0;
  let current = 0;
  results.forEach((result) => {
    current = result.correct ? current + 1 : 0;
    best = Math.max(best, current);
  });
  return best;
}
