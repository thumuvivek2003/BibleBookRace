import {
  getBookName,
  getSectionName,
  getTestamentName,
} from '@/domain/books/bookRepository.js';
import { OPTION_KIND } from '@/domain/questions/questionTypes.js';

/**
 * Bridges the domain (which speaks in ids) and the screen (which must speak the
 * learner's language).
 *
 * Generators never build sentences; they emit `{ key, params }` with ids, and
 * this module turns that into localised text. One question type therefore works
 * in every language for free.
 */

const BOOK_PARAMS = ['book', 'first', 'second', 'answer'];

/**
 * @param {object} deps
 * @param {(key: string, values?: object) => string} deps.t
 * @param {string} deps.locale
 */
export function createGameText({ t, locale }) {
  const bookName = (bookId) => getBookName(bookId, locale);
  const sectionName = (sectionId) => getSectionName(sectionId, locale);
  const testamentName = (testamentId) => getTestamentName(testamentId, locale);

  /** Replaces id-valued params with localised names. */
  const resolveParams = (params = {}) =>
    Object.fromEntries(
      Object.entries(params).map(([key, value]) => {
        if (BOOK_PARAMS.includes(key)) return [key, bookName(value)];
        if (key === 'section') return [key, sectionName(value)];
        if (key === 'testament') return [key, testamentName(value)];
        return [key, value];
      }),
    );

  const phrase = (descriptor) =>
    descriptor ? t(descriptor.key, resolveParams(descriptor.params)) : '';

  /** Label for one multiple-choice option, whatever kind it holds. */
  const optionLabel = (option) => {
    switch (option.kind) {
      case OPTION_KIND.BOOK:
        return bookName(option.value);
      case OPTION_KIND.SECTION:
        return sectionName(option.value);
      case OPTION_KIND.TESTAMENT:
        return testamentName(option.value);
      case OPTION_KIND.RUN:
        return option.value.map(bookName).join(' → ');
      default:
        return String(option.value);
    }
  };

  const runLabel = (bookIds) => bookIds.map(bookName).join(' → ');

  return { bookName, sectionName, testamentName, phrase, optionLabel, runLabel, resolveParams };
}
