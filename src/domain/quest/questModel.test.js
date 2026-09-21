import { describe, expect, it } from 'vitest';
import { createEmptyProgress, recordAttempt } from '@/domain/progress/progressModel.js';
import { buildQuestBooks, getQuest, getQuestAvailability, scoreQuest } from './questModel.js';

describe('quests', () => {
  it('resolves a fixed quest to its exact books', () => {
    const books = buildQuestBooks(getQuest('nt-run'), { progress: createEmptyProgress() });
    expect(books.map((book) => book.id)).toEqual(['john', 'romans', 'ephesians', 'james', 'revelation']);
  });

  it('builds generated quests to the requested size', () => {
    const books = buildQuestBooks(getQuest('random-run'), { progress: createEmptyProgress() });
    expect(books).toHaveLength(5);
  });

  it('locks a quest until enough books have been practised', () => {
    let progress = createEmptyProgress();
    const quest = getQuest('random-run');
    expect(getQuestAvailability(quest, progress).unlocked).toBe(false);

    for (let index = 0; index < 10; index += 1) {
      progress = recordAttempt(progress, {
        bookId: `book-${index}`,
        gameId: 'bible-map',
        correct: true,
        timeMs: 1000,
      });
    }
    expect(getQuestAvailability(quest, progress).unlocked).toBe(true);
  });

  it('awards three stars only for a fast, flawless run', () => {
    const fast = [1, 2, 3].map(() => ({ correct: true, timeMs: 6000 }));
    const slow = [1, 2, 3].map(() => ({ correct: true, timeMs: 30000 }));
    const nearlyThere = [
      { correct: true, timeMs: 8000 },
      { correct: true, timeMs: 8000 },
      { correct: true, timeMs: 8000 },
      { correct: true, timeMs: 8000 },
      { correct: false, timeMs: 8000 },
    ];
    const shaky = [
      { correct: true, timeMs: 5000 },
      { correct: false, timeMs: 5000 },
    ];

    expect(scoreQuest(fast).stars).toBe(3);
    expect(scoreQuest(slow).stars).toBe(1);
    expect(scoreQuest(nearlyThere)).toMatchObject({ stars: 2, accuracy: 0.8, bestStreak: 4 });
    expect(scoreQuest(shaky)).toMatchObject({ stars: 1, accuracy: 0.5, bestStreak: 1 });
  });
});
