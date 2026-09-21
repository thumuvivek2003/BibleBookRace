import { describe, expect, it } from 'vitest';
import { getAllBooks, getBookById } from '@/domain/books/bookRepository.js';
import { createSeededRng } from '@/utils/random.js';
import { getGames } from '@/domain/games/gameCatalog.js';
import { createQuestion, createRandomSelector, createRound } from './questionFactory.js';
import { QUESTION_TYPE } from './questionTypes.js';

const rng = () => createSeededRng(42);

describe('question factory', () => {
  it('builds a full round for every game', () => {
    getGames().forEach(({ id: gameId }) => {
      const round = createRound({
        gameId,
        selectBook: createRandomSelector(getAllBooks(), rng()),
        rng: rng(),
      });
      expect(round.length).toBeGreaterThan(0);
      round.forEach((question) => {
        expect(question.bookId).toBeTruthy();
        expect(question.prompt.key).toMatch(/^question\./);
      });
    });
  });

  it('always includes exactly one correct option', () => {
    const question = createQuestion({
      type: QUESTION_TYPE.SECTION_OF_BOOK,
      book: getBookById('ephesians'),
      rng: rng(),
    });
    const correct = question.options.filter((option) => option.id === question.correctOptionId);
    expect(correct).toHaveLength(1);
    expect(correct[0].value).toBe('pauline');
    expect(new Set(question.options.map((option) => option.id)).size).toBe(question.options.length);
  });

  it('refuses impossible questions instead of inventing an answer', () => {
    expect(
      createQuestion({ type: QUESTION_TYPE.BOOK_BEFORE, book: getBookById('genesis'), rng: rng() }),
    ).toBeNull();
    expect(
      createQuestion({ type: QUESTION_TYPE.BOOK_AFTER, book: getBookById('revelation'), rng: rng() }),
    ).toBeNull();
  });

  it('asks for the true neighbour', () => {
    const question = createQuestion({
      type: QUESTION_TYPE.BOOK_AFTER,
      book: getBookById('galatians'),
      rng: rng(),
    });
    expect(question.correctOptionId).toBe('ephesians');
  });

  it('never reveals the subject book inside a neighbourhood option', () => {
    // Every option blanks out the book being asked about. Without that, only
    // the correct run contained it and the question answered itself.
    const question = createQuestion({
      type: QUESTION_TYPE.NEIGHBOURHOOD_OF_BOOK,
      book: getBookById('ephesians'),
      rng: rng(),
    });

    question.options.forEach((option) => {
      expect(option.value).toContain(null);
      expect(option.value).not.toContain('ephesians');
    });

    const correct = question.options.find((option) => option.id === question.correctOptionId);
    expect(correct.value).toEqual(['2-corinthians', 'galatians', null, 'philippians', 'colossians']);
  });

  it('shuffles ordering questions away from the answer', () => {
    const question = createQuestion({
      type: QUESTION_TYPE.ORDER_BOOKS,
      book: getBookById('ephesians'),
      params: { length: 3 },
      rng: rng(),
    });
    expect(question.sequence.correct).toEqual(['galatians', 'ephesians', 'philippians']);
    expect(question.sequence.shuffled).not.toEqual(question.sequence.correct);
  });
});
