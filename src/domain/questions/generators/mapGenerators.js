import {
  getAllSections,
  getAllTestaments,
  getBookByOrder,
  getNeighbourhood,
  getSectionsInTestament,
  TOTAL_BOOKS,
} from '@/domain/books/bookRepository.js';
import { pickMany } from '@/utils/random.js';
import { buildChoices } from '../optionBuilder.js';
import { ANSWER_MODE, OPTION_KIND, QUESTION_TYPE } from '../questionTypes.js';

/**
 * LEVEL 1 - "Bible Map": where does this book live?
 * Each generator is a pure function: (context) -> question.
 */

const NEIGHBOURHOOD_RADIUS = 2;
const MIN_DECOY_DISTANCE = 4;

/** Old Testament or New Testament? */
export function generateTestamentQuestion({ book, rng }) {
  const { options, correctOptionId } = buildChoices({
    kind: OPTION_KIND.TESTAMENT,
    correct: book.testament,
    distractors: getAllTestaments()
      .map((testament) => testament.id)
      .filter((id) => id !== book.testament),
    rng,
  });

  return {
    type: QUESTION_TYPE.TESTAMENT_OF_BOOK,
    answerMode: ANSWER_MODE.CHOICE,
    bookId: book.id,
    prompt: { key: 'question.testamentOf', params: { book: book.id } },
    options,
    correctOptionId,
  };
}

/**
 * Which section? Distractors come from the same testament first - knowing
 * "it is a letter" should not be enough to guess.
 */
export function generateSectionQuestion({ book, rng }) {
  const sameTestament = getSectionsInTestament(book.testament)
    .map((section) => section.id)
    .filter((id) => id !== book.sectionId);
  const otherTestament = getAllSections()
    .map((section) => section.id)
    .filter((id) => id !== book.sectionId && !sameTestament.includes(id));

  const distractors = [...pickMany(sameTestament, 3, rng), ...pickMany(otherTestament, 3, rng)].slice(
    0,
    3,
  );

  const { options, correctOptionId } = buildChoices({
    kind: OPTION_KIND.SECTION,
    correct: book.sectionId,
    distractors,
    rng,
  });

  return {
    type: QUESTION_TYPE.SECTION_OF_BOOK,
    answerMode: ANSWER_MODE.CHOICE,
    bookId: book.id,
    prompt: { key: 'question.sectionOf', params: { book: book.id } },
    options,
    correctOptionId,
  };
}

/**
 * Pick the run of books that actually surrounds this one.
 *
 * The subject book is blanked out of every run (`null` renders as a gap).
 * Without that, only the correct option contained the book being asked about,
 * so the exercise could be solved by scanning for the name instead of knowing
 * the neighbours.
 */
export function generateNeighbourhoodQuestion({ book, rng }) {
  const runAround = (bookId) =>
    getNeighbourhood(bookId, NEIGHBOURHOOD_RADIUS).map((item) => (item.id === bookId ? null : item.id));

  const decoyCentres = pickMany(
    Array.from({ length: TOTAL_BOOKS }, (_, index) => index + 1)
      .filter((order) => Math.abs(order - book.order) >= MIN_DECOY_DISTANCE)
      .map((order) => getBookByOrder(order).id),
    3,
    rng,
  );

  const { options, correctOptionId } = buildChoices({
    kind: OPTION_KIND.RUN,
    correct: runAround(book.id),
    distractors: decoyCentres.map(runAround),
    idOf: (run) => run.map((id) => id ?? '_').join('>'),
    rng,
  });

  return {
    type: QUESTION_TYPE.NEIGHBOURHOOD_OF_BOOK,
    answerMode: ANSWER_MODE.CHOICE,
    bookId: book.id,
    prompt: { key: 'question.neighbourhoodOf', params: { book: book.id } },
    options,
    correctOptionId,
  };
}
