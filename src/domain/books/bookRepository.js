import { bibleBooks, TOTAL_BOOKS } from '@/data/bibleBooks.js';
import { sections, testaments, TESTAMENT } from '@/data/sections.js';

/**
 * Read-only access to Bible knowledge.
 *
 * Everything the rest of the app knows about books goes through this module, so
 * the data shape can change without touching game logic or UI
 * (Dependency Inversion: callers depend on these functions, not on the array).
 */

const byId = new Map(bibleBooks.map((book) => [book.id, book]));
const byOrder = new Map(bibleBooks.map((book) => [book.order, book]));
const sectionById = new Map(sections.map((section) => [section.id, section]));
const testamentById = new Map(testaments.map((testament) => [testament.id, testament]));

export { TOTAL_BOOKS, TESTAMENT };

/** @returns {readonly import('@/data/bibleBooks.js').Book[]} */
export function getAllBooks() {
  return bibleBooks;
}

export function getAllSections() {
  return sections;
}

export function getAllTestaments() {
  return testaments;
}

export function getBookById(bookId) {
  return byId.get(bookId) ?? null;
}

export function getBookByOrder(order) {
  return byOrder.get(order) ?? null;
}

export function getSectionById(sectionId) {
  return sectionById.get(sectionId) ?? null;
}

export function getTestamentById(testamentId) {
  return testamentById.get(testamentId) ?? null;
}

export function getSectionOfBook(bookId) {
  const book = getBookById(bookId);
  return book ? getSectionById(book.sectionId) : null;
}

/** The book immediately after, or null at Revelation. */
export function getNextBook(bookId) {
  const book = getBookById(bookId);
  return book ? getBookByOrder(book.order + 1) : null;
}

/** The book immediately before, or null at Genesis. */
export function getPreviousBook(bookId) {
  const book = getBookById(bookId);
  return book ? getBookByOrder(book.order - 1) : null;
}

/**
 * A window of books centred on `bookId`, clipped at the ends of the canon.
 * @param {string} bookId
 * @param {number} radius
 */
export function getNeighbourhood(bookId, radius = 2) {
  const book = getBookById(bookId);
  if (!book) return [];
  const from = Math.max(1, book.order - radius);
  const to = Math.min(TOTAL_BOOKS, book.order + radius);
  const window = [];
  for (let order = from; order <= to; order += 1) window.push(getBookByOrder(order));
  return window;
}

/**
 * A run of `length` consecutive books that contains `bookId`, used by the
 * ordering exercises.
 */
export function getRun(bookId, length) {
  const book = getBookById(bookId);
  if (!book) return [];
  const half = Math.floor(length / 2);
  const start = Math.min(Math.max(1, book.order - half), Math.max(1, TOTAL_BOOKS - length + 1));
  const run = [];
  for (let i = 0; i < length; i += 1) {
    const next = getBookByOrder(start + i);
    if (next) run.push(next);
  }
  return run;
}

export function getBooksInSection(sectionId) {
  return bibleBooks.filter((book) => book.sectionId === sectionId);
}

export function getBooksInTestament(testamentId) {
  return bibleBooks.filter((book) => book.testament === testamentId);
}

export function getSectionsInTestament(testamentId) {
  return sections.filter((section) => section.testament === testamentId);
}

export function getTier1Books() {
  return bibleBooks.filter((book) => book.tier1);
}

/**
 * Localised display name with a safe fallback to English.
 * @param {{ name: Record<string, string> }} entity
 * @param {string} locale
 */
export function localisedName(entity, locale) {
  if (!entity) return '';
  return entity.name?.[locale] ?? entity.name?.en ?? '';
}

export function getBookName(bookId, locale) {
  return localisedName(getBookById(bookId), locale);
}

export function getSectionName(sectionId, locale) {
  return localisedName(getSectionById(sectionId), locale);
}

export function getTestamentName(testamentId, locale) {
  return localisedName(getTestamentById(testamentId), locale);
}

/** Case-insensitive search across every locale, for the Bible Map browser. */
export function searchBooks(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return bibleBooks;
  return bibleBooks.filter((book) =>
    Object.values(book.name).some((name) => name.toLowerCase().includes(needle)),
  );
}
