import { getAllBooks, TOTAL_BOOKS } from '@/domain/books/bookRepository.js';
import {
  accuracyOf,
  averageTimeOf,
  createBookStat,
  evaluateMastery,
  masteryDistribution,
  overallMastery,
} from '@/domain/mastery/masteryModel.js';
import { selectWeakBooks } from '@/domain/mastery/weakBookSelector.js';
import { average } from '@/utils/array.js';

/**
 * Derived reads over the progress document. Components call these instead of
 * digging into the shape themselves, so the storage format can change freely.
 */

export function getBookStat(progress, bookId) {
  return progress.bookStats[bookId] ?? createBookStat();
}

export function getBookMastery(progress, bookId) {
  return evaluateMastery(getBookStat(progress, bookId));
}

export function getBooksPractisedCount(progress) {
  return Object.values(progress.bookStats).filter((stat) => stat.attempts > 0).length;
}

export function getOverallAccuracy(progress) {
  const { attempts, correct } = progress.totals;
  return attempts ? correct / attempts : 0;
}

/** Mean time over correct answers only - a wrong answer's clock is meaningless. */
export function getAverageAnswerTime(progress) {
  const times = Object.values(progress.bookStats)
    .filter((stat) => stat.correct > 0)
    .map((stat) => averageTimeOf(stat));
  return average(times);
}

export function getMasteryBreakdown(progress) {
  return masteryDistribution(progress.bookStats, TOTAL_BOOKS);
}

export function getOverallMasteryRatio(progress) {
  return overallMastery(progress.bookStats, TOTAL_BOOKS);
}

export function getWeakBooks(progress, count = 5, now = Date.now()) {
  return selectWeakBooks(getAllBooks(), progress.bookStats, count, now);
}

/** The single weakest section, used for the "focus on this" nudge. */
export function getWeakestSection(progress) {
  const bySection = new Map();
  getAllBooks().forEach((book) => {
    const stat = progress.bookStats[book.id];
    const score = stat?.attempts ? accuracyOf(stat) : 0;
    const bucket = bySection.get(book.sectionId) ?? [];
    bucket.push(score);
    bySection.set(book.sectionId, bucket);
  });

  let weakest = null;
  bySection.forEach((scores, sectionId) => {
    const value = average(scores);
    if (!weakest || value < weakest.score) weakest = { sectionId, score: value };
  });
  return weakest;
}

export function getDailyGoalRatio(progress, goalMinutes) {
  if (!goalMinutes) return 0;
  return Math.min(1, progress.daily.practiceMs / (goalMinutes * 60000));
}

export function getLevelStat(progress, levelId) {
  return progress.levelStats[levelId] ?? { rounds: 0, bestAccuracy: 0, lastPlayedAt: null };
}

export function getQuestStat(progress, questId) {
  return (
    progress.quests[questId] ?? {
      completions: 0,
      bestAccuracy: 0,
      bestTimeMs: null,
      lastCompletedAt: null,
    }
  );
}
