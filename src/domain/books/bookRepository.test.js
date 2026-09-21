import { describe, expect, it } from 'vitest';
import {
  getAllBooks,
  getBookById,
  getNextBook,
  getNeighbourhood,
  getPreviousBook,
  getRun,
  searchBooks,
  TOTAL_BOOKS,
} from './bookRepository.js';

describe('bookRepository', () => {
  it('holds the whole canon, in order', () => {
    expect(TOTAL_BOOKS).toBe(66);
    expect(getAllBooks().filter((book) => book.testament === 'OT')).toHaveLength(39);
    expect(getAllBooks().filter((book) => book.testament === 'NT')).toHaveLength(27);
    expect(getAllBooks().map((book) => book.order)).toEqual(
      Array.from({ length: 66 }, (_, index) => index + 1),
    );
  });

  it('derives neighbours from canonical order', () => {
    expect(getNextBook('galatians').id).toBe('ephesians');
    expect(getPreviousBook('ephesians').id).toBe('galatians');
    expect(getNextBook('ephesians').id).toBe('philippians');
  });

  it('has no neighbour past the ends of the canon', () => {
    expect(getPreviousBook('genesis')).toBeNull();
    expect(getNextBook('revelation')).toBeNull();
  });

  it('clips neighbourhoods at the ends instead of wrapping', () => {
    expect(getNeighbourhood('genesis', 2).map((book) => book.id)).toEqual([
      'genesis',
      'exodus',
      'leviticus',
    ]);
    expect(getNeighbourhood('ephesians', 1).map((book) => book.id)).toEqual([
      'galatians',
      'ephesians',
      'philippians',
    ]);
  });

  it('always returns a full run, even at the edges', () => {
    expect(getRun('genesis', 5)).toHaveLength(5);
    expect(getRun('revelation', 5)).toHaveLength(5);
    expect(getRun('revelation', 5).at(-1).id).toBe('revelation');
  });

  it('searches in every language', () => {
    expect(searchBooks('ephes').map((book) => book.id)).toEqual(['ephesians']);
    expect(searchBooks('కీర్తన').map((book) => book.id)).toEqual(['psalms']);
    expect(getBookById('nope')).toBeNull();
  });
});
