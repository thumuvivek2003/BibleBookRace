import { isAnswerCorrect } from './answerEvaluator.js';

/**
 * A round of questions as a pure state machine.
 *
 * The React layer holds one of these in state and only ever calls these
 * transitions, so the rules of a round are testable without rendering anything.
 */

export const ROUND_STATUS = Object.freeze({
  ASKING: 'asking',
  REVIEWING: 'reviewing',
  FINISHED: 'finished',
});

/**
 * @param {object[]} questions
 * @param {object} [meta] anything the caller wants to carry along (levelId, questId...)
 */
export function createRoundSession(questions, meta = {}) {
  return {
    meta,
    questions,
    index: 0,
    status: questions.length ? ROUND_STATUS.ASKING : ROUND_STATUS.FINISHED,
    answers: [],
    lastAnswer: null,
  };
}

export function currentQuestion(session) {
  return session.questions[session.index] ?? null;
}

export function progressOf(session) {
  return {
    position: Math.min(session.index + 1, session.questions.length),
    total: session.questions.length,
    ratio: session.questions.length ? session.answers.length / session.questions.length : 0,
  };
}

/**
 * Records an answer and moves to the review state (the "Correct!" card).
 * @param {object} session
 * @param {{ optionId?: string, sequence?: string[], found?: boolean, timeMs?: number, at?: number }} answer
 */
export function submitAnswer(session, answer) {
  if (session.status !== ROUND_STATUS.ASKING) return session;

  const question = currentQuestion(session);
  if (!question) return session;

  const record = {
    questionId: question.id,
    bookId: question.bookId,
    levelId: question.levelId,
    type: question.type,
    correct: isAnswerCorrect(question, answer),
    timeMs: Math.max(0, answer.timeMs ?? 0),
    at: answer.at ?? Date.now(),
    given: answer,
  };

  return {
    ...session,
    status: ROUND_STATUS.REVIEWING,
    answers: [...session.answers, record],
    lastAnswer: record,
  };
}

/** Moves to the next question, or finishes the round. */
export function advance(session) {
  if (session.status !== ROUND_STATUS.REVIEWING) return session;

  const nextIndex = session.index + 1;
  const finished = nextIndex >= session.questions.length;

  return {
    ...session,
    index: finished ? session.index : nextIndex,
    status: finished ? ROUND_STATUS.FINISHED : ROUND_STATUS.ASKING,
    lastAnswer: finished ? session.lastAnswer : null,
  };
}

/** Ends the round early (the learner tapped "finish"). */
export function finish(session) {
  return { ...session, status: ROUND_STATUS.FINISHED };
}

export function isFinished(session) {
  return session.status === ROUND_STATUS.FINISHED;
}

/** Everything the results screen needs. */
export function summariseRound(session) {
  const { answers } = session;
  const correct = answers.filter((answer) => answer.correct).length;
  const totalTimeMs = answers.reduce((sum, answer) => sum + answer.timeMs, 0);

  let bestStreak = 0;
  let running = 0;
  answers.forEach((answer) => {
    running = answer.correct ? running + 1 : 0;
    bestStreak = Math.max(bestStreak, running);
  });

  return {
    total: answers.length,
    correct,
    wrong: answers.length - correct,
    accuracy: answers.length ? correct / answers.length : 0,
    totalTimeMs,
    averageTimeMs: answers.length ? totalTimeMs / answers.length : 0,
    bestStreak,
    missedBookIds: answers.filter((answer) => !answer.correct).map((answer) => answer.bookId),
  };
}
