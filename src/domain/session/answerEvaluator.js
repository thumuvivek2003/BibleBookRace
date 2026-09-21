import { ANSWER_MODE } from '@/domain/questions/questionTypes.js';
import { sameOrder } from '@/utils/array.js';

/**
 * One place that decides "was that right?", for every answer mode.
 * @param {object} question
 * @param {{ optionId?: string, sequence?: string[], found?: boolean }} answer
 * @returns {boolean}
 */
export function isAnswerCorrect(question, answer) {
  if (!question || !answer) return false;

  switch (question.answerMode) {
    case ANSWER_MODE.CHOICE:
      return answer.optionId === question.correctOptionId;
    case ANSWER_MODE.SEQUENCE:
      return sameOrder(answer.sequence ?? [], question.sequence.correct);
    case ANSWER_MODE.PHYSICAL:
      return answer.found === true;
    default:
      return false;
  }
}
