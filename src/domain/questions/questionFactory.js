import { getBookById, getSectionOfBook } from '@/domain/books/bookRepository.js';
import { getGame, resolveStage } from '@/domain/games/gameCatalog.js';
import { defaultRng, pickOne } from '@/utils/random.js';
import { getGenerator } from './questionRegistry.js';
import { ANSWER_MODE } from './questionTypes.js';

/**
 * Turns "game + subject book" into a ready-to-render question.
 * Pure: no React, no storage, no DOM. `rng` is injectable so rounds are
 * reproducible in tests.
 */

let sequence = 0;
const nextId = () => {
  sequence += 1;
  return `q_${Date.now().toString(36)}_${sequence}`;
};

function withMetadata(question, { gameId, stageId }) {
  const section = getSectionOfBook(question.bookId);
  return {
    ...question,
    id: nextId(),
    gameId,
    stageId,
    explanation:
      question.answerMode === ANSWER_MODE.SEQUENCE
        ? { key: 'feedback.correctOrder', params: {} }
        : {
            key: 'feedback.bookLivesIn',
            params: {
              book: question.bookId,
              section: section?.id,
              testament: getBookById(question.bookId)?.testament,
            },
          },
  };
}

/**
 * @param {object} params
 * @param {string} params.type
 * @param {object} params.book
 * @param {object} [params.params] extra generator arguments (e.g. `{ length: 5 }`)
 * @param {import('@/utils/random.js').Rng} [params.rng]
 * @returns {object|null}
 */
export function createQuestion({ type, book, params = {}, rng = defaultRng, gameId, stageId }) {
  const question = getGenerator(type)({ book, rng, ...params });
  return question ? withMetadata(question, { gameId, stageId }) : null;
}

/**
 * Builds a full round.
 *
 * `selectBook` is injected (Dependency Inversion) so the caller decides the
 * teaching strategy - random practice, tier-1 only, or weak-book-first - without
 * this factory knowing anything about progress storage.
 *
 * @param {object} params
 * @param {string} params.gameId
 * @param {(context: { index: number, usedBookIds: string[] }) => object} params.selectBook
 * @param {number} [params.count]
 * @param {import('@/utils/random.js').Rng} [params.rng]
 * @returns {object[]}
 */
export function createRound({ gameId, selectBook, count, rng = defaultRng }) {
  const game = getGame(gameId);
  if (!game) throw new Error(`Unknown game "${gameId}"`);

  const total = count ?? game.questionsPerRound;
  const questions = [];
  const usedBookIds = [];

  for (let index = 0; index < total; index += 1) {
    const stage = resolveStage(game, index, total);
    const question = buildWithRetry({ stage, game, index, usedBookIds, selectBook, rng });
    if (!question) continue;
    questions.push(question);
    usedBookIds.push(question.bookId);
  }

  return questions;
}

const MAX_ATTEMPTS = 12;

function buildWithRetry({ stage, game, index, usedBookIds, selectBook, rng }) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    // Avoid repeating a book inside one round while enough books remain.
    const avoidRepeats = attempt < MAX_ATTEMPTS / 2;
    const book = selectBook({ index, usedBookIds: avoidRepeats ? usedBookIds : [] });
    if (!book) break;

    const question = createQuestion({
      type: stage.type,
      book,
      params: stage.params,
      rng,
      gameId: game.id,
      stageId: stage.id,
    });
    if (question) return question;
  }
  return null;
}

/** Convenience selector for callers that just want uniform random practice. */
export function createRandomSelector(books, rng = defaultRng) {
  return ({ usedBookIds }) => {
    const used = new Set(usedBookIds);
    const pool = books.filter((book) => !used.has(book.id));
    return pickOne(pool.length ? pool : books, rng);
  };
}
