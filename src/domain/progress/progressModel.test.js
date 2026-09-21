import { describe, expect, it } from 'vitest';
import { toDayKey } from '@/utils/format.js';
import {
  completeQuest,
  createEmptyProgress,
  migrateProgress,
  recordAttempt,
  registerActiveDay,
} from './progressModel.js';
import { getBooksPractisedCount, getOverallAccuracy } from './progressSelectors.js';

const dayKey = (offsetDays) => toDayKey(new Date(Date.now() + offsetDays * 86400000));

describe('progress model', () => {
  it('never mutates the document it is given', () => {
    const before = createEmptyProgress();
    const after = recordAttempt(before, { bookId: 'john', levelId: 'bible-map', correct: true, timeMs: 1000 });
    expect(before.totals.attempts).toBe(0);
    expect(after.totals.attempts).toBe(1);
  });

  it('only counts time from correct answers towards a book average', () => {
    let progress = createEmptyProgress();
    progress = recordAttempt(progress, { bookId: 'john', levelId: 'l', correct: true, timeMs: 2000 });
    progress = recordAttempt(progress, { bookId: 'john', levelId: 'l', correct: false, timeMs: 9000 });

    expect(progress.bookStats.john).toMatchObject({ attempts: 2, correct: 1, totalTimeMs: 2000, bestTimeMs: 2000 });
    expect(getOverallAccuracy(progress)).toBe(0.5);
    expect(getBooksPractisedCount(progress)).toBe(1);
  });

  it('extends a streak across consecutive days and resets after a gap', () => {
    let progress = registerActiveDay(createEmptyProgress(), dayKey(-2));
    expect(progress.streak.current).toBe(1);

    progress = registerActiveDay(progress, dayKey(-1));
    expect(progress.streak.current).toBe(2);

    progress = registerActiveDay(progress, dayKey(-1));
    expect(progress.streak.current).toBe(2); // same day twice changes nothing

    progress = registerActiveDay(progress, dayKey(2));
    expect(progress.streak.current).toBe(1);
    expect(progress.streak.longest).toBe(2);
  });

  it('keeps the best quest time, not the latest', () => {
    let progress = completeQuest(createEmptyProgress(), { questId: 'nt-run', accuracy: 0.8, totalTimeMs: 40000 });
    progress = completeQuest(progress, { questId: 'nt-run', accuracy: 1, totalTimeMs: 52000 });

    expect(progress.quests['nt-run']).toMatchObject({ completions: 2, bestAccuracy: 1, bestTimeMs: 40000 });
    expect(progress.totals.questsCompleted).toBe(2);
  });

  it('falls back to a fresh document for unknown stored shapes', () => {
    expect(migrateProgress(null).version).toBe(1);
    expect(migrateProgress({ version: 0, junk: true }).totals.attempts).toBe(0);
    expect(migrateProgress({ version: 1, totals: { attempts: 7, correct: 7, timeMs: 0, roundsCompleted: 1, questsCompleted: 0 } }).totals.attempts).toBe(7);
  });
});
