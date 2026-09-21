import { ANSWER_MODE, QUESTION_TYPE } from '../questionTypes.js';

/**
 * LEVEL 3 - "Hand Geography": no options, no hints.
 * The app only names a book and times the physical search.
 */
export function generateFindTask({ book }) {
  return {
    type: QUESTION_TYPE.FIND_IN_BIBLE,
    answerMode: ANSWER_MODE.PHYSICAL,
    bookId: book.id,
    prompt: { key: 'question.findInBible', params: { book: book.id } },
  };
}
