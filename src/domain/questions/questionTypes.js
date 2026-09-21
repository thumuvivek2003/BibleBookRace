/** The kinds of exercise the engine can produce. */
export const QUESTION_TYPE = Object.freeze({
  TESTAMENT_OF_BOOK: 'testament-of-book',
  SECTION_OF_BOOK: 'section-of-book',
  NEIGHBOURHOOD_OF_BOOK: 'neighbourhood-of-book',
  BOOK_AFTER: 'book-after',
  BOOK_BEFORE: 'book-before',
  BOOK_BETWEEN: 'book-between',
  ORDER_BOOKS: 'order-books',
  FIND_IN_BIBLE: 'find-in-bible',
});

/** How the UI must render a question. */
export const ANSWER_MODE = Object.freeze({
  CHOICE: 'choice',
  SEQUENCE: 'sequence',
  PHYSICAL: 'physical',
});

/** What an option's `value` means, so the UI knows how to label it. */
export const OPTION_KIND = Object.freeze({
  BOOK: 'book',
  SECTION: 'section',
  TESTAMENT: 'testament',
  RUN: 'run',
});
