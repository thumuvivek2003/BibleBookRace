import {
  getBookByOrder,
  getBooksInSection,
  getNextBook,
  getPreviousBook,
  getRun,
  TOTAL_BOOKS,
} from '@/domain/books/bookRepository.js';
import { pickMany, shuffle } from '@/utils/random.js';
import { buildChoices } from '../optionBuilder.js';
import { ANSWER_MODE, OPTION_KIND, QUESTION_TYPE } from '../questionTypes.js';

/**
 * LEVEL 2 - "Brain -> Neighbour": build the linked list
 * Galatians -> Ephesians -> Philippians.
 */

const DISTRACTOR_WINDOW = 8;
const DISTRACTOR_COUNT = 3;

/**
 * Near misses make a better exercise than random books: the learner has to know
 * the exact neighbour, not merely the neighbourhood.
 */
function nearbyDistractors(book, excludedIds, rng, count = DISTRACTOR_COUNT) {
  const excluded = new Set(excludedIds);
  const nearby = [];
  for (let offset = -DISTRACTOR_WINDOW; offset <= DISTRACTOR_WINDOW; offset += 1) {
    const order = book.order + offset;
    if (order < 1 || order > TOTAL_BOOKS) continue;
    const candidate = getBookByOrder(order);
    if (candidate && !excluded.has(candidate.id)) nearby.push(candidate.id);
  }

  const sameSection = getBooksInSection(book.sectionId)
    .map((item) => item.id)
    .filter((id) => !excluded.has(id) && !nearby.includes(id));

  return pickMany([...nearby, ...sameSection], count, rng);
}

function neighbourQuestion({ book, rng, type, target, promptKey }) {
  const { options, correctOptionId } = buildChoices({
    kind: OPTION_KIND.BOOK,
    correct: target.id,
    distractors: nearbyDistractors(book, [book.id, target.id], rng),
    rng,
  });

  return {
    type,
    answerMode: ANSWER_MODE.CHOICE,
    bookId: book.id,
    prompt: { key: promptKey, params: { book: book.id } },
    options,
    correctOptionId,
  };
}

/** "What comes immediately after Ephesians?" */
export function generateAfterQuestion({ book, rng }) {
  const target = getNextBook(book.id);
  if (!target) return null;
  return neighbourQuestion({
    book,
    rng,
    target,
    type: QUESTION_TYPE.BOOK_AFTER,
    promptKey: 'question.comesAfter',
  });
}

/** "What comes immediately before Ephesians?" */
export function generateBeforeQuestion({ book, rng }) {
  const target = getPreviousBook(book.id);
  if (!target) return null;
  return neighbourQuestion({
    book,
    rng,
    target,
    type: QUESTION_TYPE.BOOK_BEFORE,
    promptKey: 'question.comesBefore',
  });
}

/** "Which book sits between Galatians and Philippians?" */
export function generateBetweenQuestion({ book, rng }) {
  const previous = getPreviousBook(book.id);
  const next = getNextBook(book.id);
  if (!previous || !next) return null;

  const { options, correctOptionId } = buildChoices({
    kind: OPTION_KIND.BOOK,
    correct: book.id,
    distractors: nearbyDistractors(book, [book.id, previous.id, next.id], rng),
    rng,
  });

  return {
    type: QUESTION_TYPE.BOOK_BETWEEN,
    answerMode: ANSWER_MODE.CHOICE,
    bookId: book.id,
    prompt: {
      key: 'question.between',
      params: { first: previous.id, second: next.id },
    },
    options,
    correctOptionId,
  };
}

/**
 * "Put these in order." `length` grows with the stage (3 books, then 5).
 * A shuffle that happens to be already correct is re-rolled so the exercise is
 * never a freebie.
 */
export function generateOrderingQuestion({ book, rng, length = 3 }) {
  const run = getRun(book.id, length).map((item) => item.id);
  if (run.length < length) return null;

  let shuffled = shuffle(run, rng);
  for (let attempt = 0; attempt < 5 && shuffled.join() === run.join(); attempt += 1) {
    shuffled = shuffle(run, rng);
  }

  return {
    type: QUESTION_TYPE.ORDER_BOOKS,
    answerMode: ANSWER_MODE.SEQUENCE,
    bookId: book.id,
    prompt: { key: 'question.putInOrder', params: { count: length } },
    sequence: { shuffled, correct: run },
  };
}
