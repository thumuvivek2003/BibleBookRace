import { describe, expect, it } from 'vitest';
import { createBookStat, evaluateMastery, MASTERY, masteryDistribution } from './masteryModel.js';
import { bookPriority, selectWeakBooks } from './weakBookSelector.js';

const stat = (attempts, correct, averageMs) => ({
  ...createBookStat(),
  attempts,
  correct,
  totalTimeMs: correct * averageMs,
  lastPracticedAt: Date.now(),
});

describe('mastery', () => {
  it('starts every book at "not yet"', () => {
    expect(evaluateMastery(createBookStat())).toBe(MASTERY.NOT_YET);
    expect(evaluateMastery(undefined)).toBe(MASTERY.NOT_YET);
  });

  it('promotes only when both accuracy and speed are there', () => {
    expect(evaluateMastery(stat(1, 1, 2000))).toBe(MASTERY.LEARNING);
    expect(evaluateMastery(stat(10, 4, 3000))).toBe(MASTERY.LEARNING);
    expect(evaluateMastery(stat(10, 7, 15000))).toBe(MASTERY.FAMILIAR);
    expect(evaluateMastery(stat(10, 9, 15000))).toBe(MASTERY.FAMILIAR);
    expect(evaluateMastery(stat(10, 9, 7000))).toBe(MASTERY.FAST);
    expect(evaluateMastery(stat(10, 10, 3000))).toBe(MASTERY.AUTOMATIC);
  });

  it('counts unpractised books as "not yet"', () => {
    const counts = masteryDistribution({ ephesians: stat(10, 10, 3000) }, 66);
    expect(counts[MASTERY.AUTOMATIC]).toBe(1);
    expect(counts[MASTERY.NOT_YET]).toBe(65);
  });
});

describe('weak book detection', () => {
  it('ranks never-practised books above mastered ones', () => {
    expect(bookPriority(undefined)).toBeGreaterThan(bookPriority(stat(10, 10, 2500)));
  });

  it('ranks slow books above fast ones with the same accuracy', () => {
    expect(bookPriority(stat(10, 10, 14000))).toBeGreaterThan(bookPriority(stat(10, 10, 2500)));
  });

  it('puts the weakest books first', () => {
    const books = [
      { id: 'a', order: 1 },
      { id: 'b', order: 2 },
      { id: 'c', order: 3 },
    ];
    const stats = {
      a: stat(10, 10, 2000),
      b: stat(10, 3, 14000),
      c: stat(10, 8, 6000),
    };
    expect(selectWeakBooks(books, stats, 2).map((book) => book.id)).toEqual(['b', 'c']);
  });
});
