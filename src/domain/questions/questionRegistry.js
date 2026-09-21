import {
  generateNeighbourhoodQuestion,
  generateSectionQuestion,
  generateTestamentQuestion,
} from './generators/mapGenerators.js';
import {
  generateAfterQuestion,
  generateBeforeQuestion,
  generateBetweenQuestion,
  generateOrderingQuestion,
} from './generators/neighbourGenerators.js';
import { generateFindTask } from './generators/handGenerators.js';
import { QUESTION_TYPE } from './questionTypes.js';

/**
 * Open/Closed in practice: adding a question type means writing one pure
 * generator and registering it here. Nothing else in the app changes.
 *
 * A generator returns `null` when the given book cannot produce that question
 * (Genesis has no "before", Revelation has no "after"); the factory then picks
 * another book.
 */
const registry = new Map([
  [QUESTION_TYPE.TESTAMENT_OF_BOOK, generateTestamentQuestion],
  [QUESTION_TYPE.SECTION_OF_BOOK, generateSectionQuestion],
  [QUESTION_TYPE.NEIGHBOURHOOD_OF_BOOK, generateNeighbourhoodQuestion],
  [QUESTION_TYPE.BOOK_AFTER, generateAfterQuestion],
  [QUESTION_TYPE.BOOK_BEFORE, generateBeforeQuestion],
  [QUESTION_TYPE.BOOK_BETWEEN, generateBetweenQuestion],
  [QUESTION_TYPE.ORDER_BOOKS, generateOrderingQuestion],
  [QUESTION_TYPE.FIND_IN_BIBLE, generateFindTask],
]);

export function getGenerator(type) {
  const generator = registry.get(type);
  if (!generator) throw new Error(`No generator registered for question type "${type}"`);
  return generator;
}

export function registerGenerator(type, generator) {
  registry.set(type, generator);
}

export function getRegisteredTypes() {
  return [...registry.keys()];
}
